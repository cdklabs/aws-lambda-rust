import { spawnSync, SpawnSyncOptions } from 'child_process';

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
