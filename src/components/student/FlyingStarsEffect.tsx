import React, { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../services/audio';

export interface FlyingStarParticle {
  id: string;
  p0: { x: number; y: number };
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  currentX: number;
  currentY: number;
  scale: number;
  opacity: number;
  rotation: number;
  delayMs: number;
  startTime?: number;
  durationMs: number;
  isHit: boolean;
  size: number;
}

interface SparkleTrail {
  id: string;
  x: number;
  y: number;
  opacity: number;
  size: number;
  color: string;
}

interface FlyingStarsEffectProps {
  /** If provided, will target this element's position on screen */
  targetRef: React.RefObject<HTMLElement | null>;
  /** Event trigger: when this changes or increments, an animation batch is spawned */
  triggerCount: number;
  /** Number of stars added in this event */
  starsAdded: number;
  /** Optional origin position {x, y}. If omitted, defaults to screen center */
  origin?: { x: number; y: number } | null;
  /** Callback fired every time an individual flying star impacts the target */
  onStarHit?: (hitIndex: number, total: number) => void;
  /** Callback fired after all stars in the batch have completed their journey */
  onComplete?: () => void;
}

export const FlyingStarsEffect: React.FC<FlyingStarsEffectProps> = ({
  targetRef,
  triggerCount,
  starsAdded,
  origin,
  onStarHit,
  onComplete
}) => {
  const [particles, setParticles] = useState<FlyingStarParticle[]>([]);
  const [trails, setTrails] = useState<SparkleTrail[]>([]);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (triggerCount <= 0 || starsAdded <= 0) return;

    // 1. Calculate Destination (Target Badge)
    let destX = window.innerWidth * 0.7;
    let destY = 80;

    if (targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      destX = rect.left + rect.width / 2;
      destY = rect.top + rect.height / 2;
    }

    // 2. Calculate Origin
    const startX = origin ? origin.x : window.innerWidth / 2;
    const startY = origin ? origin.y : window.innerHeight * 0.55;

    // 3. Generate swarm particles
    const count = Math.min(10, Math.max(5, starsAdded * 2));
    const newParticles: FlyingStarParticle[] = [];

    for (let i = 0; i < count; i++) {
      const p0 = {
        x: startX + (Math.random() - 0.5) * 60,
        y: startY + (Math.random() - 0.5) * 50
      };

      // Arc out to the left or right, lifting above the straight line
      const curveDir = i % 2 === 0 ? 1 : -1;
      const arcWidth = (70 + Math.random() * 110) * curveDir;
      const midX = (p0.x + destX) / 2 + arcWidth;
      const midY = Math.min(p0.y, destY) - (90 + Math.random() * 80);

      const p1 = { x: midX, y: midY };
      const p2 = { x: destX, y: destY };

      newParticles.push({
        id: `star-p-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
        p0,
        p1,
        p2,
        currentX: p0.x,
        currentY: p0.y,
        scale: 0,
        opacity: 0,
        rotation: Math.random() * 360,
        delayMs: i * 85,
        durationMs: 700 + Math.random() * 150,
        isHit: false,
        size: 26 + Math.random() * 10
      });
    }

    setParticles(newParticles);
  }, [triggerCount]);

  // Main Animation Loop using Quadratic Bezier curves
  useEffect(() => {
    if (particles.length === 0) return;

    let startTime: number | null = null;
    let remainingHits = particles.length;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsedTotal = timestamp - startTime;

      let allDone = true;
      const newTrails: SparkleTrail[] = [];

      setParticles((prevParticles) => {
        return prevParticles.map((p, idx) => {
          if (p.isHit) return p;

          const particleElapsed = elapsedTotal - p.delayMs;

          if (particleElapsed < 0) {
            allDone = false;
            return p;
          }

          const tRaw = particleElapsed / p.durationMs;
          const t = Math.min(1, Math.max(0, tRaw));

          if (t >= 1) {
            // Impact!
            if (!p.isHit) {
              soundManager.playStarCollect(1 + (idx / Math.max(1, prevParticles.length)) * 0.4);
              if (onStarHit) onStarHit(idx, prevParticles.length);
              remainingHits--;
            }
            return {
              ...p,
              currentX: p.p2.x,
              currentY: p.p2.y,
              scale: 0,
              opacity: 0,
              isHit: true
            };
          }

          allDone = false;

          // Quadratic Bezier Formula: B(t) = (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
          const invT = 1 - t;
          const bx = invT * invT * p.p0.x + 2 * invT * t * p.p1.x + t * t * p.p2.x;
          const by = invT * invT * p.p0.y + 2 * invT * t * p.p1.y + t * t * p.p2.y;

          // Scale: Pop in from 0 -> 1.35 around t=0.2, then glide down to 0.9 before hit
          let s = 1;
          let op = 1;
          if (t < 0.2) {
            s = (t / 0.2) * 1.35;
            op = t / 0.2;
          } else if (t > 0.85) {
            s = 1.35 - ((t - 0.85) / 0.15) * 0.55;
            op = 1;
          } else {
            s = 1.35 - (t - 0.2) * 0.35;
          }

          // Generate intermittent sparkle trail dots behind the star
          if (Math.random() > 0.45) {
            newTrails.push({
              id: `tr-${Date.now()}-${Math.random()}`,
              x: bx + (Math.random() - 0.5) * 12,
              y: by + (Math.random() - 0.5) * 12,
              opacity: 0.9,
              size: 4 + Math.random() * 6,
              color: Math.random() > 0.5 ? '#fde047' : '#ffffff'
            });
          }

          return {
            ...p,
            currentX: bx,
            currentY: by,
            scale: s,
            opacity: op,
            rotation: p.rotation + 5
          };
        });
      });

      // Update sparkle trails
      if (newTrails.length > 0) {
        setTrails((old) => [...old.slice(-25), ...newTrails]);
      }

      if (!allDone) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        // Final celebration: Confetti shower around destination badge
        if (targetRef.current) {
          const rect = targetRef.current.getBoundingClientRect();
          try {
            confetti({
              particleCount: 30,
              spread: 60,
              origin: {
                x: (rect.left + rect.width / 2) / window.innerWidth,
                y: (rect.top + rect.height / 2) / window.innerHeight
              },
              colors: ['#fbbf24', '#f59e0b', '#fde047', '#ffffff', '#e0e7ff'],
              ticks: 80,
              gravity: 0.8
            });
          } catch {
            // ignore
          }
        }

        setTimeout(() => {
          setParticles([]);
          setTrails([]);
          if (onComplete) onComplete();
        }, 300);
      }
    };

    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [particles.length > 0]);

  // Fade out trails
  useEffect(() => {
    if (trails.length === 0) return;
    const trailTimer = setTimeout(() => {
      setTrails((prev) =>
        prev
          .map((t) => ({ ...t, opacity: t.opacity - 0.2 }))
          .filter((t) => t.opacity > 0.05)
      );
    }, 40);
    return () => clearTimeout(trailTimer);
  }, [trails]);

  if (particles.length === 0 && trails.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Sparkle Trail Particles */}
      {trails.map((t) => (
        <div
          key={t.id}
          className="absolute rounded-full transition-opacity duration-150"
          style={{
            left: `${t.x}px`,
            top: `${t.y}px`,
            width: `${t.size}px`,
            height: `${t.size}px`,
            backgroundColor: t.color,
            opacity: t.opacity,
            boxShadow: `0 0 6px ${t.color}`,
            transform: 'translate(-50%, -50%)'
          }}
        />
      ))}

      {/* Main Flying Stars */}
      {particles.map((p) => {
        if (!p.opacity || p.isHit) return null;
        return (
          <div
            key={p.id}
            className="absolute flex items-center justify-center select-none"
            style={{
              left: `${p.currentX}px`,
              top: `${p.currentY}px`,
              transform: `translate(-50%, -50%) scale(${p.scale}) rotate(${p.rotation}deg)`,
              opacity: p.opacity,
              filter: 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.95)) drop-shadow(0 0 18px rgba(253, 224, 71, 0.8))'
            }}
          >
            <span
              className="inline-block transform animate-spin-slow"
              style={{ fontSize: `${p.size}px`, lineHeight: 1 }}
            >
              ⭐
            </span>
          </div>
        );
      })}
    </div>
  );
};
