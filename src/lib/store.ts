"use client";
import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { Profile } from "./types";

// All user data lives in this browser only (localStorage). No accounts, no database.
const KEY = "placement-panel:v1";
export const EMPTY: Profile = { onboarded: false, name: "", family: "", typeId: "", dream: [], worry: "", resumes: [], runs: [] };

const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb); window.addEventListener("storage", cb);
  return () => { listeners.delete(cb); window.removeEventListener("storage", cb); };
};
const getRaw = () => { try { return localStorage.getItem(KEY) ?? ""; } catch { return ""; } };
const parse = (raw: string): Profile => { try { return { ...EMPTY, ...JSON.parse(raw || "{}") }; } catch { return EMPTY; } };

export function useProfile() {
  const raw = useSyncExternalStore(subscribe, getRaw, () => null); // null on server = "not loaded yet"
  const profile = useMemo(() => (raw === null ? null : parse(raw)), [raw]);
  const update = useCallback((fn: (p: Profile) => Profile) => {
    try { localStorage.setItem(KEY, JSON.stringify(fn(parse(getRaw())))); } catch { /* storage full or blocked: app still works this session */ }
    listeners.forEach((l) => l());
  }, []);
  return [profile, update] as const;
}
