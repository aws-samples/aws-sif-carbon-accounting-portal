// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Link } from "react-router-dom";
import { Auth } from "aws-amplify";

import Icon from "@cloudscape-design/components/icon";

import { CALCULATION_CONTANTS } from "../../constants";
const Logo: string = require("../../assets/logo.svg").default;

export const Header = () => {
  return (
    <div style={styles.header}>
      <Link to={"/"}>
        <div style={styles.titleWrapper}>
          <img src={Logo} alt="*" style={{ height: "30px", width: "30px" }} />
          <p style={styles.title}>{CALCULATION_CONTANTS.header}</p>
        </div>
      </Link>
      <div style={styles.signOut} onClick={async () => Auth.signOut()}>
        <Icon name="user-profile" />
        <p style={styles.signOutText}> Sign Out </p>
      </div>
    </div>
  );
};

const styles = {
  header: {
    height: "50px",
    background: "#0972d3",
    padding: "0.18rem 1.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky" as any,
    top: 0,
    zIndex: 3,
  },
  titleWrapper: { display: "flex", alignItems: "center", cursor: "pointer" },
  title: {
    fontWeight: "800",
    fontSize: "16px",
    color: "#fff",
    marginLeft: "0.5rem",
  },
  signOut: {
    color: "#fff",
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
  },
  signOutText: {
    fontSize: "0.75rem",
    fontWeight: "600",
    marginLeft: "5px",
  },
};

export default Header;
