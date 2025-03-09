import { create } from 'zustand';

interface GameStore {
  winStreak: number;
  isRigged: boolean;
  riggedGamesLeft: number;
  incrementWinStreak: () => void;
  resetWinStreak: () => void;
  setRiggedState: (rigged: boolean) => void;
  updateRiggedGames: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  winStreak: 0,
  isRigged: false,
  riggedGamesLeft: 0,

  incrementWinStreak: () => set((state) => {
    const newStreak = state.winStreak + 1;
    // After 2-3 wins, activate rigged state
    if (newStreak >= 2 + Math.floor(Math.random() * 2)) { // 2-3 wins
      return {
        winStreak: newStreak,
        isRigged: true,
        riggedGamesLeft: 2 + Math.floor(Math.random() * 2) // 2-3 rigged games
      };
    }
    return { winStreak: newStreak };
  }),

  resetWinStreak: () => set({ winStreak: 0 }),

  setRiggedState: (rigged: boolean) => set({ isRigged: rigged }),

  updateRiggedGames: () => set((state) => {
    if (!state.isRigged) return state;
    const newGamesLeft = state.riggedGamesLeft - 1;
    return {
      riggedGamesLeft: newGamesLeft,
      isRigged: newGamesLeft > 0
    };
  })
}));
