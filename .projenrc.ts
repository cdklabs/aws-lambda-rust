import {
  CdklabsConstructLibrary,
  JsiiLanguage,
} from 'cdklabs-projen-project-types';
import { DependencyType } from 'projen';
import { UpgradeDependenciesSchedule } from 'projen/lib/javascript';

const project = new CdklabsConstructLibrary({
  author: 'AWS',
  authorAddress: 'aws-cdk-dev@amazon.com',
  cdkVersion: '2.121.0',
  jsiiVersion: '~5.3.0',
  defaultReleaseBranch: 'main',
  devDeps: ['cdklabs-projen-project-types', '@aws-cdk/integ-tests-alpha'],
  bundledDeps: ['toml'],
  name: '@cdklabs/aws-lambda-rust',
  projenrcTs: true,
  private: false,
  enablePRAutoMerge: true,
  stability: 'experimental',
  setNodeEngineVersion: false,
  repositoryUrl: 'https://github.com/cdklabs/aws-lambda-rust.git',
  depsUpgradeOptions: {
    workflowOptions: {
      schedule: UpgradeDependenciesSchedule.WEEKLY,
    },
  },
  prettier: true,
  prettierOptions: {
    settings: {
      singleQuote: true,
    },
  },
  jsiiTargetLanguages: [
    JsiiLanguage.JAVA,
    JsiiLanguage.PYTHON,
    JsiiLanguage.DOTNET,
  ],
  publishToMaven: {
    javaPackage: 'io.github.cdklabs.awslambdarust',
    mavenGroupId: 'io.github.cdklabs',
    mavenArtifactId: 'aws-lambda-rust',
    mavenServerId: 'central-ossrh',
  },
  publishToPypi: {
    distName: 'cdklabs.aws-lambda-rust',
    module: 'cdklabs.aws_lambda_rust',
  },
  publishToNuget: {
    dotNetNamespace: 'Cdklabs.AwsLambdaRust',
    packageId: 'Cdklabs.AwsLambdaRust',
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
    '**/target',
  ],
});
project.deps.addDependency(
  '@aws-cdk/integ-tests-alpha@2.121.0-alpha.0',
  DependencyType.TEST,
);

project.synth();
