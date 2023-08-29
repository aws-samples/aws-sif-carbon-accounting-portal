// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { CarbonAccountingPortalStack } from "./CarbonAccountingPortalStack";

export class CarbonAccountingPortalStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);

    const portalStack = new CarbonAccountingPortalStack(
      this,
      "CarbonAccountingPortalStack"
    );
  }
}
