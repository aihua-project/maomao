import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Volume2, VolumeX, Info, Castle, Map, Shield, Sword, Coins } from 'lucide-react';
import { maps } from '@/data/maps';
import { useGameStore } from '@/store/gameStore';

export default function MainMenu() {
  const navigate = useNavigate();
  const [selectedMap, setSelectedMap] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const setMapId = useGameStore((s) => s.setMapId);

  useEffect(() => {
    const timer = setTimeout(() => setShowParticles(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleStartGame = () => {
    if (selectedMap) {
      setMapId(selectedMap);
      navigate(`/game/${selectedMap}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 via-blue-500 to-indigo-600 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full bg-white/20 animate-float ${showParticles ? 'opacity-100' : 'opacity-0 transition-opacity duration-1000'}`}
            style={{
              width: Math.random() * 80 + 40,
              height: Math.random() * 80 + 40,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`,
              filter: 'blur(8px)'
            }}
          />
        ))}
        
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 rounded-full bg-yellow-300 animate-twinkle ${showParticles ? 'opacity-100' : 'opacity-0 transition-opacity duration-1000'}`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${Math.random() * 3 + 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center mb-12">
        <div className="flex items-center justify-center mb-4 animate-pulse-glow">
          <Castle className="w-16 h-16 text-yellow-300 mr-4 drop-shadow-lg" />
          <h1 className="text-6xl md:text-8xl font-bold text-white drop-shadow-2xl animate-bounce-slow">
            塔防大作战
          </h1>
          <Castle className="w-16 h-16 text-yellow-300 ml-4 drop-shadow-lg" />
        </div>
        <p className="text-xl md:text-2xl text-white/90 mt-4 drop-shadow-lg font-medium">
          守护你的城堡，击退入侵的怪物！
        </p>
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-10 shadow-2xl border border-white/20">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-6 drop-shadow-lg flex items-center justify-center">
            <Map className="w-8 h-8 mr-2" /> 选择地图
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {maps.map((map) => (
              <button
                key={map.id}
                onClick={() => setSelectedMap(map.id)}
                className={`relative overflow-hidden rounded-2xl transition-all duration-500 transform hover:scale-105 group ${
                  selectedMap === map.id
                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-2xl ring-4 ring-white'
                    : 'bg-white/90 hover:bg-white shadow-xl'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="p-6 relative z-10">
                  <div
                    className="w-full h-40 rounded-xl mb-4 overflow-hidden shadow-lg"
                    style={{ backgroundColor: map.bgColor }}
                  >
                    <div className="w-full h-full relative">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
                      <svg viewBox="0 0 900 450" className="w-full h-full">
                        <path
                          d={`M ${map.path
                            .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
                            .join(' ')}`}
                          fill="none"
                          stroke={map.pathColor}
                          strokeWidth="30"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="absolute top-2 left-2 bg-green-500/80 backdrop-blur-sm rounded-full p-2">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div className="absolute bottom-2 right-2 bg-red-500/80 backdrop-blur-sm rounded-full p-2">
                        <Sword className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${selectedMap === map.id ? 'text-white' : 'text-gray-800'}`}>
                    {map.name}
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Sword className={`w-4 h-4 ${selectedMap === map.id ? 'text-white/80' : 'text-gray-600'}`} />
                      <span className={`text-sm ${selectedMap === map.id ? 'text-white/80' : 'text-gray-600'}`}>
                        5波怪物
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield className={`w-4 h-4 ${selectedMap === map.id ? 'text-white/80' : 'text-gray-600'}`} />
                      <span className={`text-sm ${selectedMap === map.id ? 'text-white/80' : 'text-gray-600'}`}>
                        3种炮台
                      </span>
                    </div>
                  </div>
                </div>
                {selectedMap === map.id && (
                  <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 rounded-bl-lg font-bold text-sm">
                    已选择
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={handleStartGame}
            disabled={!selectedMap}
            className={`flex items-center gap-3 px-10 py-5 rounded-full text-xl font-bold transition-all duration-300 transform group ${
              selectedMap
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-2xl hover:shadow-3xl hover:scale-105'
                : 'bg-gray-400 text-gray-600 cursor-not-allowed'
            }`}
          >
            <Play className="w-7 h-7" />
            开始游戏
            <Coins className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="absolute top-6 right-6 flex gap-3 z-20">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110"
        >
          {isMuted ? <VolumeX className="w-6 h-6 text-white" /> : <Volume2 className="w-6 h-6 text-white" />}
        </button>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110"
        >
          <Info className="w-6 h-6 text-white" />
        </button>
      </div>

      {showInfo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-white/20 animate-slide-up">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
              <Info className="w-6 h-6 mr-2 text-blue-500" />
              游戏说明
            </h2>
            <div className="space-y-6 text-gray-700">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <h3 className="font-bold text-lg text-blue-700 mb-2">🎯 游戏目标</h3>
                <p className="text-gray-700">阻止怪物到达终点，保护你的城堡！</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                <h3 className="font-bold text-lg text-orange-700 mb-2">🏰 炮台类型</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="font-bold text-orange-600">火焰炮台</span>
                    <span className="text-gray-600">- 攻速快，范围伤害</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-teal-500" />
                    <span className="font-bold text-teal-600">冰霜炮台</span>
                    <span className="text-gray-600">- 减速敌人，控制利器</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <span className="font-bold text-purple-600">雷电炮台</span>
                    <span className="text-gray-600">- 高伤害，有暴击</span>
                  </li>
                </ul>
              </div>
              <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                <h3 className="font-bold text-lg text-green-700 mb-2">👾 怪物类型</h3>
                <ul className="grid grid-cols-2 gap-2">
                  <li className="flex items-center gap-1">
                    <span className="text-green-600 font-bold">小史莱姆</span>
                    <span className="text-gray-600 text-sm">基础</span>
                  </li>
                  <li className="flex items-center gap-1">
                    <span className="text-yellow-600 font-bold">哥布林</span>
                    <span className="text-gray-600 text-sm">快速</span>
                  </li>
                  <li className="flex items-center gap-1">
                    <span className="text-gray-600 font-bold">骷髅兵</span>
                    <span className="text-gray-600 text-sm">耐打</span>
                  </li>
                  <li className="flex items-center gap-1">
                    <span className="text-amber-700 font-bold">石头人</span>
                    <span className="text-gray-600 text-sm">坦克</span>
                  </li>
                  <li className="flex items-center gap-1">
                    <span className="text-gray-800 font-bold">暗影精灵</span>
                    <span className="text-gray-600 text-sm">极速</span>
                  </li>
                  <li className="flex items-center gap-1">
                    <span className="text-red-600 font-bold">魔王</span>
                    <span className="text-gray-600 text-sm">Boss</span>
                  </li>
                </ul>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                <h3 className="font-bold text-lg text-purple-700 mb-2">💡 操作提示</h3>
                <ul className="space-y-1 text-gray-700">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    点击炮台商店选择炮台类型
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    点击地图上的空位放置炮台
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    点击已放置的炮台可以升级或出售
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    击杀怪物获得金币
                  </li>
                </ul>
              </div>
            </div>
            <button
              onClick={() => setShowInfo(false)}
              className="mt-8 w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              开始游戏
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-float {
          animation: float ease-in-out infinite;
        }
        .animate-twinkle {
          animation: twinkle ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce 2s ease-in-out infinite;
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
