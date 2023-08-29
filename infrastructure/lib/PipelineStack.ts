// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import {
  CfnOutput,
  Stack,
  StackProps,
  aws_codebuild as codebuild,
  aws_codecommit as codecommit,
  aws_iam as iam,
  aws_ssm as ssm
} from "aws-cdk-lib";
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep
} from "aws-cdk-lib/pipelines";
import { CarbonAccountingPortalStage } from "./CarbonAccountingPortalStage";
import * as path from "path";

import { Construct } from "constructs";
import { NagSuppressions } from 'cdk-nag'

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps,CONFIG:any) {
    super(scope, id, props);

    NagSuppressions.addStackSuppressions(this, [
      {
        id: 'AwsSolutions-IAM5',
        reason: 'Using CDK pipelines permissions'
      },
      {
        id: 'AwsSolutions-CB4',
        reason: 'Using CDK pipelines permissions'
      },
      {
        id: 'AwsSolutions-S1',
        reason: 'Using CDK pipelines permissions'
      },
      
    ])

    const repository = new codecommit.Repository(
      this,
      "CarbonAccountingRepository",
      {
        repositoryName: "CarbonAccountingRepository",
        code: codecommit.Code.fromZipFile(
          path.join(__dirname, "../../latest.zip")
        ),
        description: "Carbon Accounting Portal Repository"
      }
    );

    new CfnOutput(this, 'RespositoryARN', { value: repository.repositoryArn });
    new CfnOutput(this, 'RespositoryCloneUrlSSH', { value: repository.repositoryCloneUrlSsh});
    new CfnOutput(this, 'RespositoryCloneUrlHTTPS', { value: repository.repositoryCloneUrlHttp });

    const env = `REACT_APP_REGION=${
      CONFIG.region
    }\nREACT_APP_USER_POOL_ID=${
      ssm.StringParameter.valueForStringParameter(this, '/sif/'+CONFIG.tenantId+'/'+CONFIG.environmentName+'/shared/userPoolId')
    }\nREACT_APP_USER_POOL_CLIENT_ID=${
      ssm.StringParameter.valueForStringParameter(this, '/sif/'+CONFIG.tenantId+'/'+CONFIG.environmentName+'/shared/userPoolClientId')
    }\nREACT_APP_API_URL=${
      ssm.StringParameter.valueForStringParameter(this, '/sif/'+CONFIG.tenantId+'/'+CONFIG.environmentName+'/pipelines/apiUrl')
    }`;

    const pipeline = new CodePipeline(this, "Pipeline", {
      synth: new ShellStep("Synth", {
        input: CodePipelineSource.codeCommit(repository, "main"),
        commands: [
          "zip -r latest.zip .",
          "npm install",
          "cd ./frontend",
          'echo "'+env +'" > .env',
          "npm install",
          "npm run build",
          "cd ../",
          "npx cdk synth"
        ]
      })
    });

    const stage = pipeline.addStage(
      new CarbonAccountingPortalStage(this, CONFIG.environmentName, {
        env: { account: CONFIG.account, region: CONFIG.region }
      })
    );
  }
}
