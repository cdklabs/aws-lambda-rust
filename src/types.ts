import {
  AssetHashType,
  BundlingFileAccess,
  DockerImage,
  DockerRunOptions,
} from 'aws-cdk-lib/core';

/**
 * Bundling options
 */
export interface BundlingOptions extends DockerRunOptions {
  /**
   * Cross compilation target environment for the generated binary.
   */
  readonly target?: string;

  /**
   * A list of features to activate when compiling Rust code.
   */
  readonly features?: string[];

  /**
   * The type of package manager to use
   *
   * @default - PackageManagerType.CARGO_ZIGBUILD
   */
  readonly packageManagerType?: PackageManagerType;

  /**
   * Force bundling in a Docker container even if local bundling is
   * possible.
   *
   * @default - false
   */
  readonly forceDockerBundling?: boolean;

  /**
   * A custom bundling Docker image.
   *
   * @default - use the Docker image provided by @aws-cdk/aws-lambda-go-alpha
   */
  readonly dockerImage?: DockerImage;

  /**
   * Additional arguments that are passed in at build time to package manager.
   *
   * ## Examples
   *
   * - `--all-features`
   * - `--no-default-features`
   */
  readonly extraBuildArgs?: string[];

  /**
   * Build arguments to pass when building the bundling image.
   *
   * @default - no build arguments are passed
   */
  readonly buildArgs?: { [key: string]: string };

  /**
   * Determines how the asset hash is calculated. Assets will
   * get rebuilt and uploaded only if their hash has changed.
   *
   * If the asset hash is set to `OUTPUT` (default), the hash is calculated
   * after bundling. This means that any change in the output will cause
   * the asset to be invalidated and uploaded. Bear in mind that the
   * rust binary that is output can be different depending on the target
   * that it was compiled for.
   *
   * If the asset hash is set to `SOURCE`, then only changes to the source
   * directory will cause the asset to rebuild. If your go project has multiple
   * Lambda functions this means that an update to any one function could cause
   * all the functions to be rebuilt and uploaded.
   *
   * @default - AssetHashType.OUTPUT. If `assetHash` is also specified,
   * the default is `CUSTOM`.
   *
   * @default AssetHashType.CUSTOM
   */
  readonly assetHashType?: AssetHashType;

  /**
   * Specify a custom hash for this asset. If `assetHashType` is set it must
   * be set to `AssetHashType.CUSTOM`. For consistency, this custom hash will
   * be SHA256 hashed and encoded as hex. The resulting hash will be the asset
   * hash.
   *
   * NOTE: the hash is used in order to identify a specific revision of the asset, and
   * used for optimizing and caching deployment activities related to this asset such as
   * packaging, uploading to Amazon S3, etc. If you chose to customize the hash, you will
   * need to make sure it is updated every time the asset changes, or otherwise it is
   * possible that some deployments will not be invalidated.
   *
   * @default - based on `assetHashType`
   */
  readonly assetHash?: string;

  /**
   * Command hooks
   *
   * @default - do not run additional commands
   */
  readonly commandHooks?: ICommandHooks;

  /**
   * Which option to use to copy the source files to the docker container and output files back
   * @default - BundlingFileAccess.BIND_MOUNT
   */
  readonly bundlingFileAccess?: BundlingFileAccess;

  /**
   * Log level for cargo.
   *
   * @default LogLevel.WARNING
   */
  readonly logLevel?: LogLevel;
}

/**
 * Command hooks
 *
 * These commands will run in the environment in which bundling occurs: inside
 * the container for Docker bundling or on the host OS for local bundling.
 *
 * Commands are chained with `&&`.
 *
 * The following example (specified in TypeScript) copies a file from the input
 * directory to the output directory to include it in the bundled asset:
 *
 * ```text
 * afterBundling(inputDir: string, outputDir: string): string[]{
 *   return [`cp ${inputDir}/my-binary.node ${outputDir}`];
 * }
 * ```
 */
export interface ICommandHooks {
  /**
   * Returns commands to run before bundling.
   *
   * Commands are chained with `&&`.
   */
  beforeBundling(inputDir: string, outputDir: string): string[];

  /**
   * Returns commands to run after bundling.
   *
   * Commands are chained with `&&`.
   */
  afterBundling(inputDir: string, outputDir: string): string[];
}

export enum PackageManagerType {
  CARGO_ZIGBUILD,
  CROSS,
}

/**
 * Log levels for cargo commands.
 */
export enum LogLevel {
  /** Show everything */
  VERBOSE = 'verbose',
  /** Show warnings, errors, and an output file summary */
  INFO = 'info',
  /** Show nothing */
  SILENT = 'silent',
}
