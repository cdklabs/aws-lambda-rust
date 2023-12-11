import { spawnSync } from 'child_process';
/**
 * Crate installation
 */
export abstract class CrateInstallation {
  public static detect(module: string): CrateInstallation | undefined {
    try {
      // Fallback to a global version
      const proc = spawnSync(module, ['--version']);
      if (proc.status === 0 && !proc.error) {
        return {
          version: proc.stdout.toString().trim(),
        };
      }
      return undefined;
    } catch (err) {
      return undefined;
    }
  }

  public abstract readonly version: string;
}
