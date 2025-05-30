# Amazon Lambda Rust Library

<!--BEGIN STABILITY BANNER-->

---

![cdk-constructs: Experimental](https://img.shields.io/badge/cdk--constructs-experimental-important.svg?style=for-the-badge)

> The APIs of higher level constructs in this module are experimental and under active development.
> They are subject to non-backward compatible changes or removal in any future version. These are
> not subject to the [Semantic Versioning](https://semver.org/) model and breaking changes will be
> announced in the release notes. This means that while you may use them, you may need to update
> your source code when upgrading to a newer version of this package.

---

<!--END STABILITY BANNER-->

This library provides constructs for Rust Lambda functions.

The `rust.RustFunction` construct creates a Lambda function with automatic building and bundling of Rust code.

To use this module you will either need to have `cargo-lambda` installed or Docker installed.

See [Local Bundling/Docker Bundling](#local-bundling) for more information.

## Rust Function

```plaintext
.
├── my-construct.ts
├── myconstruct.my_function
│    ├── Cargo.toml
│    └── src
│        └── main.rs
```

By default, the construct will use the name of the defining file and the construct's id to look up the entry file by following this pattern `defining-file.id/Cargo.toml`. In `my-construct.ts` above we have:

```typescript
const myFunction = new rust.RustFunction(this, "my_function");
```

Alternatively, `entry` and `binaryName` properties can be specified to override this default behavior. If no `binaryName` argument is passed in, it will default to the package name as defined in the main `Cargo.toml`.

```typescript
new rust.RustFunction(this, "my_function1", {
    entry: '/path/to/directory/with/Cargo.toml',
    binaryName: 'my_function'
});

// You can also specify entry path directory which will contain your Cargo.toml file
new rust.RustFunction(this, "my_function2", {
    entry: '/path/to/directory',
    binaryName: 'my_function'
});
```

For more complex project structure combining multiple Rust Lambda function, the construct offer the ability to use Binaries or  [Workspaces](https://doc.rust-lang.org/book/ch14-03-cargo-workspaces.html) defined in your Cargo project.

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

Rust functions can be declared using `binaryName` property:

```typescript
new rust.RustFunction(this, 'FirstFunction', {
    binaryName: 'my_lambda_1',
});

new rust.RustFunction(this, 'SecondFunction', {
    binaryName: 'my_lambda_2',
});
```

## How It Works

When bundling the code, the `rust.RustFunction` runs will build and bundle your binary by passing `--release` and `--target` flags to the Cargo build command, so it compiles for a Lambda environment - which defaults to the **aarch64-unknown-linux-gnu** target.

### Use `cross` for Deployment

If you instead prefer to use [Docker](https://www.docker.com/get-started) and [Cross](https://github.com/rust-embedded/cross) for deployment, as outlined
in the [official AWS docs](https://docs.aws.amazon.com/sdk-for-rust/latest/dg/lambda.html), you can define the `packageManager` property:

```typescript
new rust.RustFunction(this, 'FirstFunction', {
    binaryName: 'my_lambda_1',
    bundling: {
      packageManagerType: rust.PackageManagerType.CROSS
    }
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
import { Architecture } from 'aws-cdk-lib/aws-lambda';

new rust.RustFunction(this, 'my_function', {
    architecture: Architecture.ARM_64
});
```

If bundling is made locally for **ARM-64** or **X86-64**, make sure to install the dedicated target:

```bash
rustup target add aarch64-unknown-linux-gnu
rustup target add x86_64-unknown-linux-gnu
```

## Customizing Docker bundling

To force bundling in a Docker container even if `Zig toolchain` is available in your environment, set `bundling.forceDockerBundling` to true.

Use `bundling.environment` to define environments variables when `cargo` runs:

```typescript
new rust.RustFunction(this, 'my_function', {
  bundling: {
    environment: {
      HELLO: 'world'
    },
  },
});
```

Use the `bundling.buildArgs` to pass build arguments to `cargo`:

```typescript
new rust.RustFunction(this, 'my_function', {
  bundling: {
    extraBuildArgs: ['--all-features'],
  },
});
```

Use the `bundling.dockerImage` to use a custom Docker bundling image:

```typescript
new rust.RustFunction(this, 'my_function', {
  bundling: {
    dockerImage: DockerImage.fromBuild('/path/to/Dockerfile'),
  },
});
```

You can set additional Docker options to configure the build environment:

```typescript
new rust.RustFunction(this, 'my_function', {
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

It is possible to run additional commands by specifying the commandHooks property.

The following hooks are available:

- **beforeBundling**: runs before all bundling commands
- **afterBundling**: runs after all bundling commands

They all receive the directory containing the lock file (inputDir) and the directory where the bundled asset will be output (outputDir).
They must return an array of commands to run. Commands are chained with &&.

The commands will run in the environment in which bundling occurs: inside the container for Docker bundling or on the host OS for local bundling.
<!-- Updated: Fri May 30 12:29:54 CEST 2025 -->
