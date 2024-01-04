import * as os from 'os';
import * as path from 'path';
import { Architecture, AssetCode, Code, Runtime } from 'aws-cdk-lib/aws-lambda';
import {
  AssetHashType,
  AssetStaging,
  BundlingFileAccess,
  BundlingOptions as CdkBundlingOptions,
  DockerImage,
  DockerVolume,
  ILocalBundling,
} from 'aws-cdk-lib/core';
import { PackageManager, PackageManagerType } from './package-manager';
import { BundlingOptions, LogLevel } from './types';
import { checkInstalledTarget, exec, getBinaryName, hasMultipleBinaries, isWorkspace } from './util';

/**
 * Bundling properties
 */
export interface BundlingProps extends BundlingOptions {
  /**
   * Path to folder containing the Cargo.toml file.
   */
  readonly entry: string;

  /**
   * The runtime of the lambda function
   */
  readonly runtime: Runtime;

  /**
   * The system architecture of the lambda function
   *
   * @default - Architecture.X86_64
   */
  readonly architecture: Architecture;

  /**
   * Build only the specified binary
   *
   * @default Build all binaries
   */
  readonly binaryName?: string;

  /**
   * The type of package manager to use
   *
   * @default - PackageManagerType.CARGO_ZIGBUILD
   */
  readonly packageManagerType?: PackageManagerType;

  /**
   * Which option to use to copy the source files to the docker container and output files back
   * @default - BundlingFileAccess.BIND_MOUNT
   */
  readonly bundlingFileAccess?: BundlingFileAccess;
}

/**
 * Bundling with esbuild
 */
export class Bundling implements CdkBundlingOptions {
  public static X86_64__TARGET: string = 'x86_64-unknown-linux-gnu';
  public static ARM_TARGET: string = 'aarch64-unknown-linux-gnu';

  /**
   * Cargo bundled Lambda asset code
   */
  public static bundle(options: BundlingProps): AssetCode {
    return Code.fromAsset(path.dirname(options.entry), {
      assetHash: options.assetHash,
      assetHashType: options.assetHash
        ? AssetHashType.CUSTOM
        : AssetHashType.OUTPUT,
      bundling: new Bundling(options),
    });
  }

  public readonly image: DockerImage;
  public readonly entrypoint?: string[];
  public readonly command: string[];
  public readonly volumes?: DockerVolume[];
  public readonly volumesFrom?: string[];
  public readonly environment?: { [key: string]: string };
  public readonly workingDirectory?: string;
  public readonly user?: string;
  public readonly securityOpt?: string;
  public readonly network?: string;
  public readonly local?: ILocalBundling;
  public readonly bundlingFileAccess?: BundlingFileAccess;

  private readonly packageManager: PackageManager;
  private readonly target: string;

  constructor(private readonly props: BundlingProps) {
    const packageManagerType =
      props.packageManagerType ?? PackageManagerType.CARGO_ZIGBUILD;
    this.packageManager = PackageManager.fromType(packageManagerType);
    this.target = this.props.target && isValidTarget(this.props.target)
      ? this.props.target
      : toTarget(this.props.architecture);

    const buildArgs = ['--release', '--color', 'always'];
    if (props.extraBuildArgs) {
      buildArgs.push(...props.extraBuildArgs);
    }
    // Docker bundling
    const shouldBuildImage =
      props.forceDockerBundling ||
      !this.packageManager.runLocally ||
      !checkInstalledTarget(toTarget(this.props.architecture));
    this.image = shouldBuildImage
      ? props.dockerImage ??
        DockerImage.fromBuild(path.join(__dirname, '../src'), {
          buildArgs: {
            ...(props.buildArgs ?? {}),
            // If runtime isn't passed use regional default, lowest common denominator is node18
            IMAGE: props.runtime.bundlingImage.image,
          },
          platform: props.architecture.dockerPlatform,
        })
      : DockerImage.fromRegistry('dummy'); // Do not build if we don't need to

    const bundlingCommand = this.createBundlingCommand({
      inputDir: AssetStaging.BUNDLING_INPUT_DIR,
      outputDir: AssetStaging.BUNDLING_OUTPUT_DIR,
      buildArgs: buildArgs,
      buildRunner: this.packageManager.runBuildCommand(),
      osPlatform: 'linux', // linux docker image
    });
    this.command = props.command ?? ['bash', '-c', bundlingCommand];
    this.environment = props.environment;
    this.workingDirectory = props.workingDirectory;
    this.entrypoint = props.entrypoint;
    this.volumes = props.volumes;
    this.volumesFrom = props.volumesFrom;
    this.user = props.user;
    this.securityOpt = props.securityOpt;
    this.network = props.network;
    this.bundlingFileAccess = props.bundlingFileAccess;

    // Local bundling
    if (!props.forceDockerBundling) {
      // only if Docker is not forced
      this.local = this.getLocalBundlingProvider();
    }
  }

  public createBundlingCommand(options: BundlingCommandOptions): string {
    const pathJoin = osPathJoin(options.osPlatform);
    const osPlatform = os.platform();
    let relativeManifestPath = options.inputDir ? pathJoin(
      options.inputDir,
      path.relative(path.dirname(this.props.entry), this.props.entry),
    ) : this.props.entry;
    let binaryName;

    const buildCommand: string[] = [
      options.buildRunner,
      `--manifest-path=${relativeManifestPath}`,
      `--target ${this.target}`,
      ...options.buildArgs,
    ];

    if (this.props.binaryName) {
      binaryName = this.props.binaryName;
    } else if (isWorkspace(this.props.entry) || hasMultipleBinaries(this.props.entry)) {
      throw new Error('Your Cargo project is a workspace or contains multiple binaries, use the property `binaryName` to specify the binary to use.');
    } else {
      binaryName = getBinaryName(this.props.entry);
    }

    if (!binaryName) {
      throw new Error('Your Cargo project is missing the package name or a [[bin]] section, use the property `binaryName` to specify the binary to use');
    }
    buildCommand.push('--bin', binaryName);

    // Features
    if (this.props.features) {
      buildCommand.push('--features', this.props.features.join(','));
    }

    // Log level
    if (this.props.logLevel && this.props.logLevel == LogLevel.SILENT) {
      buildCommand.push('--silent');
    } else if (this.props.logLevel && this.props.logLevel == LogLevel.VERBOSE) {
      buildCommand.push('--verbose');
    }

    // Move target file to destination
    const sourceBootstrap = pathJoin(path.dirname(relativeManifestPath), 'target', this.target, 'release', binaryName);
    const targetBootstrap= pathJoin(options.outputDir, 'bootstrap');
    const moveCommand: string =
        osPlatform === 'win32'
          ? ['powershell', '-command', 'Move-Item', '-Path', sourceBootstrap, '-Destination', targetBootstrap]
            .filter((c) => !!c)
            .join(' ')
          : ['mv', sourceBootstrap, targetBootstrap].filter((c) => !!c).join(' ');


    return chain([
      ...(this.props.commandHooks?.beforeBundling(
        options.inputDir,
        options.outputDir,
      ) ?? []),
      buildCommand.filter((c) => !!c).join(' '),
      moveCommand,
      ...(this.props.commandHooks?.afterBundling(
        options.inputDir,
        options.outputDir,
      ) ?? []),
    ]);
  }

  private getLocalBundlingProvider(): ILocalBundling {
    const osPlatform = os.platform();
    const projectRoot = path.dirname(this.props.entry);
    const createLocalCommand = (outputDir: string, buildArgs: string[]) =>
      this.createBundlingCommand({
        inputDir: '',
        outputDir,
        buildRunner: this.packageManager.runBuildCommand(),
        osPlatform,
        buildArgs,
      });
    const environment = this.props.environment ?? {};
    const cwd = projectRoot;

    return {
      tryBundle(outputDir: string) {
        if (
          !PackageManager.fromType(PackageManagerType.CARGO_ZIGBUILD)
            .runLocally &&
          !PackageManager.fromType(PackageManagerType.CROSS).runLocally
        ) {
          process.stderr.write(
            'No package manager cannot run locally. Switching to Docker bundling.\n',
          );
          return false;
        }

        const buildArgs = ['--release', '--color', 'always'];
        const localCommand = createLocalCommand(outputDir, buildArgs);

        exec(
          osPlatform === 'win32' ? 'cmd' : 'bash',
          [osPlatform === 'win32' ? '/c' : '-c', localCommand],
          {
            env: { ...process.env, ...environment },
            stdio: [
              // show output
              'ignore', // ignore stdio
              process.stderr, // redirect stdout to stderr
              'inherit', // inherit stderr
            ],
            cwd,
            windowsVerbatimArguments: osPlatform === 'win32',
          },
        );

        return true;
      },
    };
  }
}

/**
 * Command options for bundling a Lambda asset
 */
interface BundlingCommandOptions {
  readonly inputDir: string;
  readonly outputDir: string;
  readonly buildRunner: string;
  readonly buildArgs: string[];
  readonly osPlatform: NodeJS.Platform;
}

function chain(commands: string[]): string {
  return commands.filter((c) => !!c).join(' && ');
}

/**
 * Validates a target against a list of allowed targets.
 * @param target the target to validate.
 */
function isValidTarget(target: string): boolean {
  return (
    target.startsWith(Bundling.X86_64__TARGET) ||
    target.startsWith(Bundling.ARM_TARGET)
  );
}

/**
 * Converts an Architecture to a bundling target
 */
function toTarget(architecture: Architecture): string {
  switch (architecture) {
    case Architecture.ARM_64:
      return Bundling.ARM_TARGET;
    default:
      return Bundling.X86_64__TARGET;
  }
}

/**
 * Platform specific path join
 */
function osPathJoin(platform: NodeJS.Platform) {
  return function (...paths: string[]): string {
    const joined = path.join(...paths);
    // If we are on win32 but need posix style paths
    if (os.platform() === 'win32' && platform !== 'win32') {
      return joined.replace(/\\/g, '/');
    }
    return joined;
  };
}
