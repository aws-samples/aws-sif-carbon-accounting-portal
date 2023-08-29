// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { useState, useEffect } from "react";
import Box from "@cloudscape-design/components/box";
import BarChart from "@cloudscape-design/components/bar-chart";

import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { selectCalculationData, selectConsumptionCount, setCsvdata } from "../../features/calculation/calculationSlice";
import { MONTHS_MAP } from "../../constants";

export const AppBarChartByMonths = () => {
  const calculationData = useAppSelector(selectCalculationData);
  const acitivtyCount = useAppSelector(selectConsumptionCount);
  const [currentChart, setCurrentChart] = useState<any>([]);
  const [max, setMax] = useState<any>(0);
  const min = 0;
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fMap = new Map();
    const fArr: any = [];
    const seriesArr: any = [];
    const csvDataArr: any = [];

    calculationData.forEach((c: any, i: number) => {
      const parseData = JSON.parse(c);
      const timestamp = parseData.time;
      const date = new Date(timestamp).getUTCMonth() + 1;
      const getMonth: any = MONTHS_MAP[date];
      // Create CSV {} for each item
      const csvObj = {
        Month: getMonth,
        Facility: parseData?.facilityName,
        "co2 (kg CO2e)": Number(parseData?.impactCo2).toFixed(2),
        "ch4 (kg CO2e)": Number(parseData?.impactCh4).toFixed(2),
        "n2o (kg CO2e)": Number(parseData?.impactNo2).toFixed(2),
        "Total (kg CO2e)": (
          Number(parseData?.impactCo2) +
          Number(parseData?.impactCh4) +
          Number(parseData?.impactNo2)
        ).toFixed(2),
      };
      csvDataArr.push(csvObj);

      const seriesData = {
        x: getMonth,
        y: (Number(parseData?.impactCo2) + Number(parseData?.impactCh4) + Number(parseData?.impactNo2)).toFixed(2),
      };

      const facilityObj = {
        name: parseData?.facilityName,
        month: getMonth,
        series: {
          title: parseData?.facilityName,
          type: "bar",
          data: [seriesData],
          valueFormatter: (e: any) => Number(e).toLocaleString("en-US") + " CO2e",
        },
      };

      // Check if facility name exists
      const findIndex = seriesArr.findIndex((f: any) => f.name === parseData?.facilityName);
      if (findIndex === -1) {
        seriesArr.push(facilityObj);
      } else {
        const itemToUpdate = seriesArr[findIndex];
        itemToUpdate.series.data.push(seriesData);
      }
    });

    seriesArr.forEach((f: any) => {
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      f.series.data.sort(function (a: any, b: any) {
        return months.indexOf(a.x) - months.indexOf(b.x);
      });
    });
    const dataToSet: any = [];

    seriesArr.forEach((f: any) => dataToSet.push(f.series));
    // setFacilitiesBreakdown(seriesArr);
    setCurrentChart(dataToSet);

    //Find highest num in dataToSet[]
    let tmpMax = 0;
    dataToSet.forEach((f: any, i: any) => {
      f.data.forEach((v: any) => {
        const convertToNum = Number(v.y);
        if (convertToNum > tmpMax) {
          tmpMax = convertToNum;
        }
      });
    });
    setMax(Math.round(tmpMax));

    //Set csv data:
    dispatch(setCsvdata(csvDataArr));

    // Set facility list and set default selected option as first item in data []
    calculationData.forEach((c: any, i: number) => {
      const parseData = JSON.parse(c);
      const prevVal = fMap.get(parseData?.facilityName);
      const listItem = {
        label: parseData?.facilityName,
        value: `${i + 1}`,
      };
      prevVal === undefined
        ? fMap.set(parseData?.facilityName, [listItem])
        : fMap.set(parseData?.facilityName, [...prevVal, listItem]);
    });
    fMap.forEach((v: any, k: any) => {
      fArr.push(v[0]);
    });
  }, [acitivtyCount, calculationData, dispatch, setCurrentChart]);

  return (
    <>
      <BarChart
        series={currentChart}
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
        yTitle="Monthly Facility Emissions (kg CO2e)"
        ariaLabel="Single data series line chart"
        errorText="Error loading data."
        height={270}
        loadingText="Loading chart"
        recoveryText="Retry"
        xScaleType="categorical"
        // hideFilter
        empty={
          <Box textAlign="center" color="inherit">
            <b>No data available</b>
            <Box variant="p" color="inherit">
              There is no data available
            </Box>
          </Box>
        }
      />
    </>
  );
};
