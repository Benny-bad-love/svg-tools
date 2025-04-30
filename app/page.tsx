"use client";

import React from "react";
import { SvgEditor } from "./components/SvgEditor";
import { CollectionSidebar } from "./components/CollectionSidebar";

export default function Home() {
  return (
    <div className="min-h-screen flex">
      <CollectionSidebar />

      <div className="flex-1 flex flex-col">
        <header className="border-b dark:border-gray-800 p-4">
          <h1 className="text-xl font-bold">SVG Downloader</h1>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
              Paste your SVG code, preview it, and download it as a file
            </p>

            <SvgEditor />
          </div>
        </main>

        <footer className="p-4 text-center text-gray-500 text-sm border-t dark:border-gray-800">
          SVG Downloader Tool - Paste, Preview, Download, and Save to Collections
        </footer>
      </div>
    </div>
  );
}
