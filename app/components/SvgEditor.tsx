"use client";

import React from "react";
import { useSvg } from "../context/SvgContext";

export const SvgEditor: React.FC = () => {
  const {
    svgCode,
    fileName,
    isValidSvg,
    validationMessage,
    setSvgCode,
    setFileName,
    handleDownload,
    loadExample
  } = useSvg();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label htmlFor="svg-code" className="font-medium">
            SVG Code
          </label>
          <button
            onClick={loadExample}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Load Example
          </button>
        </div>
        <textarea
          id="svg-code"
          className={`w-full h-64 p-4 border rounded-lg focus:outline-none focus:ring-2 ${
            !isValidSvg && svgCode.trim()
              ? "border-red-500 bg-red-50 dark:bg-red-900/10 focus:ring-red-500"
              : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-blue-500"
          }`}
          placeholder="Paste your SVG code here (e.g., <svg>...</svg>)"
          value={svgCode}
          onChange={(e) => setSvgCode(e.target.value)}
        ></textarea>
        {!isValidSvg && svgCode.trim() && (
          <p className="text-red-500 text-sm mt-1">{validationMessage}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="file-name" className="font-medium">
          File Name
        </label>
        <input
          id="file-name"
          type="text"
          className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
        />
      </div>

      <div className="flex justify-center mt-4">
        <button
          onClick={handleDownload}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={!svgCode.trim()}
        >
          Download SVG
        </button>
      </div>

      {svgCode && isValidSvg && (
        <div className="mt-8">
          <h2 className="text-xl font-medium mb-2">Preview</h2>
          <div
            className="p-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 flex justify-center"
            dangerouslySetInnerHTML={{ __html: svgCode }}
          ></div>
        </div>
      )}
    </div>
  );
};