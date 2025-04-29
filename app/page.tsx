"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [svgCode, setSvgCode] = useState("");
  const [fileName, setFileName] = useState("image.svg");
  const [isValidSvg, setIsValidSvg] = useState(true);
  const [validationMessage, setValidationMessage] = useState("");

  useEffect(() => {
    validateSvg(svgCode);
  }, [svgCode]);

  const validateSvg = (code: string) => {
    if (!code.trim()) {
      setIsValidSvg(true);
      setValidationMessage("");
      return;
    }

    try {
      // Check if it has SVG tags
      if (!code.toLowerCase().includes("<svg") || !code.toLowerCase().includes("</svg>")) {
        setIsValidSvg(false);
        setValidationMessage("Missing SVG tags");
        return;
      }

      // Try parsing the SVG code as XML
      const parser = new DOMParser();
      const doc = parser.parseFromString(code, "image/svg+xml");
      const parserError = doc.querySelector("parsererror");

      if (parserError) {
        setIsValidSvg(false);
        setValidationMessage("Invalid SVG format");
      } else {
        setIsValidSvg(true);
        setValidationMessage("");
      }
    } catch (error) {
      setIsValidSvg(false);
      setValidationMessage("Error validating SVG");
    }
  };

  const handleDownload = () => {
    if (!svgCode.trim()) {
      alert("Please enter some SVG code first");
      return;
    }

    if (!isValidSvg) {
      const proceed = confirm("The SVG code appears to be invalid. Download anyway?");
      if (!proceed) return;
    }

    // Create blob from SVG
    const blob = new Blob([svgCode], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    // Create link and trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();

    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadExample = async () => {
    try {
      const response = await fetch('/example.svg');
      const text = await response.text();
      setSvgCode(text);
      setFileName('example.svg');
    } catch (error) {
      console.error('Failed to load example:', error);
      alert('Failed to load example SVG');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-8">
      <header className="w-full max-w-3xl mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">SVG Downloader</h1>
        <p className="text-center text-gray-600 dark:text-gray-300">
          Paste your SVG code and download it as a file
        </p>
      </header>

      <main className="w-full max-w-3xl flex-1 flex flex-col gap-6">
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
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg
                     bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />
        </div>

        <div className="flex justify-center mt-4">
          <button
            onClick={handleDownload}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg
                     transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
      </main>

      <footer className="mt-12 text-center text-gray-500 text-sm">
        SVG Downloader Tool - Paste, Preview, Download
      </footer>
    </div>
  );
}
