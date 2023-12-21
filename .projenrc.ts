import { CdklabsConstructLibrary } from 'cdklabs-projen-project-types';
import { DependencyType, JsonFile } from 'projen';
import { NpmAccess } from 'projen/lib/javascript';
const project = new CdklabsConstructLibrary({
  author: 'AWS',
  authorAddress: 'aws-cdk-dev@amazon.com',
  cdkVersion: '2.114.0',
  jsiiVersion: '~5.0.0',
  defaultReleaseBranch: 'main',
  devDeps: ['cdklabs-projen-project-types'],
  name: '@aws-cdk/aws-lambda-rust',
  projenrcTs: true,
  npmAccess: NpmAccess.PUBLIC,
  stability: 'experimental',
  repositoryUrl: 'https://github.com/cdklabs/aws-lambda-rust.git',
  autoApproveOptions: {
    allowedUsernames: ['aws-cdk-automation', 'dependabot[bot]', 'mergify[bot]'],
    secret: 'GITHUB_TOKEN',
  },
  autoApproveUpgrades: true,
  gitignore: ['.idea/', '.Cargo.lock'],
  publishToPypi: {
    distName: 'aws-cdk.aws-lambda-rust',
    module: 'aws_cdk.aws_lambda_rust',
  },
  publishToNuget: {
    packageId: 'Amazon.CDK.Lambda..Rust',
    dotNetNamespace: 'Amazon.CDK.Lambda..Rust',
  },
  publishToMaven: {
    mavenGroupId: 'software.amazon.awscdk',
    javaPackage: 'software.amazon.awscdk.cdk.lambda.rust',
    mavenArtifactId: 'aws-lambda-rust',
    mavenEndpoint: 'https://s01.oss.sonatype.org',
  },
});
project.deps.addDependency(
  '@aws-cdk/integ-tests-alpha@2.114.0-alpha.0',
  DependencyType.TEST,
);
new JsonFile(project, 'test/tsconfig.json', {
  obj: {
    extends: '../tsconfig.dev.json',
    include: ['./**/integ.*.ts'],
  },
});

project.synth();
