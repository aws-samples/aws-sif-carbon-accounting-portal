// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import calculationReducer from "../features/calculation/calculationSlice";

export const store = configureStore({
  reducer: {
    calculation: calculationReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
