import { useEffect, useState } from 'react';

const ORBS = [
  {
    size: '70vw',
    gradient: 'radial-gradient(circle at 30% 50%, #8B5CF6 0%, transparent 70%)',
    animation: 'aurora-drift-1 28s ease-in-out infinite alternate',
    top: '-15%', left: '-20%',
  },
  {
    size: '60vw',
    gradient: 'radial-gradient(circle at 70% 50%, #38BDF8 0%, transparent 70%)',
    animation: 'aurora-drift-2 35s ease-in-out infinite alternate',
    bottom: '-20%', right: '-15%',
  },
  {
    size: '50vw',
    gradient: 'radial-gradient(circle at 50% 50%, #A78BFA 0%, transparent 65%)',
    animation: 'aurora-drift-3 40s ease-in-out infinite alternate',
    top: '40%', left: '40%',
  },
];

const ORBS_MOBILE = [
  {
    size: '90vw',
    gradient: 'radial-gradient(circle at 50% 50%, #8B5CF6 0%, transparent 70%)',
    animation: 'aurora-drift-1 35s ease-in-out infinite alternate',
    top: '-20%', left: '-30%',
  },
  {
    size: '80vw',
    gradient: 'radial-gradient(circle at 50% 50%, #38BDF8 0%, transparent 70%)',
    animation: 'aurora-drift-2 40s ease-in-out infinite alternate',
    bottom: '-20%', right: '-20%',
  },
];

export default function AuroraBackground() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const orbs = isMobile ? ORBS_MOBILE : ORBS;

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden="true">
      {orbs.map((orb, i) => (
        <div
          key={i}
          className="absolute will-change-transform"
          style={{
            width: orb.size,
            height: orb.size,
            background: orb.gradient,
            animation: orb.animation,
            opacity: 0.25,
            filter: 'blur(80px)',
            ...(orb.top ? { top: orb.top } : {}),
            ...(orb.bottom ? { bottom: orb.bottom } : {}),
            ...(orb.left ? { left: orb.left } : {}),
            ...(orb.right ? { right: orb.right } : {}),
          }}
        />
      ))}

      <style>{`
        @keyframes aurora-drift-1 {
          0%   { transform: translate(0, 0) rotate(0deg) scale(1); }
          25%  { transform: translate(8vw, -6vh) rotate(3deg) scale(1.08); }
          50%  { transform: translate(-4vw, 4vh) rotate(-2deg) scale(0.92); }
          75%  { transform: translate(6vw, 2vh) rotate(4deg) scale(1.04); }
          100% { transform: translate(-2vw, -3vh) rotate(-1deg) scale(0.96); }
        }
        @keyframes aurora-drift-2 {
          0%   { transform: translate(0, 0) rotate(0deg) scale(1); }
          25%  { transform: translate(-6vw, 5vh) rotate(-4deg) scale(0.95); }
          50%  { transform: translate(5vw, -3vh) rotate(3deg) scale(1.06); }
          75%  { transform: translate(-3vw, -5vh) rotate(-2deg) scale(1.02); }
          100% { transform: translate(4vw, 4vh) rotate(2deg) scale(0.98); }
        }
        @keyframes aurora-drift-3 {
          0%   { transform: translate(0, 0) rotate(0deg) scale(1); }
          33%  { transform: translate(5vw, -4vh) rotate(2deg) scale(1.05); }
          66%  { transform: translate(-3vw, 3vh) rotate(-3deg) scale(0.94); }
          100% { transform: translate(2vw, -2vh) rotate(1deg) scale(1.02); }
        }
      `}</style>
    </div>
  );
}
