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
import { IConstruct } from 'constructs';
import { CrateInstallation } from './crate-installation';
import { BundlingOptions } from './types';
import { CargoManifest, getCargoManifest } from './util';
import * as os from 'os';

/**
 * Bundling properties
 */
export interface BundlingProps extends BundlingOptions {
  /**
   * Path to project root
   *
   * This will be used as the source of the volume mounted in the Docker
   * container and will be the directory where it will run `cargo lambda build` from.
   */
  readonly projectRoot: string;

  /**
   * The name of the binary to build
   *
   * @default Package's name
   */
  readonly binaryName?: string;

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
}

interface CommandOptions {
  readonly inputDir: string;
  readonly outputDir: string;
  readonly binaryName?: string;
  readonly osPlatform: NodeJS.Platform;
  readonly architecture?: Architecture;
  readonly lambdaExtension?: boolean;
  readonly manifest: CargoManifest;
}

/**
 * Bundling with esbuild
 */
export class Bundling implements CdkBundlingOptions {
  /**
   * Cargo bundled Lambda asset code
   */
  public static bundle(scope: IConstruct, options: BundlingProps): AssetCode {
    return Code.fromAsset(options.projectRoot, {
      assetHash: options.assetHash,
      assetHashType: options.assetHash ? AssetHashType.CUSTOM : AssetHashType.OUTPUT,
      bundling: new Bundling(scope, options),
    });
  }

  public static clearCargoInstallationCache(): void {
    this.cargoInstallation = undefined;
  }

  public static clearZigInstallationCache(): void {
    this.zigInstallation = undefined;
  }

  private static cargoInstallation?: CrateInstallation;
  private static zigInstallation?: CrateInstallation;

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

  constructor(private readonly props: BundlingProps) {

    Bundling.cargoInstallation = Bundling.cargoInstallation ?? CrateInstallation.detect('cargo');
    Bundling.zigInstallation = Bundling.zigInstallation ?? CrateInstallation.detect('cargo-zigbuild');

    // Docker bundling
    const shouldBuildImage = props.forceDockerBundling || !Bundling.zigInstallation;
    this.image = shouldBuildImage ? props.dockerImage ?? DockerImage.fromBuild(path.join(__dirname, '../lib'),
      {
        buildArgs: {
          ...props.buildArgs ?? {},
          // If runtime isn't passed use regional default, lowest common denominator is node18
          IMAGE: props.runtime.bundlingImage.image,
        },
        platform: props.architecture.dockerPlatform,
      })
      : DockerImage.fromRegistry('dummy'); // Do not build if we don't need to

    const bundlingCommand = this.createBundlingCommand({
      manifest: getCargoManifest(props.projectRoot),
      binaryName: props.binaryName,
      architecture: props.architecture,
      inputDir: AssetStaging.BUNDLING_INPUT_DIR,
      outputDir: AssetStaging.BUNDLING_OUTPUT_DIR,
      osPlatform: 'linux', // linux docker image
    });
    this.command = props.command ?? ['bash', '-c', bundlingCommand];
    this.environment = props.environment;
    // Bundling sets the working directory to cdk.AssetStaging.BUNDLING_INPUT_DIR
    // and we want to force npx to use the globally installed esbuild.
    this.workingDirectory = props.workingDirectory ?? '/';
    this.entrypoint = props.entrypoint;
    this.volumes = props.volumes;
    this.volumesFrom = props.volumesFrom;
    this.user = props.user;
    this.securityOpt = props.securityOpt;
    this.network = props.network;
    this.bundlingFileAccess = props.bundlingFileAccess;

    // Local bundling
    if (!props.forceDockerBundling) { // only if Docker is not forced
      this.local = this.getLocalBundlingProvider();
    }
  }

  public createBundlingCommand(props: CommandOptions): string {
    const buildBinary: string[] = [
      'cargo',
      'lambda',
      'build',
      '--release',
      '--lambda-dir',
      props.outputDir,
    ];

    if (props.lambdaExtension) {
      buildBinary.push('--extension');
    }

    if (props.architecture) {
      const targetFlag = props.architecture.name == Architecture.ARM_64.name ? '--arm64' : '--x86-64';
      buildBinary.push(targetFlag);
    }

    let packageName;
    if (props.binaryName) {
      buildBinary.push('--bin');
      buildBinary.push(props.binaryName);
      packageName = props.binaryName;
    } else {
      if (props.manifest.workspace) {
        throw new Error('the Cargo manifest is a workspace, use the option `binaryName` to specify the binary to build');
      }

      packageName = props.manifest.package?.name;
      if (props.manifest.bin) {
        if (props.manifest.bin.length == 1) {
          packageName = props.manifest.bin[0].name;

          buildBinary.push('--bin');
          buildBinary.push(packageName);
        } else {
          throw new Error('there are more than one binaries declared in this Cargo package, use the option `binaryName` to specify the binary to build');
        }
      }

      if (!packageName) {
        throw new Error('the Cargo package is missing the package name or a [[bin]] section, use the option `binaryName` to specify the binary to build');
      }
    }

    if (!props.lambdaExtension && packageName) {
      buildBinary.push('--flatten');
      buildBinary.push(packageName);
    }

    const command = buildBinary.join(' ');

    return chain([
      ...this.props.commandHooks?.beforeBundling(props.inputDir, props.outputDir) ?? [],
      command,
      ...this.props.commandHooks?.afterBundling(props.inputDir, props.outputDir) ?? [],
    ]);
  }

  private getLocalBundlingProvider(): ILocalBundling {
    const osPlatform = os.platform();
    const createLocalCommand = (outputDir: string, esbuild: PackageInstallation, tsc?: PackageInstallation) => this.createBundlingCommand({
      inputDir: this.projectRoot,
      outputDir,
      esbuildRunner: esbuild.isLocal ? this.packageManager.runBinCommand('esbuild') : 'esbuild',
      tscRunner: tsc && (tsc.isLocal ? this.packageManager.runBinCommand('tsc') : 'tsc'),
      osPlatform,
    });
    const environment = this.props.environment ?? {};
    const cwd = this.projectRoot;

    return {
      tryBundle(outputDir: string) {
        if (!Bundling.esbuildInstallation) {
          process.stderr.write('esbuild cannot run locally. Switching to Docker bundling.\n');
          return false;
        }

        if (!Bundling.esbuildInstallation.version.startsWith(`${ESBUILD_MAJOR_VERSION}.`)) {
          throw new Error(`Expected esbuild version ${ESBUILD_MAJOR_VERSION}.x but got ${Bundling.esbuildInstallation.version}`);
        }

        const localCommand = createLocalCommand(outputDir, Bundling.esbuildInstallation, Bundling.tscInstallation);

        exec(
            osPlatform === 'win32' ? 'cmd' : 'bash',
            [
              osPlatform === 'win32' ? '/c' : '-c',
              localCommand,
            ],
            {
              env: { ...process.env, ...environment },
              stdio: [ // show output
                'ignore', // ignore stdio
                process.stderr, // redirect stdout to stderr
                'inherit', // inherit stderr
              ],
              cwd,
              windowsVerbatimArguments: osPlatform === 'win32',
            });

        return true;
      },
    };
  }
}
function chain(commands: string[]): string {
  return commands.filter(c => !!c).join(' && ');
}

/**
 * Platform specific path join
 */
function osPathJoin(platform: NodeJS.Platform) {
  return function(...paths: string[]): string {
    const joined = path.join(...paths);
    // If we are on win32 but need posix style paths
    if (os.platform() === 'win32' && platform !== 'win32') {
      return joined.replace(/\\/g, '/');
    }
    return joined;
  };
}
