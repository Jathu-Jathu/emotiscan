// // src/app/page.tsx
// "use client"

// import { useEffect, useRef, useState, useCallback } from "react"
// import { predictFromBlob, EmotionResult } from "@/lib/api"

// export default function Home() {
//   const videoRef = useRef<HTMLVideoElement>(null)
//   const canvasRef = useRef<HTMLCanvasElement>(null)
//   const intervalRef = useRef<NodeJS.Timeout | null>(null)

//   const [running, setRunning] = useState(false)
//   const [result, setResult] = useState<EmotionResult | null>(null)
//   const [error, setError] = useState<string | null>(null)
//   const [loading, setLoading] = useState(false)

//   async function startCamera() {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: { width: 640, height: 480, facingMode: "user" },
//       })

//       if (videoRef.current) {
//         videoRef.current.srcObject = stream
//         videoRef.current.play()
//         setRunning(true)
//         setError(null)
//       }
//     } catch {
//       setError("Camera access denied — please allow camera permission.")
//     }
//   }

//   function stopCamera() {
//     const stream = videoRef.current?.srcObject as MediaStream
//     stream?.getTracks().forEach((track) => track.stop())

//     if (videoRef.current) videoRef.current.srcObject = null
//     if (intervalRef.current) clearInterval(intervalRef.current)

//     setRunning(false)
//     setResult(null)
//   }

//   const analyzeFrame = useCallback(async () => {
//     if (!videoRef.current || !canvasRef.current) return

//     const video = videoRef.current
//     const canvas = canvasRef.current
//     const ctx = canvas.getContext("2d")

//     if (!ctx || video.readyState < 2) return

//     canvas.width = video.videoWidth
//     canvas.height = video.videoHeight
//     ctx.drawImage(video, 0, 0)

//     canvas.toBlob(
//       async (blob) => {
//         if (!blob) return
//         setLoading(true)

//         try {
//           const data = await predictFromBlob(blob)
//           setResult(data)
//         } catch {
//           setError("Cannot connect to backend — check if uvicorn is running.")
//         } finally {
//           setLoading(false)
//         }
//       },
//       "image/jpeg",
//       0.85
//     )
//   }, [])

//   useEffect(() => {
//     if (running) {
//       intervalRef.current = setInterval(analyzeFrame, 1500)
//     }

//     return () => {
//       if (intervalRef.current) clearInterval(intervalRef.current)
//     }
//   }, [running, analyzeFrame])

//   const emotion = result?.success ? result : null

//   return (
//     <main className="min-h-screen overflow-hidden bg-[#050816] text-white">
//       <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#2563eb55,transparent_35%),radial-gradient(circle_at_bottom_right,#9333ea55,transparent_35%)]" />

//       <section className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10">
//         <div className="grid w-full max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[1.2fr_0.8fr]">

//           {/* Left Side */}
//           <div className="flex flex-col justify-center">
//             <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-blue-200 backdrop-blur">
//               <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
//               AI Powered Real-Time Detection
//             </div>

//             <h1 className="mb-4 text-4xl font-bold leading-tight md:text-6xl">
//               Real-Time <span className="text-blue-400">Emotion</span> Recognition
//             </h1>

//             <p className="mb-8 max-w-xl text-base leading-7 text-gray-300 md:text-lg">
//               Detect facial emotions live through your camera using an AI model and view confidence scores instantly.
//             </p>

//             <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-3 shadow-2xl backdrop-blur-xl">
//               <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">

//                 <video
//                   ref={videoRef}
//                   className="h-full w-full object-cover"
//                   autoPlay
//                   muted
//                   playsInline
//                 />

//                 <canvas ref={canvasRef} className="hidden" />

//                 {!running && (
//                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0b1020]">
//                     <div className="mb-4 text-7xl">📷</div>
//                     <p className="text-sm text-gray-400">Camera is currently off</p>
//                   </div>
//                 )}

//                 {running && emotion && (
//                   <div className="absolute left-4 top-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/60 px-4 py-3 backdrop-blur-md">
//                     <span className="text-4xl">{emotion.emoji}</span>
//                     <div>
//                       <p className="text-lg font-semibold">{emotion.emotion}</p>
//                       <p className="text-xs text-gray-300">
//                         {emotion.confidence}% confidence
//                       </p>
//                     </div>
//                   </div>
//                 )}

//                 {running && result && !result.success && (
//                   <div className="absolute left-4 top-4 rounded-2xl bg-yellow-400 px-4 py-2 text-sm font-medium text-black">
//                     😕 {result.error}
//                   </div>
//                 )}

//                 {loading && (
//                   <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-xs text-gray-200 backdrop-blur">
//                     <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
//                     Analyzing...
//                   </div>
//                 )}

//                 {running && (
//                   <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-red-500/20 px-4 py-2 text-xs font-medium text-red-200 backdrop-blur">
//                     <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
//                     LIVE
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div className="mt-6 flex flex-wrap gap-4">
//               {!running ? (
//                 <button
//                   onClick={startCamera}
//                   className="rounded-2xl bg-blue-600 px-8 py-4 text-sm font-semibold shadow-lg shadow-blue-600/30 transition hover:scale-105 hover:bg-blue-500"
//                 >
//                   🎥 Start Camera
//                 </button>
//               ) : (
//                 <button
//                   onClick={stopCamera}
//                   className="rounded-2xl bg-red-600 px-8 py-4 text-sm font-semibold shadow-lg shadow-red-600/30 transition hover:scale-105 hover:bg-red-500"
//                 >
//                   ⏹ Stop Camera
//                 </button>
//               )}
//             </div>

//             {error && (
//               <div className="mt-5 max-w-xl rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-200">
//                 ⚠️ {error}
//               </div>
//             )}
//           </div>

//           {/* Right Side Result Panel */}
//           <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
//             <h2 className="mb-2 text-2xl font-bold">Emotion Dashboard</h2>
//             <p className="mb-6 text-sm text-gray-400">
//               Live prediction summary and emotion probability scores.
//             </p>

//             <div className="mb-6 rounded-3xl border border-white/10 bg-black/30 p-6 text-center">
//               {emotion ? (
//                 <>
//                   <div className="mb-3 text-7xl">{emotion.emoji}</div>
//                   <h3 className="text-3xl font-bold">{emotion.emotion}</h3>
//                   <p className="mt-2 text-blue-300">
//                     {emotion.confidence}% confidence
//                   </p>
//                 </>
//               ) : (
//                 <>
//                   <div className="mb-3 text-6xl">🤖</div>
//                   <h3 className="text-xl font-semibold">Waiting for detection</h3>
//                   <p className="mt-2 text-sm text-gray-400">
//                     Start camera to see emotion results.
//                   </p>
//                 </>
//               )}
//             </div>

//             {emotion ? (
//               <div>
//                 <p className="mb-4 text-xs uppercase tracking-[0.25em] text-gray-400">
//                   Probability Scores
//                 </p>

//                 <div className="space-y-4">
//                   {Object.entries(emotion.all_scores)
//                     .sort((a, b) => b[1] - a[1])
//                     .map(([emo, score]) => (
//                       <div key={emo}>
//                         <div className="mb-1 flex justify-between text-sm">
//                           <span className="capitalize text-gray-300">{emo}</span>
//                           <span className="text-gray-400">{score}%</span>
//                         </div>

//                         <div className="h-3 overflow-hidden rounded-full bg-white/10">
//                           <div
//                             className={`h-full rounded-full transition-all duration-700 ${
//                               emo === emotion.emotion
//                                 ? "bg-blue-500"
//                                 : "bg-gray-600"
//                             }`}
//                             style={{ width: `${score}%` }}
//                           />
//                         </div>
//                       </div>
//                     ))}
//                 </div>
//               </div>
//             ) : (
//               <div className="rounded-2xl border border-dashed border-white/10 p-5 text-center text-sm text-gray-500">
//                 No prediction data yet.
//               </div>
//             )}
//           </div>
//         </div>
//       </section>
//     </main>
//   )
// }



"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { predictFromBlob, EmotionResult } from "@/lib/api"
import { jsPDF } from "jspdf"
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis,
} from "recharts"

const EMOTION_META: Record<string, { color: string; glow: string; bg: string; tip: string }> = {
  Happy:    { color: "#f9d923", glow: "rgba(249,217,35,0.35)",   bg: "rgba(249,217,35,0.08)",   tip: "Positive energy detected — keep it going ✨" },
  Sad:      { color: "#60a5fa", glow: "rgba(96,165,250,0.35)",   bg: "rgba(96,165,250,0.08)",   tip: "Low mood detected. A short break may help 💙" },
  Angry:    { color: "#f87171", glow: "rgba(248,113,113,0.35)",  bg: "rgba(248,113,113,0.08)",  tip: "Tension detected. Breathe slowly and relax." },
  Fear:     { color: "#c084fc", glow: "rgba(192,132,252,0.35)",  bg: "rgba(192,132,252,0.08)",  tip: "Anxious expression. Take a calm pause." },
  Surprise: { color: "#fb923c", glow: "rgba(251,146,60,0.35)",   bg: "rgba(251,146,60,0.08)",   tip: "Something caught your attention!" },
  Neutral:  { color: "#94a3b8", glow: "rgba(148,163,184,0.25)",  bg: "rgba(148,163,184,0.06)",  tip: "Neutral mood. System observing calmly." },
  Disgust:  { color: "#4ade80", glow: "rgba(74,222,128,0.35)",   bg: "rgba(74,222,128,0.08)",   tip: "Discomfort detected in expression." },
}

const CHART_COLORS = ["#f87171","#4ade80","#c084fc","#f9d923","#94a3b8","#60a5fa","#fb923c"]

type HistoryItem = { emotion: string; confidence: number; emoji: string; time: string }

export default function Home() {
  const videoRef    = useRef<HTMLVideoElement>(null)
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const [running,      setRunning]      = useState(false)
  const [result,       setResult]       = useState<EmotionResult | null>(null)
  const [error,        setError]        = useState<string | null>(null)
  const [loading,      setLoading]      = useState(false)
  const [history,      setHistory]      = useState<HistoryItem[]>([])
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [scanLine,     setScanLine]     = useState(0)

  // Animate scan line
  useEffect(() => {
    if (!running) return
    const t = setInterval(() => setScanLine(p => (p + 1) % 100), 20)
    return () => clearInterval(t)
  }, [running])

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setRunning(true)
        setError(null)
      }
    } catch {
      setError("Camera access denied — please allow camera permission.")
    }
  }

  function stopCamera() {
    const stream = videoRef.current?.srcObject as MediaStream
    stream?.getTracks().forEach(t => t.stop())
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (videoRef.current) videoRef.current.srcObject = null
    setRunning(false)
    setResult(null)
  }

  const speakEmotion = (emotion: string) => {
    if (!voiceEnabled || typeof window === "undefined") return
    const u = new SpeechSynthesisUtterance(`Detected emotion is ${emotion}`)
    u.rate = 0.95; u.pitch = 1
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(u)
  }

  const analyzeFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return
    const video  = videoRef.current
    const canvas = canvasRef.current
    const ctx    = canvas.getContext("2d")
    if (!ctx || video.readyState < 2) return
    canvas.width  = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)
    canvas.toBlob(async (blob) => {
      if (!blob) return
      setLoading(true)
      try {
        const data = await predictFromBlob(blob)
        setResult(data)
        if (data.success) {
          const item: HistoryItem = {
            emotion: data.emotion, confidence: data.confidence,
            emoji: data.emoji,
            time: new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit", second:"2-digit" }),
          }
          setHistory(prev => {
            const last    = prev[0]
            const updated = [item, ...prev].slice(0, 6)
            if (!last || last.emotion !== data.emotion) speakEmotion(data.emotion)
            return updated
          })
        }
      } catch {
        setError("Cannot connect to backend — check if uvicorn is running.")
      } finally {
        setLoading(false)
      }
    }, "image/jpeg", 0.85)
  }, [voiceEnabled])

  useEffect(() => {
    if (running) intervalRef.current = setInterval(analyzeFrame, 2500)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, analyzeFrame])

  const emotion   = result?.success ? result : null
  const meta      = emotion ? (EMOTION_META[emotion.emotion] ?? EMOTION_META.Neutral) : null
  const chartData = emotion
    ? Object.entries(emotion.all_scores).map(([name, value]) => ({ name, value }))
    : []

  const captureScreenshot = () => {
    if (!canvasRef.current || !emotion) return
    const link = document.createElement("a")
    link.download = `emotion-${emotion.emotion}-${Date.now()}.jpg`
    link.href = canvasRef.current.toDataURL("image/jpeg", 0.95)
    link.click()
  }

  const exportPDF = () => {
    if (!emotion) return
    const pdf = new jsPDF()
    pdf.setFontSize(22); pdf.text("Emotion Recognition Report", 20, 22)
    pdf.setFontSize(12); pdf.text("AI-powered real-time facial emotion detection", 20, 32)
    pdf.setFontSize(16)
    pdf.text(`Detected: ${emotion.emotion}`, 20, 55)
    pdf.text(`Confidence: ${emotion.confidence}%`, 20, 68)
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, 81)
    pdf.setFontSize(14); pdf.text("Probability Scores", 20, 105)
    let y = 120
    Object.entries(emotion.all_scores).sort((a,b) => b[1]-a[1]).forEach(([e,s]) => {
      pdf.text(`${e}: ${s}%`, 25, y); y += 10
    })
    if (history.length > 0) {
      y += 10; pdf.text("Emotion History", 20, y); y += 12
      history.forEach(item => { pdf.text(`${item.time} — ${item.emotion} (${item.confidence}%)`, 25, y); y += 10 })
    }
    pdf.save(`emotion-report-${Date.now()}.pdf`)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --cyan:   #00e5ff;
          --blue:   #0ea5e9;
          --indigo: #6366f1;
          --bg:     #020c14;
          --card:   rgba(255,255,255,0.03);
          --border: rgba(0,229,255,0.12);
          --text:   #e2e8f0;
          --muted:  #475569;
          --mono:   'Space Mono', monospace;
          --sans:   'Syne', sans-serif;
        }

        body { background: var(--bg); color: var(--text); font-family: var(--sans); }

        .root {
          min-height: 100vh;
          display: grid;
          grid-template-rows: auto 1fr;
          position: relative;
          overflow: hidden;
        }

        /* ── Ambient background ── */
        .ambient {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background:
            radial-gradient(ellipse 60% 50% at 10% 10%,  rgba(0,229,255,0.06) 0%, transparent 70%),
            radial-gradient(ellipse 50% 60% at 90% 80%,  rgba(99,102,241,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 50% 50%,  rgba(14,165,233,0.03) 0%, transparent 60%);
        }

        /* Grid overlay */
        .grid-bg {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            linear-gradient(rgba(0,229,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,229,255,0.025) 1px, transparent 1px);
          background-size: 48px 48px;
        }

        /* ── Navbar ── */
        nav {
          position: relative; z-index: 10;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 2rem;
          height: 60px;
          border-bottom: 1px solid var(--border);
          backdrop-filter: blur(12px);
          background: rgba(2,12,20,0.7);
        }

        .nav-logo {
          display: flex; align-items: center; gap: 10px;
          font-family: var(--mono); font-size: 15px; font-weight: 700;
          letter-spacing: 0.1em; color: var(--cyan);
        }

        .nav-logo-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--cyan);
          box-shadow: 0 0 10px var(--cyan), 0 0 20px var(--cyan);
          animation: pulse-dot 2s ease-in-out infinite;
        }

        @keyframes pulse-dot {
          0%,100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.5; transform: scale(0.8); }
        }

        .nav-pills { display: flex; gap: 8px; }

        .nav-pill {
          font-family: var(--mono); font-size: 11px; letter-spacing: 0.05em;
          padding: 5px 12px; border-radius: 20px;
          border: 1px solid var(--border);
          background: var(--card);
          color: var(--muted);
        }

        .nav-pill.live {
          border-color: rgba(0,229,255,0.4);
          color: var(--cyan);
          background: rgba(0,229,255,0.06);
        }

        /* ── Main layout ── */
        .content {
          position: relative; z-index: 10;
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 0;
          height: calc(100vh - 60px);
          overflow: hidden;
        }

        /* ── LEFT: Camera panel ── */
        .camera-panel {
          display: flex; flex-direction: column;
          padding: 20px 20px 20px 24px;
          gap: 16px;
          overflow: hidden;
          border-right: 1px solid var(--border);
        }

        .camera-header {
          display: flex; align-items: center; justify-content: space-between;
          flex-shrink: 0;
        }

        .camera-title {
          font-family: var(--mono); font-size: 11px;
          letter-spacing: 0.15em; color: var(--muted);
          text-transform: uppercase;
        }

        .status-badge {
          display: flex; align-items: center; gap: 6px;
          font-family: var(--mono); font-size: 10px;
          padding: 4px 10px; border-radius: 20px;
          border: 1px solid;
        }

        .status-badge.on  { border-color: rgba(0,229,255,0.4); color: var(--cyan);  background: rgba(0,229,255,0.06); }
        .status-badge.off { border-color: var(--border);        color: var(--muted); background: transparent; }

        .status-dot { width: 6px; height: 6px; border-radius: 50%; }
        .status-badge.on  .status-dot { background: var(--cyan); animation: pulse-dot 1.5s infinite; }
        .status-badge.off .status-dot { background: var(--muted); }

        /* Camera viewport */
        .camera-viewport {
          flex: 1;
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          background: #000;
          border: 1px solid var(--border);
          min-height: 0;
        }

        .camera-viewport video {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
        }

        canvas { display: none; }

        /* Scan overlay */
        .scan-overlay {
          position: absolute; inset: 0;
          pointer-events: none;
        }

        .scan-line {
          position: absolute; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, var(--cyan), transparent);
          box-shadow: 0 0 12px var(--cyan);
          transition: top 0.02s linear;
        }

        /* Corner brackets */
        .corner { position: absolute; width: 20px; height: 20px; }
        .corner.tl { top: 16px;  left: 16px;  border-top: 2px solid var(--cyan); border-left:  2px solid var(--cyan); }
        .corner.tr { top: 16px;  right: 16px; border-top: 2px solid var(--cyan); border-right: 2px solid var(--cyan); }
        .corner.bl { bottom: 16px; left: 16px;  border-bottom: 2px solid var(--cyan); border-left:  2px solid var(--cyan); }
        .corner.br { bottom: 16px; right: 16px; border-bottom: 2px solid var(--cyan); border-right: 2px solid var(--cyan); }

        /* Camera off state */
        .camera-off {
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 12px;
          background: #020c14;
        }

        .camera-off-icon { font-size: 56px; opacity: 0.3; }
        .camera-off-text { font-family: var(--mono); font-size: 12px; color: var(--muted); letter-spacing: 0.1em; }

        /* Emotion overlay on camera */
        .emotion-overlay {
          position: absolute; top: 16px; left: 16px;
          display: flex; align-items: center; gap: 12px;
          padding: 10px 16px;
          border-radius: 12px;
          border: 1px solid;
          backdrop-filter: blur(16px);
          transition: all 0.4s ease;
        }

        .emotion-overlay-emoji { font-size: 32px; line-height: 1; }
        .emotion-overlay-name  { font-family: var(--sans); font-size: 18px; font-weight: 800; }
        .emotion-overlay-conf  { font-family: var(--mono); font-size: 11px; opacity: 0.7; }

        /* Analyzing badge */
        .analyzing-badge {
          position: absolute; top: 16px; right: 16px;
          display: flex; align-items: center; gap: 6px;
          padding: 6px 12px; border-radius: 20px;
          background: rgba(0,0,0,0.7); backdrop-filter: blur(8px);
          border: 1px solid var(--border);
          font-family: var(--mono); font-size: 10px; color: var(--cyan);
        }

        /* Live badge */
        .live-badge {
          position: absolute; bottom: 16px; right: 16px;
          display: flex; align-items: center; gap: 6px;
          padding: 5px 12px; border-radius: 20px;
          background: rgba(239,68,68,0.15); backdrop-filter: blur(8px);
          border: 1px solid rgba(239,68,68,0.3);
          font-family: var(--mono); font-size: 10px;
          color: #fca5a5; letter-spacing: 0.1em;
        }

        /* Buttons row */
        .btn-row {
          display: flex; flex-wrap: wrap; gap: 8px;
          flex-shrink: 0;
        }

        .btn {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 10px;
          font-family: var(--mono); font-size: 11px; font-weight: 700;
          letter-spacing: 0.05em; cursor: pointer;
          border: 1px solid; transition: all 0.2s;
        }

        .btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .btn:not(:disabled):hover { transform: translateY(-1px); }

        .btn-primary { background: var(--cyan); color: #020c14; border-color: var(--cyan); box-shadow: 0 0 20px rgba(0,229,255,0.3); }
        .btn-primary:not(:disabled):hover { box-shadow: 0 0 30px rgba(0,229,255,0.5); }

        .btn-danger  { background: rgba(239,68,68,0.1); color: #f87171; border-color: rgba(239,68,68,0.3); }
        .btn-ghost   { background: var(--card); color: var(--text); border-color: var(--border); }

        /* Error */
        .error-bar {
          padding: 10px 14px; border-radius: 10px;
          background: rgba(239,68,68,0.07);
          border: 1px solid rgba(239,68,68,0.25);
          font-family: var(--mono); font-size: 11px; color: #fca5a5;
          flex-shrink: 0;
        }

        /* ── RIGHT: Dashboard panel ── */
        .dashboard {
          display: flex; flex-direction: column;
          height: 100%;
          overflow-y: auto;
          overflow-x: hidden;
          scrollbar-width: thin;
          scrollbar-color: var(--border) transparent;
        }

        .dashboard::-webkit-scrollbar { width: 4px; }
        .dashboard::-webkit-scrollbar-track { background: transparent; }
        .dashboard::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

        /* Dashboard section */
        .ds {
          padding: 20px;
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }

        .ds-label {
          font-family: var(--mono); font-size: 9px;
          letter-spacing: 0.2em; color: var(--muted);
          text-transform: uppercase; margin-bottom: 14px;
        }

        /* Emotion hero */
        .emotion-hero {
          display: flex; flex-direction: column;
          align-items: center; gap: 8px;
          padding: 20px;
          border-radius: 14px;
          border: 1px solid;
          text-align: center;
          transition: all 0.5s ease;
        }

        .hero-emoji  { font-size: 52px; line-height: 1; }
        .hero-name   { font-size: 28px; font-weight: 800; letter-spacing: -0.02em; }
        .hero-conf   { font-family: var(--mono); font-size: 12px; opacity: 0.6; }
        .hero-tip    { font-size: 12px; opacity: 0.7; line-height: 1.5; max-width: 260px; }

        .waiting-hero {
          padding: 24px 20px;
          border-radius: 14px;
          border: 1px dashed var(--border);
          text-align: center; color: var(--muted);
        }

        .waiting-hero .w-icon { font-size: 36px; opacity: 0.3; margin-bottom: 8px; }
        .waiting-hero p { font-family: var(--mono); font-size: 11px; letter-spacing: 0.05em; }

        /* Score bars */
        .score-bar-wrap { display: flex; flex-direction: column; gap: 8px; }

        .score-row { display: flex; flex-direction: column; gap: 4px; }
        .score-row-top {
          display: flex; justify-content: space-between; align-items: center;
          font-family: var(--mono); font-size: 10px;
        }
        .score-row-top .s-name { color: var(--text); }
        .score-row-top .s-val  { color: var(--muted); }

        .score-track {
          height: 4px; border-radius: 2px;
          background: rgba(255,255,255,0.06);
          overflow: hidden;
        }

        .score-fill {
          height: 100%; border-radius: 2px;
          transition: width 0.6s cubic-bezier(0.4,0,0.2,1);
        }

        /* Charts */
        .chart-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .chart-box  { background: rgba(0,0,0,0.3); border-radius: 10px; padding: 8px; }

        /* History */
        .history-list { display: flex; flex-direction: column; gap: 6px; }

        .history-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 8px 12px; border-radius: 10px;
          background: var(--card);
          border: 1px solid var(--border);
          transition: border-color 0.2s;
        }

        .history-item:hover { border-color: rgba(0,229,255,0.2); }

        .hi-left  { display: flex; align-items: center; gap: 8px; }
        .hi-emoji { font-size: 20px; }
        .hi-name  { font-size: 13px; font-weight: 700; }
        .hi-time  { font-family: var(--mono); font-size: 10px; color: var(--muted); }
        .hi-conf  {
          font-family: var(--mono); font-size: 10px; font-weight: 700;
          padding: 3px 8px; border-radius: 20px;
          background: rgba(0,229,255,0.08);
          border: 1px solid rgba(0,229,255,0.15);
          color: var(--cyan);
        }

        .empty-state {
          font-family: var(--mono); font-size: 11px;
          color: var(--muted); text-align: center;
          padding: 20px; letter-spacing: 0.05em;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .fade-in { animation: fadeIn 0.35s ease both; }
      `}</style>

      <div className="root">
        <div className="ambient" />
        <div className="grid-bg" />

        {/* ── Navbar ── */}
        <nav>
          <div className="nav-logo">
            <div className="nav-logo-dot" />
            EMOTISCAN
          </div>
          <div className="nav-pills">
            <div className={`nav-pill ${running ? "live" : ""}`}>
              {running ? "● LIVE" : "○ STANDBY"}
            </div>
            <div className="nav-pill">CNN MODEL</div>
            <div className="nav-pill">FASTAPI</div>
          </div>
        </nav>

        {/* ── Main ── */}
        <div className="content">

          {/* LEFT: Camera */}
          <div className="camera-panel">
            <div className="camera-header">
              <span className="camera-title">// camera feed</span>
              <div className={`status-badge ${running ? "on" : "off"}`}>
                <div className="status-dot" />
                {running ? "DETECTING" : "OFFLINE"}
              </div>
            </div>

            <div className="camera-viewport">
              <video ref={videoRef} autoPlay muted playsInline />
              <canvas ref={canvasRef} />

              {/* Scan overlay */}
              {running && (
                <div className="scan-overlay">
                  <div className="scan-line" style={{ top: `${scanLine}%` }} />
                  <div className="corner tl" /><div className="corner tr" />
                  <div className="corner bl" /><div className="corner br" />
                </div>
              )}

              {/* Camera off */}
              {!running && (
                <div className="camera-off">
                  <div className="camera-off-icon">⬛</div>
                  <div className="camera-off-text">CAMERA OFFLINE</div>
                  <div style={{ fontFamily:"var(--mono)", fontSize:10, color:"var(--muted)", marginTop:4 }}>
                    press START to begin detection
                  </div>
                </div>
              )}

              {/* Emotion overlay */}
              {running && emotion && meta && (
                <div className="emotion-overlay fade-in"
                  style={{
                    borderColor: meta.color + "40",
                    background: meta.bg,
                    boxShadow: `0 0 30px ${meta.glow}`,
                  }}>
                  <div className="emotion-overlay-emoji">{emotion.emoji}</div>
                  <div>
                    <div className="emotion-overlay-name" style={{ color: meta.color }}>{emotion.emotion}</div>
                    <div className="emotion-overlay-conf">{emotion.confidence}% confidence</div>
                  </div>
                </div>
              )}

              {/* No face */}
              {running && result && !result.success && (
                <div className="emotion-overlay fade-in" style={{ borderColor:"rgba(251,146,60,0.3)", background:"rgba(251,146,60,0.06)" }}>
                  <span>😕</span>
                  <span style={{ fontFamily:"var(--mono)", fontSize:11, color:"#fb923c" }}>No face detected</span>
                </div>
              )}

              {/* Analyzing */}
              {loading && (
                <div className="analyzing-badge">
                  <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--cyan)", display:"inline-block", animation:"pulse-dot 1s infinite" }} />
                  ANALYZING
                </div>
              )}

              {/* Live badge */}
              {running && (
                <div className="live-badge">
                  <span style={{ width:6, height:6, borderRadius:"50%", background:"#f87171", display:"inline-block", animation:"pulse-dot 1s infinite" }} />
                  REC
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="btn-row">
              {!running
                ? <button className="btn btn-primary" onClick={startCamera}>▶ START CAMERA</button>
                : <button className="btn btn-danger"  onClick={stopCamera}>■ STOP</button>
              }
              <button className="btn btn-ghost" onClick={() => setVoiceEnabled(p => !p)}>
                {voiceEnabled ? "🔊 VOICE" : "🔇 MUTED"}
              </button>
              <button className="btn btn-ghost" disabled={!emotion} onClick={captureScreenshot}>
                ⬇ CAPTURE
              </button>
              <button className="btn btn-ghost" disabled={!emotion} onClick={exportPDF}>
                ⬇ PDF
              </button>
            </div>

            {error && <div className="error-bar">⚠ {error}</div>}
          </div>

          {/* RIGHT: Dashboard */}
          <div className="dashboard">

            {/* Emotion hero */}
            <div className="ds">
              <div className="ds-label">// emotion state</div>
              {emotion && meta ? (
                <div className="emotion-hero fade-in"
                  style={{
                    borderColor: meta.color + "30",
                    background: meta.bg,
                    boxShadow: `inset 0 0 40px ${meta.glow}`,
                  }}>
                  <div className="hero-emoji">{emotion.emoji}</div>
                  <div className="hero-name" style={{ color: meta.color }}>{emotion.emotion}</div>
                  <div className="hero-conf">{emotion.confidence}% confidence</div>
                  <div className="hero-tip">{meta.tip}</div>
                </div>
              ) : (
                <div className="waiting-hero">
                  <div className="w-icon">🤖</div>
                  <p>AWAITING INPUT</p>
                </div>
              )}
            </div>

            {/* Probability bars */}
            {emotion && (
              <div className="ds">
                <div className="ds-label">// probability scores</div>
                <div className="score-bar-wrap">
                  {Object.entries(emotion.all_scores)
                    .sort(([,a],[,b]) => b - a)
                    .map(([emo, score]) => {
                      const c = EMOTION_META[emo]?.color ?? "#94a3b8"
                      const isTop = emo === emotion.emotion
                      return (
                        <div className="score-row" key={emo}>
                          <div className="score-row-top">
                            <span className="s-name" style={isTop ? { color: c, fontWeight:700 } : {}}>{emo}</span>
                            <span className="s-val">{score}%</span>
                          </div>
                          <div className="score-track">
                            <div className="score-fill" style={{ width:`${score}%`, background: isTop ? c : "rgba(255,255,255,0.15)" }} />
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}

            {/* Charts */}
            <div className="ds">
              <div className="ds-label">// analytics</div>
              {emotion ? (
                <div className="chart-grid">
                  <div className="chart-box">
                    <ResponsiveContainer width="100%" height={130}>
                      <PieChart>
                        <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={30} outerRadius={52} paddingAngle={2}>
                          {chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background:"#020c14", border:"1px solid var(--border)", borderRadius:8, fontSize:11, fontFamily:"var(--mono)" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="chart-box">
                    <ResponsiveContainer width="100%" height={130}>
                      <BarChart data={chartData} margin={{ top:4, right:4, left:-28, bottom:0 }}>
                        <XAxis dataKey="name" tick={{ fill:"#475569", fontSize:8 }} />
                        <YAxis tick={{ fill:"#475569", fontSize:8 }} />
                        <Tooltip contentStyle={{ background:"#020c14", border:"1px solid var(--border)", borderRadius:8, fontSize:11, fontFamily:"var(--mono)" }} />
                        <Bar dataKey="value" radius={[4,4,0,0]}>
                          {chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="empty-state">NO DATA YET</div>
              )}
            </div>

            {/* History */}
            <div className="ds">
              <div className="ds-label">// recent history</div>
              {history.length > 0 ? (
                <div className="history-list">
                  {history.map((item, i) => {
                    const c = EMOTION_META[item.emotion]?.color ?? "#94a3b8"
                    return (
                      <div className="history-item" key={`${item.time}-${i}`}>
                        <div className="hi-left">
                          <span className="hi-emoji">{item.emoji}</span>
                          <div>
                            <div className="hi-name" style={{ color: c }}>{item.emotion}</div>
                            <div className="hi-time">{item.time}</div>
                          </div>
                        </div>
                        <span className="hi-conf">{item.confidence}%</span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="empty-state">HISTORY EMPTY</div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  )
}