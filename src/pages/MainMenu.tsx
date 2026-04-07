import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Volume2, VolumeX, Info } from 'lucide-react';
import { maps } from '@/data/maps';
import { useGameStore } from '@/store/gameStore';

export default function MainMenu() {
  const navigate = useNavigate();
  const [selectedMap, setSelectedMap] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const setMapId = useGameStore((s) => s.setMapId);

  const handleStartGame = () => {
    if (selectedMap) {
      setMapId(selectedMap);
      navigate(`/game/${selectedMap}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 via-sky-300 to-green-400 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/20 animate-float"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center mb-8">
        <h1 className="text-6xl md:text-8xl font-bold text-white drop-shadow-lg animate-bounce-slow">
          🏰 塔防大作战 🏰
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mt-4 drop-shadow">
          守护你的城堡，击退入侵的怪物！
        </p>
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        <h2 className="text-2xl font-bold text-white text-center mb-4 drop-shadow">
          选择地图
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {maps.map((map) => (
            <button
              key={map.id}
              onClick={() => setSelectedMap(map.id)}
              className={`relative p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                selectedMap === map.id
                  ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-2xl ring-4 ring-white'
                  : 'bg-white/80 hover:bg-white shadow-xl'
              }`}
            >
              <div
                className="w-full h-32 rounded-xl mb-4"
                style={{ backgroundColor: map.bgColor }}
              >
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
              </div>
              <h3 className={`text-xl font-bold ${selectedMap === map.id ? 'text-white' : 'text-gray-800'}`}>
                {map.name}
              </h3>
              <p className={`text-sm mt-1 ${selectedMap === map.id ? 'text-white/90' : 'text-gray-600'}`}>
                5波怪物 · 3种炮台
              </p>
            </button>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={handleStartGame}
            disabled={!selectedMap}
            className={`flex items-center gap-2 px-8 py-4 rounded-full text-xl font-bold transition-all duration-300 ${
              selectedMap
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Play className="w-6 h-6" />
            开始游戏
          </button>
        </div>
      </div>

      <div className="absolute top-4 right-4 flex gap-2 z-20">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-3 bg-white/80 rounded-full hover:bg-white transition-colors shadow-lg"
        >
          {isMuted ? <VolumeX className="w-6 h-6 text-gray-700" /> : <Volume2 className="w-6 h-6 text-gray-700" />}
        </button>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-3 bg-white/80 rounded-full hover:bg-white transition-colors shadow-lg"
        >
          <Info className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {showInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">游戏说明</h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-bold text-lg">🎯 游戏目标</h3>
                <p>阻止怪物到达终点，保护你的城堡！</p>
              </div>
              <div>
                <h3 className="font-bold text-lg">🏰 炮台类型</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li><span className="text-orange-500 font-bold">火焰炮台</span> - 攻速快，范围伤害</li>
                  <li><span className="text-teal-500 font-bold">冰霜炮台</span> - 减速敌人，控制利器</li>
                  <li><span className="text-purple-500 font-bold">雷电炮台</span> - 高伤害，有暴击</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-lg">👾 怪物类型</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>小史莱姆 - 基础敌人</li>
                  <li>哥布林 - 移动快速</li>
                  <li>骷髅兵 - 血量较高</li>
                  <li>石头人 - 血量极高但缓慢</li>
                  <li>暗影精灵 - 极快但脆弱</li>
                  <li>魔王 - Boss级敌人</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-lg">💡 操作提示</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>点击炮台商店选择炮台类型</li>
                  <li>点击地图上的空位放置炮台</li>
                  <li>点击已放置的炮台可以升级或出售</li>
                  <li>击杀怪物获得金币</li>
                </ul>
              </div>
            </div>
            <button
              onClick={() => setShowInfo(false)}
              className="mt-6 w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold hover:from-blue-600 hover:to-purple-600 transition-all"
            >
              知道了
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-float {
          animation: float ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
