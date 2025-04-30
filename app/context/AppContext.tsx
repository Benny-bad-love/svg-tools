"use client";

import React from "react";
import { CollectionsProvider } from "./CollectionsContext";
import { SvgProvider } from "./SvgContext";

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SvgProvider>
      <CollectionsProvider>
        {children}
      </CollectionsProvider>
    </SvgProvider>
  );
};