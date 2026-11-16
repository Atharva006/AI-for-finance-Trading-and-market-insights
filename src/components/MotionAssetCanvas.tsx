import React, { useEffect, useRef } from 'react';

interface MotionAssetCanvasProps {
  mode: 'matsya-target' | 'data-strike';
  className?: string;
  videoSrc?: string; // If a generated video file exists
}

export const MotionAssetCanvas: React.FC<MotionAssetCanvasProps> = ({
  mode,
  className = '',
  videoSrc,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (videoSrc) return; // If video is provided, let video handle it

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

    // Data-to-strike particles
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
      for (let i = 0; i < 45; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          speed: 1.5 + Math.random() * 2.5,
          length: 10 + Math.random() * 30,
          opacity: 0.15 + Math.random() * 0.45,
          color: Math.random() > 0.4 ? '#FF5500' : '#FFFFFF',
          isCandle: Math.random() > 0.5,
          text: headlines[Math.floor(Math.random() * headlines.length)],
        });
      }
    }

    const render = () => {
      time += 0.02;

      // Dark Obsidian Background #060608
      ctx.fillStyle = '#060608';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      if (mode === 'matsya-target') {
        // ASSET 1: THE MATSYA TARGET (ASTROLABE & LIQUID REFLECTION)
        // 1. Black Liquid Ripple Reflections
        ctx.save();
        for (let r = 3; r >= 1; r--) {
          const rippleRadius = (time * 15 * r) % 280;
          ctx.beginPath();
          ctx.arc(cx, cy, rippleRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 85, 0, ${Math.max(0, 0.25 - rippleRadius / 300)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // 2. Geometric Brass / Orange Astrolabe Rings
        ctx.save();
        ctx.translate(cx, cy);

        // Outer Ring with Coordinate Notches
        ctx.rotate(time * 0.3);
        ctx.beginPath();
        ctx.arc(0, 0, 160, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 136, 0, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Astrolabe notches
        for (let i = 0; i < 36; i++) {
          const angle = (i * Math.PI * 2) / 36;
          const r1 = 152;
          const r2 = i % 3 === 0 ? 168 : 160;
          ctx.beginPath();
          ctx.moveTo(Math.cos(angle) * r1, Math.sin(angle) * r1);
          ctx.lineTo(Math.cos(angle) * r2, Math.sin(angle) * r2);
          ctx.strokeStyle = i % 3 === 0 ? '#FF5500' : 'rgba(255, 255, 255, 0.2)';
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
        ctx.strokeStyle = 'rgba(255, 85, 0, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Inner Concentric Targeting Rings
        ctx.beginPath();
        ctx.arc(0, 0, 60, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();

        // 3. Converging Laser Focal Strike Point (The Eye of the Fish)
        // Crosshair rays
        ctx.strokeStyle = 'rgba(255, 85, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(width, cy);
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, height);
        ctx.stroke();

        // Converging Energy Beams
        for (let b = 0; b < 4; b++) {
          const beamAngle = time * 2 + (b * Math.PI) / 2;
          const beamDist = 90 + Math.sin(time * 3 + b) * 20;
          const bx = cx + Math.cos(beamAngle) * beamDist;
          const by = cy + Math.sin(beamAngle) * beamDist;

          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.lineTo(cx, cy);
          ctx.strokeStyle = 'rgba(255, 85, 0, 0.7)';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Particle at beam tip
          ctx.beginPath();
          ctx.arc(bx, by, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
        }

        // Razor Sharp Laser Center Point
        const pulse = Math.sin(time * 6) * 2 + 5;
        const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 35);
        glowGrad.addColorStop(0, '#FF5500');
        glowGrad.addColorStop(0.3, 'rgba(255, 85, 0, 0.6)');
        glowGrad.addColorStop(1, 'rgba(255, 85, 0, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 35, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, pulse, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#FF5500';
        ctx.shadowBlur = 18;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
        ctx.restore();
      } else {
        // ASSET 2: DATA-TO-STRIKE FLOW
        // Chaotic Candlesticks & News dissolving into a razor-sharp orange trajectory line
        const targetY = cy;

        // Draw the Converged Razor Algorithmic Trajectory Line
        ctx.beginPath();
        ctx.moveTo(width * 0.45, targetY);
        ctx.lineTo(width, targetY);
        ctx.strokeStyle = '#FF5500';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#FF5500';
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Secondary White Core inside the strike line
        ctx.beginPath();
        ctx.moveTo(width * 0.5, targetY);
        ctx.lineTo(width, targetY);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Particles transitioning from chaotic left to aligned right
        particles.forEach((p) => {
          p.x += p.speed;
          if (p.x > width) {
            p.x = 0;
            p.y = Math.random() * height;
          }

          // As particle crosses 40% width, it gravitationally pulls toward targetY
          const convergenceRatio = Math.max(0, Math.min(1, (p.x - width * 0.2) / (width * 0.35)));
          const currentY = p.y * (1 - convergenceRatio) + targetY * convergenceRatio;

          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.opacity;

          if (convergenceRatio > 0.85) {
            // Converged into clean laser stream
            ctx.fillStyle = '#FF5500';
            ctx.fillRect(p.x, currentY - 1, p.length, 2);
          } else if (p.isCandle) {
            // Chaotic Candlestick
            const candleH = 14;
            ctx.fillRect(p.x, currentY - candleH / 2, 4, candleH);
            ctx.fillRect(p.x + 1.5, currentY - candleH, 1, candleH * 2);
          } else {
            // News headline fragment or tick
            ctx.font = '9px "JetBrains Mono"';
            ctx.fillText(p.text || 'TICK_DATA', p.x, currentY);
          }
        });

        ctx.globalAlpha = 1.0;

        // Strike impact pulse at the tip
        ctx.beginPath();
        ctx.arc(width * 0.98, targetY, 4 + Math.sin(time * 8) * 2, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#FF5500';
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [mode, videoSrc]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {videoSrc ? (
        <video
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover mix-blend-screen opacity-90"
        />
      ) : (
        <canvas
          ref={canvasRef}
          className="w-full h-full block mix-blend-screen"
        />
      )}
    </div>
  );
};
