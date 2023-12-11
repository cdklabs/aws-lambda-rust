import { spawnSync, SpawnSyncOptions } from 'child_process';
import { readFileSync } from 'fs';
import { load } from 'js-toml';

export interface Workspace {
  members: string[];
}

export interface Package {
  name: string;
}

export interface CargoManifest {
  package?: Package;
  bin?: Package[];
  workspace?: Workspace;
}


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

/**
 * Read Cargo Manifest (Cargo.toml) file
 * @param path Path to Cargo.toml file
 */
export function getCargoManifest(path: string): CargoManifest {
  try {
    const data = readFileSync(path);
    return load(data.toString('utf-8')) as CargoManifest;
  } catch (err) {
    throw new Error(
      `Unable to find or parse Cargo.toml at \`${path}\`\n` +
        `${err}\n`,
    );
  }
}
