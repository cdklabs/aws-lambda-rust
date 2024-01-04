import * as child_process from 'child_process';
import { PackageManagerType } from '../lib';
import { PackageManager } from '../lib/package-manager';

jest.mock('child_process');

beforeEach(() => {
  jest.clearAllMocks();
});

test('Cargo-Zigbuild package manager', () => {
  const spawnSyncMock = jest.spyOn(child_process, 'spawnSync').mockReturnValue({
    status: 0,
    stderr: Buffer.from('stderr'),
    stdout: Buffer.from('global-version'),
    pid: 123,
    output: ['stdout', 'stderr'],
    signal: null,
  });

  expect(PackageManager.fromType(PackageManagerType.CARGO_ZIGBUILD)).toEqual({
    runCommand: 'cargo-zigbuild',
    buildCommand: ['zigbuild'],
    runLocally: true,
    crossCompile: true,
    type: PackageManagerType.CARGO_ZIGBUILD,
  });

  spawnSyncMock.mockRestore();
});

test('Cargo-Zigbuild package manager build command', () => {
  const spawnSyncMock = jest.spyOn(child_process, 'spawnSync').mockReturnValue({
    status: 0,
    stderr: Buffer.from('stderr'),
    stdout: Buffer.from('global-version'),
    pid: 123,
    output: ['stdout', 'stderr'],
    signal: null,
  });

  const manager = PackageManager.fromType(PackageManagerType.CARGO_ZIGBUILD);

  expect(manager.runBuildCommand()).toEqual('cargo-zigbuild zigbuild');

  spawnSyncMock.mockRestore();
});

test('Cross package manager', () => {
  const spawnSyncMock = jest.spyOn(child_process, 'spawnSync').mockReturnValue({
    status: 0,
    stderr: Buffer.from('stderr'),
    stdout: Buffer.from('global-version'),
    pid: 123,
    output: ['stdout', 'stderr'],
    signal: null,
  });

  expect(PackageManager.fromType(PackageManagerType.CROSS)).toEqual({
    runCommand: 'cross',
    buildCommand: ['build'],
    runLocally: true,
    crossCompile: true,
    type: PackageManagerType.CROSS,
  });

  spawnSyncMock.mockRestore();
});

test('Cross package manager build command', () => {
  const spawnSyncMock = jest.spyOn(child_process, 'spawnSync').mockReturnValue({
    status: 0,
    stderr: Buffer.from('stderr'),
    stdout: Buffer.from('global-version'),
    pid: 123,
    output: ['stdout', 'stderr'],
    signal: null,
  });

  const manager = PackageManager.fromType(PackageManagerType.CROSS);
  expect(manager.runBuildCommand()).toEqual('cross build');

  spawnSyncMock.mockRestore();
});
