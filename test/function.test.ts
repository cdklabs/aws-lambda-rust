import * as path from 'path';
import { Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { CodeConfig, Runtime } from 'aws-cdk-lib/aws-lambda';
import { RustFunction } from '../lib';
import { Bundling } from '../lib/bundling';
import * as util from '../lib/util';

jest.mock('../lib/bundling', () => {
  return {
    Bundling: {
      bundle: jest.fn().mockReturnValue({
        bind: (): CodeConfig => {
          return {
            s3Location: {
              bucketName: 'my-bucket',
              objectKey: 'my-key',
            },
          };
        },
        bindToResource: () => {
          return;
        },
      }),
    },
  };
});

let stack: Stack;
beforeEach(() => {
  stack = new Stack();
  jest.clearAllMocks();
  jest.spyOn(util, 'isWorkspace').mockReturnValue(false);
  jest.spyOn(util, 'hasMultipleBinaries').mockReturnValue(false);
  jest.spyOn(util, 'getBinaryName').mockReturnValue('testBin');
});

test('RustFunction with defaults', () => {
  // WHEN
  new RustFunction(stack, 'binary1');

  expect(Bundling.bundle).toHaveBeenCalledWith(
    expect.objectContaining({
      entry: expect.stringContaining('function.test.binary1/Cargo.toml'),
    }),
  );

  Template.fromStack(stack).hasResourceProperties('AWS::Lambda::Function', {
    Handler: 'not-used',
    Runtime: Match.stringLikeRegexp('provided'),
  });
});

test('RustFunction with container env vars', () => {
  // WHEN
  new RustFunction(stack, 'binary1', {
    bundling: {
      environment: {
        KEY: 'VALUE',
      },
    },
  });

  expect(Bundling.bundle).toHaveBeenCalledWith(
    expect.objectContaining({
      environment: {
        KEY: 'VALUE',
      },
    }),
  );
});

test('RustFunction with specific package', () => {
  // WHEN
  new RustFunction(stack, 'binary1', {
    entry: path.join(__dirname, 'rust-workspaces/Cargo.toml'),
    packageName: 'my_lambda1',
  });

  expect(Bundling.bundle).toHaveBeenCalledWith(
    expect.objectContaining({
      packageName: 'my_lambda1',
    }),
  );
});


test('RustFunction with specific bins', () => {
  // WHEN
  new RustFunction(stack, 'binary1', {
    entry: path.join(__dirname, 'rust-workspaces/Cargo.toml'),
    binaryName: 'my_lambda1',
  });

  expect(Bundling.bundle).toHaveBeenCalledWith(
    expect.objectContaining({
      binaryName: 'my_lambda1',
    }),
  );
});

test('throws when entry is not Cargo.toml', () => {
  expect(
    () =>
      new RustFunction(stack, 'Fn', {
        entry: 'NotToml/',
      }),
  ).toThrow(
    'Only entry pointing to a manifest (Cargo.toml) file are supported.',
  );
});

test('throws when entry does not exist', () => {
  expect(
    () =>
      new RustFunction(stack, 'Fn', {
        entry: 'folder/Cargo.toml',
      }),
  ).toThrow(/Cannot find manifest file at folder/);
});

test('throws when entry cannot be automatically found', () => {
  expect(() => new RustFunction(stack, 'Fn')).toThrow(
    /Cannot find manifest file - Cargo.toml/,
  );
});

test('throws with the wrong runtime family', () => {
  expect(
    () =>
      new RustFunction(stack, 'binary1', {
        runtime: Runtime.PYTHON_3_8,
      }),
  ).toThrow(/Only `Custom` runtimes are supported/);
});

test('defaults to AL2023', () => {
  // WHEN
  new RustFunction(stack, 'binary1');

  Template.fromStack(stack).hasResourceProperties('AWS::Lambda::Function', {
    Runtime: Runtime.PROVIDED_AL2023.toString(),
  });
});
