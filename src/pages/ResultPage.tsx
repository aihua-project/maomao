import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Skull, Home, RotateCcw, Star } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';

export default function ResultPage() {
  const navigate = useNavigate();
  const { result, score, lives, currentWave, totalWaves, mapId, resetGame } = useGameStore();
  const [showStars, setShowStars] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);

  const isWin = result === 'win';

  useEffect(() => {
    const timer = setTimeout(() => setShowStars(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (animatedScore < score) {
      const timer = setTimeout(() => {
        setAnimatedScore(Math.min(animatedScore + Math.ceil(score / 30), score));
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [animatedScore, score]);

  const handlePlayAgain = () => {
    resetGame(mapId);
    navigate(`/game/${mapId}`);
  };

  const handleBackToMenu = () => {
    resetGame(1);
    navigate('/');
  };

  const getStars = () => {
    if (!isWin) return 0;
    if (lives >= 15) return 3;
    if (lives >= 10) return 2;
    return 1;
  };

  const stars = getStars();

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${
      isWin 
        ? 'bg-gradient-to-b from-yellow-400 via-orange-400 to-red-500' 
        : 'bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900'
    }`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full ${isWin ? 'bg-white/30' : 'bg-gray-500/20'} animate-fall`}
            style={{
              width: Math.random() * 10 + 5,
              height: Math.random() * 10 + 5,
              left: `${Math.random() * 100}%`,
              top: `-20px`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 3 + 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center">
        <div className={`mb-8 ${isWin ? 'animate-bounce' : 'animate-pulse'}`}>
          {isWin ? (
            <Trophy className="w-32 h-32 text-yellow-200 drop-shadow-lg mx-auto" />
          ) : (
            <Skull className="w-32 h-32 text-gray-400 drop-shadow-lg mx-auto" />
          )}
        </div>

        <h1 className={`text-5xl md:text-7xl font-bold mb-4 ${
          isWin ? 'text-white' : 'text-gray-300'
        } drop-shadow-lg`}>
          {isWin ? '🎉 胜利！🎉' : '💀 失败 💀'}
        </h1>

        <p className={`text-xl md:text-2xl mb-8 ${
          isWin ? 'text-white/90' : 'text-gray-400'
        }`}>
          {isWin ? '恭喜你成功守护了城堡！' : '怪物突破了防线...'}
        </p>

        {isWin && showStars && (
          <div className="flex justify-center gap-4 mb-8">
            {[1, 2, 3].map((star) => (
              <Star
                key={star}
                className={`w-16 h-16 transition-all duration-500 ${
                  star <= stars
                    ? 'text-yellow-300 fill-yellow-300 scale-100'
                    : 'text-gray-400 scale-75'
                }`}
                style={{
                  animationDelay: `${star * 0.2}s`,
                  opacity: showStars ? 1 : 0,
                  transform: showStars && star <= stars ? 'scale(1)' : 'scale(0.5)'
                }}
              />
            ))}
          </div>
        )}

        <div className={`rounded-2xl p-6 mb-8 ${
          isWin ? 'bg-white/20' : 'bg-gray-700/50'
        } backdrop-blur-sm`}>
          <div className="grid grid-cols-2 gap-6 text-white">
            <div className="text-center">
              <p className={`text-sm ${isWin ? 'text-white/70' : 'text-gray-400'}`}>最终得分</p>
              <p className="text-4xl font-bold">{animatedScore}</p>
            </div>
            <div className="text-center">
              <p className={`text-sm ${isWin ? 'text-white/70' : 'text-gray-400'}`}>剩余生命</p>
              <p className="text-4xl font-bold">{lives}</p>
            </div>
            <div className="text-center">
              <p className={`text-sm ${isWin ? 'text-white/70' : 'text-gray-400'}`}>完成波次</p>
              <p className="text-4xl font-bold">{currentWave} / {totalWaves}</p>
            </div>
            <div className="text-center">
              <p className={`text-sm ${isWin ? 'text-white/70' : 'text-gray-400'}`}>评价</p>
              <p className="text-4xl font-bold">
                {isWin ? (stars === 3 ? '完美!' : stars === 2 ? '优秀!' : '不错!') : '继续加油!'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handlePlayAgain}
            className={`flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-xl font-bold transition-all transform hover:scale-105 ${
              isWin
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg'
            }`}
          >
            <RotateCcw className="w-6 h-6" />
            再来一局
          </button>
          
          <button
            onClick={handleBackToMenu}
            className={`flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-xl font-bold transition-all transform hover:scale-105 ${
              isWin
                ? 'bg-white/20 text-white hover:bg-white/30'
                : 'bg-gray-600 text-white hover:bg-gray-500'
            }`}
          >
            <Home className="w-6 h-6" />
            返回主菜单
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        .animate-fall {
          animation: fall linear infinite;
        }
      `}</style>
    </div>
  );
}
