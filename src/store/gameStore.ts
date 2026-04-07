import { create } from 'zustand';
import { GameState, TowerType } from '@/types';

interface GameStore extends GameState {
  setGold: (gold: number) => void;
  addGold: (amount: number) => void;
  spendGold: (amount: number) => boolean;
  setLives: (lives: number) => void;
  loseLife: () => void;
  setCurrentWave: (wave: number) => void;
  nextWave: () => void;
  setIsPlaying: (playing: boolean) => void;
  setIsPaused: (paused: boolean) => void;
  setSelectedTower: (tower: TowerType | null) => void;
  setResult: (result: 'win' | 'lose' | null) => void;
  setMapId: (mapId: number) => void;
  addScore: (score: number) => void;
  resetGame: (mapId: number) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gold: 100,
  lives: 20,
  currentWave: 0,
  totalWaves: 5,
  isPlaying: false,
  isPaused: false,
  selectedTower: null,
  result: null,
  mapId: 1,
  score: 0,

  setGold: (gold) => set({ gold }),
  addGold: (amount) => set((state) => ({ gold: state.gold + amount })),
  spendGold: (amount) => {
    const state = get();
    if (state.gold >= amount) {
      set({ gold: state.gold - amount });
      return true;
    }
    return false;
  },
  setLives: (lives) => set({ lives }),
  loseLife: () => set((state) => ({ lives: Math.max(0, state.lives - 1) })),
  setCurrentWave: (wave) => set({ currentWave: wave }),
  nextWave: () => set((state) => ({ currentWave: state.currentWave + 1 })),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setIsPaused: (paused) => set({ isPaused: paused }),
  setSelectedTower: (tower) => set({ selectedTower: tower }),
  setResult: (result) => set({ result }),
  setMapId: (mapId) => set({ mapId }),
  addScore: (score) => set((state) => ({ score: state.score + score })),
  resetGame: (mapId) => set({
    gold: 100,
    lives: 20,
    currentWave: 0,
    totalWaves: 5,
    isPlaying: false,
    isPaused: false,
    selectedTower: null,
    result: null,
    mapId,
    score: 0
  })
}));
