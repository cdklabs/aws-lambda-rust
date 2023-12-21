import * as child_process from 'child_process';
import * as os from 'os';
import { Architecture, Code, Runtime } from 'aws-cdk-lib/aws-lambda';
import {
  AssetHashType,
  BundlingFileAccess,
  DockerImage,
} from 'aws-cdk-lib/core';
import { LogLevel } from '../lib';
import { Bundling } from '../lib/bundling';
import { PackageManager, PackageManagerType } from '../lib/package-manager';

const STANDARD_RUNTIME = Runtime.PROVIDED_AL2023;
const STANDARD_ARCHITECTURE = Architecture.X86_64;

// Mock
jest.mock('os');
jest.mock('child_process');
jest.mock('../src/util');

beforeEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();

  jest.spyOn(Code, 'fromAsset');

  jest.spyOn(PackageManager, 'fromType').mockReturnValue(
    new PackageManager({
      buildCommand: ['zigbuild'],
      runCommand: 'cargo-zigbuild',
      crossCompile: true,
      runLocally: false,
      type: PackageManagerType.CARGO_ZIGBUILD,
    }),
  );

  jest.spyOn(DockerImage, 'fromBuild').mockReturnValue({
    image: 'built-image',
    cp: () => 'dest-path',
    run: () => {},
    toJSON: () => 'built-image',
  });
});

let projectRoot = '/project/lib';
let entry = '/project/lib/Cargo.toml';

describe('Bundling in Docker', () => {
  test('using cargo-zigbuild', () => {
    Bundling.bundle({
      entry,
      projectRoot,
      runtime: STANDARD_RUNTIME,
      architecture: STANDARD_ARCHITECTURE,
      forceDockerBundling: true,
    });

    expect(PackageManager.fromType).toHaveBeenCalledWith(
      PackageManagerType.CARGO_ZIGBUILD,
    );

    // Correctly bundles with cargo-zigbuild
    expect(Code.fromAsset).toHaveBeenCalledWith(
      projectRoot,
      expect.objectContaining({
        assetHashType: AssetHashType.OUTPUT,
        bundling: expect.objectContaining({
          command: [
            'bash',
            '-c',
            'cargo-zigbuild zigbuild --manifest-path=/asset-input/Cargo.toml --release --target-dir /asset-output --color always --target x86_64-unknown-linux-gnu',
          ],
          workingDirectory: '/',
        }),
      }),
    );

    expect(DockerImage.fromBuild).toHaveBeenCalledWith(
      expect.stringMatching(/aws-lambda-rust\/src$/),
      expect.objectContaining({
        buildArgs: expect.objectContaining({
          IMAGE: expect.stringMatching(/build-provided.al2023$/),
        }),
        platform: 'linux/amd64',
      }),
    );
  });

  test('with specific binary', () => {
    Bundling.bundle({
      entry,
      projectRoot,
      binaryName: 'test',
      runtime: STANDARD_RUNTIME,
      architecture: STANDARD_ARCHITECTURE,
      forceDockerBundling: true,
    });

    // Correctly bundles with cargo-zigbuild
    expect(Code.fromAsset).toHaveBeenCalledWith(
      projectRoot,
      expect.objectContaining({
        assetHashType: AssetHashType.OUTPUT,
        bundling: expect.objectContaining({
          command: [
            'bash',
            '-c',
            'cargo-zigbuild zigbuild --manifest-path=/asset-input/Cargo.toml --bin=test --release --target-dir /asset-output --color always --target x86_64-unknown-linux-gnu',
          ],
          workingDirectory: '/',
        }),
      }),
    );
  });

  test('with specific package', () => {
    Bundling.bundle({
      entry,
      projectRoot,
      packageName: 'test',
      runtime: STANDARD_RUNTIME,
      architecture: STANDARD_ARCHITECTURE,
      forceDockerBundling: true,
    });

    // Correctly bundles with cargo-zigbuild
    expect(Code.fromAsset).toHaveBeenCalledWith(
      projectRoot,
      expect.objectContaining({
        assetHashType: AssetHashType.OUTPUT,
        bundling: expect.objectContaining({
          command: [
            'bash',
            '-c',
            'cargo-zigbuild zigbuild --manifest-path=/asset-input/Cargo.toml --package=test --release --target-dir /asset-output --color always --target x86_64-unknown-linux-gnu',
          ],
          workingDirectory: '/',
        }),
      }),
    );
  });

  test('with verbose logLevel', () => {
    Bundling.bundle({
      entry,
      projectRoot,
      runtime: STANDARD_RUNTIME,
      architecture: STANDARD_ARCHITECTURE,
      forceDockerBundling: true,
      logLevel: LogLevel.VERBOSE,
    });

    // Correctly bundles with cargo-zigbuild
    expect(Code.fromAsset).toHaveBeenCalledWith(
      projectRoot,
      expect.objectContaining({
        assetHashType: AssetHashType.OUTPUT,
        bundling: expect.objectContaining({
          command: [
            'bash',
            '-c',
            'cargo-zigbuild zigbuild --manifest-path=/asset-input/Cargo.toml --release --target-dir /asset-output --color always --target x86_64-unknown-linux-gnu --verbose',
          ],
          workingDirectory: '/',
        }),
      }),
    );
  });

  test('with Silent logLevel', () => {
    Bundling.bundle({
      entry,
      projectRoot,
      runtime: STANDARD_RUNTIME,
      architecture: STANDARD_ARCHITECTURE,
      forceDockerBundling: true,
      logLevel: LogLevel.SILENT,
    });

    // Correctly bundles with cargo-zigbuild
    expect(Code.fromAsset).toHaveBeenCalledWith(
      projectRoot,
      expect.objectContaining({
        assetHashType: AssetHashType.OUTPUT,
        bundling: expect.objectContaining({
          command: [
            'bash',
            '-c',
            'cargo-zigbuild zigbuild --manifest-path=/asset-input/Cargo.toml --release --target-dir /asset-output --color always --target x86_64-unknown-linux-gnu --silent',
          ],
          workingDirectory: '/',
        }),
      }),
    );
  });

  test('with Windows path', () => {
    const osPlatformMock = jest.spyOn(os, 'platform').mockReturnValue('win32');

    Bundling.bundle({
      entry: 'C:\\my-project\\lib\\Cargo.toml',
      projectRoot: 'C:\\my-project\\lib',
      runtime: STANDARD_RUNTIME,
      architecture: STANDARD_ARCHITECTURE,
      forceDockerBundling: true,
    });

    // Correctly bundles with cargo-zigbuild
    expect(Code.fromAsset).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        bundling: expect.objectContaining({
          command: expect.arrayContaining([
            expect.stringContaining('/lib/Cargo.toml'),
          ]),
        }),
      }),
    );
    osPlatformMock.mockRestore();
  });

  test('with custom profile', () => {
    Bundling.bundle({
      entry,
      projectRoot,
      profile: 'custom',
      runtime: STANDARD_RUNTIME,
      architecture: STANDARD_ARCHITECTURE,
      forceDockerBundling: true,
    });

    // Correctly bundles with cargo-zigbuild
    expect(Code.fromAsset).toHaveBeenCalledWith(
      projectRoot,
      expect.objectContaining({
        assetHashType: AssetHashType.OUTPUT,
        bundling: expect.objectContaining({
          command: [
            'bash',
            '-c',
            'cargo-zigbuild zigbuild --manifest-path=/asset-input/Cargo.toml --profile=custom --release --target-dir /asset-output --color always --target x86_64-unknown-linux-gnu',
          ],
          workingDirectory: '/',
        }),
      }),
    );
  });

  test('with ARM target', () => {
    Bundling.bundle({
      entry,
      projectRoot,
      runtime: STANDARD_RUNTIME,
      architecture: Architecture.ARM_64,
      forceDockerBundling: true,
    });

    // Correctly bundles with cargo-zigbuild
    expect(Code.fromAsset).toHaveBeenCalledWith(
      projectRoot,
      expect.objectContaining({
        assetHashType: AssetHashType.OUTPUT,
        bundling: expect.objectContaining({
          command: [
            'bash',
            '-c',
            'cargo-zigbuild zigbuild --manifest-path=/asset-input/Cargo.toml --release --target-dir /asset-output --color always --target aarch64-unknown-linux-gnu',
          ],
          workingDirectory: '/',
        }),
      }),
    );
  });

  test('with extra build args', () => {
    Bundling.bundle({
      entry,
      projectRoot,
      runtime: STANDARD_RUNTIME,
      architecture: STANDARD_ARCHITECTURE,
      forceDockerBundling: true,
      extraBuildArgs: ['--frozen', '--offline'],
    });

    // Correctly bundles with cargo-zigbuild
    expect(Code.fromAsset).toHaveBeenCalledWith(
      projectRoot,
      expect.objectContaining({
        assetHashType: AssetHashType.OUTPUT,
        bundling: expect.objectContaining({
          command: [
            'bash',
            '-c',
            'cargo-zigbuild zigbuild --manifest-path=/asset-input/Cargo.toml --release --target-dir /asset-output --color always --frozen --offline --target x86_64-unknown-linux-gnu',
          ],
          workingDirectory: '/',
        }),
      }),
    );
  });

  test('with custom Docker image', () => {
    Bundling.bundle({
      entry,
      projectRoot,
      runtime: STANDARD_RUNTIME,
      architecture: STANDARD_ARCHITECTURE,
      forceDockerBundling: true,
      dockerImage: DockerImage.fromRegistry('my-custom-image'),
    });

    expect(Code.fromAsset).toHaveBeenCalledWith(projectRoot, {
      assetHashType: AssetHashType.OUTPUT,
      bundling: expect.objectContaining({
        image: { image: 'my-custom-image' },
      }),
    });
  });

  test('with Docker build args', () => {
    Bundling.bundle({
      entry,
      projectRoot,
      runtime: STANDARD_RUNTIME,
      architecture: STANDARD_ARCHITECTURE,
      buildArgs: {
        HELLO: 'WORLD',
      },
      forceDockerBundling: true,
    });

    expect(DockerImage.fromBuild).toHaveBeenCalledWith(
      expect.stringMatching(/src$/),
      expect.objectContaining({
        buildArgs: expect.objectContaining({
          HELLO: 'WORLD',
        }),
      }),
    );
  });

  test('with command hooks', () => {
    Bundling.bundle({
      entry,
      projectRoot,
      runtime: STANDARD_RUNTIME,
      architecture: STANDARD_ARCHITECTURE,
      forceDockerBundling: true,
      commandHooks: {
        beforeBundling(inputDir: string, outputDir: string): string[] {
          return [
            `echo hello > ${inputDir}/a.txt`,
            `cp ${inputDir}/a.txt ${outputDir}`,
          ];
        },
        afterBundling(inputDir: string, outputDir: string): string[] {
          return [`cp ${inputDir}/b.txt ${outputDir}/txt`];
        },
      },
    });

    expect(Code.fromAsset).toHaveBeenCalledWith(projectRoot, {
      assetHashType: AssetHashType.OUTPUT,
      bundling: expect.objectContaining({
        command: [
          'bash',
          '-c',
          expect.stringMatching(
            /^echo hello > \/asset-input\/a.txt && cp \/asset-input\/a.txt \/asset-output && .+ && cp \/asset-input\/b.txt \/asset-output\/txt$/,
          ),
        ],
      }),
    });
  });

  test('with custom hash', () => {
    Bundling.bundle({
      entry,
      projectRoot,
      runtime: STANDARD_RUNTIME,
      forceDockerBundling: true,
      assetHash: 'custom',
      architecture: STANDARD_ARCHITECTURE,
    });

    // Correctly passes asset hash options
    expect(Code.fromAsset).toHaveBeenCalledWith(
      projectRoot,
      expect.objectContaining({
        assetHash: 'custom',
        assetHashType: AssetHashType.CUSTOM,
      }),
    );
  });

  test('Custom bundling entrypoint', () => {
    Bundling.bundle({
      entry,
      projectRoot,
      runtime: STANDARD_RUNTIME,
      architecture: STANDARD_ARCHITECTURE,
      forceDockerBundling: true,
      entrypoint: ['/cool/entrypoint', '--cool-entrypoint-arg'],
    });

    expect(Code.fromAsset).toHaveBeenCalledWith(projectRoot, {
      assetHashType: AssetHashType.OUTPUT,
      bundling: expect.objectContaining({
        entrypoint: ['/cool/entrypoint', '--cool-entrypoint-arg'],
      }),
    });
  });

  test('Custom bundling volumes', () => {
    Bundling.bundle({
      entry,
      projectRoot,
      runtime: STANDARD_RUNTIME,
      architecture: Architecture.X86_64,
      forceDockerBundling: true,
      volumes: [{ hostPath: '/host-path', containerPath: '/container-path' }],
    });

    expect(Code.fromAsset).toHaveBeenCalledWith(projectRoot, {
      assetHashType: AssetHashType.OUTPUT,
      bundling: expect.objectContaining({
        volumes: [{ hostPath: '/host-path', containerPath: '/container-path' }],
      }),
    });
  });

  test('Custom bundling volumesFrom', () => {
    Bundling.bundle({
      entry,
      projectRoot,
      runtime: STANDARD_RUNTIME,
      architecture: STANDARD_ARCHITECTURE,
      forceDockerBundling: true,
      volumesFrom: ['777f7dc92da7'],
    });

    expect(Code.fromAsset).toHaveBeenCalledWith(projectRoot, {
      assetHashType: AssetHashType.OUTPUT,
      bundling: expect.objectContaining({
        volumesFrom: ['777f7dc92da7'],
      }),
    });
  });

  test('Custom bundling workingDirectory', () => {
    Bundling.bundle({
      entry,
      projectRoot,
      runtime: STANDARD_RUNTIME,
      architecture: STANDARD_ARCHITECTURE,
      forceDockerBundling: true,
      workingDirectory: '/working-directory',
    });

    expect(Code.fromAsset).toHaveBeenCalledWith(projectRoot, {
      assetHashType: AssetHashType.OUTPUT,
      bundling: expect.objectContaining({
        workingDirectory: '/working-directory',
      }),
    });
  });

  test('Custom bundling user', () => {
    Bundling.bundle({
      entry,
      projectRoot,
      runtime: STANDARD_RUNTIME,
      architecture: STANDARD_ARCHITECTURE,
      forceDockerBundling: true,
      user: 'user:group',
    });

    expect(Code.fromAsset).toHaveBeenCalledWith(projectRoot, {
      assetHashType: AssetHashType.OUTPUT,
      bundling: expect.objectContaining({
        user: 'user:group',
      }),
    });
  });

  test('Custom bundling securityOpt', () => {
    Bundling.bundle({
      entry,
      projectRoot,
      runtime: STANDARD_RUNTIME,
      architecture: STANDARD_ARCHITECTURE,
      forceDockerBundling: true,
      securityOpt: 'no-new-privileges',
    });

    expect(Code.fromAsset).toHaveBeenCalledWith(projectRoot, {
      assetHashType: AssetHashType.OUTPUT,
      bundling: expect.objectContaining({
        securityOpt: 'no-new-privileges',
      }),
    });
  });

  test('Custom bundling network', () => {
    Bundling.bundle({
      entry,
      projectRoot,
      runtime: STANDARD_RUNTIME,
      architecture: STANDARD_ARCHITECTURE,
      forceDockerBundling: true,
      network: 'host',
    });

    expect(Code.fromAsset).toHaveBeenCalledWith(projectRoot, {
      assetHashType: AssetHashType.OUTPUT,
      bundling: expect.objectContaining({
        network: 'host',
      }),
    });
  });

  test('Custom bundling file copy variant', () => {
    Bundling.bundle({
      entry,
      projectRoot,
      runtime: STANDARD_RUNTIME,
      architecture: STANDARD_ARCHITECTURE,
      forceDockerBundling: true,
      bundlingFileAccess: BundlingFileAccess.VOLUME_COPY,
    });

    expect(Code.fromAsset).toHaveBeenCalledWith(projectRoot, {
      assetHashType: AssetHashType.OUTPUT,
      bundling: expect.objectContaining({
        bundlingFileAccess: BundlingFileAccess.VOLUME_COPY,
      }),
    });
  });
});

describe('Bundling locally', () => {
  test('Local bundling', () => {
    jest.spyOn(PackageManager, 'fromType').mockReturnValue(
      new PackageManager({
        buildCommand: ['zigbuild'],
        runCommand: 'cargo-zigbuild',
        crossCompile: true,
        runLocally: true,
        type: PackageManagerType.CARGO_ZIGBUILD,
      }),
    );
    const spawnSyncMock = jest
      .spyOn(child_process, 'spawnSync')
      .mockReturnValue({
        status: 0,
        stderr: Buffer.from('stderr'),
        stdout: Buffer.from('x86_64-unknown-linux-gnu'),
        pid: 123,
        output: ['stdout', 'stderr'],
        signal: null,
      });

    const bundler = new Bundling({
      entry,
      projectRoot,
      runtime: STANDARD_RUNTIME,
      architecture: STANDARD_ARCHITECTURE,
      environment: {
        KEY: 'value',
      },
    });

    expect(bundler.local).toBeDefined();

    const tryBundle = bundler.local?.tryBundle('/outdir', {
      image: STANDARD_RUNTIME.bundlingImage,
    });
    expect(tryBundle).toBe(true);

    expect(spawnSyncMock).toHaveBeenCalledWith(
      'bash',
      expect.arrayContaining(['-c', expect.stringContaining(entry)]),
      expect.objectContaining({
        env: expect.objectContaining({ KEY: 'value' }),
        cwd: '/project/lib',
      }),
    );

    // Docker image is not built
    expect(DockerImage.fromBuild).not.toHaveBeenCalled();

    spawnSyncMock.mockRestore();
  });
});
