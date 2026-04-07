import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pause, Play, Home, Coins, Heart, Zap, Shield, Sword, ArrowLeft, Plus, Minus } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-950 flex flex-col">
      <div className="bg-gradient-to-r from-indigo-900/80 to-purple-900/80 backdrop-blur-md px-6 py-4 flex items-center justify-between shadow-lg border-b border-indigo-700/50">
        <div className="flex items-center gap-8">
          <button
            onClick={handleBackToMenu}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-800/70 hover:bg-indigo-700/80 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border border-indigo-600/30"
          >
            <ArrowLeft className="w-5 h-5 text-indigo-300" />
            <span className="text-white font-bold">返回</span>
          </button>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-yellow-600/20 border border-yellow-500/30 px-4 py-2 rounded-full backdrop-blur-sm">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="font-bold text-yellow-300 text-lg">{gold}</span>
            </div>
            
            <div className="flex items-center gap-2 bg-red-600/20 border border-red-500/30 px-4 py-2 rounded-full backdrop-blur-sm">
              <Heart className="w-5 h-5 text-red-400" />
              <span className="font-bold text-red-300 text-lg">{lives}</span>
            </div>
            
            <div className="flex items-center gap-2 bg-purple-600/20 border border-purple-500/30 px-4 py-2 rounded-full backdrop-blur-sm">
              <Zap className="w-5 h-5 text-purple-400" />
              <span className="font-bold text-purple-300 text-lg">{score}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border border-cyan-700/30 px-5 py-2.5 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              <span className="text-white text-lg font-bold">
                波次: <span className="text-cyan-300">{currentWave}</span> / {totalWaves}
              </span>
            </div>
          </div>
          
          <button
            onClick={handlePause}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600/70 to-indigo-600/70 hover:from-blue-500/80 hover:to-indigo-500/80 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border border-blue-500/30"
          >
            {isPaused ? <Play className="w-5 h-5 text-white" /> : <Pause className="w-5 h-5 text-white" />}
            <span className="text-white font-bold">{isPaused ? '继续' : '暂停'}</span>
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
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center animate-fade-in">
            <div className="bg-gradient-to-br from-indigo-800/90 to-purple-900/90 border border-indigo-600/50 rounded-3xl p-10 text-center shadow-2xl animate-slide-up w-full max-w-md">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center justify-center gap-2">
                <Shield className="w-8 h-8 text-indigo-300" />
                游戏暂停
              </h2>
              <p className="text-indigo-200 mb-8 text-lg">
                点击继续按钮恢复游戏
              </p>
              <button
                onClick={handlePause}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl w-full"
              >
                继续游戏
              </button>
              <button
                onClick={handleBackToMenu}
                className="mt-4 px-8 py-3 bg-transparent border border-indigo-400 text-indigo-300 rounded-xl font-bold hover:bg-indigo-800/30 transition-all duration-300 w-full"
              >
                返回主菜单
              </button>
            </div>
          </div>
        )}

        {selectedTower && upgradePanelPos && (
          <div
            className="absolute bg-gradient-to-br from-indigo-800/90 to-purple-900/90 border border-indigo-600/50 rounded-2xl p-5 z-20 min-w-[220px] shadow-2xl animate-slide-up"
            style={{
              left: `${(upgradePanelPos.x / 900) * 100}%`,
              top: `${(upgradePanelPos.y / 450) * 100 - 10}%`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="text-center mb-4">
              <div className="flex items-center justify-center mb-2">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg mr-2"
                  style={{ backgroundColor: towerConfigs[selectedTower.type].color }}
                >
                  {selectedTower.type === 'fire' ? '🔥' : selectedTower.type === 'ice' ? '❄️' : '⚡'}
                </div>
                <h3 className="font-bold text-white text-lg">
                  {towerConfigs[selectedTower.type].name}
                </h3>
              </div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-full px-3 py-0.5">
                  <span className="text-yellow-300 text-sm font-bold">等级 {selectedTower.level}</span>
                </div>
              </div>
              <p className="text-indigo-300 text-sm">
                攻击力: <span className="text-white font-bold">{selectedTower.attackPower}</span>
              </p>
              <p className="text-indigo-400 text-xs mt-1">
                攻击范围: {selectedTower.attackRange}px
              </p>
            </div>
            
            {selectedTower.level < 3 && (
              <button
                onClick={handleUpgrade}
                disabled={gold < getUpgradeCost(selectedTower.level)}
                className={`w-full py-3 rounded-xl text-sm font-bold mb-3 transition-all duration-300 transform hover:scale-105 ${
                  gold >= getUpgradeCost(selectedTower.level)
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl'
                    : 'bg-gray-700/50 text-gray-400 cursor-not-allowed border border-gray-600'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  升级 ({getUpgradeCost(selectedTower.level)} 金币)
                </div>
              </button>
            )}
            
            <button
              onClick={handleSell}
              className="w-full py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl text-sm font-bold hover:from-red-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl mb-3"
            >
              <div className="flex items-center justify-center gap-2">
                <Minus className="w-4 h-4" />
                出售 (+{Math.floor(towerConfigs[selectedTower.type].cost * 0.5 * selectedTower.level)} 金币)
              </div>
            </button>
            
            <button
              onClick={() => {
                setSelectedTower(null);
                setUpgradePanelPos(null);
                engineRef.current?.setSelectedTowerSlot(null);
              }}
              className="w-full py-2 bg-transparent border border-indigo-600/50 text-indigo-300 rounded-xl text-sm font-bold hover:bg-indigo-700/30 transition-all duration-300"
            >
              关闭
            </button>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-indigo-900/80 to-purple-900/80 backdrop-blur-md px-6 py-4 border-t border-indigo-700/50 shadow-lg">
        <div className="flex items-center justify-center gap-6">
          {(Object.keys(towerConfigs) as TowerType[]).map((type) => {
            const config = towerConfigs[type];
            const isSelected = selectedTowerType === type;
            const canAfford = gold >= config.cost;

            return (
              <button
                key={type}
                onClick={() => setSelectedTowerType(isSelected ? null : type)}
                disabled={!canAfford}
                className={`relative flex flex-col items-center p-4 rounded-2xl transition-all duration-500 transform group ${
                  isSelected
                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-2xl ring-2 ring-white scale-110'
                    : canAfford
                    ? 'bg-indigo-800/70 hover:bg-indigo-700/80 hover:scale-105 border border-indigo-600/30'
                    : 'bg-gray-800/50 opacity-60 cursor-not-allowed border border-gray-700/50'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-2 shadow-lg group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: config.color }}
                >
                  {type === 'fire' ? '🔥' : type === 'ice' ? '❄️' : '⚡'}
                </div>
                <span className={`text-sm font-bold mb-1 ${isSelected ? 'text-white' : 'text-indigo-200'}`}>
                  {config.name}
                </span>
                <div className={`flex items-center gap-1 ${isSelected ? 'text-white/90' : 'text-yellow-300'}`}>
                  <Coins className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">{config.cost}</span>
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full font-bold text-xs shadow-lg">
                    已选择
                  </div>
                )}
              </button>
            );
          })}
          
          {selectedTowerType && (
            <div className="flex items-center text-indigo-300 text-sm ml-4 bg-indigo-800/30 border border-indigo-700/50 px-4 py-2 rounded-xl animate-pulse">
              <Shield className="w-4 h-4 mr-2" />
              点击地图上的空位放置炮台
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
