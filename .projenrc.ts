import { CdklabsConstructLibrary } from 'cdklabs-projen-project-types';
const project = new CdklabsConstructLibrary({
  author: 'AWS',
  authorAddress: 'aws-cdk-dev@amazon.com',
  cdkVersion: '2.80.0',
  defaultReleaseBranch: 'main',
  devDeps: ['cdklabs-projen-project-types'],
  name: '@aws-cdk/aws-lambda-rust',
  projenrcTs: true,
  release: false,
  repositoryUrl: 'https://github.com/cdklabs/aws-lambda-rust.git',
  autoApproveOptions: {
    allowedUsernames: ['aws-cdk-automation', 'dependabot[bot]', 'mergify[bot]'],
    secret: 'GITHUB_TOKEN',
  },
  autoApproveUpgrades: true,
});
project.synth();