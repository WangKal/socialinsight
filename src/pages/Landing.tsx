import { useState, useEffect, useRef } from 'react'
import { AuthButtons } from "@/components/AuthButtons";
import { useAuth } from "@/hooks/use-auth";
import { Link, useNavigate } from "react-router-dom";
// ─── Data ───────────────────────────────────────────────────────────────────

const problems = [
  {
    number: '01',
    title: 'The Challenge',
    body: 'Brands and governments suffer from a critical perception gap between internal beliefs and public sentiment, operating in a blind state that costs them trust and relevance.',
  },
  {
    number: '02',
    title: 'The Disconnect',
    body: 'Acting on assumptions rather than reality leads to a total failure to connect with citizens and product users—strategies built on air rather than ground truth.',
  },
  {
    number: '03',
    title: 'The Volume Barrier',
    body: 'Millions of high-frequency social media data streams make it impossible for manual teams to diagnose the why behind public discourse at the speed decisions require.',
  },
]

const differentiators = [
  {
    label: 'Beyond Vanity Metrics',
    traditional: 'Surface-level reach, impressions, and follower counts that tell you nothing about what people actually think.',
    groundTruth: 'Deep dives into public comment and post streams to surface the real emotional drivers behind every number.',
  },
  {
    label: 'Localized Linguistic Intent',
    traditional: 'Generic Western sentiment models that miss code-switching, sarcasm, and regional nuance entirely.',
    groundTruth: 'Built to decode Sheng, Pidgin, and complex regional contexts—so nothing gets lost in translation.',
  },
  {
    label: 'Actionable Ground Truth',
    traditional: 'Reports full of charts and jargon that leave you with more questions than answers.',
    groundTruth: 'Unstructured regional chatter transformed into audited intelligence that eliminates strategic blind spots.',
  },
]

const audiences = [
  {
    icon: '◈',
    title: 'Local & Foreign Brands',
    body: 'Consumer enterprises navigating fast-moving markets and real-time public forums.',
  },
  {
    icon: '◉',
    title: 'Governments & Public Sector',
    body: 'Public institutions tracking policy reception, citizen understanding, and regulatory feedback.',
  },
  {
    icon: '◫',
    title: 'Research Teams',
    body: 'Analysts cross-validating official surveys against organic public comment threads.',
  },
  {
    icon: '◧',
    title: 'Communications & PR',
    body: 'Strategy teams auditing client brand health and identifying hidden reputational risks.',
  },
  {
    icon: '◦',
    title: 'Business Development',
    body: 'Commercial professionals using data-driven shadow audits to secure high-value contracts.',
  },
]

const useCaseTabs = [
  {
    label: 'Brand & Market',
    title: 'Brand & Market Intelligence',
    items: [
      'Competitor tracking across social platforms in real time',
      'Product and feature reaction audits from organic comment streams',
      'Campaign messaging validation before and after launch',
      'Unmet friction discovery hidden in public discourse',
    ],
  },
  {
    label: 'Risk & Reputation',
    title: 'Risk & Reputation Management',
    items: [
      'Early crisis warning signals surfaced before they escalate',
      'Narrative disconnect diagnosis between brand and public',
      'Long-term brand trust auditing across market cycles',
      'Reputational risk mapping tied to specific content or policy',
    ],
  },
  {
    label: 'Research & Verification',
    title: 'Research & Ground-Truth Verification',
    items: [
      'Survey cross-validation against organic comment reality',
      'Localized slang and sarcasm decoding for accurate sentiment',
      'Academic and institutional research support',
      'Media coverage analysis vs. actual public response',
    ],
  },
  {
    label: 'Public Sector',
    title: 'Public Sector & Institutional Strategy',
    items: [
      'Policy pulse audits across citizen platforms',
      'Platform-specific discourse analysis on TikTok and Reels',
      'Public sector friction mapping for communication reform',
      'Regulatory feedback aggregation and intent classification',
    ],
  },
  {
    label: 'Commercial Strategy',
    title: 'Commercial Strategy',
    items: [
      'Diagnostic pitching with shadow audit evidence packages',
      'High-value account acquisition through data-backed proposals',
      'Consulting contract support with proprietary ground-truth data',
      'Competitive intelligence positioning for growth teams',
    ],
  },
]

// ─── Data Pulse Visual ───────────────────────────────────────────────────────

function DataPulse() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height
    const accent = '#C2622A'
    const accentLight = '#E8835A'

    const nodes: { x: number; y: number; vx: number; vy: number; r: number; pulse: number; phase: number }[] = []
    const COUNT = 18
    for (let i = 0; i < COUNT; i++) {
      nodes.push({
        x: 60 + Math.random() * (W - 120),
        y: 60 + Math.random() * (H - 120),
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: 3 + Math.random() * 4,
        pulse: 0,
        phase: Math.random() * Math.PI * 2,
      })
    }

    let frame = 0
    let raf: number

    const draw = () => {
      frame++
      ctx.clearRect(0, 0, W, H)

      nodes.forEach(n => {
        n.x += n.vx
        n.y += n.vy
        if (n.x < 40 || n.x > W - 40) n.vx *= -1
        if (n.y < 40 || n.y > H - 40) n.vy *= -1
        n.pulse = Math.sin(frame * 0.04 + n.phase) * 0.5 + 0.5
      })

      // Edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.35
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.strokeStyle = `rgba(194, 98, 42, ${alpha})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      }

      // Nodes
      nodes.forEach(n => {
        const glow = 8 + n.pulse * 16
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glow)
        grad.addColorStop(0, `rgba(194, 98, 42, ${0.15 + n.pulse * 0.1})`)
        grad.addColorStop(1, 'rgba(194, 98, 42, 0)')
        ctx.beginPath()
        ctx.arc(n.x, n.y, glow, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()

        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fillStyle = n.pulse > 0.7 ? accentLight : accent
        ctx.globalAlpha = 0.7 + n.pulse * 0.3
        ctx.fill()
        ctx.globalAlpha = 1
      })

      // Floating labels
      if (frame % 180 === 0 || frame === 1) {
        const labels = ['Sentiment', 'Trust', 'Reach', 'Intent', 'Slang', 'Pulse']
        const node = nodes[Math.floor(Math.random() * nodes.length)]
        ctx.font = '11px Plus Jakarta Sans, sans-serif'
        ctx.fillStyle = 'rgba(194, 98, 42, 0.6)'
        ctx.fillText(labels[Math.floor(Math.random() * labels.length)], node.x + 10, node.y - 6)
      }

      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={460}
      height={400}
      className="w-full max-w-[460px] h-auto opacity-90"
    />
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="min-h-screen flex items-center pt-20" style={{ backgroundColor: '#F7F7F7' }}>
      <div className="max-w-6xl mx-auto px-6 py-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: copy */}
          <div className="flex flex-col gap-8">
            <div className="inline-flex items-center gap-2 self-start">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#C2622A' }} />
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#C2622A' }}>
                Ground-Truth Intelligence
              </span>
            </div>
            <h1
              className="text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight"
              style={{ color: '#222222' }}
            >
              Bridging the Reality Gap Between Leadership and Public Sentiment.
            </h1>
            <p className="text-lg leading-relaxed max-w-lg" style={{ color: '#555555' }}>
              SocialInsight decodes high-volume public comment streams, slang, and localized nuances to reveal the unvarnished ground-truth intelligence brands and governments miss.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                className="px-7 py-3.5 rounded-full text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-95"
                style={{ backgroundColor: '#C2622A', color: '#FFFFFF' }}
              >
                Request a Diagnostic Audit
              </button>
              <a
                href="#use-cases"
                className="px-7 py-3.5 rounded-full text-sm font-semibold border transition-all duration-200 hover:border-neutral-400"
                style={{ borderColor: '#D4D4D4', color: '#222222' }}
              >
                Explore Use Cases
              </a>
            </div>
            {/* Stat bar */}
            <div className="flex gap-8 pt-4 border-t" style={{ borderColor: '#E5E5E5' }}>
              {[
                { value: '40M+', label: 'Comments Analyzed' },
                { value: '12', label: 'Local Languages Decoded' },
                { value: '98%', label: 'Narrative Accuracy' },
              ].map(s => (
                <div key={s.label}>
                  <div className="text-2xl font-bold" style={{ color: '#222222' }}>
                    {s.value}
                  </div>
                  <div className="text-xs font-medium mt-0.5" style={{ color: '#888888' }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: data pulse */}
          <div className="flex items-center justify-center">
            <div
              className="relative w-full max-w-[460px] rounded-3xl overflow-hidden border"
              style={{ backgroundColor: '#FAFAFA', borderColor: '#E5E5E5', aspectRatio: '1.15' }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <DataPulse />
              </div>
              {/* Floating badge */}
              <div
                className="absolute bottom-5 left-5 px-4 py-2 rounded-2xl border text-xs font-semibold"
                style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5', color: '#222222' }}
              >
                Live Sentiment Pulse ·{' '}
                <span style={{ color: '#C2622A' }}>Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Core Problem ──────────────────────────────────────────────────────────────

function CoreProblem() {
  return (
    <section className="py-28" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#C2622A' }}>
            The Perception Gap
          </p>
          <h2 className="text-4xl font-bold tracking-tight" style={{ color: '#222222' }}>
            Why organizations operate blind.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x" style={{ borderColor: '#E5E5E5', border: '1px solid #E5E5E5', borderRadius: '16px', overflow: 'hidden' }}>
          {problems.map((p, i) => (
            <div key={i} className="p-8 lg:p-10" style={{ backgroundColor: '#FAFAFA' }}>
              <span className="text-xs font-mono font-semibold" style={{ color: '#C2622A' }}>
                {p.number}
              </span>
              <h3 className="text-xl font-bold mt-4 mb-3" style={{ color: '#222222' }}>
                {p.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '#666666' }}>
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── What We Do ────────────────────────────────────────────────────────────────

function WhatWeDo() {
  return (
    <section className="py-28" style={{ backgroundColor: '#F7F7F7' }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#C2622A' }}>
            What We Do
          </p>
          <h2 className="text-4xl font-bold tracking-tight" style={{ color: '#222222' }}>
            Ground truth, not guesswork.
          </h2>
        </div>
        <div className="flex flex-col gap-6">
          {differentiators.map((d, i) => (
            <div
              key={i}
              className="grid grid-cols-1 lg:grid-cols-5 rounded-2xl border overflow-hidden"
              style={{ borderColor: '#E5E5E5', backgroundColor: '#FFFFFF' }}
            >
              {/* Label column */}
              <div
                className="lg:col-span-1 p-6 flex items-start"
                style={{ backgroundColor: '#222222' }}
              >
                <h3 className="text-sm font-bold leading-snug" style={{ color: '#F7F7F7' }}>
                  {d.label}
                </h3>
              </div>
              {/* Traditional */}
              <div className="lg:col-span-2 p-6 border-b lg:border-b-0 lg:border-r" style={{ borderColor: '#E5E5E5' }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#AAAAAA' }}>
                  Traditional Approach
                </p>
                <p className="text-sm leading-relaxed" style={{ color: '#888888' }}>
                  {d.traditional}
                </p>
              </div>
              {/* Ground truth */}
              <div className="lg:col-span-2 p-6" style={{ backgroundColor: '#FFFAF7' }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#C2622A' }}>
                  SocialInsight Ground Truth
                </p>
                <p className="text-sm leading-relaxed" style={{ color: '#222222' }}>
                  {d.groundTruth}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Audiences ─────────────────────────────────────────────────────────────────

function Audiences() {
  return (
    <section id="audiences" className="py-28" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#C2622A' }}>
            Who Uses It
          </p>
          <h2 className="text-4xl font-bold tracking-tight" style={{ color: '#222222' }}>
            Built for those who need the truth.
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {audiences.map((a, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border flex flex-col gap-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-default"
              style={{ borderColor: '#E5E5E5', backgroundColor: '#FAFAFA' }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-light"
                style={{ backgroundColor: '#FFF0E8', color: '#C2622A' }}
              >
                {a.icon}
              </div>
              <h3 className="text-sm font-bold leading-snug" style={{ color: '#222222' }}>
                {a.title}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: '#777777' }}>
                {a.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Use Cases ─────────────────────────────────────────────────────────────────

function UseCases() {
  const [active, setActive] = useState(0)
  const tab = useCaseTabs[active]

  return (
    <section id="use-cases" className="py-28" style={{ backgroundColor: '#F7F7F7' }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#C2622A' }}>
            Comprehensive Use Cases
          </p>
          <h2 className="text-4xl font-bold tracking-tight" style={{ color: '#222222' }}>
            Five domains. One intelligence layer.
          </h2>
        </div>

        {/* Tab bar */}
        <div className="flex flex-wrap gap-2 mb-8">
          {useCaseTabs.map((t, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200"
              style={
                active === i
                  ? { backgroundColor: '#222222', color: '#F7F7F7' }
                  : { backgroundColor: '#FFFFFF', color: '#555555', border: '1px solid #E5E5E5' }
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div
          key={active}
          className="rounded-2xl border overflow-hidden"
          style={{ borderColor: '#E5E5E5', backgroundColor: '#FFFFFF' }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left: title + number */}
            <div className="p-10 lg:p-12 flex flex-col justify-between" style={{ backgroundColor: '#222222' }}>
              <div>
                <span className="text-xs font-mono" style={{ color: '#C2622A' }}>
                  0{active + 1} / 05
                </span>
                <h3 className="text-2xl font-bold mt-4 leading-snug" style={{ color: '#F7F7F7' }}>
                  {tab.title}
                </h3>
              </div>
              <p className="text-xs mt-8" style={{ color: '#888888' }}>
                Navigate tabs to explore all five operational categories.
              </p>
            </div>
            {/* Right: items */}
            <div className="p-10 lg:p-12 flex flex-col gap-5">
              {tab.items.map((item, j) => (
                <div key={j} className="flex items-start gap-4">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: '#FFF0E8' }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#C2622A' }} />
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: '#333333' }}>
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Footer CTA ────────────────────────────────────────────────────────────────

function FooterCTA() {
  return (
    <section className="py-28" style={{ backgroundColor: '#222222' }}>
      <div className="max-w-6xl mx-auto px-6 text-center flex flex-col items-center gap-8">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white"
          style={{ backgroundColor: '#C2622A' }}
        >
          S
        </div>
        <h2
          className="text-4xl lg:text-5xl font-bold tracking-tight max-w-2xl leading-tight"
          style={{ color: '#F7F7F7' }}
        >
          Stop operating in the blind.
        </h2>
        <p className="text-lg max-w-xl" style={{ color: '#AAAAAA' }}>
          Uncover the narrative ground-truth today. Your public has been speaking. It's time to actually listen.
        </p>
        <button
          className="px-8 py-4 rounded-full text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-95"
          style={{ backgroundColor: '#C2622A', color: '#FFFFFF' }}
        >
          Book a Consultation
        </button>
        <p className="text-xs" style={{ color: '#555555' }}>
          © 2024 SocialInsight. All rights reserved.
        </p>
      </div>
    </section>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function Landing() {

  const navigate = useNavigate();




// ─── Nav ─────────────────────────────────────────────────────────────────────

function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: scrolled ? 'rgba(247,247,247,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid #E5E5E5' : '1px solid transparent',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-11 h-11 rounded-xl  flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">
              <img src="/images/SocialInsightLogo.png" alt="Logo" /> </div>
          <span className="font-semibold text-base tracking-tight" style={{ color: '#222222' }}>
            SocialInsight
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#use-cases" className="text-sm font-medium" style={{ color: '#888888' }}>
            Use Cases
          </a>
          <a href="#audiences" className="text-sm font-medium" style={{ color: '#888888' }}>
            Who It's For
          </a>
         {/**} <button
            className="text-sm font-semibold px-4 py-2 rounded-full transition-all duration-200 hover:opacity-90 active:scale-95"
            style={{ backgroundColor: '#222222', color: '#F7F7F7' }}
          >
            Request Audit
          </button>**/}

          <div className="flex items-center gap-3">
            <AuthButtons/>
          </div>
        </div>
      </div>
    </nav>
  )
}



  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <Nav />
      <Hero />
      <CoreProblem />
      <WhatWeDo />
      <Audiences />
      <UseCases />
      <FooterCTA />
    </div>
  )
}
