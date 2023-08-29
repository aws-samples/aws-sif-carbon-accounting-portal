// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { useState, useEffect } from "react";
import BarChart from "@cloudscape-design/components/bar-chart";
import Box from "@cloudscape-design/components/box";
import { useAppSelector } from "../../app/hooks";
import { selectCalculationData, selectConsumptionCount } from "../../features/calculation/calculationSlice";

export const AppBarChart = () => {
  const calculationData = useAppSelector(selectCalculationData);
  const [chartData, setChartData] = useState<any>([]);
  const acitivtyCount = useAppSelector(selectConsumptionCount);
  const [max, setMax] = useState<any>(0);
  const min = 0;

  useEffect(() => {
    const fMap = new Map();
    const fArr: any = [];
    // Sort facility from highest coe2 to lowest co2e
    calculationData.forEach((c: any, i: number) => {
      const parseData = JSON.parse(c);
      const series = {
        title: parseData?.facilityName,
        type: "bar",
        data: [
          {
            x: "",
            y: (Number(parseData?.impactCo2) + Number(parseData?.impactCh4) + Number(parseData?.impactNo2)).toFixed(2),
          },
        ],
        valueFormatter: (e: any) => Number(e).toLocaleString("en-US") + " CO2e",
      };
      for (let j = 0; j < acitivtyCount.length; j++) {
        if (parseData?.facilityName === acitivtyCount[j].facilityName) {
          const prevVals = fMap.get(parseData?.facilityName);

          if (prevVals === undefined) {
            fMap.set(parseData?.facilityName, [series]);
          } else {
            fMap.set(parseData?.facilityName, [...prevVals, series]);
          }
          return;
        }
      }
      const exists = fArr.some((x: any) => x.title === parseData?.facilityName);
      if (!exists) {
        fArr.push(series);
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
          let numbertoAdd;
          if (Array.isArray(value)) {
            numbertoAdd = value[0]?.y;
          }
          res[key] += Number(numbertoAdd);
        }
      }
      fArr.push({
        title: val[0].title,
        type: "bar",
        data: [{ x: "", y: res.data.toFixed(2) }],
        valueFormatter: (e: any) => Number(e).toLocaleString("en-US") + " CO2e",
      });
    });
    const sortFromHiToLow = fArr.sort((a: any, b: any) => parseFloat(b?.data[0].y) - parseFloat(a?.data[0].y));

    setMax(() => Math.round(Number(sortFromHiToLow[0].data[0].y)));
    setChartData(sortFromHiToLow);
  }, [acitivtyCount, calculationData]);

  return (
    <BarChart
      series={chartData}
      i18nStrings={{
        filterLabel: "Filter displayed data",
        filterPlaceholder: "Filter data",
        filterSelectedAriaLabel: "selected",
        detailPopoverDismissAriaLabel: "Dismiss",
        legendAriaLabel: "Legend",
        chartAriaRoleDescription: "line chart",
        yTickFormatter: function o(e) {
          return Math.abs(e) >= 1e9
            ? (e / 1e9).toFixed(1).replace(/\.0$/, "") + "G"
            : Math.abs(e) >= 1e6
            ? (e / 1e6).toFixed(1).replace(/\.0$/, "") + "M"
            : Math.abs(e) >= 1e3
            ? (e / 1e3).toFixed(1).replace(/\.0$/, "") + "K"
            : e.toFixed(2);
        },
      }}
      yDomain={[min, max]}
      ariaLabel="Single data series line chart"
      errorText="Error loading data."
      height={350}
      loadingText="Loading chart"
      recoveryText="Retry"
      xScaleType="categorical"
      yTitle="Total Facility Emissions (kg CO2e)"
      hideFilter
      empty={
        <Box textAlign="center" color="inherit">
          <b>No data available</b>
          <Box variant="p" color="inherit">
            There is no data available
          </Box>
        </Box>
      }
    />
  );
};
