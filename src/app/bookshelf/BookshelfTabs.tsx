"use client";

import React, { useState } from "react";

const tabs = [
  { key: "reading", label: "Reading" },
  { key: "finished", label: "Finished" },
  { key: "dropped", label: "Dropped" },
];

export default function BookshelfTabs() {
  const [activeTab, setActiveTab] = useState<string>("reading");

  function handleTabClick(tabKey: string) {
    setActiveTab(tabKey);
    console.log(`Switched to tab: ${tabKey}`);
  }

  return (
    <div className="flex space-x-6 border-b border-gray-300">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => handleTabClick(tab.key)}
          className={`pb-2 text-sm font-medium transition-colors
            ${
              activeTab === tab.key
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-700 hover:text-blue-600"
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
