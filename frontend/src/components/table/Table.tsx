// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useState, useEffect } from "react";
import Table from "@cloudscape-design/components/table";
import Header from "@cloudscape-design/components/header";
import { Box } from "@cloudscape-design/components";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { selectCalculationData, selectConsumptionCount } from "../../features/calculation/calculationSlice";

interface TableDataInterface {
  name: string;
  co2: number;
  ch4: number;
  n2o: number;
  total: number;
}

export const ResultsTable = () => {
  const calculationData = useAppSelector(selectCalculationData);
  const acitivtyCount = useAppSelector(selectConsumptionCount);
  const [tableData, setTableData] = useState<TableDataInterface[]>([]);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Determine if there are multiple instances of the same facility. If so, sum up the total and combine into one
    const fMap = new Map();
    const fArr: any = [];

    calculationData?.forEach((c: any, i: number) => {
      const parseData = JSON.parse(c);
      //Facility used for electricity usage
      const facility = {
        name: parseData?.facilityName,
        co2: parseData?.impactCo2.toFixed(2),
        ch4: parseData?.impactCh4.toFixed(2),
        n2o: parseData?.impactNo2.toFixed(2),
        total: (parseData?.impactCo2 + parseData?.impactCh4 + parseData?.impactNo2).toFixed(2),
      };

      for (let j = 0; j < acitivtyCount.length; j++) {
        if (parseData?.facilityName === acitivtyCount[j].facilityName) {
          const prevVals = fMap.get(parseData?.facilityName);

          if (prevVals === undefined) {
            fMap.set(parseData?.facilityName, [facility]);
          } else {
            fMap.set(parseData?.facilityName, [...prevVals, facility]);
          }
          return;
        }
      }

      //Facility for building footage
      // If facilityName already exists, do not push
      const exists = fArr.some((x: any) => x.name === parseData?.facilityName);
      if (!exists) {
        fArr.push({
          name: parseData?.facilityName,
          co2: Number(parseData?.impactCo2.toFixed(2)).toLocaleString("en-US"),
          ch4: Number(parseData?.impactCh4.toFixed(2)).toLocaleString("en-US"),
          n2o: Number(parseData?.impactNo2.toFixed(2)).toLocaleString("en-US"),
          total: Number((parseData?.impactCo2 + parseData?.impactCh4 + parseData?.impactNo2).toFixed(2)).toLocaleString(
            "en-US"
          ),
        });
      }
    });

    //Iterate over map and count up the total
    fMap.forEach((val: any, key: any) => {
      let res: any = {};
      for (let i = 0; i < val.length; i++) {
        for (const [key, value] of Object.entries(val[i])) {
          if (!res[key]) {
            res[key] = 0;
          }
          res[key] += Number(value);
        }
      }

      fArr.push({
        name: val[0].name,
        co2: Number(res.co2.toFixed(2)).toLocaleString("en-US"),
        ch4: Number(res.ch4.toFixed(2)).toLocaleString("en-US"),
        n2o: Number(res.n2o.toFixed(2)).toLocaleString("en-US"),
        total: Number(res.total.toFixed(2)).toLocaleString("en-US"),
      });
    });

    setTableData(fArr);
  }, [acitivtyCount, calculationData, dispatch]);

  return (
    <>
      <Table
        wrapLines={true}
        columnDefinitions={[
          {
            id: "facility",
            header: "Facility",
            cell: (e: any) => e.name,
            width: 120,
          },
          {
            id: "co2",
            header: "Carbon Dioxide (CO2) (kg)",
            cell: (e: any) => e.co2,
            width: 100,
          },
          {
            id: "ch4",
            header: "Methane (CH4) (kgCO2e)",
            cell: (e: any) => e.ch4,
            width: 100,
          },
          {
            id: "n2o",
            header: "Nitrous Oxide (N2O) (kgCO2e)",
            cell: (e: any) => e.n2o,
            width: 100,
          },
          {
            id: "total",
            header: "Total CO2e",
            cell: (e: any) => e.total,
            width: 100,
          },
        ]}
        items={tableData}
        loadingText="Loading resources"
        visibleColumns={["facility", "co2", "ch4", "n2o", "total"]}
        header={<Header variant="h2">Scope 2 Emissions (kg CO2e)</Header>}
        empty={
          <Box textAlign="center" color="inherit">
            <b>No resources</b>
            <Box padding={{ bottom: "s" }} variant="p" color="inherit">
              No resources to display.
            </Box>
          </Box>
        }
        variant={"container"}
        contentDensity={"comfortable"}
      />
    </>
  );
};
