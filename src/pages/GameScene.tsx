import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pause, Play, Home, Coins, Heart, Zap } from 'lucide-react';
import { GameEngine } from '@/game/GameEngine';
import { towerConfigs, getUpgradeCost } from '@/data/towers';
import { useGameStore } from '@/store/gameStore';
import { Tower, TowerType } from '@/types';

export default function GameScene() {
  const { mapId } = useParams<{ mapId: string }>();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [selectedTowerType, setSelectedTowerType] = useState<TowerType | null>(null);
  const [selectedTower, setSelectedTower] = useState<Tower | null>(null);
  const [upgradePanelPos, setUpgradePanelPos] = useState<{ x: number; y: number } | null>(null);

  const {
    gold,
    lives,
    currentWave,
    totalWaves,
    isPlaying,
    isPaused,
    result,
    score,
    setIsPlaying,
    setIsPaused,
    resetGame
  } = useGameStore();

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current, parseInt(mapId || '1'));
    engineRef.current = engine;

    resetGame(parseInt(mapId || '1'));
    setIsPlaying(true);
    engine.start();

    const handleResize = () => engine.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.stop();
    };
  }, [mapId, resetGame, setIsPlaying]);

  useEffect(() => {
    if (result) {
      navigate('/result');
    }
  }, [result, navigate]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const engine = engineRef.current;
    if (!engine) return;

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const slotIndex = engine.getSlotAtPosition(x, y);
    
    if (slotIndex >= 0) {
      const tower = engine.getTowerAtSlot(slotIndex);
      
      if (tower) {
        setSelectedTower(tower);
        const slot = engine.getMap().towerSlots[slotIndex];
        setUpgradePanelPos({ x: slot.x, y: slot.y });
        engine.setSelectedTowerSlot(slotIndex);
      } else if (selectedTowerType) {
        const success = engine.placeTower(slotIndex, selectedTowerType);
        if (success) {
          setSelectedTowerType(null);
        }
      }
    } else {
      setSelectedTower(null);
      setUpgradePanelPos(null);
      engine.setSelectedTowerSlot(null);
    }
  }, [selectedTowerType]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const engine = engineRef.current;
    if (!engine) return;

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const slotIndex = engine.getSlotAtPosition(x, y);
    engine.setHoveredSlot(slotIndex >= 0 ? slotIndex : null);
  }, []);

  const handleUpgrade = useCallback(() => {
    const engine = engineRef.current;
    if (!engine || !selectedTower) return;

    const success = engine.upgradeTower(selectedTower.id);
    if (success) {
      const updatedTower = engine.getTowers().find(t => t.id === selectedTower.id);
      if (updatedTower) {
        setSelectedTower({ ...updatedTower });
      }
    }
  }, [selectedTower]);

  const handleSell = useCallback(() => {
    const engine = engineRef.current;
    if (!engine || !selectedTower) return;

    engine.sellTower(selectedTower.id);
    setSelectedTower(null);
    setUpgradePanelPos(null);
    engine.setSelectedTowerSlot(null);
  }, [selectedTower]);

  const handlePause = useCallback(() => {
    setIsPaused(!isPaused);
  }, [isPaused, setIsPaused]);

  const handleBackToMenu = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.stop();
    }
    navigate('/');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 to-slate-900 flex flex-col">
      <div className="bg-slate-700/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={handleBackToMenu}
            className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors text-white"
          >
            <Home className="w-5 h-5" />
            返回
          </button>
          
          <div className="flex items-center gap-4 text-white">
            <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-1 rounded-full">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="font-bold text-yellow-300">{gold}</span>
            </div>
            
            <div className="flex items-center gap-2 bg-red-500/20 px-3 py-1 rounded-full">
              <Heart className="w-5 h-5 text-red-400" />
              <span className="font-bold text-red-300">{lives}</span>
            </div>
            
            <div className="flex items-center gap-2 bg-purple-500/20 px-3 py-1 rounded-full">
              <Zap className="w-5 h-5 text-purple-400" />
              <span className="font-bold text-purple-300">{score}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-white text-lg font-bold">
            波次: <span className="text-cyan-400">{currentWave}</span> / {totalWaves}
          </div>
          
          <button
            onClick={handlePause}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors text-white"
          >
            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            {isPaused ? '继续' : '暂停'}
          </button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-pointer"
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
        />

        {isPaused && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">游戏暂停</h2>
              <p className="text-gray-600 mb-6">点击继续按钮恢复游戏</p>
              <button
                onClick={handlePause}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all"
              >
                继续游戏
              </button>
            </div>
          </div>
        )}

        {selectedTower && upgradePanelPos && (
          <div
            className="absolute bg-white rounded-xl shadow-2xl p-4 z-20 min-w-[180px]"
            style={{
              left: `${(upgradePanelPos.x / 900) * 100}%`,
              top: `${(upgradePanelPos.y / 450) * 100 - 10}%`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="text-center mb-3">
              <h3 className="font-bold text-gray-800">
                {towerConfigs[selectedTower.type].name}
              </h3>
              <p className="text-sm text-gray-500">等级 {selectedTower.level}</p>
              <p className="text-xs text-gray-400 mt-1">
                攻击力: {selectedTower.attackPower}
              </p>
            </div>
            
            {selectedTower.level < 3 && (
              <button
                onClick={handleUpgrade}
                disabled={gold < getUpgradeCost(selectedTower.level)}
                className={`w-full py-2 rounded-lg text-sm font-bold mb-2 transition-all ${
                  gold >= getUpgradeCost(selectedTower.level)
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                升级 ({getUpgradeCost(selectedTower.level)} 金币)
              </button>
            )}
            
            <button
              onClick={handleSell}
              className="w-full py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-sm font-bold hover:from-red-600 hover:to-red-700 transition-all"
            >
              出售 (+{Math.floor(towerConfigs[selectedTower.type].cost * 0.5 * selectedTower.level)} 金币)
            </button>
            
            <button
              onClick={() => {
                setSelectedTower(null);
                setUpgradePanelPos(null);
                engineRef.current?.setSelectedTowerSlot(null);
              }}
              className="w-full py-1 mt-2 text-gray-500 text-xs hover:text-gray-700"
            >
              关闭
            </button>
          </div>
        )}
      </div>

      <div className="bg-slate-700/80 backdrop-blur-sm px-4 py-3">
        <div className="flex items-center justify-center gap-4">
          {(Object.keys(towerConfigs) as TowerType[]).map((type) => {
            const config = towerConfigs[type];
            const isSelected = selectedTowerType === type;
            const canAfford = gold >= config.cost;

            return (
              <button
                key={type}
                onClick={() => setSelectedTowerType(isSelected ? null : type)}
                disabled={!canAfford}
                className={`relative flex flex-col items-center p-3 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg ring-2 ring-white scale-105'
                    : canAfford
                    ? 'bg-slate-600 hover:bg-slate-500 hover:scale-105'
                    : 'bg-slate-800 opacity-50 cursor-not-allowed'
                }`}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl"
                  style={{ backgroundColor: config.color }}
                >
                  {type === 'fire' ? '🔥' : type === 'ice' ? '❄️' : '⚡'}
                </div>
                <span className={`text-sm font-bold mt-1 ${isSelected ? 'text-white' : 'text-white'}`}>
                  {config.name}
                </span>
                <span className={`text-xs ${isSelected ? 'text-white/90' : 'text-yellow-300'}`}>
                  💰 {config.cost}
                </span>
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </button>
            );
          })}
          
          {selectedTowerType && (
            <div className="text-white text-sm ml-4 animate-pulse">
              点击地图上的空位放置炮台
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
