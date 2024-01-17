import { spawnSync, SpawnSyncOptions } from 'child_process';
import { readFileSync } from 'fs';
import * as toml from 'toml';

export interface CallSite {
  getThis(): any;
  getTypeName(): string;
  getFunctionName(): string;
  getMethodName(): string;
  getFileName(): string;
  getLineNumber(): number;
  getColumnNumber(): number;
  getFunction(): Function;
  getEvalOrigin(): string;
  isNative(): boolean;
  isToplevel(): boolean;
  isEval(): boolean;
  isConstructor(): boolean;
}

export interface Package {
  name: string;
}

/**
 * Base layout of a Rust manifest file
 */
export interface TomlProps {
  readonly package?: Package;
  readonly workspace?: {
    members: string[];
  };
  readonly bin?: Package[];
}

/**
 * Get Manifest binary name
 * @param entry the Manifest file path
 */
export function getBinaryName(entry: string) {
  try {
    const contents = readFileSync(entry, 'utf8');
    let data: TomlProps = toml.parse(contents);
    if (data.bin && data.bin.length == 1) {
      return data.bin[0].name;
    }
    return data.package?.name;
  } catch (err) {
    throw new Error(
      `Unable to parse Manifest file \`${entry}\`\n` + `${err}\n`,
    );
  }
}

export function hasMultipleBinaries(entry: string) {
  try {
    const contents = readFileSync(entry, 'utf8');
    let data: TomlProps = toml.parse(contents);
    return data.bin && data.bin.length > 1;
  } catch (err) {
    throw new Error(
      `Unable to parse Manifest file \`${entry}\`\n` + `${err}\n`,
    );
  }
}

/**
 * Check if the given Manifest contains multiple workspaces
 * @param entry the Manifest file path
 */
export function isWorkspace(entry: string) {
  try {
    const contents = readFileSync(entry, 'utf8');
    let data: TomlProps = toml.parse(contents);
    return (
      data.workspace &&
      data.workspace.members &&
      data.workspace.members.length > 0
    );
  } catch (err) {
    throw new Error(
      `Unable to parse Manifest file \`${entry}\`\n` + `${err}\n`,
    );
  }
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
      throw new Error(
        `[Status ${proc.status}] stdout: ${proc.stdout
          ?.toString()
          .trim()}\n\n\nstderr: ${proc.stderr?.toString().trim()}`,
      );
    }
    throw new Error(`${cmd} exited with status ${proc.status}`);
  }

  return proc;
}

/**
 * Check if an architecture target is installed.
 * @param target The target to test
 */
export function checkInstalledTarget(target: string) {
  const proc = spawnSync('rustup', ['target', 'list', '--installed']);
  if (
    proc &&
    proc.status === 0 &&
    !proc.error &&
    proc.stdout.toString().includes(target)
  ) {
    return true;
  }
  return false;
}

/**
 * Check if a command can be run locally.
 * @param cmd The command to execute
 */
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

/**
 * Get callsites from the V8 stack trace API
 *
 * https://github.com/sindresorhus/callsites
 */
export function callsites(): CallSite[] {
  const _prepareStackTrace = Error.prepareStackTrace;
  Error.prepareStackTrace = (_, stack) => stack;
  const stack = new Error().stack?.slice(1);
  Error.prepareStackTrace = _prepareStackTrace;
  return stack as unknown as CallSite[];
}
