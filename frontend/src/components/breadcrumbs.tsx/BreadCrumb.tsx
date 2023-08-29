// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from "react";
import BreadcrumbGroup, { BreadcrumbGroupProps } from "@cloudscape-design/components/breadcrumb-group";
import { CALCULATION_CONTANTS } from "../../constants";

const items: BreadcrumbGroupProps.Item[] = [
  { text: CALCULATION_CONTANTS.header, href: "/" },
  { text: "Scope 2 Calculation", href: "/scope-2-calculation" },
];

export interface BreadcrumbsProps {
  active: BreadcrumbGroupProps.Item;
}

export default function Breadcrumbs() {
  return <BreadcrumbGroup items={items} />;
}
