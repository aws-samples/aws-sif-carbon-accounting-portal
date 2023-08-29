// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { Children } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Box, Container, Grid, SpaceBetween, Icon } from "@cloudscape-design/components";
import { Chart } from "react-google-charts";

import { CALCULATION_CONTANTS } from "../../constants/index";
import AppHeader from "../../components/header/Header";

const LandingPage = () => {
  const subAssemblyLinks = [
    {
      type: "Scope 1",
      value: "15%",
      link: null,
    },
    {
      type: "Scope 2",
      value: "20%",
      link: true,
    },
    {
      type: "Scope 3",
      value: "65%",
      link: null,
    },
  ];

  return (
    <div>
      <div id="top-nav">
        <AppHeader />
      </div>
      <div style={styles.landingContainer}>
        <p style={styles.landingTitle}>{CALCULATION_CONTANTS.header} </p>
        <Grid gridDefinition={[{ colspan: 2 }, { colspan: 6 }, { colspan: 4 }]}>
          <p style={styles.slogan}> {CALCULATION_CONTANTS.landingSlogan} </p>
          <ThreeDPieChart />
          <div
            style={{
              maxWidth: "300px",
            }}
          >
            <p style={styles.landingText}>{CALCULATION_CONTANTS.landingText1}</p>
            <Container>
              <SpaceBetween size="s">
                {Children.toArray(
                  subAssemblyLinks.map(({ type, value, link }) => {
                    return (
                      <Grid
                        gridDefinition={[{ colspan: { default: 8, xxs: 10 } }, { colspan: { default: 4, xxs: 2 } }]}
                      >
                        <Box variant="p"> {type} </Box>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <Box variant="p"> {value} </Box>
                          <span style={{ margin: "0 0.5rem" }} />
                          {link && (
                            <Link to="/scope-2-calculation">
                              <Icon name="external" variant="link" />
                            </Link>
                          )}
                        </div>
                      </Grid>
                    );
                  })
                )}
              </SpaceBetween>
            </Container>
          </div>
        </Grid>
      </div>
    </div>
  );
};

const ThreeDPieChart = () => {
  const navigate = useNavigate();
  return (
    <Chart
      chartType="PieChart"
      data={data}
      options={options}
      chartEvents={[
        {
          eventName: "ready",
          callback: ({ chartWrapper, google }) => {
            const chart: any = chartWrapper.getChart();
            chart.container.addEventListener("click", (ev: any) => {
              navigate("/scope-2-calculation");
            });
          },
        },
      ]}
    />
  );
};

const data = [
  ["Scope", "Value"],
  ["Scope 1", 15],
  ["Scope 2", 20],
  ["Scope 3", 65],
];

const options = {
  title: "",
  is3D: true,
  backgroundColor: "transparent",
  legend: "none",
  pieSliceText: "label",
  slices: {
    1: { offset: 0.2 },
  },
  colors: ["#81ecec", "#74b9ff", "#4834d4"],
  height: 600,
  width: 600,
  fontSize: 24,
};

const styles = {
  landingContainer: {
    minWidth: "800px",
    maxWidth: "1200px",
    width: "80%",
    margin: "0 auto",
  },
  landingTitle: {
    fontWeight: "800",
    fontSize: "40px",
    color: "#222f3e",
  },
  landingText: {
    fontWeight: "600",
    color: "#222f3e",
    fontSize: "18px",
  },
  slogan: {
    color: "#fff",
    fontSize: "18px",
  },
};

export default LandingPage;
