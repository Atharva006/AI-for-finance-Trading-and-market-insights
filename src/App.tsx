import React, { useState, useEffect } from 'react';
import Lenis from 'lenis';
import { CustomCursor } from './components/CustomCursor';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { MatsyaPhilosophy } from './components/MatsyaPhilosophy';
import { BacktestSandbox } from './components/BacktestSandbox';
import { OrderBookTelemetry } from './components/OrderBookTelemetry';
import { Footer } from './components/Footer';
import { TerminalModal } from './components/TerminalModal';
import { quantSound } from './components/AudioAmbience';

export function App() {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Initialize Lenis Smooth Scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    quantSound.enabled = next;
    if (next) {
      quantSound.playTargetLock();
    }
  };

  const handleOpenTerminal = () => {
    quantSound.playClick();
    setIsTerminalOpen(true);
  };

  const handleExplorePhilosophy = () => {
    quantSound.playClick();
    const el = document.getElementById('philosophy');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-white text-[#0A0A0D] selection:bg-[#FF5500] selection:text-white">
      {/* Precision Custom Reticle Cursor */}
      <CustomCursor />

      {/* Top HUD Navigation Bar */}
      <Navbar
        onOpenTerminal={handleOpenTerminal}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Main Content Area */}
      <main className="relative">
        {/* Hero Section with Vanta.js 3D Globe in Pure White + Matsya Astrolabe Motion Canvas */}
        <HeroSection
          onOpenTerminal={handleOpenTerminal}
          onExplorePhilosophy={handleExplorePhilosophy}
          motionAsset1Url="/assets/matsya-target.mp4"
        />

        {/* Section 2: Matsya-Vedha — The Philosophy */}
        <MatsyaPhilosophy
          motionAsset2Url="/assets/data-strike.mp4"
        />

        {/* Section 3: Interactive NSE Strategy Backtest Sandbox */}
        <BacktestSandbox />

        {/* Microstructure Telemetry: Level 2 Depth & News Sentiment Core */}
        <OrderBookTelemetry />
      </main>

      {/* Footer & Compliance Stamp */}
      <Footer />

      {/* Terminal Shell Modal */}
      <TerminalModal
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
      />
    </div>
  );
}

export default App;
