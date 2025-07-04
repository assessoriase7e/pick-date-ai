"use client";

import { create } from "zustand";

interface CalendarState {
  limitModalOpen: boolean;
  setLimitModalOpen: (open: boolean) => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  limitModalOpen: false,
  setLimitModalOpen: (open) => set({ limitModalOpen: open }),
}));