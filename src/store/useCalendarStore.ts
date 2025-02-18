import { create } from "zustand";

interface Festival {
  np: string;
  en: string;
  tithi: string;
  event: string;
  day: number;
  specialday: string;
  holiday: boolean;
  month: string;
}

interface Store {
  festivals: Festival[];
  setFestivals: (festivals: Festival[]) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  notes: Record<string, string>;
  setNote: (date: string, note: string) => void;
}

const useCalendarStore = create<Store>((set) => ({
  festivals: [],
  setFestivals: (festivals) => set({ festivals }),
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
  notes: JSON.parse(localStorage.getItem("notes") || "{}"),
  setNote: (date, note) =>
    set((state) => {
      const updatedNotes = { ...state.notes, [date]: note };
      localStorage.setItem("notes", JSON.stringify(updatedNotes));
      return { notes: updatedNotes };
    }),
}));

export default useCalendarStore;
