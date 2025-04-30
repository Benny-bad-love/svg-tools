"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { validateSvg as validateSvgUtil, downloadSvg, loadExampleSvg } from "../utils/svgUtils";

type SvgContextType = {
  svgCode: string;
  fileName: string;
  isValidSvg: boolean;
  validationMessage: string;

  // SVG actions
  setSvgCode: (code: string) => void;
  setFileName: (name: string) => void;
  handleDownload: () => Promise<void>;
  loadExample: () => Promise<void>;
};

export const SvgContext = createContext<SvgContextType | undefined>(undefined);

export const SvgProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [svgCode, setSvgCode] = useState("");
  const [fileName, setFileName] = useState("image.svg");
  const [isValidSvg, setIsValidSvg] = useState(true);
  const [validationMessage, setValidationMessage] = useState("");

  // Validate SVG whenever code changes
  useEffect(() => {
    const { isValid, message } = validateSvgUtil(svgCode);
    setIsValidSvg(isValid);
    setValidationMessage(message);
  }, [svgCode]);

  // SVG actions
  const handleDownload = async () => {
    try {
      await downloadSvg(svgCode, fileName, isValidSvg);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const loadExample = async () => {
    try {
      const exampleSvg = await loadExampleSvg();
      setSvgCode(exampleSvg);
      setFileName('example.svg');
    } catch (error) {
      console.error('Failed to load example:', error);
      alert('Failed to load example SVG');
    }
  };

  const value = {
    svgCode,
    fileName,
    isValidSvg,
    validationMessage,

    setSvgCode,
    setFileName,
    handleDownload,
    loadExample
  };

  return (
    <SvgContext.Provider value={value}>
      {children}
    </SvgContext.Provider>
  );
};

// Custom hook to use the SVG context
export const useSvg = () => {
  const context = useContext(SvgContext);
  if (context === undefined) {
    throw new Error("useSvg must be used within an SvgProvider");
  }
  return context;
};