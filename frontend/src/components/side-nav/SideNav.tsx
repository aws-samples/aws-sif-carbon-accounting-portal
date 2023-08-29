// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import * as React from "react";
import { useNavigate } from "react-router-dom";

import SideNavigation, { SideNavigationProps } from "@cloudscape-design/components/side-navigation";

const items: SideNavigationProps["items"] = [{ type: "link", text: "Scope 2 Calculation", href: "#/page1" }];

export const SideNav = () => {
  const [activeHref, setActiveHref] = React.useState("#/page1");
  const navigate = useNavigate();

  return (
    <SideNavigation
      activeHref={activeHref}
      header={{ href: "#/", text: "Home" }}
      onFollow={(event) => {
        if (!event.detail.external) {
          event.preventDefault();
          setActiveHref(event.detail.href);

          if (event.detail.text === "Home") navigate("/");
        }
      }}
      items={items}
    />
  );
};
