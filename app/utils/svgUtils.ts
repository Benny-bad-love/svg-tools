/**
 * Validates SVG code
 * @param code SVG code to validate
 * @returns Object containing validation status and message
 */
export const validateSvg = (code: string): { isValid: boolean; message: string } => {
  if (!code.trim()) {
    return { isValid: true, message: "" };
  }

  try {
    // Check if it has SVG tags
    if (!code.toLowerCase().includes("<svg") || !code.toLowerCase().includes("</svg>")) {
      return { isValid: false, message: "Missing SVG tags" };
    }

    // Try parsing the SVG code as XML
    const parser = new DOMParser();
    const doc = parser.parseFromString(code, "image/svg+xml");
    const parserError = doc.querySelector("parsererror");

    if (parserError) {
      return { isValid: false, message: "Invalid SVG format" };
    } else {
      return { isValid: true, message: "" };
    }
  } catch {
    return { isValid: false, message: "Error validating SVG" };
  }
};

/**
 * Downloads SVG code as a file
 * @param svgCode SVG code to download
 * @param fileName Name of the file
 * @param isValidSvg Whether the SVG is valid
 * @returns Promise that resolves when download is complete or cancelled
 */
export const downloadSvg = (svgCode: string, fileName: string, isValidSvg: boolean): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!svgCode.trim()) {
      alert("Please enter some SVG code first");
      reject("No SVG code provided");
      return;
    }

    if (!isValidSvg) {
      const proceed = confirm("The SVG code appears to be invalid. Download anyway?");
      if (!proceed) {
        resolve(); // User cancelled
        return;
      }
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
    resolve();
  });
};

/**
 * Loads example SVG
 * @returns Promise that resolves with example SVG content
 */
export const loadExampleSvg = async (): Promise<string> => {
  try {
    const response = await fetch('/example.svg');
    return await response.text();
  } catch (error) {
    console.error('Failed to load example:', error);
    throw new Error('Failed to load example SVG');
  }
};