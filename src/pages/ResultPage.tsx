import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Skull, Home, RotateCcw, Star, Shield, Heart, Zap, Sword, Crown } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';

export default function ResultPage() {
  const navigate = useNavigate();
  const { result, score, lives, currentWave, totalWaves, mapId, resetGame } = useGameStore();
  const [showStars, setShowStars] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const isWin = result === 'win';

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowStars(true);
      if (isWin) {
        setShowConfetti(true);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [isWin]);

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
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden ${
      isWin 
        ? 'bg-gradient-to-b from-yellow-500 via-orange-400 to-red-600' 
        : 'bg-gradient-to-b from-gray-900 via-purple-900 to-black'
    }`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(80)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full ${isWin ? 'bg-white/30' : 'bg-purple-500/20'} animate-fall`}
            style={{
              width: Math.random() * 15 + 5,
              height: Math.random() * 15 + 5,
              left: `${Math.random() * 100}%`,
              top: `-20px`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 3 + 2}s`,
              filter: 'blur(2px)'
            }}
          />
        ))}
        
        {isWin && showConfetti && [...Array(100)].map((_, i) => (
          <div
            key={`confetti-${i}`}
            className="absolute animate-confetti"
            style={{
              width: Math.random() * 6 + 4,
              height: Math.random() * 6 + 4,
              left: `${Math.random() * 100}%`,
              top: `-10px`,
              backgroundColor: [
                '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'
              ][Math.floor(Math.random() * 6)],
              borderRadius: Math.random() > 0.5 ? '50%' : '0',
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${Math.random() * 3 + 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center max-w-4xl w-full">
        <div className={`mb-10 animate-fade-in`}>
          <div className={`w-32 h-32 mx-auto mb-6 relative ${
            isWin ? 'animate-bounce-slow' : 'animate-pulse'
          }`}>
            {isWin ? (
              <div className="relative">
                <Trophy className="w-32 h-32 text-yellow-300 drop-shadow-2xl" />
                <Crown className="absolute -top-4 -right-4 w-16 h-16 text-yellow-400 drop-shadow-lg animate-spin-slow" />
              </div>
            ) : (
              <Skull className="w-32 h-32 text-gray-400 drop-shadow-2xl" />
            )}
          </div>

          <h1 className={`text-5xl md:text-7xl font-bold mb-4 ${
            isWin ? 'text-white' : 'text-gray-300'
          } drop-shadow-2xl animate-slide-up`}>
            {isWin ? '🎉 胜利！ 🎉' : '💀 失败 💀'}
          </h1>

          <p className={`text-xl md:text-2xl mb-8 ${
            isWin ? 'text-white/90' : 'text-gray-400'
          } animate-slide-up`}>
            {isWin ? '恭喜你成功守护了城堡！' : '怪物突破了防线...'}
          </p>
        </div>

        {isWin && showStars && (
          <div className="flex justify-center gap-4 mb-10 animate-slide-up">
            {[1, 2, 3].map((star) => (
              <Star
                key={star}
                className={`w-16 h-16 transition-all duration-500 ${star <= stars ? 'animate-pulse-glow' : ''}`}
                style={{
                  color: star <= stars ? '#FFD700' : '#666',
                  fill: star <= stars ? '#FFD700' : 'none',
                  transform: showStars && star <= stars ? 'scale(1.1)' : 'scale(0.7)',
                  opacity: showStars ? 1 : 0,
                  animationDelay: `${star * 0.2}s`,
                  textShadow: star <= stars ? '0 0 20px #FFD700' : 'none'
                }}
              />
            ))}
          </div>
        )}

        <div className={`bg-gradient-to-br ${isWin ? 'from-white/20 to-white/10' : 'from-purple-900/50 to-gray-900/50'} backdrop-blur-lg rounded-3xl p-8 mb-10 shadow-2xl border ${isWin ? 'border-white/30' : 'border-purple-800/30'} animate-slide-up`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br ${isWin ? 'from-yellow-500/20 to-orange-500/20' : 'from-purple-800/30 to-indigo-800/30'} rounded-2xl p-6 border ${isWin ? 'border-yellow-500/30' : 'border-purple-700/30'} backdrop-blur-sm">
              <div className="flex items-center justify-center mb-4">
                <Zap className={`w-8 h-8 ${
                  isWin ? 'text-yellow-300' : 'text-purple-400'
                }`} />
              </div>
              <p className={`text-sm mb-2 ${
                isWin ? 'text-white/80' : 'text-gray-400'
              }`}>最终得分</p>
              <p className="text-4xl font-bold text-white">{animatedScore}</p>
            </div>
            
            <div className="bg-gradient-to-br ${isWin ? 'from-red-500/20 to-pink-500/20' : 'from-indigo-800/30 to-blue-800/30'} rounded-2xl p-6 border ${isWin ? 'border-red-500/30' : 'border-indigo-700/30'} backdrop-blur-sm">
              <div className="flex items-center justify-center mb-4">
                <Heart className={`w-8 h-8 ${
                  isWin ? 'text-red-400' : 'text-blue-400'
                }`} />
              </div>
              <p className={`text-sm mb-2 ${
                isWin ? 'text-white/80' : 'text-gray-400'
              }`}>剩余生命</p>
              <p className="text-4xl font-bold text-white">{lives}</p>
            </div>
            
            <div className="bg-gradient-to-br ${isWin ? 'from-green-500/20 to-emerald-500/20' : 'from-blue-800/30 to-cyan-800/30'} rounded-2xl p-6 border ${isWin ? 'border-green-500/30' : 'border-blue-700/30'} backdrop-blur-sm">
              <div className="flex items-center justify-center mb-4">
                <Sword className={`w-8 h-8 ${
                  isWin ? 'text-green-400' : 'text-cyan-400'
                }`} />
              </div>
              <p className={`text-sm mb-2 ${
                isWin ? 'text-white/80' : 'text-gray-400'
              }`}>完成波次</p>
              <p className="text-4xl font-bold text-white">{currentWave} / {totalWaves}</p>
            </div>
            
            <div className="bg-gradient-to-br ${isWin ? 'from-purple-500/20 to-pink-500/20' : 'from-gray-800/30 to-gray-700/30'} rounded-2xl p-6 border ${isWin ? 'border-purple-500/30' : 'border-gray-700/30'} backdrop-blur-sm">
              <div className="flex items-center justify-center mb-4">
                <Shield className={`w-8 h-8 ${
                  isWin ? 'text-purple-400' : 'text-gray-400'
                }`} />
              </div>
              <p className={`text-sm mb-2 ${
                isWin ? 'text-white/80' : 'text-gray-400'
              }`}>评价</p>
              <p className="text-4xl font-bold text-white">
                {isWin 
                  ? (stars === 3 ? '完美!' : stars === 2 ? '优秀!' : '不错!') 
                  : '继续加油!'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center animate-slide-up">
          <button
            onClick={handlePlayAgain}
            className={`flex items-center justify-center gap-3 px-10 py-5 rounded-xl text-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl w-full sm:w-auto ${
              isWin
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800'
            }`}
          >
            <RotateCcw className="w-6 h-6" />
            再来一局
          </button>
          
          <button
            onClick={handleBackToMenu}
            className={`flex items-center justify-center gap-3 px-10 py-5 rounded-xl text-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl w-full sm:w-auto ${
              isWin
                ? 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/30'
                : 'bg-gray-800/80 backdrop-blur-sm text-gray-200 hover:bg-gray-700/80 border border-gray-700/30'
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
        @keyframes confetti {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-glow {
          0%, 100% { filter: drop-shadow(0 0 10px currentColor); }
          50% { filter: drop-shadow(0 0 20px currentColor); }
        }
        .animate-fall {
          animation: fall linear infinite;
        }
        .animate-confetti {
          animation: confetti linear infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
