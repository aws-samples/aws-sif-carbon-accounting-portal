// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import {
  Stack,
  StackProps,
  aws_codebuild as codebuild,
  aws_iam as iam,
  aws_kms as kms
} from "aws-cdk-lib";
import { Construct } from "constructs";
import { NagSuppressions } from "cdk-nag";

export class SifCodebuildStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps, CONFIG: any) {
    super(scope, id, props);

    NagSuppressions.addStackSuppressions(this, [
      {
        id: "AwsSolutions-IAM5",
        reason: "Allow all SIF Framework resources to be built"
      }
    ]);

    // Create a KMS key
    const kmsKey = new kms.Key(this, "SifBuildDeployKey", {
      enableKeyRotation: true 
    });

    let project = new codebuild.Project(this, "SifBuildDeploy", {
      projectName: "SifBuildDeploy",
      encryptionKey: kmsKey,
      environment: {
        buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_4,
        computeType: codebuild.ComputeType.SMALL,
        privileged: true
      },
      buildSpec: codebuild.BuildSpec.fromObject({
        version: "0.2",
        phases: {
          install: {
            commands: [
              "npm install -g aws-cdk@2.89.0",
              "npm install -g @microsoft/rush@5.86.0"
            ]
          },
          pre_build: {
            commands: [
              //Clone version 1.3 of sif framework from repo
              "git clone --branch v1.3.0 https://github.com/aws-solutions-library-samples/guidance-for-aws-sustainability-insights-framework.git"
            ]
          },
          build: {
            commands: [
              "cd guidance-for-aws-sustainability-insights-framework/typescript",
              "rush update --bypass-policy",
              "rush build",
              "cd ../java/apps/calculator",
              "mvn clean install",
              "cd ../referencedatasets-indexer",
              "mvn clean install",
              "cd ../../../infrastructure/platform",
              `npm run cdk -- deploy -c environment=${CONFIG.environmentName} -c deleteBucket=true -c clusterDeletionProtection=false --all --require-approval never`,
              "cd ../tenant",
              `npm run cdk -- deploy -c tenantId=${CONFIG.tenantId} -c deleteBucket=true -c enableDeleteResource=true -c environment=${CONFIG.environmentName} -c administratorEmail=${CONFIG.adminEmail} --all --require-approval never --concurrency=10`
            ]
          }
        }
      })
    });
    let policy = new iam.PolicyStatement({
      actions: ["*"],
      resources: ["*"]
    });
    project.addToRolePolicy(policy);
  }
  
}
