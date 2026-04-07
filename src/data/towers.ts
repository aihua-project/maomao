import { TowerConfig, TowerType } from '@/types';

export const towerConfigs: Record<TowerType, TowerConfig> = {
  fire: {
    name: '火焰炮台',
    cost: 50,
    baseAttack: 15,
    attackRange: 120,
    attackInterval: 800,
    color: '#FF6B35',
    upgradeMultiplier: 1.6
  },
  ice: {
    name: '冰霜炮台',
    cost: 60,
    baseAttack: 10,
    attackRange: 110,
    attackInterval: 1000,
    color: '#4ECDC4',
    slowFactor: 0.5,
    slowDuration: 2000,
    upgradeMultiplier: 1.7
  },
  lightning: {
    name: '雷电炮台',
    cost: 80,
    baseAttack: 30,
    attackRange: 150,
    attackInterval: 1500,
    color: '#9B59B6',
    critChance: 0.2,
    upgradeMultiplier: 1.8
  }
};

export const getTowerAttackPower = (type: TowerType, level: number): number => {
  const config = towerConfigs[type];
  return Math.floor(config.baseAttack * Math.pow(config.upgradeMultiplier, level - 1));
};

export const getUpgradeCost = (level: number): number => {
  return level * 30;
};
