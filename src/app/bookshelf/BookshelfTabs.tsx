"use client";

import { bookStatus } from "../utils/types/booksDB";

interface BookshelfTabsProps {
  selectedTab: bookStatus;
  onTabChange: (tab: bookStatus) => void;
}

export default function BookshelfTabs({ selectedTab, onTabChange }: BookshelfTabsProps) {
  const tabs: { label: string; value: bookStatus; color: string }[] = [
    { label: "Currently Reading", value: "reading", color: "blue" },
    { label: "Want to Read", value: "notStarted", color: "orange" },
    { label: "Completed", value: "completed", color: "green" },
    { label: "Abandoned", value: "abandoned", color: "gray" },
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              selectedTab === tab.value
                ? `border-${tab.color}-500 text-${tab.color}-600`
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
