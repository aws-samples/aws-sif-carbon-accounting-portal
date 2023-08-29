// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { calculate } from "./calculationAPI";

export interface CalculationState {
  data: any;
  status: "idle" | "loading" | "failed";
  electricityConsumptionActivityCount: any;
  csvData: any[];
  apiErrorMessage: any;
}

const initialState: CalculationState = {
  data: null,
  status: "idle",
  electricityConsumptionActivityCount: [],
  csvData: [],
  apiErrorMessage: "",
};

export const calculateAsync = createAsyncThunk("calculation/getCalculation", async (data: any, { rejectWithValue }) => {
  const response = await calculate(data);
  if (response.data) {
    return response.data;
  } else {
    return rejectWithValue("Api Failed");
  }
});

export const calculationSlice = createSlice({
  name: "calculation",
  initialState,
  reducers: {
    setElectricityConsumptionActivityCount: (state, action: PayloadAction<any>) => {
      state.electricityConsumptionActivityCount.push(action.payload);
    },
    setCsvdata: (state, action: PayloadAction<any>) => {
      state.csvData = action.payload;
    },
    clearData: (state) => {
      state.data = null;
      state.csvData = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(calculateAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(calculateAsync.fulfilled, (state, action: PayloadAction<any>) => {
        state.status = "idle";
        state.data = action.payload;
      })
      .addCase(calculateAsync.rejected, (state, action: any) => {
        state.status = "failed";
        state.apiErrorMessage = action["error"].message;
      });
  },
});

export const { setElectricityConsumptionActivityCount, setCsvdata, clearData } = calculationSlice.actions;
export const selectCalculationData = (state: RootState) => state.calculation.data;
export const selectCalculationStatus = (state: RootState) => state.calculation.status;
export const selectConsumptionCount = (state: RootState) => state.calculation.electricityConsumptionActivityCount;
export const selectCsvData = (state: RootState) => state.calculation.csvData;
export const selectApiErrorMessage = (state: RootState) => state.calculation.apiErrorMessage;

export default calculationSlice.reducer;
