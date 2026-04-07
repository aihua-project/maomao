import { Tower, Monster, Projectile, GameMap, Particle, TowerType, MonsterType } from '@/types';
import { towerConfigs, getTowerAttackPower } from '@/data/towers';
import { monsterConfigs } from '@/data/monsters';
import { maps, waveConfigs } from '@/data/maps';
import { useGameStore } from '@/store/gameStore';

let idCounter = 0;
const generateId = () => `entity_${++idCounter}`;

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private towers: Tower[] = [];
  private monsters: Monster[] = [];
  private projectiles: Projectile[] = [];
  private particles: Particle[] = [];
  private map: GameMap;
  private lastTime: number = 0;
  private animationId: number = 0;
  private waveSpawnTimer: number = 0;
  private monstersToSpawn: MonsterType[] = [];
  private spawnInterval: number = 1000;
  private lastSpawnTime: number = 0;
  private isRunning: boolean = false;
  private selectedTowerSlot: number | null = null;
  private hoveredSlot: number | null = null;

  constructor(canvas: HTMLCanvasElement, mapId: number) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.map = maps[mapId - 1];
    this.resize();
  }

  resize() {
    const container = this.canvas.parentElement;
    if (container) {
      this.canvas.width = container.clientWidth;
      this.canvas.height = container.clientHeight;
    }
  }

  start() {
    this.isRunning = true;
    this.lastTime = performance.now();
    this.startWave(1);
    this.gameLoop();
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  reset() {
    this.towers = [];
    this.monsters = [];
    this.projectiles = [];
    this.particles = [];
    this.monstersToSpawn = [];
    this.selectedTowerSlot = null;
    this.hoveredSlot = null;
  }

  private startWave(waveNumber: number) {
    const store = useGameStore.getState();
    if (waveNumber > store.totalWaves) {
      store.setResult('win');
      store.setIsPlaying(false);
      return;
    }

    store.setCurrentWave(waveNumber);
    const waveConfig = waveConfigs[waveNumber - 1];
    this.monstersToSpawn = [];
    
    waveConfig.monsters.forEach(({ type, count }) => {
      for (let i = 0; i < count; i++) {
        this.monstersToSpawn.push(type);
      }
    });

    this.lastSpawnTime = performance.now();
  }

  private spawnMonster(type: MonsterType) {
    const config = monsterConfigs[type];
    const startPoint = this.map.path[0];
    
    const monster: Monster = {
      id: generateId(),
      type,
      x: startPoint.x,
      y: startPoint.y,
      hp: config.hp,
      maxHp: config.hp,
      speed: config.speed,
      baseSpeed: config.speed,
      pathIndex: 0,
      isDead: false,
      isSlowed: false,
      slowEndTime: 0,
      slowFactor: 1,
      size: config.size,
      reward: config.reward,
      wobble: Math.random() * Math.PI * 2
    };

    this.monsters.push(monster);
  }

  placeTower(slotIndex: number, type: TowerType): boolean {
    const store = useGameStore.getState();
    const config = towerConfigs[type];

    if (store.gold < config.cost) return false;
    if (slotIndex < 0 || slotIndex >= this.map.towerSlots.length) return false;

    const existingTower = this.towers.find(t => {
      const slot = this.map.towerSlots[slotIndex];
      return Math.abs(t.x - slot.x) < 5 && Math.abs(t.y - slot.y) < 5;
    });

    if (existingTower) return false;

    const slot = this.map.towerSlots[slotIndex];
    const tower: Tower = {
      id: generateId(),
      type,
      x: slot.x,
      y: slot.y,
      level: 1,
      attackPower: config.baseAttack,
      attackRange: config.attackRange,
      attackInterval: config.attackInterval,
      lastAttackTime: 0,
      angle: 0
    };

    this.towers.push(tower);
    store.spendGold(config.cost);
    return true;
  }

  upgradeTower(towerId: string): boolean {
    const store = useGameStore.getState();
    const tower = this.towers.find(t => t.id === towerId);
    if (!tower || tower.level >= 3) return false;

    const upgradeCost = tower.level * 30;
    if (store.gold < upgradeCost) return false;

    tower.level++;
    tower.attackPower = getTowerAttackPower(tower.type, tower.level);
    tower.attackRange += 10;
    store.spendGold(upgradeCost);
    return true;
  }

  sellTower(towerId: string): boolean {
    const tower = this.towers.find(t => t.id === towerId);
    if (!tower) return false;

    const config = towerConfigs[tower.type];
    const sellPrice = Math.floor(config.cost * 0.5 * tower.level);
    
    const store = useGameStore.getState();
    store.addGold(sellPrice);
    this.towers = this.towers.filter(t => t.id !== towerId);
    return true;
  }

  getTowerAtSlot(slotIndex: number): Tower | null {
    const slot = this.map.towerSlots[slotIndex];
    return this.towers.find(t => Math.abs(t.x - slot.x) < 5 && Math.abs(t.y - slot.y) < 5) || null;
  }

  setHoveredSlot(index: number | null) {
    this.hoveredSlot = index;
  }

  setSelectedTowerSlot(index: number | null) {
    this.selectedTowerSlot = index;
  }

  getSelectedTowerSlot(): number | null {
    return this.selectedTowerSlot;
  }

  private gameLoop = () => {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    const store = useGameStore.getState();
    if (!store.isPaused) {
      this.update(deltaTime, currentTime);
    }
    this.render();

    this.animationId = requestAnimationFrame(this.gameLoop);
  };

  private update(deltaTime: number, currentTime: number) {
    const store = useGameStore.getState();

    if (this.monstersToSpawn.length > 0 && currentTime - this.lastSpawnTime > this.spawnInterval) {
      const type = this.monstersToSpawn.shift()!;
      this.spawnMonster(type);
      this.lastSpawnTime = currentTime;
    }

    this.monsters.forEach(monster => {
      if (monster.isDead) return;

      if (monster.isSlowed && currentTime > monster.slowEndTime) {
        monster.isSlowed = false;
        monster.slowFactor = 1;
        monster.speed = monster.baseSpeed;
      }

      monster.wobble += deltaTime * 0.01;

      if (monster.pathIndex < this.map.path.length - 1) {
        const target = this.map.path[monster.pathIndex + 1];
        const dx = target.x - monster.x;
        const dy = target.y - monster.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 5) {
          monster.pathIndex++;
        } else {
          const moveSpeed = monster.speed * monster.slowFactor * (deltaTime / 16);
          monster.x += (dx / dist) * moveSpeed;
          monster.y += (dy / dist) * moveSpeed;
        }
      } else {
        monster.isDead = true;
        store.loseLife();
        
        if (store.lives <= 0) {
          store.setResult('lose');
          store.setIsPlaying(false);
        }
      }
    });

    this.towers.forEach(tower => {
      const config = towerConfigs[tower.type];
      let target: Monster | null = null;
      let minDist = Infinity;

      this.monsters.forEach(monster => {
        if (monster.isDead) return;
        const dx = monster.x - tower.x;
        const dy = monster.y - tower.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= tower.attackRange && dist < minDist) {
          minDist = dist;
          target = monster;
        }
      });

      if (target) {
        const dx = target.x - tower.x;
        const dy = target.y - tower.y;
        tower.angle = Math.atan2(dy, dx);

        if (currentTime - tower.lastAttackTime >= tower.attackInterval) {
          tower.lastAttackTime = currentTime;
          
          const isCrit = config.critChance && Math.random() < config.critChance;
          const damage = isCrit ? tower.attackPower * 2 : tower.attackPower;

          const projectile: Projectile = {
            id: generateId(),
            x: tower.x,
            y: tower.y,
            targetId: target.id,
            speed: 8,
            damage,
            color: config.color,
            type: tower.type,
            isCrit: isCrit || false
          };

          this.projectiles.push(projectile);
        }
      }
    });

    this.projectiles = this.projectiles.filter(proj => {
      const target = this.monsters.find(m => m.id === proj.targetId && !m.isDead);
      if (!target) return false;

      const dx = target.x - proj.x;
      const dy = target.y - proj.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < target.size) {
        target.hp -= proj.damage;
        
        if (proj.type === 'ice') {
          const config = towerConfigs.ice;
          target.isSlowed = true;
          target.slowFactor = config.slowFactor!;
          target.slowEndTime = currentTime + config.slowDuration!;
          target.speed = target.baseSpeed * target.slowFactor;
        }

        for (let i = 0; i < 5; i++) {
          this.particles.push({
            x: proj.x,
            y: proj.y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 300,
            maxLife: 300,
            color: proj.color,
            size: 4
          });
        }

        if (target.hp <= 0) {
          target.isDead = true;
          store.addGold(target.reward);
          store.addScore(target.reward * 10);

          for (let i = 0; i < 10; i++) {
            this.particles.push({
              x: target.x,
              y: target.y,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6,
              life: 500,
              maxLife: 500,
              color: '#FFD700',
              size: 6
            });
          }
        }

        return false;
      }

      const moveSpeed = proj.speed * (deltaTime / 16);
      proj.x += (dx / dist) * moveSpeed;
      proj.y += (dy / dist) * moveSpeed;
      return true;
    });

    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= deltaTime;
      return p.life > 0;
    });

    this.monsters = this.monsters.filter(m => !m.isDead);

    if (this.monstersToSpawn.length === 0 && this.monsters.length === 0) {
      const nextWave = store.currentWave + 1;
      if (nextWave <= store.totalWaves) {
        setTimeout(() => this.startWave(nextWave), 2000);
      } else {
        store.setResult('win');
        store.setIsPlaying(false);
      }
    }
  }

  private render() {
    const ctx = this.ctx;
    const { width, height } = this.canvas;

    ctx.fillStyle = this.map.bgColor;
    ctx.fillRect(0, 0, width, height);

    this.drawGrassPattern();
    this.drawPath();
    this.drawTowerSlots();
    this.drawTowers();
    this.drawMonsters();
    this.drawProjectiles();
    this.drawParticles();
    this.drawRangeIndicator();
  }

  private drawGrassPattern() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(34, 139, 34, 0.1)';
    
    for (let x = 0; x < this.canvas.width; x += 40) {
      for (let y = 0; y < this.canvas.height; y += 40) {
        if ((x + y) % 80 === 0) {
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  private drawPath() {
    const ctx = this.ctx;
    const path = this.map.path;

    ctx.strokeStyle = this.map.pathColor;
    ctx.lineWidth = 40;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.stroke();

    ctx.strokeStyle = '#D2691E';
    ctx.lineWidth = 36;
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.stroke();

    ctx.fillStyle = '#32CD32';
    ctx.beginPath();
    ctx.arc(path[0].x, path[0].y, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#228B22';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S', path[0].x, path[0].y);

    ctx.fillStyle = '#DC143C';
    ctx.beginPath();
    ctx.arc(path[path.length - 1].x, path[path.length - 1].y, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('E', path[path.length - 1].x, path[path.length - 1].y);
  }

  private drawTowerSlots() {
    const ctx = this.ctx;

    this.map.towerSlots.forEach((slot, index) => {
      const hasTower = this.towers.some(t => Math.abs(t.x - slot.x) < 5 && Math.abs(t.y - slot.y) < 5);
      const isHovered = this.hoveredSlot === index;
      const isSelected = this.selectedTowerSlot === index;

      if (!hasTower) {
        ctx.fillStyle = isHovered ? 'rgba(100, 200, 100, 0.5)' : 'rgba(200, 200, 200, 0.3)';
        ctx.strokeStyle = isHovered ? '#4CAF50' : 'rgba(150, 150, 150, 0.5)';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.roundRect(slot.x - 25, slot.y - 25, 50, 50, 8);
        ctx.fill();
        ctx.stroke();

        if (isHovered) {
          ctx.fillStyle = '#4CAF50';
          ctx.font = '24px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('+', slot.x, slot.y);
        }
      }

      if (isSelected && hasTower) {
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(slot.x - 28, slot.y - 28, 56, 56, 10);
        ctx.stroke();
      }
    });
  }

  private drawTowers() {
    const ctx = this.ctx;

    this.towers.forEach(tower => {
      const config = towerConfigs[tower.type];
      const size = 30 + tower.level * 5;

      ctx.fillStyle = config.color;
      ctx.beginPath();
      ctx.arc(tower.x, tower.y, size / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(tower.x - 5, tower.y - 5, size / 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.translate(tower.x, tower.y);
      ctx.rotate(tower.angle);

      ctx.fillStyle = '#333';
      ctx.fillRect(5, -4, 20, 8);

      ctx.restore();

      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tower.level.toString(), tower.x, tower.y);
    });
  }

  private drawMonsters() {
    const ctx = this.ctx;

    this.monsters.forEach(monster => {
      const config = monsterConfigs[monster.type];
      const wobbleOffset = Math.sin(monster.wobble) * 2;

      ctx.save();
      ctx.translate(monster.x, monster.y + wobbleOffset);

      if (monster.type === 'boss') {
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, monster.size);
        gradient.addColorStop(0, '#FF0000');
        gradient.addColorStop(0.5, config.color);
        gradient.addColorStop(1, '#4A0000');
        ctx.fillStyle = gradient;
      } else if (monster.type === 'slime') {
        ctx.fillStyle = config.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, monster.size, monster.size * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.ellipse(-5, -5, 6, 4, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = monster.isSlowed ? '#87CEEB' : config.color;
      }

      if (monster.type !== 'slime') {
        ctx.beginPath();
        ctx.arc(0, 0, monster.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#FFF';
      ctx.beginPath();
      ctx.arc(-monster.size * 0.3, -monster.size * 0.2, 4, 0, Math.PI * 2);
      ctx.arc(monster.size * 0.3, -monster.size * 0.2, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.arc(-monster.size * 0.3, -monster.size * 0.2, 2, 0, Math.PI * 2);
      ctx.arc(monster.size * 0.3, -monster.size * 0.2, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      const hpBarWidth = monster.size * 2;
      const hpBarHeight = 6;
      const hpBarY = monster.y - monster.size - 10;

      ctx.fillStyle = '#333';
      ctx.fillRect(monster.x - hpBarWidth / 2, hpBarY, hpBarWidth, hpBarHeight);

      const hpPercent = monster.hp / monster.maxHp;
      ctx.fillStyle = hpPercent > 0.5 ? '#4CAF50' : hpPercent > 0.25 ? '#FFC107' : '#F44336';
      ctx.fillRect(monster.x - hpBarWidth / 2, hpBarY, hpBarWidth * hpPercent, hpBarHeight);
    });
  }

  private drawProjectiles() {
    const ctx = this.ctx;

    this.projectiles.forEach(proj => {
      ctx.fillStyle = proj.color;
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, proj.isCrit ? 8 : 5, 0, Math.PI * 2);
      ctx.fill();

      if (proj.isCrit) {
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, 10, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
  }

  private drawParticles() {
    const ctx = this.ctx;

    this.particles.forEach(p => {
      const alpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  private drawRangeIndicator() {
    const ctx = this.ctx;
    const store = useGameStore.getState();

    if (this.hoveredSlot !== null) {
      const slot = this.map.towerSlots[this.hoveredSlot];
      const tower = this.getTowerAtSlot(this.hoveredSlot);
      
      if (tower) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(slot.x, slot.y, tower.attackRange, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (store.selectedTower) {
        const config = towerConfigs[store.selectedTower];
        ctx.strokeStyle = 'rgba(100, 255, 100, 0.3)';
        ctx.fillStyle = 'rgba(100, 255, 100, 0.1)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(slot.x, slot.y, config.attackRange, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
  }

  getSlotAtPosition(x: number, y: number): number {
    for (let i = 0; i < this.map.towerSlots.length; i++) {
      const slot = this.map.towerSlots[i];
      const dx = x - slot.x;
      const dy = y - slot.y;
      if (Math.sqrt(dx * dx + dy * dy) < 30) {
        return i;
      }
    }
    return -1;
  }

  getMap(): GameMap {
    return this.map;
  }

  getTowers(): Tower[] {
    return this.towers;
  }
}
