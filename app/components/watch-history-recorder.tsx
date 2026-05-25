"use client";

import { useEffect } from "react";

export type WatchHistoryItem = {
  slug: string;
  name: string;
  originalName: string;
  thumbUrl: string;
  posterUrl: string;
  episodeName: string;
  episodeSlug: string;
  watchedAt: number;
};

const STORAGE_KEY = "netphim:watch-history";
const MAX_HISTORY_ITEMS = 12;

export function saveWatchHistory(item: WatchHistoryItem) {
  const rawHistory = window.localStorage.getItem(STORAGE_KEY);
  const history = rawHistory ? (JSON.parse(rawHistory) as WatchHistoryItem[]) : [];
  const nextHistory = [
    item,
    ...history.filter(
      (historyItem) => historyItem.slug !== item.slug
    ),
  ].slice(0, MAX_HISTORY_ITEMS);

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory));
  window.dispatchEvent(new Event("netphim:watch-history-updated"));
}

export function readWatchHistory(): WatchHistoryItem[] {
  try {
    const rawHistory = window.localStorage.getItem(STORAGE_KEY);

    return rawHistory ? (JSON.parse(rawHistory) as WatchHistoryItem[]) : [];
  } catch {
    return [];
  }
}

export function clearWatchHistory() {
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("netphim:watch-history-updated"));
}

export function WatchHistoryRecorder({ item }: { item: WatchHistoryItem }) {
  useEffect(() => {
    saveWatchHistory({ ...item, watchedAt: Date.now() });
  }, [item]);

  return null;
}
