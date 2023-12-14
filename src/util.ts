import { spawnSync, SpawnSyncOptions } from 'child_process';

/**
 * Spawn sync with error handling
 */
export function exec(cmd: string, args: string[], options?: SpawnSyncOptions) {
  const proc = spawnSync(cmd, args, options);

  if (proc.error) {
    throw proc.error;
  }

  if (proc.status !== 0) {
    if (proc.stdout || proc.stderr) {
      throw new Error(`[Status ${proc.status}] stdout: ${proc.stdout?.toString().trim()}\n\n\nstderr: ${proc.stderr?.toString().trim()}`);
    }
    throw new Error(`${cmd} exited with status ${proc.status}`);
  }

  return proc;
}

export function canRunLocally(cmd: string) {
  try {
    const proc = spawnSync(cmd, ['--version']);
    if (proc.status === 0 && !proc.error) {
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
}
