import { useState, useEffect, useCallback, useRef } from 'react';

const GRID_WIDTH = 20;
const GRID_HEIGHT = 25;

export function SnakeGame() {
  const [snake, setSnake] = useState([{ x: 10, y: 12 }]);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true); // Default paused
  const [score, setScore] = useState(0);
  const touchStart = useRef({ x: 0, y: 0 });

  const cellPctW = 100 / GRID_WIDTH;
  const cellPctH = 100 / GRID_HEIGHT;

  const changeDirection = useCallback((newDir) => {
    if (newDir === 'UP' && direction !== 'DOWN') setDirection('UP');
    else if (newDir === 'DOWN' && direction !== 'UP') setDirection('DOWN');
    else if (newDir === 'LEFT' && direction !== 'RIGHT') setDirection('LEFT');
    else if (newDir === 'RIGHT' && direction !== 'LEFT') setDirection('RIGHT');
  }, [direction]);

  const resetGame = useCallback(() => {
    setSnake([{ x: 10, y: 12 }]);
    setDirection('RIGHT');
    setGameOver(false);
    setIsPaused(true);
    setScore(0);
  }, []);

  useEffect(() => {
    if (gameOver || isPaused) return;
    const moveSnake = () => {
      const newSnake = [...snake];
      const head = { ...newSnake[0] };
      switch (direction) {
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'RIGHT': head.x += 1; break;
      }
      if (head.x < 0 || head.x >= GRID_WIDTH || head.y < 0 || head.y >= GRID_HEIGHT || newSnake.some(seg => seg.x === head.x && seg.y === head.y)) {
        setGameOver(true); return;
      }
      newSnake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        setScore(s => s + 1);
        setFood({ x: Math.floor(Math.random() * GRID_WIDTH), y: Math.floor(Math.random() * GRID_HEIGHT) });
      } else { newSnake.pop(); }
      setSnake(newSnake);
    };
    const interval = setInterval(moveSnake, 120);
    return () => clearInterval(interval);
  }, [snake, direction, food, gameOver, isPaused]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
      if (e.key === ' ') {
        e.preventDefault();
        setIsPaused(p => !p);
      } else {
        changeDirection(e.key.replace('Arrow', '').toUpperCase());
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changeDirection]);

  const handleTouchStart = (e) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e) => {
    const deltaX = e.changedTouches[0].clientX - touchStart.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStart.current.y;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      changeDirection(deltaX > 0 ? 'RIGHT' : 'LEFT');
    } else {
      changeDirection(deltaY > 0 ? 'DOWN' : 'UP');
    }
  };

  return (
    <div className="flex flex-col items-center bg-surface-container-low p-5 rounded-lg border border-border w-full h-full min-h-[460px]">
      <div className="flex justify-between w-full mb-4 items-center">
        <h3 className="text-sm font-bold text-text-bright uppercase tracking-widest">SNAKE_OS</h3>
        <span className="text-xs font-code-sm text-primary">SCORE: {score}</span>
      </div>
      
      <div 
        className="relative bg-background rounded-sm overflow-hidden border border-border w-full"
        style={{ aspectRatio: `${GRID_WIDTH}/${GRID_HEIGHT}` }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {snake.map((seg, i) => (
          <div key={i} className="absolute bg-primary shadow-[0_0_6px_rgba(139,92,246,0.5)]" style={{ width: `${cellPctW}%`, height: `${cellPctH}%`, left: `${seg.x * cellPctW}%`, top: `${seg.y * cellPctH}%` }} />
        ))}
        <div className="absolute bg-error shadow-[0_0_6px_rgba(239,68,68,0.5)]" style={{ width: `${cellPctW}%`, height: `${cellPctH}%`, left: `${food.x * cellPctW}%`, top: `${food.y * cellPctH}%` }} />
        
        {(gameOver || isPaused) && (
          <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center backdrop-blur-sm z-10 gap-3">
            <p className={`font-bold text-base tracking-widest ${gameOver ? 'text-error' : 'text-primary'}`}>
                {gameOver ? 'GAME_OVER' : 'PAUSED'}
            </p>
            <div className='flex gap-2'>
                <button onClick={resetGame} className="px-4 py-1.5 bg-border text-text-bright font-bold text-[10px] uppercase">Retry</button>
                {!gameOver && <button onClick={() => setIsPaused(false)} className="px-4 py-1.5 bg-primary text-on-primary font-bold text-[10px] uppercase">Start</button>}
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-center gap-2 mt-4">
        <button onClick={() => setIsPaused(p => !p)} className="px-4 py-1 bg-surface-container border border-border rounded text-xs text-primary font-bold uppercase">
            {isPaused ? 'Resume' : 'Pause'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4 w-40">
        <div />
        <button onClick={() => changeDirection('UP')} className="p-3 bg-surface-container border border-border rounded text-primary hover:bg-surface-container-high">▲</button>
        <div />
        <button onClick={() => changeDirection('LEFT')} className="p-3 bg-surface-container border border-border rounded text-primary hover:bg-surface-container-high">◀</button>
        <button onClick={() => changeDirection('DOWN')} className="p-3 bg-surface-container border border-border rounded text-primary hover:bg-surface-container-high">▼</button>
        <button onClick={() => changeDirection('RIGHT')} className="p-3 bg-surface-container border border-border rounded text-primary hover:bg-surface-container-high">▶</button>
      </div>
    </div>
  );
}
