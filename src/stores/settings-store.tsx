import { create } from "zustand";

type SettingsStore = {
  bpm: number;
  isPlaying: boolean;
  songPath: string;
  setBpm: (bpm: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setSongPath: (songPath: string) => void;
};

const useSettingsStore = create<SettingsStore>((set) => ({
  bpm: 138,
  isPlaying: false,
  songPath: "",
  setBpm: (bpm: number) => set({ bpm }),
  setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),
  setSongPath: (songPath: string) => set({ songPath }),
}));

export default useSettingsStore;
