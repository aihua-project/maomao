import { GameMap, WaveConfig } from '@/types';

export const maps: GameMap[] = [
  {
    id: 1,
    name: '森林小径',
    bgColor: '#87CEEB',
    pathColor: '#8B4513',
    path: [
      { x: 0, y: 200 },
      { x: 150, y: 200 },
      { x: 150, y: 100 },
      { x: 300, y: 100 },
      { x: 300, y: 300 },
      { x: 450, y: 300 },
      { x: 450, y: 150 },
      { x: 600, y: 150 },
      { x: 600, y: 350 },
      { x: 750, y: 350 },
      { x: 750, y: 250 },
      { x: 900, y: 250 }
    ],
    towerSlots: [
      { x: 100, y: 150 },
      { x: 200, y: 150 },
      { x: 200, y: 250 },
      { x: 250, y: 50 },
      { x: 250, y: 200 },
      { x: 350, y: 200 },
      { x: 350, y: 350 },
      { x: 400, y: 250 },
      { x: 500, y: 200 },
      { x: 500, y: 350 },
      { x: 550, y: 100 },
      { x: 650, y: 250 },
      { x: 700, y: 300 },
      { x: 800, y: 200 },
      { x: 850, y: 300 }
    ]
  },
  {
    id: 2,
    name: '沙漠绿洲',
    bgColor: '#F4A460',
    pathColor: '#DEB887',
    path: [
      { x: 0, y: 150 },
      { x: 200, y: 150 },
      { x: 200, y: 300 },
      { x: 100, y: 300 },
      { x: 100, y: 400 },
      { x: 400, y: 400 },
      { x: 400, y: 200 },
      { x: 600, y: 200 },
      { x: 600, y: 350 },
      { x: 800, y: 350 },
      { x: 800, y: 150 },
      { x: 900, y: 150 }
    ],
    towerSlots: [
      { x: 100, y: 100 },
      { x: 150, y: 200 },
      { x: 150, y: 350 },
      { x: 50, y: 350 },
      { x: 200, y: 350 },
      { x: 300, y: 350 },
      { x: 350, y: 300 },
      { x: 450, y: 300 },
      { x: 450, y: 150 },
      { x: 500, y: 250 },
      { x: 550, y: 150 },
      { x: 650, y: 250 },
      { x: 700, y: 300 },
      { x: 750, y: 200 },
      { x: 850, y: 200 }
    ]
  }
];

export const waveConfigs: WaveConfig[] = [
  { monsters: [{ type: 'slime', count: 5 }] },
  { monsters: [{ type: 'slime', count: 3 }, { type: 'goblin', count: 3 }] },
  { monsters: [{ type: 'goblin', count: 5 }, { type: 'skeleton', count: 2 }] },
  { monsters: [{ type: 'skeleton', count: 4 }, { type: 'golem', count: 2 }, { type: 'shadow', count: 3 }] },
  { monsters: [{ type: 'golem', count: 3 }, { type: 'shadow', count: 5 }, { type: 'boss', count: 1 }] }
];
