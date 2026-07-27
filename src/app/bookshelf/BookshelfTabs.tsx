"use client";

import { bookStatus } from "../utils/types/booksDB";
import { Tabs } from "../components/ui";

interface BookshelfTabsProps {
  selectedTab: bookStatus | 'wishlist';
  onTabChange: (tab: bookStatus | 'wishlist') => void;
  counts?: Partial<Record<bookStatus | 'wishlist', number>>;
}

export default function BookshelfTabs({ selectedTab, onTabChange, counts }: BookshelfTabsProps) {
  const tabs: { label: string; value: bookStatus | 'wishlist'; badgeCount?: number }[] = [
    { label: "Currently Reading", value: "reading", badgeCount: counts?.reading },
    { label: "Want to Read", value: "notStarted", badgeCount: counts?.notStarted },
    { label: "Completed", value: "completed", badgeCount: counts?.completed },
    { label: "Abandoned", value: "abandoned", badgeCount: counts?.abandoned },
    { label: "Wishlist", value: "wishlist", badgeCount: counts?.wishlist },
  ];

  return <Tabs items={tabs} value={selectedTab} onChange={onTabChange} />;
}
