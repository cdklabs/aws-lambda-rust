# API Reference <a name="API Reference" id="api-reference"></a>


## Structs <a name="Structs" id="Structs"></a>

### BundlingOptions <a name="BundlingOptions" id="@aws-cdk/aws-lambda-rust.BundlingOptions"></a>

Bundling options.

#### Initializer <a name="Initializer" id="@aws-cdk/aws-lambda-rust.BundlingOptions.Initializer"></a>

```typescript
import { BundlingOptions } from '@aws-cdk/aws-lambda-rust'

const bundlingOptions: BundlingOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@aws-cdk/aws-lambda-rust.BundlingOptions.property.command">command</a></code> | <code>string[]</code> | The command to run in the container. |
| <code><a href="#@aws-cdk/aws-lambda-rust.BundlingOptions.property.entrypoint">entrypoint</a></code> | <code>string[]</code> | The entrypoint to run in the container. |
| <code><a href="#@aws-cdk/aws-lambda-rust.BundlingOptions.property.environment">environment</a></code> | <code>{[ key: string ]: string}</code> | The environment variables to pass to the container. |
| <code><a href="#@aws-cdk/aws-lambda-rust.BundlingOptions.property.network">network</a></code> | <code>string</code> | Docker [Networking options](https://docs.docker.com/engine/reference/commandline/run/#connect-a-container-to-a-network---network). |
| <code><a href="#@aws-cdk/aws-lambda-rust.BundlingOptions.property.securityOpt">securityOpt</a></code> | <code>string</code> | [Security configuration](https://docs.docker.com/engine/reference/run/#security-configuration) when running the docker container. |
| <code><a href="#@aws-cdk/aws-lambda-rust.BundlingOptions.property.user">user</a></code> | <code>string</code> | The user to use when running the container. |
| <code><a href="#@aws-cdk/aws-lambda-rust.BundlingOptions.property.volumes">volumes</a></code> | <code>aws-cdk-lib.DockerVolume[]</code> | Docker volumes to mount. |
| <code><a href="#@aws-cdk/aws-lambda-rust.BundlingOptions.property.volumesFrom">volumesFrom</a></code> | <code>string[]</code> | Where to mount the specified volumes from. |
| <code><a href="#@aws-cdk/aws-lambda-rust.BundlingOptions.property.workingDirectory">workingDirectory</a></code> | <code>string</code> | Working directory inside the container. |
| <code><a href="#@aws-cdk/aws-lambda-rust.BundlingOptions.property.assetHash">assetHash</a></code> | <code>string</code> | Specify a custom hash for this asset. |
| <code><a href="#@aws-cdk/aws-lambda-rust.BundlingOptions.property.assetHashType">assetHashType</a></code> | <code>aws-cdk-lib.AssetHashType</code> | Determines how the asset hash is calculated. Assets will get rebuilt and uploaded only if their hash has changed. |
| <code><a href="#@aws-cdk/aws-lambda-rust.BundlingOptions.property.bundlingFileAccess">bundlingFileAccess</a></code> | <code>aws-cdk-lib.BundlingFileAccess</code> | Which option to use to copy the source files to the docker container and output files back. |
| <code><a href="#@aws-cdk/aws-lambda-rust.BundlingOptions.property.commandHooks">commandHooks</a></code> | <code><a href="#@aws-cdk/aws-lambda-rust.ICommandHooks">ICommandHooks</a></code> | Command hooks. |
| <code><a href="#@aws-cdk/aws-lambda-rust.BundlingOptions.property.dockerImage">dockerImage</a></code> | <code>aws-cdk-lib.DockerImage</code> | A custom bundling Docker image. |
| <code><a href="#@aws-cdk/aws-lambda-rust.BundlingOptions.property.extraBuildArgs">extraBuildArgs</a></code> | <code>string[]</code> | Additional arguments that are passed in at build time to `cargo lambda`. |
| <code><a href="#@aws-cdk/aws-lambda-rust.BundlingOptions.property.forceDockerBundling">forceDockerBundling</a></code> | <code>boolean</code> | Force bundling in a Docker container even if local bundling is possible. |
| <code><a href="#@aws-cdk/aws-lambda-rust.BundlingOptions.property.logLevel">logLevel</a></code> | <code><a href="#@aws-cdk/aws-lambda-rust.LogLevel">LogLevel</a></code> | Log level for cargo. |
| <code><a href="#@aws-cdk/aws-lambda-rust.BundlingOptions.property.profile">profile</a></code> | <code>string</code> | Build artifacts with the specified profile. |
| <code><a href="#@aws-cdk/aws-lambda-rust.BundlingOptions.property.release">release</a></code> | <code>boolean</code> | Build optimized artifacts with the release profile. |
| <code><a href="#@aws-cdk/aws-lambda-rust.BundlingOptions.property.target">target</a></code> | <code>string</code> | Cross compilation target environment for the generated binary. |

---

##### `command`<sup>Optional</sup> <a name="command" id="@aws-cdk/aws-lambda-rust.BundlingOptions.property.command"></a>

```typescript
public readonly command: string[];
```

- *Type:* string[]
- *Default:* run the command defined in the image

The command to run in the container.

---

##### `entrypoint`<sup>Optional</sup> <a name="entrypoint" id="@aws-cdk/aws-lambda-rust.BundlingOptions.property.entrypoint"></a>

```typescript
public readonly entrypoint: string[];
```

- *Type:* string[]
- *Default:* run the entrypoint defined in the image

The entrypoint to run in the container.

---

##### `environment`<sup>Optional</sup> <a name="environment" id="@aws-cdk/aws-lambda-rust.BundlingOptions.property.environment"></a>

```typescript
public readonly environment: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}
- *Default:* no environment variables.

The environment variables to pass to the container.

---

##### `network`<sup>Optional</sup> <a name="network" id="@aws-cdk/aws-lambda-rust.BundlingOptions.property.network"></a>

```typescript
public readonly network: string;
```

- *Type:* string
- *Default:* no networking options

Docker [Networking options](https://docs.docker.com/engine/reference/commandline/run/#connect-a-container-to-a-network---network).

---

##### `securityOpt`<sup>Optional</sup> <a name="securityOpt" id="@aws-cdk/aws-lambda-rust.BundlingOptions.property.securityOpt"></a>

```typescript
public readonly securityOpt: string;
```

- *Type:* string
- *Default:* no security options

[Security configuration](https://docs.docker.com/engine/reference/run/#security-configuration) when running the docker container.

---

##### `user`<sup>Optional</sup> <a name="user" id="@aws-cdk/aws-lambda-rust.BundlingOptions.property.user"></a>

```typescript
public readonly user: string;
```

- *Type:* string
- *Default:* root or image default

The user to use when running the container.

---

##### `volumes`<sup>Optional</sup> <a name="volumes" id="@aws-cdk/aws-lambda-rust.BundlingOptions.property.volumes"></a>

```typescript
public readonly volumes: DockerVolume[];
```

- *Type:* aws-cdk-lib.DockerVolume[]
- *Default:* no volumes are mounted

Docker volumes to mount.

---

##### `volumesFrom`<sup>Optional</sup> <a name="volumesFrom" id="@aws-cdk/aws-lambda-rust.BundlingOptions.property.volumesFrom"></a>

```typescript
public readonly volumesFrom: string[];
```

- *Type:* string[]
- *Default:* no containers are specified to mount volumes from

Where to mount the specified volumes from.

> [https://docs.docker.com/engine/reference/commandline/run/#mount-volumes-from-container---volumes-from](https://docs.docker.com/engine/reference/commandline/run/#mount-volumes-from-container---volumes-from)

---

##### `workingDirectory`<sup>Optional</sup> <a name="workingDirectory" id="@aws-cdk/aws-lambda-rust.BundlingOptions.property.workingDirectory"></a>

```typescript
public readonly workingDirectory: string;
```

- *Type:* string
- *Default:* image default

Working directory inside the container.

---

##### `assetHash`<sup>Optional</sup> <a name="assetHash" id="@aws-cdk/aws-lambda-rust.BundlingOptions.property.assetHash"></a>

```typescript
public readonly assetHash: string;
```

- *Type:* string
- *Default:* based on `assetHashType`

Specify a custom hash for this asset.

If `assetHashType` is set it must
be set to `AssetHashType.CUSTOM`. For consistency, this custom hash will
be SHA256 hashed and encoded as hex. The resulting hash will be the asset
hash.

NOTE: the hash is used in order to identify a specific revision of the asset, and
used for optimizing and caching deployment activities related to this asset such as
packaging, uploading to Amazon S3, etc. If you chose to customize the hash, you will
need to make sure it is updated every time the asset changes, or otherwise it is
possible that some deployments will not be invalidated.

---

##### `assetHashType`<sup>Optional</sup> <a name="assetHashType" id="@aws-cdk/aws-lambda-rust.BundlingOptions.property.assetHashType"></a>

```typescript
public readonly assetHashType: AssetHashType;
```

- *Type:* aws-cdk-lib.AssetHashType
- *Default:* AssetHashType.CUSTOM

Determines how the asset hash is calculated. Assets will get rebuilt and uploaded only if their hash has changed.

If the asset hash is set to `OUTPUT` (default), the hash is calculated
after bundling. This means that any change in the output will cause
the asset to be invalidated and uploaded. Bear in mind that the
rust binary that is output can be different depending on the target
that it was compiled for.

If the asset hash is set to `SOURCE`, then only changes to the source
directory will cause the asset to rebuild. If your go project has multiple
Lambda functions this means that an update to any one function could cause
all the functions to be rebuilt and uploaded.

---

##### `bundlingFileAccess`<sup>Optional</sup> <a name="bundlingFileAccess" id="@aws-cdk/aws-lambda-rust.BundlingOptions.property.bundlingFileAccess"></a>

```typescript
public readonly bundlingFileAccess: BundlingFileAccess;
```

- *Type:* aws-cdk-lib.BundlingFileAccess
- *Default:* BundlingFileAccess.BIND_MOUNT

Which option to use to copy the source files to the docker container and output files back.

---

##### `commandHooks`<sup>Optional</sup> <a name="commandHooks" id="@aws-cdk/aws-lambda-rust.BundlingOptions.property.commandHooks"></a>

```typescript
public readonly commandHooks: ICommandHooks;
```

- *Type:* <a href="#@aws-cdk/aws-lambda-rust.ICommandHooks">ICommandHooks</a>
- *Default:* do not run additional commands

Command hooks.

---

##### `dockerImage`<sup>Optional</sup> <a name="dockerImage" id="@aws-cdk/aws-lambda-rust.BundlingOptions.property.dockerImage"></a>

```typescript
public readonly dockerImage: DockerImage;
```

- *Type:* aws-cdk-lib.DockerImage
- *Default:* use the Docker image provided by

A custom bundling Docker image.

---

##### `extraBuildArgs`<sup>Optional</sup> <a name="extraBuildArgs" id="@aws-cdk/aws-lambda-rust.BundlingOptions.property.extraBuildArgs"></a>

```typescript
public readonly extraBuildArgs: string[];
```

- *Type:* string[]

Additional arguments that are passed in at build time to `cargo lambda`.

## Examples

- `--all-features`
- `--no-default-features`

---

##### `forceDockerBundling`<sup>Optional</sup> <a name="forceDockerBundling" id="@aws-cdk/aws-lambda-rust.BundlingOptions.property.forceDockerBundling"></a>

```typescript
public readonly forceDockerBundling: boolean;
```

- *Type:* boolean
- *Default:* false

Force bundling in a Docker container even if local bundling is possible.

---

##### `logLevel`<sup>Optional</sup> <a name="logLevel" id="@aws-cdk/aws-lambda-rust.BundlingOptions.property.logLevel"></a>

```typescript
public readonly logLevel: LogLevel;
```

- *Type:* <a href="#@aws-cdk/aws-lambda-rust.LogLevel">LogLevel</a>
- *Default:* LogLevel.WARNING

Log level for cargo.

---

##### `profile`<sup>Optional</sup> <a name="profile" id="@aws-cdk/aws-lambda-rust.BundlingOptions.property.profile"></a>

```typescript
public readonly profile: string;
```

- *Type:* string

Build artifacts with the specified profile.

---

##### `release`<sup>Optional</sup> <a name="release" id="@aws-cdk/aws-lambda-rust.BundlingOptions.property.release"></a>

```typescript
public readonly release: boolean;
```

- *Type:* boolean
- *Default:* true

Build optimized artifacts with the release profile.

---

##### `target`<sup>Optional</sup> <a name="target" id="@aws-cdk/aws-lambda-rust.BundlingOptions.property.target"></a>

```typescript
public readonly target: string;
```

- *Type:* string

Cross compilation target environment for the generated binary.

---


## Protocols <a name="Protocols" id="Protocols"></a>

### ICommandHooks <a name="ICommandHooks" id="@aws-cdk/aws-lambda-rust.ICommandHooks"></a>

- *Implemented By:* <a href="#@aws-cdk/aws-lambda-rust.ICommandHooks">ICommandHooks</a>

Command hooks.

These commands will run in the environment in which bundling occurs: inside
the container for Docker bundling or on the host OS for local bundling.

Commands are chained with `&&`.

The following example (specified in TypeScript) copies a file from the input
directory to the output directory to include it in the bundled asset:

```text
afterBundling(inputDir: string, outputDir: string): string[]{
   return [`cp ${inputDir}/my-binary.node ${outputDir}`];
}
```

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@aws-cdk/aws-lambda-rust.ICommandHooks.afterBundling">afterBundling</a></code> | Returns commands to run after bundling. |
| <code><a href="#@aws-cdk/aws-lambda-rust.ICommandHooks.beforeBundling">beforeBundling</a></code> | Returns commands to run before bundling. |

---

##### `afterBundling` <a name="afterBundling" id="@aws-cdk/aws-lambda-rust.ICommandHooks.afterBundling"></a>

```typescript
public afterBundling(inputDir: string, outputDir: string): string[]
```

Returns commands to run after bundling.

Commands are chained with `&&`.

###### `inputDir`<sup>Required</sup> <a name="inputDir" id="@aws-cdk/aws-lambda-rust.ICommandHooks.afterBundling.parameter.inputDir"></a>

- *Type:* string

---

###### `outputDir`<sup>Required</sup> <a name="outputDir" id="@aws-cdk/aws-lambda-rust.ICommandHooks.afterBundling.parameter.outputDir"></a>

- *Type:* string

---

##### `beforeBundling` <a name="beforeBundling" id="@aws-cdk/aws-lambda-rust.ICommandHooks.beforeBundling"></a>

```typescript
public beforeBundling(inputDir: string, outputDir: string): string[]
```

Returns commands to run before bundling.

Commands are chained with `&&`.

###### `inputDir`<sup>Required</sup> <a name="inputDir" id="@aws-cdk/aws-lambda-rust.ICommandHooks.beforeBundling.parameter.inputDir"></a>

- *Type:* string

---

###### `outputDir`<sup>Required</sup> <a name="outputDir" id="@aws-cdk/aws-lambda-rust.ICommandHooks.beforeBundling.parameter.outputDir"></a>

- *Type:* string

---


## Enums <a name="Enums" id="Enums"></a>

### LogLevel <a name="LogLevel" id="@aws-cdk/aws-lambda-rust.LogLevel"></a>

Log levels for cargo commands.

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@aws-cdk/aws-lambda-rust.LogLevel.VERBOSE">VERBOSE</a></code> | Show everything. |
| <code><a href="#@aws-cdk/aws-lambda-rust.LogLevel.DEBUG">DEBUG</a></code> | Show everything from info and some additional messages for debugging. |
| <code><a href="#@aws-cdk/aws-lambda-rust.LogLevel.INFO">INFO</a></code> | Show warnings, errors, and an output file summary. |
| <code><a href="#@aws-cdk/aws-lambda-rust.LogLevel.WARNING">WARNING</a></code> | Show warnings and errors. |
| <code><a href="#@aws-cdk/aws-lambda-rust.LogLevel.ERROR">ERROR</a></code> | Show errors only. |
| <code><a href="#@aws-cdk/aws-lambda-rust.LogLevel.SILENT">SILENT</a></code> | Show nothing. |

---

##### `VERBOSE` <a name="VERBOSE" id="@aws-cdk/aws-lambda-rust.LogLevel.VERBOSE"></a>

Show everything.

---


##### `DEBUG` <a name="DEBUG" id="@aws-cdk/aws-lambda-rust.LogLevel.DEBUG"></a>

Show everything from info and some additional messages for debugging.

---


##### `INFO` <a name="INFO" id="@aws-cdk/aws-lambda-rust.LogLevel.INFO"></a>

Show warnings, errors, and an output file summary.

---


##### `WARNING` <a name="WARNING" id="@aws-cdk/aws-lambda-rust.LogLevel.WARNING"></a>

Show warnings and errors.

---


##### `ERROR` <a name="ERROR" id="@aws-cdk/aws-lambda-rust.LogLevel.ERROR"></a>

Show errors only.

---


##### `SILENT` <a name="SILENT" id="@aws-cdk/aws-lambda-rust.LogLevel.SILENT"></a>

Show nothing.

---

