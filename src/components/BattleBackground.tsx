import React, { useMemo } from 'react';

interface BattleBackgroundProps {
  isBoss: boolean;
}

const BattleBackground: React.FC<BattleBackgroundProps> = ({ isBoss }) => {
  const embers = useMemo(
    () =>
      Array.from({ length: 12 + Math.floor(Math.random() * 4) }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 80 + 10}%`,
        size: `${Math.random() * 6 + 4}px`,
        duration: `${2 + Math.random() * 1.6}s`,
        delay: `${Math.random() * 2.5}s`,
        color: Math.random() > 0.5 ? '#FFB347' : '#FFD700',
        opacity: 0.65 + Math.random() * 0.35,
      })),
    []
  );

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }

          @keyframes cloudDrift {
            0% { transform: translateX(-180%); }
            100% { transform: translateX(130vw); }
          }

          @keyframes flicker {
            0%, 100% { transform: scaleX(1); opacity: 1; }
            50% { transform: scaleX(0.78); opacity: 0.82; }
          }

          @keyframes ember {
            0% { transform: translateY(0) scale(1); opacity: 0.9; }
            100% { transform: translateY(-180px) scale(0.2); opacity: 0; }
          }

          .battle-bg-cloud {
            position: absolute;
            background: rgba(255, 255, 255, 0.85);
            border-radius: 9999px;
            filter: drop-shadow(0 0 8px rgba(255,255,255,0.45));
          }

          .battle-bg-cloud::before,
          .battle-bg-cloud::after {
            content: '';
            position: absolute;
            background: rgba(255, 255, 255, 0.85);
            border-radius: 9999px;
          }

          .battle-bg-cloud::before {
            width: 70%;
            height: 70%;
            top: -36%;
            left: 12%;
          }

          .battle-bg-cloud::after {
            width: 55%;
            height: 55%;
            top: -24%;
            right: 8%;
          }

        `}</style>

      {isBoss ? (
        <>
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, #0D0D1A 0%, #1A1025 35%, #2D1B0E 70%, #1A0D06 100%)',
            }}
          />

          {/* SDS: glow around torches */}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 25% 32%, rgba(255, 155, 28, 0.25), transparent 25%), radial-gradient(circle at 75% 32%, rgba(255, 155, 28, 0.25), transparent 25%)',
              mixBlendMode: 'screen',
              pointerEvents: 'none',
            }}
          />

          {/* Rocky ceiling */}
          <svg className="absolute inset-x-0 top-0 w-full h-1/4" viewBox="0 0 100 30" preserveAspectRatio="none">
            <path d="M0,20 L5,18 L9,22 L13,16 L18,20 L22,14 L27,18 L31,12 L36,18 L40,12 L45,16 L50,10 L55,17 L59,13 L64,18 L68,14 L73,19 L77,15 L82,20 L86,16 L91,21 L95,18 L100,20 L100,0 L0,0Z" fill="#2A1F12" />
          </svg>

          {/* Rocky floor */}
          <svg className="absolute inset-x-0 bottom-0 w-full h-1/5" viewBox="0 0 100 25" preserveAspectRatio="none">
            <path d="M0,5 L4,10 L8,7 L12,9 L16,5 L20,8 L24,6 L28,10 L32,7 L36,12 L40,8 L44,11 L48,7 L52,10 L56,6 L60,9 L64,5 L68,8 L72,6 L76,11 L80,7 L84,10 L88,6 L92,9 L96,5 L100,8 L100,25 L0,25Z" fill="#3A2A15" />
          </svg>

          <div className="absolute left-8 top-[30%] flex flex-col items-center z-10">
            <div className="w-3 h-20 bg-[#512f12] rounded-full" />
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full"
              style={{ width: 16, height: 24, background: 'radial-gradient(circle at 40% 40%, #fff7c7, #ff9c2a 40%, #dc5800 75%)', animation: 'flicker 0.6s ease-in-out infinite' }}
            />
          </div>

          <div className="absolute right-8 top-[30%] flex flex-col items-center z-10">
            <div className="w-3 h-20 bg-[#512f12] rounded-full" />
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full"
              style={{ width: 16, height: 24, background: 'radial-gradient(circle at 40% 40%, #fff7c7, #ff9c2a 40%, #dc5800 75%)', animation: 'flicker 0.6s ease-in-out infinite' }}
            />
          </div>

          {/* Stalattiti */}
          {Array.from({ length: 6 }, (_, idx) => {
            const left = 8 + idx * 14;
            const width = 20 + (idx % 3) * 6;
            const height = 40 + (idx % 4) * 10;
            return (
              <div
                key={`stalactite-${idx}`}
                className="absolute top-0"
                style={{
                  left: `${left}%`,
                  width: `${width}px`,
                  height: `${height}px`,
                  clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                  background: '#2b1d10',
                  opacity: 0.95,
                }}
              />
            );
          })}

          {/* Rock platforms */}
          {/* piattaforme dungeon rimosse come richiesto */}

          {/* Embers */}
          {embers.map((ember) => (
            <div
              key={ember.id}
              className="absolute rounded-full"
              style={{
                left: ember.left,
                bottom: `${Math.random() * 40 + 10}%`,
                width: ember.size,
                height: ember.size,
                backgroundColor: ember.color,
                opacity: ember.opacity,
                animation: `ember ${ember.duration} ${ember.delay} linear infinite`,
                filter: 'blur(1px)',
                zIndex: 5,
              }}
            />
          ))}

          {/* Ambient glow overlay */}
          <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 25% 30%, rgba(255,180,90,0.16), transparent 30%), radial-gradient(circle at 75% 30%, rgba(255,180,90,0.16), transparent 30%)' }} />
        </>
      ) : (
        <>
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, #6ABADB 0%, #8ED0F0 15%, #7AB830 15%, #4E9A22 40%, #3D7A1A 70%, #2E5E12 100%)',
            }}
          />

          {[
            { top: '4%', left: '-15%', size: 90, duration: '28s', delay: '0s' },
            { top: '8%', left: '15%', size: 72, duration: '26s', delay: '8s' },
            { top: '2%', left: '-8%', size: 62, duration: '30s', delay: '4s' },
          ].map((cloud, idx) => (
            <div
              key={`cloud-${idx}`}
              className="battle-bg-cloud"
              style={{
                top: cloud.top,
                left: cloud.left,
                width: `${cloud.size}px`,
                height: `${cloud.size * 0.55}px`,
                animation: `cloudDrift ${cloud.duration} linear infinite`,
                animationDelay: cloud.delay,
              }}
            />
          ))}

          {/* piattaforme rimosse come richiesto */}

          <div className="absolute bottom-0 left-0 w-full" style={{ height: '20%', background: 'linear-gradient(180deg, #2d6f2e, #225d2a)' }} />
        </>
      )}
    </div>
  );
};

export default BattleBackground;
