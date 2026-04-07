export type TowerType = 'fire' | 'ice' | 'lightning';
export type MonsterType = 'slime' | 'goblin' | 'skeleton' | 'golem' | 'shadow' | 'boss';

export interface Point {
  x: number;
  y: number;
}

export interface TowerConfig {
  name: string;
  cost: number;
  baseAttack: number;
  attackRange: number;
  attackInterval: number;
  color: string;
  upgradeMultiplier: number;
  slowFactor?: number;
  slowDuration?: number;
  critChance?: number;
}

export interface MonsterConfig {
  name: string;
  hp: number;
  speed: number;
  reward: number;
  color: string;
  size: number;
}

export interface Tower {
  id: string;
  type: TowerType;
  x: number;
  y: number;
  level: number;
  attackPower: number;
  attackRange: number;
  attackInterval: number;
  lastAttackTime: number;
  angle: number;
}

export interface Monster {
  id: string;
  type: MonsterType;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  baseSpeed: number;
  pathIndex: number;
  isDead: boolean;
  isSlowed: boolean;
  slowEndTime: number;
  slowFactor: number;
  size: number;
  reward: number;
  wobble: number;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  targetId: string;
  speed: number;
  damage: number;
  color: string;
  type: TowerType;
  isCrit: boolean;
}

export interface GameMap {
  id: number;
  name: string;
  bgColor: string;
  pathColor: string;
  path: Point[];
  towerSlots: Point[];
}

export interface WaveConfig {
  monsters: { type: MonsterType; count: number }[];
}

export interface GameState {
  gold: number;
  lives: number;
  currentWave: number;
  totalWaves: number;
  isPlaying: boolean;
  isPaused: boolean;
  selectedTower: TowerType | null;
  result: 'win' | 'lose' | null;
  mapId: number;
  score: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}
