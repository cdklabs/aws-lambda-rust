import { CdklabsConstructLibrary, JsiiLanguage } from 'cdklabs-projen-project-types';
import { DependencyType } from 'projen';

const project = new CdklabsConstructLibrary({
  author: 'AWS',
  authorAddress: 'aws-cdk-dev@amazon.com',
  cdkVersion: '2.114.0',
  jsiiVersion: '~5.3.0',
  typescriptVersion: '~5.3.3',
  defaultReleaseBranch: 'main',
  devDeps: ['cdklabs-projen-project-types', '@aws-cdk/integ-tests-alpha'],
  bundledDeps: ['toml'],
  name: '@aws-cdk/aws-lambda-rust',
  projenrcTs: true,
  private: false,
  enablePRAutoMerge: true,
  stability: 'experimental',
  setNodeEngineVersion: false,
  repositoryUrl: 'https://github.com/cdklabs/aws-lambda-rust.git',
  jsiiTargetLanguages: [
    JsiiLanguage.JAVA,
    JsiiLanguage.PYTHON,
    JsiiLanguage.DOTNET,
    JsiiLanguage.GO,
  ],
  publishToMaven: {
    javaPackage: 'software.amazon.awscdk.services.lambda.rust',
    mavenGroupId: 'software.amazon.awscdk',
    mavenArtifactId: 'lambda-rust',
    mavenEndpoint: 'https://aws.oss.sonatype.org',
  },
  publishToPypi: {
    distName: 'aws-cdk.aws-lambda-rust',
    module: 'aws_cdk.aws_lambda_rust',
  },
  publishToNuget: {
    dotNetNamespace: 'Amazon.CDK.AWS.Lambda.Rust',
    packageId: 'Amazon.CDK.AWS.Lambda.Rust',
  },
  autoApproveOptions: {
    allowedUsernames: ['aws-cdk-automation', 'dependabot[bot]', 'mergify[bot]'],
    secret: 'GITHUB_TOKEN',
  },
  autoApproveUpgrades: true,
  gitignore: [
    '*.d.ts',
    '*.generated.ts',
    '*.js',
    '**/integ.*.snapshot/asset.*/',
    '**/bin',
    '**/obj',
    '/*.sln',
    '**/target',
  ],
});
project.deps.addDependency(
  '@aws-cdk/integ-tests-alpha@2.114.0-alpha.0',
  DependencyType.TEST,
);

project.synth();
