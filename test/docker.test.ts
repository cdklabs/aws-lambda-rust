import { spawnSync } from 'child_process';
import * as path from 'path';

const docker = process.env.CDK_DOCKER ?? 'docker';

beforeAll(() => {
  const process = spawnSync(
    docker,
    ['build', '-t', 'cargo-builder', path.join(__dirname, '../')],
    { stdio: 'inherit' },
  );
  expect(process.error).toBeUndefined();
  expect(process.status).toBe(0);
});

test('cargo is available', () => {
  const proc = spawnSync(docker, [
    'run',
    'cargo-builder',
    'cargo',
    '--version',
  ]);
  expect(proc.status).toEqual(0);
});

test('cargo-zigbuild is available', () => {
  const proc = spawnSync(docker, [
    'run',
    'cargo-builder',
    'cargo-zigbuild',
    '--version',
  ]);
  expect(proc.status).toEqual(0);
});

test('cross is available', () => {
  const proc = spawnSync(docker, [
    'run',
    'cargo-builder',
    'cross',
    '--version',
  ]);
  expect(proc.status).toEqual(0);
});

test('cache folders have the right permissions', () => {
  const proc = spawnSync(docker, [
    'run',
    'cargo-builder',
    'bash',
    '-c',
    "stat -c '%a' /usr/local/cargo/bin",
  ]);
  expect(proc.stdout.toString()).toMatch('777');
});
