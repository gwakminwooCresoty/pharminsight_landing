import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Globe, LayoutGrid, Layers, BarChart3, Menu } from "lucide-react";
import "./App.css";

// ─── Shared ──────────────────────────────────────────────────────────────────
const EASE = [0.22, 1, 0.36, 1];

// ─── Brain data ───────────────────────────────────────────────────────────────
// v: 0 = teal (left), 1 = emerald (right), 2 = center
const BNODES = [
  { x: 140, y: 68, r: 3.5, v: 0 }, { x: 95, y: 108, r: 3, v: 0 },
  { x: 75, y: 162, r: 3, v: 0 }, { x: 88, y: 218, r: 3, v: 0 },
  { x: 128, y: 262, r: 3.5, v: 0 }, { x: 260, y: 68, r: 3.5, v: 1 },
  { x: 305, y: 108, r: 3, v: 1 }, { x: 325, y: 162, r: 3, v: 1 },
  { x: 312, y: 218, r: 3, v: 1 }, { x: 272, y: 262, r: 3.5, v: 1 },
  { x: 200, y: 296, r: 3, v: 2 }, { x: 160, y: 102, r: 3, v: 0 },
  { x: 132, y: 152, r: 4, v: 0 }, { x: 148, y: 206, r: 3, v: 0 },
  { x: 168, y: 252, r: 3, v: 0 }, { x: 240, y: 102, r: 3, v: 1 },
  { x: 268, y: 152, r: 4, v: 1 }, { x: 252, y: 206, r: 3, v: 1 },
  { x: 232, y: 252, r: 3, v: 1 }, { x: 200, y: 50, r: 4.5, v: 2 },
  { x: 200, y: 138, r: 6.5, v: 2 }, { x: 184, y: 183, r: 3.5, v: 0 },
  { x: 216, y: 183, r: 3.5, v: 1 }, { x: 200, y: 228, r: 3.5, v: 2 },
] as const;

const BCONNS: [number, number][] = [
  [19, 0], [0, 1], [1, 2], [2, 3], [3, 4], [4, 10],
  [19, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10],
  [0, 11], [1, 11], [1, 12], [2, 12], [3, 13], [4, 14],
  [5, 15], [6, 15], [6, 16], [7, 16], [8, 17], [9, 18],
  [11, 12], [12, 13], [13, 14], [14, 23],
  [15, 16], [16, 17], [17, 18], [18, 23],
  [19, 20], [11, 20], [15, 20],
  [20, 21], [20, 22], [21, 22], [21, 23], [22, 23], [23, 10],
  [12, 21], [16, 22], [13, 21], [17, 22],
];

const BPULSES = [
  { a: 19, b: 20, d: 0, rd: 3.0 }, { a: 20, b: 21, d: 0.8, rd: 3.5 },
  { a: 20, b: 22, d: 1.6, rd: 3.2 }, { a: 21, b: 23, d: 2.2, rd: 4.0 },
  { a: 22, b: 23, d: 2.9, rd: 3.8 }, { a: 1, b: 12, d: 0.5, rd: 4.5 },
  { a: 6, b: 16, d: 1.3, rd: 4.3 }, { a: 12, b: 21, d: 1.9, rd: 3.9 },
  { a: 16, b: 22, d: 2.6, rd: 4.1 }, { a: 3, b: 13, d: 0.9, rd: 5.0 },
  { a: 8, b: 17, d: 1.7, rd: 4.8 },
];

// ─── Noise ────────────────────────────────────────────────────────────────────
function NoiseOverlay() {
  return (
    <div aria-hidden className="fixed inset-0 pointer-events-none z-[2]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat", backgroundSize: "256px 256px", opacity: 0.025, mixBlendMode: "overlay"
      }}
    />
  );
}

// ─── Ambient Fog — teal/emerald palette ──────────────────────────────────────
function AmbientBg() {
  return (
    <div aria-hidden className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <motion.div className="absolute rounded-full"
        style={{
          width: 1000, height: 1000, top: "-28%", left: "-18%",
          background: "radial-gradient(circle, rgba(13,148,136,0.09) 0%, transparent 65%)", filter: "blur(70px)"
        }}
        animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute rounded-full"
        style={{
          width: 800, height: 800, top: "18%", right: "-18%",
          background: "radial-gradient(circle, rgba(5,150,105,0.07) 0%, transparent 65%)", filter: "blur(70px)"
        }}
        animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 3 }} />
      <motion.div className="absolute rounded-full"
        style={{
          width: 700, height: 700, bottom: "-12%", left: "22%",
          background: "radial-gradient(circle, rgba(15,118,110,0.08) 0%, transparent 65%)", filter: "blur(80px)"
        }}
        animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 6 }} />
    </div>
  );
}

// ─── Logo ─────────────────────────────────────────────────────────────────────
function LogoMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <defs>
        <linearGradient id="lm-g" x1="0" y1="0" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0d9488" /><stop offset="1" stopColor="#059669" />
        </linearGradient>
      </defs>
      <rect width="22" height="22" rx="5" fill="url(#lm-g)" />
      <rect x="3" y="3" width="16" height="16" rx="3" fill="rgba(2,8,23,0.88)" />
      <rect x="6.5" y="6.5" width="9" height="9" rx="2" fill="url(#lm-g)" opacity="0.82" />
    </svg>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div style={{
        borderBottom: "1px solid rgba(255,255,255,0.055)",
        backdropFilter: "blur(24px) saturate(200%)", WebkitBackdropFilter: "blur(24px) saturate(200%)",
        background: "rgba(2,8,23,0.76)"
      }}>
        <div className="max-w-7xl mx-auto px-6 h-[60px] flex items-center justify-between">
          <a href="#" className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-teal-500 rounded">
            <LogoMark />
            <span className="text-white font-semibold text-[15px]" style={{ letterSpacing: "-0.025em" }}>
              팜인사이트
            </span>
          </a>
          <nav className="hidden md:flex items-center gap-8" aria-label="주 메뉴">
          </nav>
          <button className="md:hidden p-1.5 rounded focus:outline-none focus-visible:ring-1 focus-visible:ring-teal-500"
            style={{ color: "rgba(255,255,255,0.5)" }}
            onClick={() => setOpen(!open)} aria-label="메뉴" aria-expanded={open}>
            <Menu size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}

// ─── Brain Aura ───────────────────────────────────────────────────────────────
function BrainAura() {
  const nodeCol = (v: number) => v === 1 ? "#10b981" : "#0d9488";
  const haloCol = (v: number) => v === 1 ? "rgba(16,185,129,0.22)" : "rgba(13,148,136,0.22)";
  const connCol = (va: number, vb: number) =>
    (va === 1 && vb === 1) ? "rgba(16,185,129,0.13)" : "rgba(13,148,136,0.13)";
  const pulseCol = (va: number) => va === 1 ? "rgba(16,185,129,0.95)" : "rgba(13,148,136,0.95)";

  return (
    <div aria-hidden className="relative w-full h-full flex items-center justify-center select-none">
      {/* Ambient glow behind brain */}
      <motion.div className="absolute"
        style={{
          width: 340, height: 320, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(13,148,136,0.07) 0%, rgba(16,185,129,0.04) 50%, transparent 70%)",
          filter: "blur(32px)"
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} />

      <svg viewBox="0 0 400 340" className="relative w-full h-full" style={{ maxWidth: 460, maxHeight: 420, overflow: "visible" }}>
        <defs>
          <filter id="bn-gt" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="bn-ge" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="bn-gc" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Brain silhouette */}
        <path d="M200 44C170 38,118 56,95 92C65 134,60 186,74 228C88 265,118 292,155 302C170 307,185 310,200 309C215 310,230 307,245 302C282 292,312 265,326 228C340 186,335 134,305 92C282 56,230 38,200 44Z"
          fill="none" stroke="rgba(13,148,136,0.07)" strokeWidth="1" />
        <path d="M200 46Q197 178 200 307" fill="none" stroke="rgba(13,148,136,0.06)" strokeWidth="0.8" />

        {/* Connections */}
        {BCONNS.map(([a, b], i) => {
          const na = BNODES[a], nb = BNODES[b];
          return (
            <motion.line key={i} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
              stroke={connCol(na.v, nb.v)} strokeWidth="0.8"
              animate={{ opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 3 + i * 0.18, repeat: Infinity, delay: i * 0.07, ease: "easeInOut" }} />
          );
        })}

        {/* Pulse signals */}
        {BPULSES.map((p, i) => {
          const na = BNODES[p.a], nb = BNODES[p.b];
          return (
            <motion.circle key={i} r={2.5}
              fill={pulseCol(na.v)}
              filter={na.v === 1 ? "url(#bn-ge)" : "url(#bn-gt)"}
              animate={{ cx: [na.x, nb.x], cy: [na.y, nb.y], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: p.d, repeatDelay: p.rd, ease: "easeInOut" }} />
          );
        })}

        {/* Nodes */}
        {BNODES.map((n, i) => {
          const col = nodeCol(n.v);
          const halo = haloCol(n.v);
          const isCenter = i === 20;
          return (
            <g key={i} filter={isCenter ? "url(#bn-gc)" : undefined}>
              <motion.circle cx={n.x} cy={n.y} r={n.r * 2.8} fill={halo}
                animate={{ r: [n.r * 2.4, n.r * 3.5, n.r * 2.4] }}
                transition={{ duration: 2.2 + i * 0.14, repeat: Infinity, delay: i * 0.11, ease: "easeInOut" }} />
              <motion.circle cx={n.x} cy={n.y} r={n.r} fill={col}
                animate={{ opacity: [0.55, 1, 0.55], r: [n.r * 0.9, n.r * 1.1, n.r * 0.9] }}
                transition={{ duration: 2.2 + i * 0.14, repeat: Infinity, delay: i * 0.11, ease: "easeInOut" }} />
              {isCenter && (
                <motion.circle cx={n.x} cy={n.y} r={n.r * 2} fill="none"
                  stroke="rgba(13,148,136,0.3)" strokeWidth="0.8"
                  animate={{ r: [n.r * 1.8, n.r * 3.2, n.r * 1.8], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }} />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative flex items-center min-h-screen pt-[60px]">
      <div className="max-w-7xl mx-auto px-6 w-full py-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-6 items-center">
          <div>
            <motion.div className="inline-flex items-center gap-2 rounded-full mb-8 px-3 py-1.5"
              style={{ border: "1px solid rgba(13,148,136,0.24)", background: "rgba(13,148,136,0.06)" }}
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}>
              <motion.span className="w-[5px] h-[5px] rounded-full"
                style={{ background: "#0d9488" }}
                animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.4, repeat: Infinity }} />
              <span className="text-[10.5px] font-medium tracking-[0.14em] uppercase"
                style={{ color: "rgba(13,148,136,0.9)" }}>약국 관리 플랫폼</span>
            </motion.div>

            <motion.h1 className="font-bold leading-[1.04] mb-6"
              style={{ fontSize: "clamp(44px,6vw,72px)", letterSpacing: "-0.042em", color: "rgba(255,255,255,0.96)" }}
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: EASE }}>
              흩어진 약국을
              <br />
              <span style={{
                background: "linear-gradient(88deg, #0d9488 0%, #10b981 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
              }}>
                하나의 기준으로
              </span>
            </motion.h1>

            <motion.p className="text-[16px] mb-10 max-w-[420px]"
              style={{ color: "rgba(255,255,255,0.4)", lineHeight: "1.72", letterSpacing: "-0.01em" }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.18, ease: EASE }}>
              전국에 흩어진 약국 네트워크를 통합하고,
              <br />
              운영의 표준을 정의하는 B2B 플랫폼입니다.
            </motion.p>

            <motion.div className="flex items-center gap-3"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.36 }}>
              <div className="h-px w-12 shrink-0" style={{ background: "rgba(255,255,255,0.1)" }} />
              <p className="text-[11px] tracking-wide" style={{ color: "rgba(255,255,255,0.26)" }}>
                전국 1,200개 이상의 약국 네트워크가 신뢰하는 관리 표준
              </p>
            </motion.div>
          </div>

          <motion.div className="relative h-[400px] lg:h-[540px]"
            initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.15, ease: EASE }}>
            <BrainAura />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Cinematic Divider ────────────────────────────────────────────────────────
function CinematicDivider() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["-120%", "130%"]);
  return (
    <div ref={ref} aria-hidden className="relative h-20 overflow-hidden">
      <div className="absolute top-1/2 inset-x-0 h-px -translate-y-1/2"
        style={{ background: "rgba(255,255,255,0.034)" }} />
      <motion.div className="absolute top-1/2 h-px w-64 -translate-y-1/2 left-0"
        style={{ x, background: "linear-gradient(to right, transparent, rgba(13,148,136,0.65), rgba(16,185,129,0.55), transparent)" }} />
    </div>
  );
}

// ─── Concept Cards ────────────────────────────────────────────────────────────
const CONCEPTS = [
  { Icon: Globe, title: "전국 약국, 한눈에", desc: "지도 위에 흩어진 전국 약국 현황을 하나의 화면으로 실시간 파악합니다.", accent: "#0d9488" },
  { Icon: LayoutGrid, title: "거점별 현황 파악", desc: "각 약국의 운영 상태를 놓치지 않고 촘촘하게 모니터링합니다.", accent: "#10b981" },
  { Icon: Layers, title: "표준화된 운영", desc: "모든 거점에 동일한 기준과 프로세스를 일관되게 적용합니다.", accent: "#059669" },
  { Icon: BarChart3, title: "데이터 기반 결정", desc: "운영 수치가 명확한 근거가 되어 최적의 판단을 이끕니다.", accent: "#0d9488" },
] as const;

function ConceptCard({ Icon, title, desc, accent, index }: {
  Icon: React.ElementType; title: string; desc: string; accent: string; index: number;
}) {
  return (
    <motion.div className="relative rounded-xl p-6 overflow-hidden cursor-default"
      style={{
        background: "rgba(255,255,255,0.02)", borderWidth: 1, borderStyle: "solid",
        borderColor: "rgba(255,255,255,0.065)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)"
      }}
      initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay: index * 0.09, ease: EASE }}
      whileHover={{ y: -5, borderColor: `${accent}52`, boxShadow: `0 8px 40px ${accent}22`, transition: { duration: 0.22 } }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-5"
        style={{ background: `${accent}14`, border: `1px solid ${accent}2a` }}>
        <Icon size={14} style={{ color: accent }} />
      </div>
      <h3 className="text-sm font-semibold mb-2"
        style={{ color: "rgba(255,255,255,0.9)", letterSpacing: "-0.022em" }}>{title}</h3>
      <p className="text-[12px] leading-relaxed" style={{ color: "rgba(255,255,255,0.34)" }}>{desc}</p>
      <motion.div className="absolute inset-0 rounded-xl pointer-events-none opacity-0"
        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.036) 0%, transparent 55%)" }}
        whileHover={{ opacity: 1, transition: { duration: 0.2 } }} />
    </motion.div>
  );
}

function ConceptSection() {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div className="mb-12"
          initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7, ease: EASE }}>
          <p className="text-[10.5px] font-medium tracking-[0.16em] uppercase mb-3"
            style={{ color: "rgba(13,148,136,0.65)" }}>플랫폼 가치</p>
          <h2 className="font-bold"
            style={{ fontSize: "clamp(28px,4vw,44px)", letterSpacing: "-0.034em", lineHeight: "1.18", color: "rgba(255,255,255,0.92)" }}>
            약국 관리의<br />새로운 기준
          </h2>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CONCEPTS.map((c, i) => <ConceptCard key={c.title} {...c} index={i} />)}
        </div>
      </div>
    </section>
  );
}

// ─── Growth Charts ────────────────────────────────────────────────────────────
// Chart paths: viewBox 0 0 320 110, Y=0 top, Y=110 bottom
// Cost: lower Y = lower cost (better). Amber rises, green drops.
// Revenue: lower Y = higher revenue. Amber barely climbs, green shoots up.
const CHART_CFG = {
  cost: {
    title: "관리 비용",
    badge: "▼ 도입 후 감소",
    amberPath: "M0,48 L100,48 C140,51 180,58 230,67 L320,76",
    greenPath: "M0,48 L100,48 C118,47 136,40 160,28 C188,14 244,8 320,6",
    fillPath: "M0,48 L100,48 C118,47 136,40 160,28 C188,14 244,8 320,6 L320,110 L0,110 Z",
    fillId: "ch-cf", glowId: "ch-cg",
    endCy: 6,
  },
  revenue: {
    title: "매출 성장",
    badge: "▲ 도입 후 상승",
    amberPath: "M0,84 L100,84 C145,82 185,79 245,75 L320,72",
    greenPath: "M0,84 L100,84 C118,84 132,78 150,66 C174,49 218,24 270,13 L320,10",
    fillPath: "M0,84 L100,84 C118,84 132,78 150,66 C174,49 218,24 270,13 L320,10 L320,110 L0,110 Z",
    fillId: "ch-rf", glowId: "ch-rg",
    endCy: 10,
  },
} as const;

function GrowthChart({ type, delay }: { type: keyof typeof CHART_CFG; delay: number }) {
  const c = CHART_CFG[type];

  return (
    <motion.div className="rounded-xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)"
      }}
      initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay, ease: EASE }}>

      {/* Header */}
      <div className="px-5 pt-5 pb-2 flex items-center justify-between">
        <span className="text-[13.5px] font-semibold"
          style={{ color: "rgba(255,255,255,0.88)", letterSpacing: "-0.02em" }}>{c.title}</span>
        <span className="text-[10px] font-semibold px-2 py-1 rounded-full"
          style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
          {c.badge}
        </span>
      </div>

      {/* Chart */}
      <div className="px-5 pb-3">
        <div style={{ aspectRatio: "320/110", position: "relative" }}>
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 110" preserveAspectRatio="none"
            style={{ overflow: "visible" }}>
            <defs>
              <linearGradient id={c.fillId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(16,185,129,0.22)" />
                <stop offset="100%" stopColor="rgba(16,185,129,0.02)" />
              </linearGradient>
              <filter id={c.glowId} x="-20%" y="-40%" width="140%" height="180%">
                <feGaussianBlur stdDeviation="1.5" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Grid */}
            {[22, 44, 66, 88].map(y => (
              <line key={y} x1="0" y1={y} x2="320" y2={y}
                stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            ))}

            {/* Adoption line */}
            <line x1="100" y1="0" x2="100" y2="110"
              stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" strokeDasharray="3 3" />
            <text x="104" y="9" fontSize="6.5" fill="rgba(255,255,255,0.3)"
              fontFamily="Inter,system-ui,sans-serif">도입 시점</text>

            {/* Area fill */}
            <motion.path d={c.fillPath} fill={`url(#${c.fillId})`}
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: delay + 0.8 }} />

            {/* Amber line */}
            <motion.path d={c.amberPath} fill="none"
              stroke="rgba(245,158,11,0.5)" strokeWidth="1.5"
              strokeLinecap="round" strokeDasharray="5 3"
              initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, delay: delay + 0.2, ease: "easeOut" }} />

            {/* Green line with glow */}
            <motion.path d={c.greenPath} fill="none"
              stroke="rgba(16,185,129,0.92)" strokeWidth="2.2"
              strokeLinecap="round" filter={`url(#${c.glowId})`}
              initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.7, delay: delay + 0.3, ease: "easeOut" }} />

            {/* End dot — green line terminus */}
            <motion.circle cx="320" cy={c.endCy} r="4"
              fill="#10b981" stroke="rgba(16,185,129,0.25)" strokeWidth="5"
              initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: delay + 2, ease: EASE }} />
          </svg>
        </div>

        {/* Axis hint */}
        <div className="flex justify-between mt-1">
          <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.2)" }}>도입 전</span>
          <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.2)" }}>도입 후</span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 mt-3">
          <div className="flex items-center gap-1.5">
            <svg width="18" height="4" viewBox="0 0 18 4">
              <line x1="0" y1="2" x2="18" y2="2" stroke="rgba(245,158,11,0.6)"
                strokeWidth="1.5" strokeDasharray="4 2" />
            </svg>
            <span className="text-[9.5px]" style={{ color: "rgba(255,255,255,0.3)" }}>현행 유지</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="18" height="4" viewBox="0 0 18 4">
              <line x1="0" y1="2" x2="18" y2="2" stroke="rgba(16,185,129,0.9)" strokeWidth="2" />
            </svg>
            <span className="text-[9.5px]" style={{ color: "rgba(255,255,255,0.3)" }}>PharmInsight 도입</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ShowcaseSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div className="mb-12"
          initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7, ease: EASE }}>
          <p className="text-[10.5px] font-medium tracking-[0.16em] uppercase mb-3"
            style={{ color: "rgba(16,185,129,0.65)" }}>도입 효과</p>
          <h2 className="font-bold"
            style={{ fontSize: "clamp(28px,4vw,44px)", letterSpacing: "-0.034em", lineHeight: "1.18", color: "rgba(255,255,255,0.92)" }}>
            관리 비용은 낮추고,
            <br />
            매출 성장은 높입니다
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5">
          <GrowthChart type="cost" delay={0} />
          <GrowthChart type="revenue" delay={0.1} />
        </div>

        {/* Summary stats */}
        <motion.div className="mt-5 grid sm:grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.25, ease: EASE }}>
          {[
            { icon: "▼", value: "평균 41%", label: "관리 비용 감소", color: "#0d9488" },
            { icon: "▲", value: "평균 34%", label: "매출 성장", color: "#10b981" },
          ].map(s => (
            <div key={s.label} className="rounded-xl px-6 py-5 flex items-center gap-4"
              style={{ background: "rgba(255,255,255,0.018)", border: "1px solid rgba(255,255,255,0.065)" }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${s.color}16`, border: `1px solid ${s.color}28` }}>
                <span className="text-base font-bold" style={{ color: s.color }}>{s.icon}</span>
              </div>
              <div>
                <div className="text-[22px] font-bold leading-none mb-0.5"
                  style={{ color: "rgba(255,255,255,0.92)", letterSpacing: "-0.04em" }}>{s.value}</div>
                <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.36)" }}>{s.label}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Closing Statement ────────────────────────────────────────────────────────
function ClosingStatement() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 68% 52% at 50% 50%, rgba(13,148,136,0.05) 0%, transparent 70%)" }} />
      <div className="absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(to right, transparent, rgba(13,148,136,0.2), rgba(16,185,129,0.18), transparent)" }} />
      <div className="max-w-4xl mx-auto px-6 text-center relative">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.9, ease: EASE }}>
          <p className="text-[10.5px] font-medium tracking-[0.16em] uppercase mb-6"
            style={{ color: "rgba(13,148,136,0.52)" }}>PharmInsight</p>
          <h2 className="font-bold"
            style={{ fontSize: "clamp(34px,5.5vw,60px)", letterSpacing: "-0.042em", lineHeight: "1.1", color: "rgba(255,255,255,0.92)" }}>
            약국 관리의
            <br />
            <span style={{
              background: "linear-gradient(88deg, #0d9488 0%, #10b981 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
            }}>
              새로운 표준
            </span>
          </h2>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function SiteFooter() {
  return (
    <footer style={{ borderTop: "1px solid rgba(255,255,255,0.052)" }}>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="text-[13.5px] font-semibold mb-1"
              style={{ color: "rgba(255,255,255,0.62)", letterSpacing: "-0.022em" }}>PharmInsight</div>
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.2)" }}>
              © 2024 PharmInsight Inc. All rights reserved.
            </p>
          </div>
          <nav className="flex flex-wrap gap-6" aria-label="푸터 링크">
            {["이용약관", "개인정보처리방침", "쿠키 정책", "문의하기"].map(link => (
              <a key={link} href="#"
                className="text-[11px] transition-colors duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/20 rounded"
                style={{ color: "rgba(255,255,255,0.28)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.56)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.28)"; }}
              >{link}</a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "#020817", color: "white", overflowX: "hidden" }}>
      <AmbientBg />
      <NoiseOverlay />
      <Nav />
      <main>
        <HeroSection />
        <CinematicDivider />
        <ConceptSection />
        <CinematicDivider />
        <ShowcaseSection />
        <ClosingStatement />
      </main>
      <SiteFooter />
    </div>
  );
}
