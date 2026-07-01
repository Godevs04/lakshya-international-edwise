"use client";

import { useSyncExternalStore } from "react";
import { formatDate, getGreetingForHour } from "@/lib/utils/format";

type LocalDateTime = {
  greeting: string;
  displayDate: string;
};

const SERVER_SNAPSHOT: LocalDateTime = {
  greeting: "Welcome",
  displayDate: "",
};

let clientSnapshot: LocalDateTime | null = null;

function getLocalDateTimeSnapshot(): LocalDateTime {
  if (!clientSnapshot) {
    const now = new Date();
    clientSnapshot = {
      greeting: getGreetingForHour(now.getHours()),
      displayDate: formatDate(now),
    };
  }
  return clientSnapshot;
}

function getLocalDateTimeServerSnapshot(): LocalDateTime {
  return SERVER_SNAPSHOT;
}

export function useLocalDateTime(): LocalDateTime {
  return useSyncExternalStore(
    () => () => {},
    getLocalDateTimeSnapshot,
    getLocalDateTimeServerSnapshot
  );
}
