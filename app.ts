#!/usr/bin/env node
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { SifCodebuildStack } from "./infrastructure/lib/SifCodebuildStack";
import { CarbonAccountingPortalStack} from "./infrastructure/lib/CarbonAccountingPortalStack";
import { PipelineStack} from "./infrastructure/lib/PipelineStack";
import { CONFIG } from "./config";

import { AwsSolutionsChecks } from 'cdk-nag'
import { Aspects } from 'aws-cdk-lib';

const app = new cdk.App();

let props = {
  env: { account: CONFIG.account, region: CONFIG.region }
}

new CarbonAccountingPortalStack(app, "CarbonAccountingPortalStack", props,);
new PipelineStack(app, "CarbonAccountingPortalPipeline", props,CONFIG);
new SifCodebuildStack(app, "SifCodebuildStack", props,CONFIG);

Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }))