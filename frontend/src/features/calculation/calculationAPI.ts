// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Auth } from "aws-amplify";

export const calculate = async (body: any) => {
  return fetch(`${process.env.REACT_APP_API_URL}pipelines?dryRun=true`, {
    headers: {
      Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "Accept-Version": "1.0.0",
      "x-groupcontextid": "/",
    },
    method: "POST",
    body: body,
  }).then((response) => response.json());
};
