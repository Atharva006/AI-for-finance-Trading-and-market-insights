import React, { useEffect, useRef } from 'react';

interface MotionAssetCanvasProps {
  mode: 'matsya-target' | 'data-strike';
  className?: string;
  videoSrc?: string;
}

export const MotionAssetCanvas: React.FC<MotionAssetCanvasProps> = ({
  mode,
  className = '',
  videoSrc,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 500);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || 800;
      height = canvas.height = canvas.parentElement?.clientHeight || 500;
    };

    window.addEventListener('resize', handleResize);

    let time = 0;

    const particles: Array<{
      x: number;
      y: number;
      speed: number;
      length: number;
      opacity: number;
      color: string;
      isCandle?: boolean;
      text?: string;
    }> = [];

    const headlines = [
      'RBI REPO RATE +25BPS',
      'NSE NIFTY CE IV SPIKE',
      'RELIANCE Q3 EBITDA +18%',
      'HDFC MERGER ARBITRAGE',
      'FII INFLOW ₹3,400 CR',
      'CRUDE SPIKE IMPACT',
    ];

    if (mode === 'data-strike') {
      for (let i = 0; i < 40; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          speed: 1.5 + Math.random() * 2.5,
          length: 12 + Math.random() * 25,
          opacity: 0.2 + Math.random() * 0.5,
          color: Math.random() > 0.4 ? '#FF5500' : '#0F172A',
          isCandle: Math.random() > 0.5,
          text: headlines[Math.floor(Math.random() * headlines.length)],
        });
      }
    }

    const render = () => {
      time += 0.02;

      // Pure White Background #FFFFFF
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      if (mode === 'matsya-target') {
        // ASSET 1: THE MATSYA TARGET (ASTROLABE & LIQUID REFLECTION ON WHITE)
        // 1. Subtle Oil Ripple Reflections
        ctx.save();
        for (let r = 3; r >= 1; r--) {
          const rippleRadius = (time * 15 * r) % 280;
          ctx.beginPath();
          ctx.arc(cx, cy, rippleRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 85, 0, ${Math.max(0, 0.2 - rippleRadius / 350)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // 2. Geometric Astrolabe Rings
        ctx.translate(cx, cy);

        // Outer Ring with Notches
        ctx.rotate(time * 0.3);
        ctx.beginPath();
        ctx.arc(0, 0, 160, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 85, 0, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        for (let i = 0; i < 36; i++) {
          const angle = (i * Math.PI * 2) / 36;
          const r1 = 152;
          const r2 = i % 3 === 0 ? 168 : 160;
          ctx.beginPath();
          ctx.moveTo(Math.cos(angle) * r1, Math.sin(angle) * r1);
          ctx.lineTo(Math.cos(angle) * r2, Math.sin(angle) * r2);
          ctx.strokeStyle = i % 3 === 0 ? '#FF5500' : 'rgba(15, 23, 42, 0.15)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Middle Inverted Hexagram Astrolabe
        ctx.rotate(-time * 0.6);
        ctx.beginPath();
        for (let j = 0; j < 6; j++) {
          const a = (j * Math.PI * 2) / 6;
          const rad = 110;
          const x = Math.cos(a) * rad;
          const y = Math.sin(a) * rad;
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = 'rgba(255, 85, 0, 0.35)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Inner Targeting Ring
        ctx.beginPath();
        ctx.arc(0, 0, 60, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.4)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.restore();

        // 3. Converging Laser Focal Strike Point
        ctx.strokeStyle = 'rgba(255, 85, 0, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(width, cy);
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, height);
        ctx.stroke();

        for (let b = 0; b < 4; b++) {
          const beamAngle = time * 2 + (b * Math.PI) / 2;
          const beamDist = 90 + Math.sin(time * 3 + b) * 20;
          const bx = cx + Math.cos(beamAngle) * beamDist;
          const by = cy + Math.sin(beamAngle) * beamDist;

          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.lineTo(cx, cy);
          ctx.strokeStyle = 'rgba(255, 85, 0, 0.6)';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(bx, by, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#FF5500';
          ctx.fill();
        }

        // Razor Sharp Center Point
        const pulse = Math.sin(time * 6) * 1.5 + 4.5;
        const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
        glowGrad.addColorStop(0, '#FF5500');
        glowGrad.addColorStop(0.3, 'rgba(255, 85, 0, 0.3)');
        glowGrad.addColorStop(1, 'rgba(255, 85, 0, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 30, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, pulse, 0, Math.PI * 2);
        ctx.fillStyle = '#0A0A0D';
        ctx.fill();
      } else {
        // ASSET 2: DATA-TO-STRIKE FLOW (ON PURE WHITE)
        const targetY = cy;

        ctx.beginPath();
        ctx.moveTo(width * 0.4, targetY);
        ctx.lineTo(width, targetY);
        ctx.strokeStyle = '#FF5500';
        ctx.lineWidth = 3;
        ctx.stroke();

        particles.forEach((p) => {
          p.x += p.speed;
          if (p.x > width) {
            p.x = 0;
            p.y = Math.random() * height;
          }

          const convergenceRatio = Math.max(0, Math.min(1, (p.x - width * 0.2) / (width * 0.35)));
          const currentY = p.y * (1 - convergenceRatio) + targetY * convergenceRatio;

          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.opacity;

          if (convergenceRatio > 0.85) {
            ctx.fillStyle = '#FF5500';
            ctx.fillRect(p.x, currentY - 1, p.length, 2);
          } else if (p.isCandle) {
            const candleH = 12;
            ctx.fillRect(p.x, currentY - candleH / 2, 4, candleH);
            ctx.fillRect(p.x + 1.5, currentY - candleH, 1, candleH * 2);
          } else {
            ctx.font = '9px "JetBrains Mono"';
            ctx.fillText(p.text || 'TICK_DATA', p.x, currentY);
          }
        });

        ctx.globalAlpha = 1.0;

        ctx.beginPath();
        ctx.arc(width * 0.98, targetY, 4 + Math.sin(time * 8) * 2, 0, Math.PI * 2);
        ctx.fillStyle = '#FF5500';
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [mode]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {videoSrc ? (
        <video
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover mix-blend-multiply opacity-80"
        />
      ) : (
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
        />
      )}
    </div>
  );
};
