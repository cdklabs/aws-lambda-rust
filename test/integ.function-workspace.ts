import { ExpectedResult, IntegTest } from '@aws-cdk/integ-tests-alpha';
import { App, CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { RustFunction } from '../lib';

/*
 * Stack verification steps:
 * * aws lambda invoke --function-name <deployed fn name> --invocation-type Event --payload '"OK"' response.json
 */
class TestStack extends Stack {
  public readonly functionName: string;
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const fn = new RustFunction(this, 'binary1', {
      entry: 'rust-workspaces/Cargo.toml',
      binaryName: 'my_lambda2',
      bundling: {
        forceDockerBundling: false,
      },
    });
    this.functionName = fn.functionName;

    new CfnOutput(this, 'FunctionArn', {
      value: fn.functionArn,
    });
  }
}

const app = new App();
const testCase = new TestStack(app, 'integ-lambda-rust-function-workspace');
const integ = new IntegTest(app, 'lambda-rust-function', {
  testCases: [testCase],
  stackUpdateWorkflow: true,
});

const invoke = integ.assertions.invokeFunction({
  functionName: testCase.functionName,
});

invoke.expect(
  ExpectedResult.objectLike( {
    Payload: '{"statusCode":200,"headers":{},"multiValueHeaders":{},"body":"OK2","isBase64Encoded":false}',
  }),
);
app.synth();
