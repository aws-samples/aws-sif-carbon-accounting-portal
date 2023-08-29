// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Amplify } from "aws-amplify";
import { Routes, Route } from "react-router-dom";

import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

import "./App.css";
import "@cloudscape-design/global-styles/index.css";
import LandingPage from "./pages/landing/LandingPage";
import CalculatePage from "./pages/calculate/CalculatePage";
import { Box } from "@cloudscape-design/components";

import awsExports from "./aws-exports";
Amplify.configure(awsExports);

const App = () => {
  return (
    <div>
      <Authenticator hideSignUp={true} components={components}>
        <Routes>
          <Route index element={<LandingPage />} />
          <Route path="/scope-2-calculation" element={<CalculatePage />} />
        </Routes>
      </Authenticator>
    </div>
  );
};

const components = {
  Header() {
    return <div style={{ marginTop: "30%", textAlign: "center" }} />;
  },
  SignIn: {
    Header() {
      return (
        <Box variant="h2" textAlign="center" margin={{ top: "m" }}>
          Carbon Accounting Portal
        </Box>
      );
    },
  },
};

export default App;
