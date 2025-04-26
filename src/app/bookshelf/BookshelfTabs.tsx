"use client";

import { bookStatus } from "../utils/types/booksDB";

interface BookshelfTabsProps {
  selectedTab: bookStatus;
  onTabChange: (tab: bookStatus) => void;
}

export default function BookshelfTabs({ selectedTab, onTabChange }: BookshelfTabsProps) {
  const tabs: { label: string; value: bookStatus }[] = [
    { label: "Reading", value: "reading" },
    { label: "Not Started", value: "notStarted" },
    { label: "Completed", value: "completed" },
    { label: "Abandoned", value: "abandoned" },
  ];

  return (
    <div className="flex justify-around border-b border-gray-300">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onTabChange(tab.value)}
          className={`py-2 px-4 font-medium ${
            selectedTab === tab.value
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
