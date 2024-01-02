import { CdklabsConstructLibrary } from 'cdklabs-projen-project-types';
import { DependencyType } from 'projen';
import { NpmAccess } from 'projen/lib/javascript';
const project = new CdklabsConstructLibrary({
  author: 'AWS',
  authorAddress: 'aws-cdk-dev@amazon.com',
  cdkVersion: '2.114.0',
  jsiiVersion: '~5.3.0',
  typescriptVersion: '~5.3.3',
  defaultReleaseBranch: 'main',
  devDeps: ['cdklabs-projen-project-types', '@aws-cdk/integ-tests-alpha'],
  deps: ['toml'],
  name: '@aws-cdk/aws-lambda-rust',
  projenrcTs: true,
  npmAccess: NpmAccess.PUBLIC,
  stability: 'experimental',
  setNodeEngineVersion: false,
  repositoryUrl: 'https://github.com/cdklabs/aws-lambda-rust.git',
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
