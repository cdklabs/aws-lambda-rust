import * as child_process from 'child_process';
import { callsites } from 'aws-cdk-lib/aws-lambda-nodejs/lib/util';
import { Bundling } from '../lib/bundling';
import { checkInstalledTarget, exec } from '../lib/util';
import { canRunLocally } from '../src/util';

jest.mock('child_process');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('exec', () => {
  test('normal execution', () => {
    const spawnSyncMock = jest
      .spyOn(child_process, 'spawnSync')
      .mockReturnValue({
        status: 0,
        stderr: Buffer.from('stderr'),
        stdout: Buffer.from('stdout'),
        pid: 123,
        output: ['stdout', 'stderr'],
        signal: null,
      });

    const proc = exec('cmd', ['arg1', 'arg2'], { env: { KEY: 'value' } });

    expect(spawnSyncMock).toHaveBeenCalledWith('cmd', ['arg1', 'arg2'], {
      env: { KEY: 'value' },
    });
    expect(proc.stdout.toString()).toBe('stdout');

    spawnSyncMock.mockRestore();
  });

  test('non zero status', () => {
    const spawnSyncMock = jest
      .spyOn(child_process, 'spawnSync')
      .mockReturnValue({
        status: 999,
        stderr: Buffer.from('error occured'),
        stdout: Buffer.from('stdout'),
        pid: 123,
        output: ['stdout', 'stderr'],
        signal: null,
      });

    expect(() => exec('cmd', ['arg1', 'arg2'])).toThrow('error occured');

    spawnSyncMock.mockRestore();
  });

  test('with error', () => {
    const spawnSyncMock = jest
      .spyOn(child_process, 'spawnSync')
      .mockReturnValue({
        error: new Error('bad error'),
        status: 0,
        stderr: Buffer.from('stderr'),
        stdout: Buffer.from('stdout'),
        pid: 123,
        output: ['stdout', 'stderr'],
        signal: null,
      });

    expect(() => exec('cmd', ['arg1', 'arg2'])).toThrow(new Error('bad error'));

    spawnSyncMock.mockRestore();
  });
});

describe('canRunLocally', () => {
  test('Can run cmd locally', () => {
    const spawnSyncMock = jest
      .spyOn(child_process, 'spawnSync')
      .mockReturnValue({
        status: 0,
        stderr: Buffer.from('stderr'),
        stdout: Buffer.from('global-version'),
        pid: 123,
        output: ['stdout', 'stderr'],
        signal: null,
      });

    expect(canRunLocally('test')).toEqual(true);

    spawnSyncMock.mockRestore();
  });

  test('Cannot run cmd locally', () => {
    const spawnSyncMock = jest
      .spyOn(child_process, 'spawnSync')
      .mockReturnValue({
        error: new Error('bad error'),
        status: 0,
        stderr: Buffer.from('stderr'),
        stdout: Buffer.from('global-version'),
        pid: 123,
        output: ['stdout', 'stderr'],
        signal: null,
      });

    expect(canRunLocally('test')).toEqual(false);

    spawnSyncMock.mockRestore();
  });
});

describe('canRunLocally', () => {
  test('Can run cmd locally', () => {
    const spawnSyncMock = jest
      .spyOn(child_process, 'spawnSync')
      .mockReturnValue({
        status: 0,
        stderr: Buffer.from('stderr'),
        stdout: Buffer.from('global-version'),
        pid: 123,
        output: ['stdout', 'stderr'],
        signal: null,
      });

    expect(canRunLocally('test')).toEqual(true);

    spawnSyncMock.mockRestore();
  });

  test('Cannot run cmd locally', () => {
    const spawnSyncMock = jest
      .spyOn(child_process, 'spawnSync')
      .mockReturnValue({
        error: new Error('bad error'),
        status: 0,
        stderr: Buffer.from('stderr'),
        stdout: Buffer.from('global-version'),
        pid: 123,
        output: ['stdout', 'stderr'],
        signal: null,
      });

    expect(canRunLocally('test')).toEqual(false);

    spawnSyncMock.mockRestore();
  });
});

describe('checkInstalledTarget', () => {
  test('Target installed', () => {
    const spawnSyncMock = jest
      .spyOn(child_process, 'spawnSync')
      .mockReturnValue({
        status: 0,
        stderr: Buffer.from('stderr'),
        stdout: Buffer.from(
          '' +
            'aarch64-apple-darwin\n' +
            'aarch64-unknown-linux-gnu\n' +
            'x86_64-unknown-linux-gnu',
        ),
        pid: 123,
        output: ['stdout', 'stderr'],
        signal: null,
      });

    expect(checkInstalledTarget(Bundling.ARM_TARGET)).toEqual(true);

    spawnSyncMock.mockRestore();
  });

  test('Target not installed', () => {
    const spawnSyncMock = jest
      .spyOn(child_process, 'spawnSync')
      .mockReturnValue({
        status: 0,
        stderr: Buffer.from('stderr'),
        stdout: Buffer.from(
          '' + 'aarch64-apple-darwin\n' + 'x86_64-unknown-linux-gnu',
        ),
        pid: 123,
        output: ['stdout', 'stderr'],
        signal: null,
      });

    expect(checkInstalledTarget(Bundling.ARM_TARGET)).toEqual(false);

    spawnSyncMock.mockRestore();
  });
});

describe('callsites', () => {
  expect(callsites()[0].getFileName()).toMatch(/\/test\/util.test.ts$/);
});
