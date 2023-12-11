# Amazon Lambda Rust Library

This library provides constructs for Rust Lambda functions.

The `RustFunction` construct creates a Lambda function with automatic building and bundling of Rust code.

To use this module you will either need to have `cargo-lambda` installed or Docker installed.

See [Local Bundling/Docker Bundling](#local-bundling) for more information.

## Rust Function

By default, the construct will use directory where cdk was invoked as directory where Cargo file is located.

```plaintext
.
├── Cargo.toml
└── src
    └── main.rs
```

It will use the package name as defined in the main `Cargo.toml`:

```typescript
new RustFunction(this, "my_function");
```

Alternatively, `bin` and `directory` properties can be specified to override this default behavior.

```typescript
new RustFunction(this, "my_function", {
    directory: '/path/to/directory/with/Cargo.toml',
    bin: 'my_function',
});
```

For more complex project structure combining multiple Rust Lambda function, the construct offer the ability to use [Workspaces](https://doc.rust-lang.org/book/ch14-03-cargo-workspaces.html) defined in your Cargo project.

Given a sample project structure:

```plaintext
.
├── Cargo.toml
├── my_lambda_1
│   ├── Cargo.toml
│   └── src
│       └── main.rs
└── my_lambda_2
    ├── Cargo.toml
    └── src
        └── main.rs
```

And with a given `Cargo.toml`:

```toml
[workspace]
members = [
    "my_lambda_1",
    "my_lambda_2"
]
```

Rust functions can be declared using `package` properties:

```typescript
new RustFunction(this, 'FirstFunction', {
    package: 'my_lambda_1',
});

new RustFunction(this, 'SecondFunction', {
    package: 'my_lambda_2',
});
```

## Customizing the underlying Lambda function

All properties of `lambda.Function` can be used to customize the underlying `lambda.Function`.

See also the [AWS Lambda construct library](https://github.com/aws/aws-cdk/tree/main/packages/aws-cdk-lib/aws-lambda).

## Local Bundling

By default, Cargo Lambda uses the [Zig toolchain](https://crates.io/crates/cargo-zigbuild) to cross compile your code.
This is the most convenient cross compilation mechanism because it comes built in, and it works for the majority of use cases.
Any pure Rust Lambda function should compile correctly with this toolchain.

By default, Construct will compile the code for Linux X86-64 architectures, but you can compile for ARM-64 architectures by providing the right property if needed:

```typescript
new RustFunction(this, 'my_function', {
    bundling: {
        architecture: lambda.Architecture.ARM_64
    }
});
```

If bundling is made locally for ARM-64 or X86-64, make sure to install the dedicated target:

```bash
rustup target add aarch64-unknown-linux-gnu
rustup target add x86_64-unknown-linux-gnu
```

## Customizing Docker bundling

To force bundling in a Docker container even if `Zig toolchain` is available in your environment, set `bundling.forceDockerBundling` to true.

Use `bundling.environment` to define environments variables when `cargo` runs:

```typescript
new RustFunction(this, 'my_function', {
  bundling: {
    environment: {
      HELLO: 'world'
    },
  },
});
```

Use the `bundling.buildArgs` to pass build arguments to `cargo`:

```typescript
new go.RustFunction(this, 'my_function', {
  bundling: {
    buildArgs: ['--all-features'],
  },
});
```

Use the `bundling.dockerImage` to use a custom Docker bundling image:

```typescript
new go.RustFunction(this, 'my_function', {
  bundling: {
    dockerImage: DockerImage.fromBuild('/path/to/Dockerfile'),
  },
});
```

You can set additional Docker options to configure the build environment:

```typescript
new RustFunction(this, 'my_function', {
 bundling: {
     network: 'host',
     securityOpt: 'no-new-privileges',
     user: 'user:group',
     volumesFrom: ['777f7dc92da7'],
     volumes: [{ hostPath: '/host-path', containerPath: '/container-path' }],
  },
});
```

## Command hooks

It is possible to run additional commands by specifying the commandHooks prop:

```typescript
// This example only available in TypeScript
// Run additional props via `commandHooks`
new RustFunction(this, 'my_function_with_commands', {
  bundling: {
    commandHooks: {
      beforeBundling(inputDir: string, outputDir: string): string[] {
        return [
          `echo hello > ${inputDir}/a.txt`,
          `cp ${inputDir}/a.txt ${outputDir}`,
        ];
      },
      afterBundling(inputDir: string, outputDir: string): string[] {
        return [`cp ${inputDir}/b.txt ${outputDir}/txt`];
      },
      beforeInstall() {
        return [];
      },
      // ...
    },
    // ...
  },
});
```

The following hooks are available:

- **beforeBundling**: runs before all bundling commands
- **beforeInstall**: runs before Cargo crates installation
- **afterBundling**: runs after all bundling commands

They all receive the directory containing the lock file (inputDir) and the directory where the bundled asset will be output (outputDir).
They must return an array of commands to run. Commands are chained with &&.

The commands will run in the environment in which bundling occurs: inside the container for Docker bundling or on the host OS for local bundling.
