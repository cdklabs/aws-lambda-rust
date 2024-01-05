import * as os from 'os';
import { PackageManagerType } from './types';
import { canRunLocally } from './util';

interface PackageManagerProps {
  readonly runCommand: string;
  readonly buildCommand: string[];
  readonly crossCompile: boolean;
  readonly runLocally: boolean;
  readonly type: PackageManagerType;
}

/**
 * A Rust package manager
 */
export class PackageManager {
  /**
   * Create a package manager from a package manager type. Method will also check if it can be runned locally
   * @param type Package manager used
   * @returns the right PackageManager for that type
   */
  public static fromType(type: PackageManagerType): PackageManager {
    let runCommand = 'cargo-zigbuild';
    let buildCommand = ['zigbuild'];
    let crossCompile = true;

    if (type === PackageManagerType.CROSS) {
      runCommand = 'cross';
      buildCommand = ['build'];
    }
    return new PackageManager({
      runCommand: runCommand,
      buildCommand: buildCommand,
      runLocally: canRunLocally(runCommand),
      crossCompile: crossCompile,
      type,
    });
  }

  public readonly runCommand: string;
  public readonly buildCommand: string[];
  public readonly runLocally: boolean;
  public readonly crossCompile: boolean;
  public readonly type: PackageManagerType;

  constructor(props: PackageManagerProps) {
    this.runCommand = props.runCommand;
    this.buildCommand = props.buildCommand;
    this.crossCompile = props.crossCompile;
    this.runLocally = props.runLocally;
    this.type = props.type;
  }

  public runBuildCommand(): string {
    return [
      os.platform() === 'win32' ? `${this.runCommand}.cmd` : this.runCommand,
      ...this.buildCommand,
    ].join(' ');
  }
}
