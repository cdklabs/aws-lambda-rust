import * as path from 'path';
import { Architecture, Code, Runtime } from 'aws-cdk-lib/aws-lambda';
import { AssetHashType, DockerImage } from 'aws-cdk-lib/core';
import { Bundling } from '../lib/bundling';
import { PackageManager, PackageManagerType } from '../lib/package-manager';

const STANDARD_RUNTIME = Runtime.PROVIDED_AL2;
const STANDARD_ARCHITECTURE = Architecture.X86_64;

// Mock
let packageManagerMock: jest.SpyInstance<PackageManager | undefined>;

beforeEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();

  jest.spyOn(Code, 'fromAsset');

  packageManagerMock = jest.spyOn(PackageManager, 'fromType').mockReturnValue(new PackageManager({
    buildCommand: ['build'],
    runCommand: 'cargo',
    crossCompile: true,
    runLocally: false,
  }));

  jest.spyOn(DockerImage, 'fromBuild').mockReturnValue({
    image: 'built-image',
    cp: () => 'dest-path',
    run: () => {},
    toJSON: () => 'built-image',
  });
});

let projectRoot = '/project';
let manifestPath = '/project/lib/Cargo.toml';

test('Bundling in Docker using cargo-zigbuild', () => {
  Bundling.bundle({
    manifestPath,
    projectRoot,
    runtime: STANDARD_RUNTIME,
    architecture: STANDARD_ARCHITECTURE,
    environment: {
      KEY: 'value',
    },
    forceDockerBundling: true,
  });

  expect(packageManagerMock).toHaveBeenCalledWith(PackageManagerType.CARGO_ZIGBUILD);

  // Correctly bundles with cargo-zigbuild
  expect(Code.fromAsset).toHaveBeenCalledWith(path.dirname(manifestPath), {
    assetHashType: AssetHashType.OUTPUT,
    bundling: expect.objectContaining({
      environment: {
        KEY: 'value',
      },
      command: [
        'bash', '-c',
        'cargo-zigbuild --manifest-path=/asset-input/lib/Cargo.toml --workspace --bins --release --target-dir /asset-output --color always --target x86_64-unknown-linux-gnu',
      ],
      workingDirectory: '/',
    }),
  });

  expect(DockerImage.fromBuild).toHaveBeenCalledWith(expect.stringMatching(/aws-lambda-nodejs\/lib$/), expect.objectContaining({
    buildArgs: expect.objectContaining({
      IMAGE: expect.stringMatching(/build-nodejs/),
    }),
    platform: 'linux/amd64',
  }));

});

test('Bundling in Docker using cross', () => {

});

test('Bundling in Docker with workspace', () => {

});

test('Bundling in Docker with verbose logLevel', () => {

});

test('Bundling in Docker with Windows path', () => {

});

test('Bundling in Docker with custom profile', () => {

});

test('Bundling in Docker with custom target', () => {

});

test('Bundling in Docker with invalid target', () => {

});

test('Bundling in Docker with extra build args', () => {

});

test('Bundling with custom Docker image', () => {

});

test('Bundling in Docker with comand hooks', () => {

});

test('Local bundling', () => {

});

test('Bundling in Docker with extra build args', () => {

});
