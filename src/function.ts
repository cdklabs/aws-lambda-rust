import * as fs from 'fs';
import * as path from 'path';
import {
  Architecture,
  FunctionOptions,
  Runtime,
  RuntimeFamily,
  Function,
} from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { Bundling } from './bundling';
import { BundlingOptions } from './types';
import { callsites } from './util';

/**
 * Properties for a RustFunction
 */
export interface RustFunctionProps extends FunctionOptions {
  /**
   * Path to the entry Cargo.toml file.
   *
   * @default - Derived from the name of the defining file and the construct's id.
   * If the `RustsFunction` is defined in `stack.ts` with `my-binary` as id
   * (`new RustFunction(this, 'my-binary')`), the construct will look at `stack.my-binary/Cargo.toml`
   */
  readonly entry?: string;

  /**
   * The name of the binary to build, in case that it's different that the package's name.
   *
   * @default Build all binaries
   */
  readonly binaryName?: string;

  /**
   * The runtime environment. Only OS-only runtimes are supported.
   *
   * @default `Runtime.PROVIDED_AL2023`
   */
  readonly runtime?: Runtime;

  /**
   * Bundling options
   *
   * @default - use default bundling options: all
   * binaries and packages are bundled.
   */
  readonly bundling?: BundlingOptions;

  /**
   * The path to the directory containing project Manifest file
   *
   * @default - the directory containing the `depsLockFilePath`
   */
  readonly projectRoot?: string;
}

/**
 * A Rust Lambda function
 */
export class RustFunction extends Function {
  constructor(scope: Construct, id: string, props: RustFunctionProps = {}) {
    if (props.runtime && props.runtime.family !== RuntimeFamily.OTHER) {
      throw new Error('Only `Custom` runtimes are supported.');
    }

    // Entry and defaults
    const entry = path.resolve(findEntry(id, props.entry));
    // Handler is not important for Rust function
    const handler = 'rust.handler';
    const architecture = props.architecture ?? Architecture.X86_64;
    const runtime = props.runtime ?? Runtime.PROVIDED_AL2023;

    super(scope, id, {
      ...props,
      runtime,
      code: Bundling.bundle({
        ...(props.bundling ?? {}),
        entry,
        runtime,
        architecture,
        binaryName: props.binaryName,
      }),
      handler: handler,
    });
  }
}

/**
 * Searches for an entry file. Preference order is the following:
 * 1. Given entry file
 * 2. A Cargo.toml file named as the defining file with id as u (defining-file.id/Cargo.toml)
 */
function findEntry(id: string, entry?: string): string {
  if (entry) {
    if (!/\Cargo.toml$/.test(entry)) {
      // Only Cargo.toml files are supported.
      // If the user gave a path to a directory, we'll look for a Cargo.toml file in it.
      // If the user gave a path to a file, we'll use it as-is.
      entry = path.join(entry, 'Cargo.toml');
    }

    if (!fs.existsSync(entry)) {
      throw new Error(`Cannot find manifest file at ${entry}`);
    }

    return entry;
  }

  const definingFile = findDefiningFile();
  const extname = path.extname(definingFile);

  const manifestFile = definingFile.replace(
    new RegExp(`${extname}$`),
    `.${id}/Cargo.toml`,
  );
  if (fs.existsSync(manifestFile)) {
    return manifestFile;
  }

  throw new Error('Cannot find manifest file - Cargo.toml');
}

/**
 * Finds the name of the file where the `RustFunction` is defined
 */
function findDefiningFile(): string {
  let definingIndex;
  const sites = callsites();
  for (const [index, site] of sites.entries()) {
    if (site.getFunctionName() === 'RustFunction') {
      // The next site is the site where the RustFunction was created
      definingIndex = index + 1;
      break;
    }
  }

  if (!definingIndex || !sites[definingIndex]) {
    throw new Error('Cannot find defining file.');
  }

  return sites[definingIndex].getFileName();
}
