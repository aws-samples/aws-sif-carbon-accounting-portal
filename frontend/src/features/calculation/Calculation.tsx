// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { useState, Children } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { calculateAsync, setElectricityConsumptionActivityCount, selectCalculationStatus } from "./calculationSlice";

import {
  Button,
  Container,
  FormField,
  Grid,
  Header,
  Icon,
  Input,
  Multiselect,
  Select,
  SpaceBetween,
  Spinner,
} from "@cloudscape-design/components";

import {
  ACTIVITY_DATA_TYPES,
  BUILDING_ACTIVITIES,
  BUILDING_AREA_UNIT,
  CALCULATION_CONTANTS,
  ELECTRICITY_UNITS,
  MONTHS,
} from "../../constants";

export const Calculation = () => {
  const [facilityFields, setFacilityFields] = useState<any>([
    {
      facilityName: "",
      facilityZip: "",
      selectedBuildinActivity: undefined,
      selectedActivityDataType: undefined,
      activities: [
        {
          selectedMonth: undefined,
          selectedConsumptionA: "",
          selectedUnitA: undefined,
        },
      ],
      selectedConsumptionB: "",
      selectedUnitB: undefined,
      selectedAreaMonths: [],
    },
  ]);
  const [formErrors, setFormErrors] = useState<any>([]);
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectCalculationStatus);

  const handleOnChange = (index: number, event: any, name: any, isActivity?: boolean, activityIndex?: number) => {
    let data: any = [...facilityFields];
    let errors: any = [...formErrors];
    if (isActivity) {
      data[index]["activities"][`${activityIndex}`][`${name}`] = event;
      setFacilityFields(data);

      if (
        errors[index] &&
        errors[index]["activities"] &&
        errors[index]["activities"][`${activityIndex}`] &&
        errors[index]["activities"][`${activityIndex}`][`${name}`]
      ) {
        delete errors[index]["activities"][`${activityIndex}`][`${name}`];
        setFormErrors(errors);
      }
    } else {
      data[index][name] = event;
      setFacilityFields(data);

      if (errors[index] && errors[index][name]) {
        delete errors[index][name];
        setFormErrors(errors);
      }
    }
  };

  //  Add Facility
  const addFacility = () => {
    const addFields = {
      facilityName: "",
      facilityZip: "",
      selectedBuildinActivity: undefined,
      selectedActivityDataType: undefined,
      activities: [
        {
          selectedMonth: undefined,
          selectedConsumptionA: "",
          selectedUnitA: undefined,
        },
      ],
      selectedConsumptionB: "",
      selectedUnitB: undefined,
      selectedAreaMonths: [],
    };
    setFacilityFields([...facilityFields, addFields]);
  };

  // Remove Facility
  const removeFacility = (index: number) => {
    let data = [...facilityFields];
    data.splice(index, 1);
    setFacilityFields(data);
  };

  // Add Activity
  const addActivity = (index: number) => {
    let data = [...facilityFields];
    const activity = {
      selectedMonth: undefined,
      selectedConsumptionA: "",
      selectedUnitA: undefined,
    };
    const activityData = [...data[index]["activities"]];
    activityData.push(activity);
    data[index]["activities"] = activityData;
    setFacilityFields(data);
  };

  // Remove Activity
  const removeActivity = (index: number, activityIndex: number) => {
    let data = [...facilityFields];
    data[index]["activities"].splice(activityIndex, 1);
    setFacilityFields(data);
  };

  // Middle function to validate form fields
  const validateFormFields = () => {
    let hasError = false;
    const currentFacilityFields = [...facilityFields];
    const errors: any = new Array(facilityFields.length).fill(null).map(() => {
      return {
        facilityName: "",
        facilityZip: "",
        selectedBuildinActivity: undefined,
        selectedActivityDataType: undefined,
        selectedMonth: undefined,
        activities: [
          {
            selectedMonth: undefined,
            selectedConsumptionA: "",
            selectedUnitA: undefined,
          },
        ],
        selectedConsumptionB: "",
        selectedUnitB: undefined,
      };
    });

    currentFacilityFields.forEach((f, i) => {
      if (!f?.facilityName) {
        errors[i].facilityName = "Facility name field is required.";
        hasError = true;
      }
      if (!f?.facilityZip) {
        errors[i].facilityZip = "Facility zip field is required.";
        hasError = true;
      }
      if (!f?.selectedActivityDataType) {
        errors[i].selectedActivityDataType = "Activity data type field is required.";
        hasError = true;
      } else if (f?.selectedActivityDataType.label === "Electricity Consumption") {
        // Validate for each acitivity
        errors[i].activities = new Array(f?.activities.length).fill(null).map(() => {
          return {
            selectedMonth: undefined,
            selectedConsumptionA: "",
            selectedUnitA: undefined,
          };
        });

        f?.activities.forEach((a: any, activityIdx: number) => {
          if (!a.selectedMonth) {
            errors[i].activities[activityIdx].selectedMonth = "Month field is required.";
            hasError = true;
          }
          if (!a.selectedConsumptionA) {
            errors[i].activities[activityIdx].selectedConsumptionA = "Consumption field is required.";
            hasError = true;
          }
          if (!a.selectedUnitA) {
            errors[i].activities[activityIdx].selectedUnitA = "Data unit field is required.";
            hasError = true;
          }
        });
      } else if (f?.selectedActivityDataType.label === "Building Square footage") {
        // Validate unit B
        if (!f?.selectedConsumptionB) {
          errors[i].selectedConsumptionB = "Activity Data Consumption field is required.";
          hasError = true;
        }
        if (!f.selectedUnitB) {
          errors[i].selectedUnitB = "Activity Data Unit field is required.";
          hasError = true;
        }
        if (!f?.selectedBuildinActivity) {
          errors[i].selectedBuildinActivity = "Building activity field is required.";
          hasError = true;
        }
        if (f?.selectedAreaMonths.length === 0) {
          errors[i].selectedAreaMonths = "Building area months field is required.";
          hasError = true;
        }
      }
    });
    setFormErrors(errors);
    return hasError;
  };

  const handleCalculation = async () => {
    const hasFormErrors = validateFormFields();
    if (hasFormErrors) return;
    const electricityUsageUnitArr: any = [];
    const buildingAreaArr: any = [];
    let dataToCalculate: any = [];
    const currentYear = new Date().getFullYear();

    facilityFields.forEach((f: any, i: number) => {
      let electricityUsageUnit: any;
      let electricityUsage: any;

      if (f.selectedActivityDataType.value === "Usage") {
        dispatch(setElectricityConsumptionActivityCount({ facilityName: f.facilityName }));
        f?.activities.forEach((a: any, i: number) => {
          electricityUsageUnitArr.push({
            date: `${a.selectedMonth.value}/01/${currentYear}`,
            facilityName: f.facilityName,
            zipCode: Number(f.facilityZip), //int
            calculationType: f.selectedActivityDataType.value,
            buildingArea: Number(f.selectedConsumptionB) ?? 0, //int
            buildingAreaUnit: f.selectedUnitB?.value ?? "",
            buildingActivityType: f.selectedBuildinActivity?.value ?? "",
            electricityUsage: Number(a.selectedConsumptionA),
            electricityUsageUnit: a.selectedUnitA?.value,
          });
        });
      }

      if (f.selectedAreaMonths.length >= 1) {
        f.selectedAreaMonths.forEach((month: any) => {
          buildingAreaArr.push({
            date: `${month.value}/01/${currentYear}`,
            facilityName: f.facilityName,
            zipCode: Number(f.facilityZip), //int
            calculationType: f.selectedActivityDataType.value,
            buildingArea: Number(f.selectedConsumptionB) ?? 0, //int
            buildingAreaUnit: f.selectedUnitB?.value ?? "",
            buildingActivityType: f.selectedBuildinActivity?.value ?? "",
            electricityUsage: electricityUsage ?? "",
            electricityUsageUnit: electricityUsageUnit ?? "",
          });
        });
      }
    });

    dataToCalculate = [...electricityUsageUnitArr, ...buildingAreaArr];

    const body = {
      name: "Building Co2Eq impact pipeline",
      description: "data processing pipeline to calculate co2eq for facilities",
      transformer: {
        transforms: [
          {
            index: 0,
            formula: "AS_TIMESTAMP(:date,'M/d/yyyy')",
            outputs: [
              {
                description: "Timestamp",
                index: 0,
                key: "time",
                label: "Time",
                type: "timestamp",
              },
            ],
          },
          {
            index: 1,
            formula: ":facilityName",
            outputs: [
              {
                description: "facilityName",
                index: 0,
                key: "facilityName",
                label: "facilityName",
                type: "string",
              },
            ],
          },
          {
            index: 2,
            formula:
              "#GetImpactByMhw(:zipCode,'co2',IF(:calculationType=='Area',#GetMwhByArea(:buildingArea,:buildingAreaUnit,:buildingActivityType)/12,#ConvertElectricity(:electricityUsageUnit,:electricityUsage)))",
            outputs: [
              {
                description: "impactCo2",
                index: 0,
                key: "impactCo2",
                label: "impactCo2",
                type: "number",
              },
            ],
          },
          {
            index: 3,
            formula:
              "#GetImpactByMhw(:zipCode,'ch4',IF(:calculationType=='Area',#GetMwhByArea(:buildingArea,:buildingAreaUnit,:buildingActivityType)/12,#ConvertElectricity(:electricityUsageUnit,:electricityUsage)))",
            outputs: [
              {
                description: "impactNo2",
                index: 0,
                key: "impactNo2",
                label: "impactNo2",
                type: "number",
              },
            ],
          },
          {
            index: 4,
            formula:
              "#GetImpactByMhw(:zipCode,'no2',IF(:calculationType=='Area',#GetMwhByArea(:buildingArea,:buildingAreaUnit,:buildingActivityType)/12,#ConvertElectricity(:electricityUsageUnit,:electricityUsage)))",
            outputs: [
              {
                description: "impactCh4",
                index: 0,
                key: "impactCh4",
                label: "impactCh4",
                type: "number",
              },
            ],
          },
        ],
        parameters: [
          {
            index: 0,
            key: "date",
            type: "string",
          },
          {
            index: 1,
            key: "facilityName",
            type: "string",
          },
          {
            index: 2,
            key: "zipCode",
            type: "number",
          },
          {
            index: 3,
            key: "calculationType",
            type: "string",
          },
          {
            index: 4,
            key: "electricityUsage",
            type: "number",
          },
          {
            index: 5,
            key: "electricityUsageUnit",
            type: "string",
          },
          {
            index: 6,
            key: "buildingArea",
            type: "number",
          },
          {
            index: 7,
            key: "buildingAreaUnit",
            type: "string",
          },
          {
            index: 8,
            key: "buildingActivityType",
            type: "string",
          },
        ],
      },
      dryRunOptions: {
        data: dataToCalculate,
      },
    };

    dispatch(calculateAsync(JSON.stringify(body)));
  };

  return (
    <SpaceBetween size="s">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexDirection: "row-reverse",
        }}
      >
        <Button iconName="add-plus" variant="primary" onClick={addFacility} disabled={facilityFields.length === 5}>
          {CALCULATION_CONTANTS.addButtonText}
        </Button>
      </div>

      {Children.toArray(
        facilityFields.map((facility: any, index: number) => {
          return (
            <Container key={index}>
              <SpaceBetween size="s">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Header variant="h2">{CALCULATION_CONTANTS.provideFacilityHeader}</Header>
                  {index !== 0 && (
                    <div onClick={() => removeFacility(index)}>
                      <Icon name="close" />
                    </div>
                  )}
                </div>
                <Grid gridDefinition={[{ colspan: 3 }, { colspan: 3 }, { colspan: 3 }, { colspan: 3 }]}>
                  <FormField description="" label="Facility name" errorText={formErrors[index]?.facilityName}>
                    <Input
                      value={facility.facilityName}
                      onChange={(event) => handleOnChange(index, event.detail.value, "facilityName")}
                      placeholder={"Enter facility name"}
                    />
                  </FormField>
                  <FormField description="" label="Facility zip code" errorText={formErrors[index]?.facilityZip}>
                    <Input
                      value={facility.facilityZip}
                      onChange={(event) => handleOnChange(index, event.detail.value, "facilityZip")}
                      placeholder={"Enter facility Zip Code"}
                    />
                  </FormField>
                  <FormField
                    description=""
                    label="Activity data type"
                    errorText={formErrors[index]?.selectedActivityDataType}
                  >
                    <Select
                      selectedOption={facility.selectedActivityDataType}
                      onChange={({ detail }: any) =>
                        handleOnChange(index, detail.selectedOption, "selectedActivityDataType")
                      }
                      options={ACTIVITY_DATA_TYPES}
                      selectedAriaLabel="Selected"
                      placeholder="Select activity data ype"
                    />
                  </FormField>
                </Grid>
              </SpaceBetween>
              {facility?.selectedActivityDataType?.label === "Electricity Consumption" && (
                <div style={{ marginTop: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <em>{CALCULATION_CONTANTS["2A"]}</em>
                    <Button
                      iconName="add-plus"
                      onClick={() => addActivity(index)}
                      disabled={facility?.activities.length === 12}
                    >
                      {CALCULATION_CONTANTS["2ACTA"]}{" "}
                    </Button>
                  </div>
                  {Children.toArray(
                    facility?.activities.map((activity: any, activityIndex: number) => {
                      return (
                        <div key={activityIndex}>
                          <p style={{ margin: "0.75rem 0px 0.25rem 0px" }}>Activity {activityIndex + 1}</p>
                          <Grid gridDefinition={[{ colspan: 3 }, { colspan: 3 }, { colspan: 3 }, { colspan: 1 }]}>
                            <FormField
                              description=""
                              label="Activity data month"
                              errorText={
                                formErrors[index]?.activities &&
                                formErrors[index]?.activities[activityIndex]?.selectedMonth
                              }
                            >
                              <Select
                                selectedOption={activity.selectedMonth}
                                onChange={({ detail }: any) =>
                                  handleOnChange(index, detail.selectedOption, "selectedMonth", true, activityIndex)
                                }
                                options={MONTHS}
                                selectedAriaLabel="Selected"
                                placeholder="Select month"
                              />
                            </FormField>
                            <FormField
                              description=""
                              label="Activity data consumption"
                              errorText={
                                formErrors[index]?.activities &&
                                formErrors[index]?.activities[activityIndex]?.selectedConsumptionA
                              }
                            >
                              <Input
                                value={activity.selectedConsumptionA}
                                onChange={(event) =>
                                  handleOnChange(index, event.detail.value, "selectedConsumptionA", true, activityIndex)
                                }
                                placeholder={"Enter consumption i.e. 2000"}
                              />
                            </FormField>
                            <FormField
                              description=""
                              label="Activity data unit"
                              errorText={
                                formErrors[index]?.activities &&
                                formErrors[index]?.activities[activityIndex]?.selectedUnitA
                              }
                            >
                              <Select
                                selectedOption={activity.selectedUnitA}
                                onChange={({ detail }: any) =>
                                  handleOnChange(index, detail.selectedOption, "selectedUnitA", true, activityIndex)
                                }
                                options={ELECTRICITY_UNITS}
                                selectedAriaLabel="Selected"
                                placeholder="Select unit"
                              />
                            </FormField>
                            {facility?.activities.length > 1 && (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  marginTop: "1.75rem",
                                  cursor: "pointer",
                                }}
                                onClick={() => removeActivity(index, activityIndex)}
                              >
                                <Icon name="close" />
                              </div>
                            )}
                          </Grid>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
              {facility.selectedActivityDataType?.label === "Building Square footage" && (
                <div style={{ marginTop: "0.75rem" }}>
                  <SpaceBetween size="s">
                    <em>{CALCULATION_CONTANTS["2B"]}</em>
                    <Grid gridDefinition={[{ colspan: 3 }, { colspan: 3 }, { colspan: 3 }, { colspan: 3 }]}>
                      <FormField
                        label="Select all months that applies"
                        errorText={formErrors[index]?.selectedAreaMonths}
                      >
                        <Multiselect
                          selectedOptions={facility.selectedAreaMonths}
                          onChange={({ detail }) => handleOnChange(index, detail.selectedOptions, "selectedAreaMonths")}
                          deselectAriaLabel={(e) => `Remove ${e.label}`}
                          options={MONTHS}
                          placeholder="Select month(s)"
                          selectedAriaLabel="Selected"
                        />
                      </FormField>
                      <FormField
                        description=""
                        label="Main facility type"
                        errorText={formErrors[index]?.selectedBuildinActivity}
                      >
                        <Select
                          selectedOption={facility.selectedBuildinActivity}
                          onChange={({ detail }: any) =>
                            handleOnChange(index, detail.selectedOption, "selectedBuildinActivity")
                          }
                          options={BUILDING_ACTIVITIES}
                          selectedAriaLabel="Selected"
                          placeholder="Select main facility type"
                        />
                      </FormField>
                      <FormField
                        description=""
                        label="Activity data consumption"
                        errorText={formErrors[index]?.selectedConsumptionB}
                      >
                        <Input
                          value={facility.selectedConsumptionB}
                          onChange={(event) => handleOnChange(index, event.detail.value, "selectedConsumptionB")}
                          placeholder={"Enter consumption i.e. 2000"}
                        />
                      </FormField>
                      <FormField description="" label="Activity data unit" errorText={formErrors[index]?.selectedUnitB}>
                        <Select
                          selectedOption={facility.selectedUnitB}
                          onChange={({ detail }: any) => handleOnChange(index, detail.selectedOption, "selectedUnitB")}
                          options={BUILDING_AREA_UNIT}
                          selectedAriaLabel="Selected"
                          placeholder="Select unit"
                        />
                      </FormField>
                    </Grid>
                  </SpaceBetween>
                </div>
              )}
            </Container>
          );
        })
      )}
      <div style={{ display: "flex", alignItems: "center", flexDirection: "row-reverse" }}>
        {status === "loading" ? (
          <Button variant="primary">
            <Spinner />
          </Button>
        ) : (
          <Button onClick={handleCalculation} variant="primary">
            {CALCULATION_CONTANTS.calculateButtonText}
          </Button>
        )}
      </div>
    </SpaceBetween>
  );
};
