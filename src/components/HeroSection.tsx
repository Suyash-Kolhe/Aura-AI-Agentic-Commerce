import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronDown,
  ArrowRight,
  MessageSquare,
  Sparkles,
  Cpu,
  ShieldCheck,
  Zap,
  ShoppingBag,
  CheckCircle2,
  Lock,
  Layers,
} from 'lucide-react';
import logoImg from '../assets/logo.png';
import AuthModal, { UserProfile } from './AuthModal';
import { formatUserInitials } from '../utils/auth';

interface HeroSectionProps {
  currentUser: UserProfile | null;
  onAuthenticated: (user: UserProfile) => void;
  onGoToChat: () => void;
  onLogout: () => void;
}

export default function HeroSection({
  currentUser,
  onAuthenticated,
  onGoToChat,
  onLogout,
}: HeroSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');

  // Custom JS-controlled fade loop using requestAnimationFrame:
  // 0.5s fade-in at start, 0.5s fade-out at end.
  // On ended, opacity resets to 0, waits 100ms, then replays from 0.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let animId: number;
    let isEnding = false;
    const fadeDuration = 0.5;

    // Start with opacity 0
    video.style.opacity = '0';

    const updateFade = () => {
      if (video && video.duration && !isNaN(video.duration) && video.duration > 0) {
        const ct = video.currentTime;
        const dur = video.duration;

        if (ct < fadeDuration) {
          const op = Math.min(1, Math.max(0, ct / fadeDuration));
          video.style.opacity = op.toFixed(4);
        } else if (ct >= dur - fadeDuration) {
          const remaining = Math.max(0, dur - ct);
          const op = Math.min(1, Math.max(0, remaining / fadeDuration));
          video.style.opacity = op.toFixed(4);
        } else {
          video.style.opacity = '1';
        }

        if (ct >= dur - 0.04 && !isEnding) {
          isEnding = true;
          video.style.opacity = '0';
          video.pause();
          setTimeout(() => {
            if (video) {
              video.currentTime = 0;
              video.style.opacity = '0';
              video.play().catch(() => {});
              isEnding = false;
            }
          }, 100);
        }
      }

      animId = requestAnimationFrame(updateFade);
    };

    const handleEnded = () => {
      if (isEnding) return;
      isEnding = true;
      video.style.opacity = '0';
      setTimeout(() => {
        if (video) {
          video.currentTime = 0;
          video.style.opacity = '0';
          video.play().catch(() => {});
          isEnding = false;
        }
      }, 100);
    };

    video.addEventListener('ended', handleEnded);
    video.play().catch(() => {});
    animId = requestAnimationFrame(updateFade);

    return () => {
      cancelAnimationFrame(animId);
      if (video) {
        video.removeEventListener('ended', handleEnded);
      }
    };
  }, []);

  const handleOpenAuth = (mode: 'signup' | 'signin') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: UserProfile) => {
    setAuthModalOpen(false);
    onAuthenticated(user);
    onGoToChat();
  };

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[hsl(260_87%_3%)] text-[hsl(40_6%_95%)] flex flex-col justify-between selection:bg-[#6366f1]/30 selection:text-white">
      {/* Motion Video Background: Fixed all over the hero section */}
      <video
        ref={videoRef}
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_065045_c44942da-53c6-4804-b734-f9e07fc22e08.mp4"
        playsInline
        muted
        autoPlay
        className="fixed inset-0 w-full h-full object-cover pointer-events-none z-0 transition-none"
        style={{ opacity: 0 }}
      />

      {/* Atmospheric Glass/Gradient Overlays across entire scrollable hero */}
      <div
        className="fixed inset-0 bg-gradient-to-b from-black/50 via-[#0c081e]/85 to-[hsl(260_87%_3%)]/95 pointer-events-none z-0"
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.2),rgba(255,255,255,0))] pointer-events-none z-0"
        aria-hidden="true"
      />

      {/* Hero content sits in a relative z-10 container */}
      <div className="relative z-10 flex flex-col min-h-screen justify-between">
        {/* Navbar */}
        <header className="sticky top-0 z-50 bg-[#0c081e]/75 backdrop-blur-md border-b border-white/10 w-full transition-all">
          <div className="w-full py-4 px-6 sm:px-10 flex flex-row items-center justify-between">
            {/* Left: Logo */}
            <a
              href="#hero-top"
              className="flex items-center gap-3 shrink-0 focus:outline-none"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <img
                src={logoImg}
                alt="Aura AI"
                className="h-[32px] w-auto object-contain cursor-pointer select-none bg-transparent"
              />
            </a>

            {/* Right: Auth & Navigation CTAs */}
            <div className="flex items-center gap-3">
              {currentUser ? (
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={onGoToChat}
                    className="heroSecondary rounded-full px-4 py-2 text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 hover:scale-[1.05] hover:border-purple-400/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] cursor-pointer text-white"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-purple-300" />
                    <span>Open AI Chat</span>
                  </button>

                  <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-400/50 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                    {formatUserInitials(currentUser.name)}
                  </div>
                  <span className="text-xs text-zinc-300 font-medium hidden sm:inline max-w-[100px] truncate">
                    {currentUser.name}
                  </span>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer ml-1"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleOpenAuth('signup')}
                  className="heroSecondary rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 hover:scale-[1.05] hover:border-purple-400/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] cursor-pointer"
                >
                  Sign Up
                </button>
              )}
            </div>
          </div>
        </header>

        {/* 1. HERO HEADLINE & TOP CTA SECTION */}
        <section
          id="hero-top"
          aria-label="Aura AI Hero"
          className="relative flex flex-col items-center justify-center text-center px-6 py-24 sm:py-32 overflow-visible"
        >
          {/* Blurred overlay glow centered behind headline */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[984px] h-[527px] opacity-90 bg-gray-950 blur-[82px] pointer-events-none -z-10 rounded-full max-w-[95vw]"
            aria-hidden="true"
          />

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium mb-6 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Autonomous Shopping Intelligence · PayPal Orders v2</span>
          </motion.div>

          {/* Headline: "Aura AI" */}
          <h1
            className="font-general font-normal leading-[1.02] tracking-[-0.024em] select-none text-[80px] sm:text-[130px] md:text-[180px] lg:text-[220px]"
            style={{ textWrap: 'balance' }}
          >
            <span className="text-[hsl(40_6%_95%)]">Aura </span>
            <span
              className="bg-clip-text text-transparent inline-block"
              style={{
                backgroundImage: 'linear-gradient(to left, #6366f1, #a855f7, #fcd34d)',
              }}
            >
              AI
            </span>
          </h1>

          {/* Subtitle: "The most powerful AI ever deployed / for Shopping" */}
          <p className="text-hero-sub text-lg sm:text-xl leading-8 max-w-xl mt-[12px] opacity-85 font-normal">
            The most powerful AI ever deployed
            <br />
            for Shopping
          </p>

          <p className="text-zinc-400 text-sm max-w-lg mt-3 leading-relaxed">
            Experience conversational discovery, zero-friction intent detection, and instant 1-click PayPal checkout.
          </p>

          {/* Primary CTA Button */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-[32px]">
            {currentUser ? (
              <button
                type="button"
                onClick={onGoToChat}
                className="heroSecondary rounded-2xl px-[32px] py-[20px] text-base font-semibold inline-flex items-center gap-3 shadow-2xl group transition-all duration-300 ease-out hover:scale-[1.04] hover:shadow-[0_0_35px_rgba(168,85,247,0.4)] hover:border-purple-400/60 active:scale-[0.98] cursor-pointer"
              >
                <span>Chat with Aura AI</span>
                <MessageSquare className="w-5 h-5 text-purple-300" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleOpenAuth('signup')}
                className="heroSecondary rounded-2xl px-[32px] py-[20px] text-base font-semibold inline-flex items-center gap-3 shadow-2xl group transition-all duration-300 ease-out hover:scale-[1.04] hover:shadow-[0_0_35px_rgba(168,85,247,0.4)] hover:border-purple-400/60 active:scale-[0.98] cursor-pointer"
              >
                <span>Sign Up to Start Shopping</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
              </button>
            )}

            <button
              type="button"
              onClick={() => handleScrollTo('how-to-buy-section')}
              className="px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center gap-2"
            >
              <span>See How It Works</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* 2. CORE FEATURES OF AURA AI */}
        <section
          id="features-section"
          className="relative py-20 px-6 sm:px-12 max-w-7xl mx-auto w-full"
        >
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-400 block mb-2">
              Next-Gen Commerce Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-general">
              Features Built for Autonomous Shopping
            </h2>
            <p className="text-sm text-zinc-400 mt-3 leading-relaxed">
              Aura blends modern generative AI models with real-time financial settlement pipelines, eliminating traditional multi-step forms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="liquid-glass rounded-2xl p-6 border border-white/10 bg-[#130d2a]/80 backdrop-blur-md hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-400/30 flex items-center justify-center text-purple-300 mb-5 group-hover:scale-110 transition-transform">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-general">Autonomous Intent Detection</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                When you say &quot;I want to buy the ANC-1 Headphones&quot;, Aura stops prose and instantly emits structured JSON with exact product identifiers and prices.
              </p>
              <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-purple-300">
                <span>RFC 8259 JSON · Zero-lag parsing</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="liquid-glass rounded-2xl p-6 border border-white/10 bg-[#130d2a]/80 backdrop-blur-md hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 mb-5 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-general">Instant PayPal Orders v2</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Seamless backend authentication creates native PayPal sandbox orders in milliseconds with 256-bit encryption and immediate visual approval links.
              </p>
              <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-emerald-400">
                <span>POST /api/checkout · OAuth2 Token Exchange</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="liquid-glass rounded-2xl p-6 border border-white/10 bg-[#130d2a]/80 backdrop-blur-md hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 mb-5 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-general">Conversational Gadget Discovery</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Deep hardware comprehension across 45mm beryllium drivers, waveguide optics, dual-frequency GPS, and hall effect magnetic switches.
              </p>
              <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-zinc-400">
                <span>Gemini 2.5 Flash · Technical grounding</span>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="liquid-glass rounded-2xl p-6 border border-white/10 bg-[#130d2a]/80 backdrop-blur-md hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-amber-600/20 border border-amber-400/30 flex items-center justify-center text-amber-300 mb-5 group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-general">Curated Hardware Inventory</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Hand-picked high-performance devices with studio photography, verified prices, and real-time inventory tracking.
              </p>
              <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-amber-300">
                <span>Exclusive tech drops · Stock verification</span>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="liquid-glass rounded-2xl p-6 border border-white/10 bg-[#130d2a]/80 backdrop-blur-md hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-400/30 flex items-center justify-center text-purple-300 mb-5 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-general">Real-Time Checkout Ledger</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Track pending approvals, simulate sandbox capture, inspect raw order IDs, and verify digital receipt generation in an live transaction ledger.
              </p>
              <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-purple-300">
                <span>Stateful Order Registry · Status: CAPTURED</span>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="liquid-glass rounded-2xl p-6 border border-white/10 bg-[#130d2a]/80 backdrop-blur-md hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-sky-600/20 border border-sky-400/30 flex items-center justify-center text-sky-300 mb-5 group-hover:scale-110 transition-transform">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-general">Secure Member Workspace</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Effortless social login with Google and GitHub or password credentials gives you instant access to your private shopping session.
              </p>
              <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-sky-300">
                <span>OAuth &amp; Email · Persistent Session</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. HOW TO BUY PRODUCTS USING THE AI (3 SIMPLE STEPS) */}
        <section
          id="steps-section"
          className="relative py-20 px-6 sm:px-12 max-w-7xl mx-auto w-full"
        >
          <div className="text-center max-w-2xl mx-auto mb-16" id="how-to-buy-section">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-400 block mb-2">
              Simple 3-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-general">
              How to Buy Products Using Aura AI
            </h2>
            <p className="text-sm text-zinc-400 mt-3 leading-relaxed">
              No shopping carts, no 5-page checkouts. Experience a frictionless conversational path from curiosity to confirmed PayPal purchase.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="relative rounded-2xl bg-[#130d2a]/90 border border-white/15 p-7 flex flex-col justify-between shadow-2xl backdrop-blur-md hover:border-purple-500/50 transition-all group">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-4xl font-black font-mono text-purple-400/40 group-hover:text-purple-400 transition-colors">
                    01
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-300 font-mono">
                    Discover
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 font-general">Ask Aura in Plain English</h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  Ask Aura about gadget specs, compare battery lives, or inquire about material finishes. Aura acts as your personalized hardware concierge.
                </p>
              </div>

              {/* Step 1 Visual Sample */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-zinc-300 space-y-2">
                <div className="text-[10px] text-purple-300 uppercase font-semibold">User Prompt Example:</div>
                <div className="p-2 rounded-lg bg-white/5 text-zinc-200 text-xs">
                  &quot;What makes the Aether ANC-1 Studio Headphones special?&quot;
                </div>
                <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Aura explains specs &amp; studio drivers</span>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-2xl bg-[#130d2a]/90 border border-white/15 p-7 flex flex-col justify-between shadow-2xl backdrop-blur-md hover:border-purple-500/50 transition-all group">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-4xl font-black font-mono text-purple-400/40 group-hover:text-purple-400 transition-colors">
                    02
                  </span>
                  <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 font-mono">
                    Intent
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 font-general">State Your Purchase Intent</h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  When you are ready to buy, simply say &quot;I want to buy the [item]&quot; or click &quot;Buy via Aura&quot;. The AI automatically halts general text and triggers intent parsing.
                </p>
              </div>

              {/* Step 2 Visual Sample */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-zinc-300 space-y-2">
                <div className="text-[10px] text-purple-300 uppercase font-semibold">Autonomous Intent Extraction:</div>
                <div className="p-2 rounded-lg bg-purple-950/40 border border-purple-500/30 text-purple-200 text-[11px]">
                  &#123; &quot;intent&quot;: &quot;purchase&quot;, &quot;item&quot;: &quot;Aether ANC-1&quot;, &quot;price&quot;: 349.00 &#125;
                </div>
                <div className="text-[11px] text-purple-300 flex items-center gap-1.5 pt-1">
                  <Zap className="w-3.5 h-3.5 text-purple-400" />
                  <span>Locked item &amp; exact pricing in USD</span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative rounded-2xl bg-[#130d2a]/90 border border-white/15 p-7 flex flex-col justify-between shadow-2xl backdrop-blur-md hover:border-purple-500/50 transition-all group">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-4xl font-black font-mono text-purple-400/40 group-hover:text-purple-400 transition-colors">
                    03
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-mono">
                    Checkout
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 font-general">1-Click PayPal Checkout</h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  Aura replies with a visual product showcase card containing specs and your direct, official PayPal Checkout approval link. Click to authorize instantly.
                </p>
              </div>

              {/* Step 3 Visual Sample */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-zinc-300 space-y-2">
                <div className="text-[10px] text-purple-300 uppercase font-semibold">Interactive Card Preview:</div>
                <div className="p-2 rounded-lg bg-[#0070BA]/20 border border-[#0070BA]/40 text-white flex items-center justify-between text-xs">
                  <span>Complete via PayPal</span>
                  <span className="font-bold font-mono">$349.00 USD</span>
                </div>
                <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Sandbox verified &amp; logged to ledger</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. BOTTOM HERO CALL-TO-ACTION BANNER */}
        <section className="relative py-20 px-6 max-w-5xl mx-auto w-full text-center">
          <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-[#0c081e]/80 border border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.25)] relative overflow-hidden backdrop-blur-md">
            <div className="relative z-10 space-y-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-300">
                Ready for the future of tech shopping?
              </span>
              <h2 className="text-3xl sm:text-5xl font-bold text-white font-general tracking-tight">
                Start Chatting with Aura AI Today
              </h2>
              <p className="text-sm text-zinc-300 max-w-lg mx-auto leading-relaxed">
                Join thousands experiencing intelligent gadget curation and autonomous PayPal Checkout.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                {currentUser ? (
                  <button
                    type="button"
                    onClick={onGoToChat}
                    className="heroSecondary rounded-2xl px-8 py-4 text-base font-semibold inline-flex items-center gap-2 hover:scale-105 transition-all shadow-xl cursor-pointer"
                  >
                    <span>Launch AI Shopping Assistant</span>
                    <MessageSquare className="w-5 h-5 text-purple-300" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenAuth('signup')}
                    className="heroSecondary rounded-2xl px-8 py-4 text-base font-semibold inline-flex items-center gap-2 hover:scale-105 transition-all shadow-xl cursor-pointer"
                  >
                    <span>Sign Up Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Landing Page Footer */}
        <footer className="border-t border-white/10 bg-[#090617]/90 backdrop-blur-md py-8 px-6 mt-12">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
            <div className="flex items-center gap-3">
              <img src={logoImg} alt="Aura AI" className="h-6 w-auto object-contain" />
              <span>Aura AI · The Most Powerful AI Ever Deployed for Shopping</span>
            </div>
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => handleScrollTo('features-section')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Features
              </button>
              <button
                type="button"
                onClick={() => handleScrollTo('steps-section')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                How to Buy
              </button>
              <span>PayPal Orders v2 Active</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Professional Sign Up / Sign In Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
        onAuthenticated={handleAuthSuccess}
      />
    </div>
  );
}
