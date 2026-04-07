import { MonsterConfig, MonsterType } from '@/types';

export const monsterConfigs: Record<MonsterType, MonsterConfig> = {
  slime: {
    name: '小史莱姆',
    hp: 50,
    speed: 0.8,
    reward: 5,
    color: '#7ED321',
    size: 20
  },
  goblin: {
    name: '哥布林',
    hp: 80,
    speed: 1.2,
    reward: 8,
    color: '#F5A623',
    size: 22
  },
  skeleton: {
    name: '骷髅兵',
    hp: 120,
    speed: 1.0,
    reward: 12,
    color: '#E8E8E8',
    size: 24
  },
  golem: {
    name: '石头人',
    hp: 300,
    speed: 0.6,
    reward: 20,
    color: '#8B7355',
    size: 32
  },
  shadow: {
    name: '暗影精灵',
    hp: 40,
    speed: 2.0,
    reward: 15,
    color: '#4A4A4A',
    size: 18
  },
  boss: {
    name: '魔王',
    hp: 1000,
    speed: 0.8,
    reward: 100,
    color: '#8B0000',
    size: 45
  }
};
