// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";

import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import {
  CloudFrontWebDistribution,
  OriginAccessIdentity,
  ErrorResponse,
  CfnDistribution
} from "aws-cdk-lib/aws-cloudfront";
import { BlockPublicAccess, Bucket } from "aws-cdk-lib/aws-s3";
import { RemovalPolicy } from "aws-cdk-lib";

import { Construct } from "constructs";

import { NagSuppressions } from "cdk-nag";

export class CarbonAccountingPortalStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    NagSuppressions.addStackSuppressions(this, [
      {
        id: "AwsSolutions-L1",
        reason: "Built in CDK custom Resource for s3 deployments"
      },
      {
        id: "AwsSolutions-IAM5",
        reason: "Built in CDK custom Resource for s3 deployments"
      },
      {
        id: "AwsSolutions-IAM4",
        reason: "Built in CDK custom Resource for s3 deployments"
      },
      {
        id: "AwsSolutions-CFR4",
        reason:
          "Using cloudfront provided domain and certificate instead of custom domain"
      },
      {
        id: "AwsSolutions-S1",
        reason: "React files only"
      },
      {
        id: "AwsSolutions-S5",
        reason: "Public access disabled"
      },
      {
        id: "AwsSolutions-CFR3",
        reason: "CF service simple single page POV app only."
      }
    ]);

    let siteBucket = new Bucket(this, "CarbonAccountingPortalUI", {
      enforceSSL: true,
      websiteIndexDocument: "index.html",
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    });

    const oia = new OriginAccessIdentity(this, "OIA", {
      comment: "Carbon Accounting Portal OAI"
    });
    siteBucket.grantRead(oia);

    // Cloudfront error response
    const notFoundError: CfnDistribution.CustomErrorResponseProperty = {
      errorCode: 404,
      // the properties below are optional
      responseCode: 200,
      responsePagePath: "/index.html"
    };

    const notAuthorizedError: CfnDistribution.CustomErrorResponseProperty = {
      errorCode: 403,
      // the properties below are optional
      responseCode: 200,
      responsePagePath: "/index.html"
    };

    // Cloudfront Dist
    const distribution = new CloudFrontWebDistribution(
      this,
      "CarbonAccountingPortalDistribution",
      {
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: siteBucket,
              originAccessIdentity: oia
            },
            behaviors: [{ isDefaultBehavior: true }]
          }
        ],
        comment: "Carbon Accounting Portal Distribution",
        errorConfigurations: [notFoundError, notAuthorizedError]
      }
    );

    new CfnOutput(this, "URL", { value: distribution.distributionDomainName });

    // S3 deployment
    new BucketDeployment(this, "DeployCarbonWebsite", {
      sources: [Source.asset("frontend/build")],
      destinationBucket: siteBucket,
      distribution,
      distributionPaths: ["/*"]
    });
  }
}
