// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { CSVLink } from "react-csv";

import { Alert, AppLayout, ContentLayout, Header, Button, Container, Grid } from "@cloudscape-design/components";

import { Calculation } from "../../features/calculation/Calculation";
import { ResultsTable } from "../../components/table/Table";
import { SideNav } from "../../components/side-nav/SideNav";
import AppHeader from "../../components/header/Header";
import Breadcrumbs from "../../components/breadcrumbs.tsx/BreadCrumb";
import { AppBarChart } from "../../components/chart/BarChart";
import { AppBarChartByMonths } from "../../components/chart/BarChartByMonths";
import {
  selectCalculationStatus,
  selectCalculationData,
  selectCsvData,
  clearData,
  selectApiErrorMessage,
} from "../../features/calculation/calculationSlice";

const CalculatePage = () => {
  const [navOpen, setNavOpen] = useState(false);
  const status = useAppSelector(selectCalculationStatus);
  const data = useAppSelector(selectCalculationData);
  const csvData = useAppSelector(selectCsvData);
  const apiErrorMessage = useAppSelector(selectApiErrorMessage);
  const dispatch = useAppDispatch();

  useEffect(() => {
    return () => {
      dispatch(clearData());
    };
  }, [dispatch]);

  return (
    <>
      <div id="top-nav">
        <AppHeader />
      </div>
      <AppLayout
        breadcrumbs={<Breadcrumbs />}
        navigation={<SideNav />}
        navigationOpen={false}
        onNavigationChange={() => setNavOpen(!navOpen)}
        headerSelector="#top-nav"
        toolsHide={true}
        ariaLabels={{
          navigation: "Navigation drawer",
          navigationClose: "Close navigation drawer",
          navigationToggle: "Open navigation drawer",
          notifications: "Notifications",
          tools: "Help panel",
          toolsClose: "Close help panel",
          toolsToggle: "Open help panel",
        }}
        content={
          <ContentLayout header={<Header variant="h1">CO2e Calculation</Header>}>
            <Calculation />
            {data && status !== "loading" && (
              <div style={{ marginTop: "1rem" }}>
                <ResultsTable />

                <div style={{ marginTop: "1.5rem" }}>
                  <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
                    <Container>
                      <AppBarChartByMonths />
                    </Container>
                    <Container>
                      <AppBarChart />
                    </Container>
                  </Grid>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", flexDirection: "row-reverse", marginTop: "0.75rem" }}
                >
                  <Button variant="primary">
                    <CSVLink filename={"carbon-accounting.csv"} data={csvData}>
                      Download Results
                    </CSVLink>
                  </Button>
                </div>
              </div>
            )}
            <div style={{ marginBottom: "1rem" }} />
            {status === "failed" && (
              <Alert statusIconAriaLabel="Error" type="error" header="Something went wrong with your calculation.">
                {apiErrorMessage}
              </Alert>
            )}
          </ContentLayout>
        }
      />
    </>
  );
};

export default CalculatePage;
