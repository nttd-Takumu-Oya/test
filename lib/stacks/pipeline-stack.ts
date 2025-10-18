// lib/stacks/pipeline-stack.ts
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { PipelineStage } from './pipeline-stage';

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Secrets ManagerからGitHubトークンを取得
    const githubToken = secretsmanager.Secret.fromSecretNameV2(this, 'GitHubToken', 'github');
    // GitHubリポジトリ情報
    const repo = 'nttd-Takumu-Oya/test';
    const branch = 'master';

    const pipeline = new CodePipeline(this, 'Pipeline',{
      pipelineName: 'test-pipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub(repo, branch, {
          authentication: githubToken.secretValueFromJson('github'),
        }),
        commands: ['npm ci', 'npm run build', 'npx cdk synth']
      })
    });
    const deploy = new PipelineStage(this, "Deploy");
    const deployStage = pipeline.addStage(deploy);
  }
}
