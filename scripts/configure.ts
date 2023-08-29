// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import {
  SSMClient,
  GetParameterCommand,
  GetParameterCommandInput
} from "@aws-sdk/client-ssm";
import { authorize } from "./auth";
import axios, { AxiosResponse } from "axios";
import * as path from "path";
import { readFileSync } from "fs";
import { CONFIG } from "../config";

const ssmClient = new SSMClient({ region: CONFIG.region });

const createResource = async (
  url: any,
  body: any,
  token: string,
  path: string
): Promise<any> => {
  // console.log("creating: \n", body);
  console.log("body: \n", body);
  console.log("url: \n", url);
  console.log("path: \n", path);

  let result = {};
  try {
    result = await axios.post(`${url}${path}`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Version": "1.0.0",
        "x-groupcontextid": "/"
      }
    });
  } catch (e) {
    console.log(result);
    console.log(`Failed to create: ${e}`);
  }
  console.log(result);

  return result;
};

const getRequestBodies = () => {
  return {
    referenceSetBuildingUnitConversion: {
      name: "BuildingUnitConversion",
      description: "Lookup table for Building Units",
      datasetHeaders: ["BuildingAreaUnit", "BuildingAreaConversionToSqFt"],
      data: readFileSync(
        path.join(__dirname, "referenceBuildingUnitConversion.csv"),
        "utf8"
      )
    },
    referenceSetZipcodesToImpact: {
      name: "ZipCodeToEfactor",
      description: "Lookup table zipcode",
      datasetHeaders: ["ZipCode", "EgridSubRegion"],
      data: readFileSync(
        path.join(__dirname, "referenceZipcodesToImpact.csv"),
        "utf8"
      )
    },
    referenceSetUsageByBuildingActivityType: {
      name: "BuildingToConsumption",
      description: "Lookup table for building type to consumption",
      datasetHeaders: [
        "BuildingActivity",
        "BuildingConsumptionKwhPerSqFtPerYear"
      ],
      data: readFileSync(
        path.join(__dirname, "referenceUsageByBuildingActivityType.csv"),
        "utf8"
      )
    },
    referenceSetElectricityConversion: {
      name: "ElectricityUnitConversion",
      description: "Lookup table for ElectricityUnits",
      datasetHeaders: ["ElectricityUnit", "ElectricityConversionToMwh"],
      data: readFileSync(
        path.join(__dirname, "referenceElecticityConversion.csv"),
        "utf8"
      )
    },
    calculationBuildingUnitConversion: JSON.parse(
      readFileSync(path.join(__dirname, "calculationBuildingUnit.json"), "utf8")
    ),
    calculationBuildingActivityType: JSON.parse(
      readFileSync(
        path.join(__dirname, "calculationBuildingActivityType.json"),
        "utf8"
      )
    ),
    calculationElectricityConversion: JSON.parse(
      readFileSync(
        path.join(__dirname, "calculationElectricityConversion.json"),
        "utf8"
      )
    ),
    calculationGetMWHByArea: JSON.parse(
      readFileSync(path.join(__dirname, "calculationGetMWHByArea.json"), "utf8")
    ),
    calculationGetMWHByCalculationType: JSON.parse(
      readFileSync(
        path.join(__dirname, "calculationGetMWHByCalculationType.json"),
        "utf8"
      )
    ),
    calcuationGetImpactByMWH: JSON.parse(
      readFileSync(
        path.join(__dirname, "calcuationGetImpactByMWH.json"),
        "utf8"
      )
    )
  };
};

const getParameter = async (parameterName: string):Promise<any> => {
  let commandInput: GetParameterCommandInput = {
    Name: parameterName
  };

  console.log(parameterName);
  let result = await ssmClient.send(new GetParameterCommand(commandInput));

  return result.Parameter?.Value;
};

const main = async () => {
  //generate SIF cofiguration request JSON bodies for calculations
  //and reference datasets from CSV & JSON Files
  let requestBodies = getRequestBodies();

  const ssmParameterValues = {
    userPoolClientId: await getParameter(
      `/sif/${CONFIG.tenantId}/${CONFIG.environmentName}/shared/userPoolClientId`
    ),
    userPoolId: await getParameter(
      `/sif/${CONFIG.tenantId}/${CONFIG.environmentName}/shared/userPoolId`
    ),
    referenceDatasetsUrl: await getParameter(
      `/sif/${CONFIG.tenantId}/${CONFIG.environmentName}/referenceDatasets/apiUrl`
    ),
    calculationsUrl: await getParameter(
      `/sif/${CONFIG.tenantId}/${CONFIG.environmentName}/calculations/apiUrl`
    ),
    pipelinesUrl: await getParameter(
      `/sif/${CONFIG.tenantId}/${CONFIG.environmentName}/pipelines/apiUrl`
    ),
    impactsUrl: await getParameter(
      `/sif/${CONFIG.tenantId}/${CONFIG.environmentName}/impacts/apiUrl`
    )
  };

  console.log("authenticating");
  let token = await authorize(
    CONFIG.adminEmail,
    process.argv[2],
    ssmParameterValues.userPoolId,
    ssmParameterValues.userPoolClientId
  );

  console.log("Creating reference datasets");
  await createResource(
    ssmParameterValues.referenceDatasetsUrl,
    requestBodies.referenceSetElectricityConversion,
    token,
    "referenceDatasets"
  );
  await createResource(
    ssmParameterValues.referenceDatasetsUrl,
    requestBodies.referenceSetBuildingUnitConversion,
    token,
    "referenceDatasets"
  );
  await createResource(
    ssmParameterValues.referenceDatasetsUrl,
    requestBodies.referenceSetZipcodesToImpact,
    token,
    "referenceDatasets"
  );
  await createResource(
    ssmParameterValues.referenceDatasetsUrl,
    requestBodies.referenceSetUsageByBuildingActivityType,
    token,
    "referenceDatasets"
  );

  console.log("Creating emission factor impacts");
  let impacts = JSON.parse(
    readFileSync(path.join(__dirname, "impacts.json"), "utf8")
  );

  //map impacts
  let transformedImpacts = impacts.map((item:any) => {
    return {
      name: item.impact_factor_name,
      description: item.Notes,
      impacts: {
        CO2eq: {
          name: "KG C02 eq per MWh",
          attributes: {
            outUnit: "KG C02 eq per MWh"
          },
          components: {
            co2: {
              key: "co2",
              value: item.co2_co2e,
              type: "pollutant"
            },
            ch4: {
              key: "ch4",
              value: item.ch4_co2e,
              type: "pollutant"
            },
            no2: {
              key: "no2",
              value: item.n2o_co2e,
              type: "pollutant"
            }
          }
        }
      }
    };
  });

  //insert impacts
  transformedImpacts.forEach(
    async (impactBody: any) =>
      await createResource(
        ssmParameterValues.impactsUrl,
        JSON.stringify(impactBody),
        token,
        "activities"
      )
  );

  console.log("Creating calculations");
  await createResource(
    ssmParameterValues.calculationsUrl,
    requestBodies.calculationBuildingActivityType,
    token,
    "calculations"
  );
  await createResource(
    ssmParameterValues.calculationsUrl,
    requestBodies.calculationBuildingUnitConversion,
    token,
    "calculations"
  );
  await createResource(
    ssmParameterValues.calculationsUrl,
    requestBodies.calculationElectricityConversion,
    token,
    "calculations"
  );
  await createResource(
    ssmParameterValues.calculationsUrl,
    requestBodies.calculationGetMWHByArea,
    token,
    "calculations"
  );
  await createResource(
    ssmParameterValues.calculationsUrl,
    requestBodies.calculationGetMWHByCalculationType,
    token,
    "calculations"
  );
  await createResource(
    ssmParameterValues.calculationsUrl,
    requestBodies.calcuationGetImpactByMWH,
    token,
    "calculations"
  );

  console.log("Completed");
};

main();
