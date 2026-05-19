import { useVideoJob } from "../hooks/useVideoJob";
import VideoResult from "../components/VideoResult";

interface Props {
  jobId: string;
  onReset: () => void;
}

export default function JobStatusPage({ jobId, onReset }: Props) {
  const { data, isLoading, isError } = useVideoJob(jobId);

  const progress = data?.progress ?? 0;
  const status = data?.status ?? "pending";

  const statusConfig: Record<string, { label: string; cls: string; pulse: boolean }> = {
    pending:    { label: "Queued",     cls: "js-badge-pending",  pulse: true },
    processing: { label: "Processing", cls: "js-badge-proc",     pulse: true },
    done:       { label: "Completed",  cls: "js-badge-done",     pulse: false },
    failed:     { label: "Failed",     cls: "js-badge-failed",   pulse: false },
  };
  const badgeCfg = statusConfig[status] ?? statusConfig.pending;

  const logEntries = [
    { time: "0:00", msg: "Job queued & accepted",      done: progress >= 5 },
    { time: "0:08", msg: "Parsing script structure",   done: progress >= 20 },
    { time: "0:21", msg: "Generating scene descriptions", done: progress >= 40 },
    { time: "0:47", msg: "Synthesising voice narration",  done: progress >= 60 },
    { time: "1:12", msg: "Compositing visual frames",  done: progress >= 78 },
    { time: "1:38", msg: "Applying colour grading",    done: progress >= 90 },
    { time: "1:55", msg: "Encoding final output",      done: progress >= 100 },
  ].filter(e => e.done || progress >= 5);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500;600&display=swap');

        .js-root {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 100vh;
          font-family: 'Outfit', sans-serif;
          background: #faf9f7;
          color: #0f0e11;
        }

        /* ── Left panel ── */
        .js-panel-left {
          background: #0f0e11;
          padding: 48px 40px;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }
        .js-panel-left::before {
          content: '';
          position: absolute;
          top: -80px; right: -80px;
          width: 320px; height: 320px;
          background: radial-gradient(circle, rgba(200,80,42,0.18) 0%, transparent 70%);
          pointer-events: none;
        }
        .js-panel-left::after {
          content: '';
          position: absolute;
          bottom: -60px; left: -60px;
          width: 240px; height: 240px;
          background: radial-gradient(circle, rgba(212,168,67,0.1) 0%, transparent 70%);
          pointer-events: none;
        }

        .js-wordmark {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 56px;
        }
        .js-wordmark-icon {
          width: 34px; height: 34px;
          background: #c8502a;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
        }
        .js-wordmark-text {
          font-family: 'Outfit', sans-serif;
          font-size: 14px; font-weight: 500;
          color: rgba(255,255,255,0.85);
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .js-headline {
          font-family: 'DM Serif Display', serif;
          font-size: 42px; line-height: 1.1;
          color: #fff;
          margin-bottom: 14px;
        }
        .js-headline em { color: #e8754f; font-style: italic; }
        .js-subtext {
          font-size: 14px; font-weight: 300;
          color: rgba(255,255,255,0.4);
          line-height: 1.75;
          max-width: 280px;
          margin-bottom: 52px;
        }
        .js-steps {
          display: flex; flex-direction: column; gap: 22px;
          margin-top: auto;
        }
        .js-step { display: flex; align-items: flex-start; gap: 14px; }
        .js-step-num {
          width: 28px; height: 28px; min-width: 28px;
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-family: 'DM Mono', monospace;
          font-size: 11px; color: rgba(255,255,255,0.35);
          margin-top: 1px;
        }
        .js-step-num.active {
          background: #c8502a; border-color: #c8502a; color: #fff;
        }
        .js-step-title { font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.82); margin-bottom: 2px; }
        .js-step-desc { font-size: 12px; font-weight: 300; color: rgba(255,255,255,0.32); }

        /* ── Right panel ── */
        .js-panel-right {
          padding: 48px 44px;
          display: flex; flex-direction: column;
          background: #faf9f7;
        }

        .js-eyebrow {
          font-family: 'DM Mono', monospace;
          font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase;
          color: #7c7889; margin-bottom: 28px;
          display: flex; align-items: center; gap: 8px;
        }
        .js-eyebrow::before {
          content: ''; display: inline-block;
          width: 20px; height: 1px; background: #c8502a;
        }

        .js-title {
          font-family: 'DM Serif Display', serif;
          font-size: 30px; color: #0f0e11;
          margin-bottom: 6px; line-height: 1.2;
        }
        .js-sub {
          font-size: 13px; font-weight: 300; color: #7c7889;
          line-height: 1.65; margin-bottom: 28px;
        }

        /* Job ID chip */
        .js-id-chip {
          display: inline-flex; align-items: center; gap: 6px;
          background: #f2f0ec;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 20px;
          padding: 5px 12px;
          font-family: 'DM Mono', monospace;
          font-size: 11px; color: #7c7889;
          margin-bottom: 20px; align-self: flex-start;
        }
        .js-id-chip span { color: #3a3740; }

        /* Status badge */
        .js-badge {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 6px 14px; border-radius: 20px;
          font-size: 12px; font-weight: 500;
          letter-spacing: 0.02em;
          margin-bottom: 24px; align-self: flex-start;
        }
        .js-badge-pending, .js-badge-proc {
          background: rgba(212,168,67,0.12);
          color: #9a7320;
          border: 1px solid rgba(212,168,67,0.3);
        }
        .js-badge-done {
          background: rgba(40,160,80,0.1);
          color: #1a7a38;
          border: 1px solid rgba(40,160,80,0.25);
        }
        .js-badge-failed {
          background: rgba(200,50,42,0.08);
          color: #8b1a16;
          border: 1px solid rgba(200,50,42,0.2);
        }
        .js-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: currentColor;
        }
        @keyframes js-pulse {
          0%,100% { opacity: 1; } 50% { opacity: 0.3; }
        }
        .js-dot-pulse { animation: js-pulse 1.2s ease-in-out infinite; }

        /* Progress */
        .js-progress-wrap { margin-bottom: 24px; }
        .js-progress-header {
          display: flex; justify-content: space-between; align-items: baseline;
          margin-bottom: 10px;
        }
        .js-progress-label { font-size: 13px; font-weight: 400; color: #3a3740; }
        .js-progress-pct {
          font-family: 'DM Mono', monospace;
          font-size: 22px; font-weight: 500; color: #c8502a;
        }
        .js-track {
          width: 100%; height: 4px;
          background: #e8e4de; border-radius: 99px; overflow: hidden;
        }
        .js-fill {
          height: 100%;
          background: linear-gradient(90deg, #c8502a, #e8754f);
          border-radius: 99px;
          transition: width 0.6s ease;
        }

        /* Event log */
        .js-log {
          flex: 1; min-height: 160px;
          background: #f2f0ec;
          border: 1px solid rgba(0,0,0,0.07);
          border-radius: 14px;
          padding: 16px 18px;
          display: flex; flex-direction: column; gap: 10px;
          margin-bottom: 24px;
          overflow: auto;
        }
        .js-log-entry {
          display: flex; align-items: flex-start; gap: 10px;
        }
        .js-log-time {
          font-family: 'DM Mono', monospace;
          font-size: 10px; color: #b0aab8; margin-top: 2px; min-width: 38px;
        }
        .js-log-dot {
          width: 6px; height: 6px; min-width: 6px;
          border-radius: 50%; margin-top: 5px;
        }
        .js-log-dot-done { background: #28a050; }
        .js-log-dot-active { background: #e8754f; }
        .js-log-msg { font-size: 13px; font-weight: 300; color: #3a3740; }

        /* Error / loading states */
        .js-state-msg {
          padding: 14px 18px;
          border-radius: 10px;
          font-size: 13px; font-weight: 300;
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 16px;
        }
        .js-state-error {
          background: rgba(200,50,42,0.07);
          border: 1px solid rgba(200,50,42,0.18);
          color: #8b2015;
        }
        .js-state-loading {
          background: #f2f0ec;
          border: 1px solid rgba(0,0,0,0.07);
          color: #7c7889;
        }
        @keyframes js-spin { to { transform: rotate(360deg); } }
        .js-spinner {
          width: 14px; height: 14px; min-width: 14px;
          border: 1.5px solid #e8e4de;
          border-top-color: #c8502a;
          border-radius: 50%;
          animation: js-spin 0.8s linear infinite;
        }

        /* Footer nav */
        .js-nav-row {
          display: flex; align-items: center; gap: 10px;
          justify-content: flex-end;
        }
        .js-nav-hint { font-size: 12px; font-weight: 300; color: #9e9aa8; margin-right: auto; }
        .js-btn-ghost {
          background: transparent;
          border: 1px solid rgba(0,0,0,0.1);
          border-radius: 10px;
          padding: 10px 20px;
          font-family: 'Outfit', sans-serif;
          font-size: 13px; font-weight: 400;
          color: #3a3740; cursor: pointer;
          transition: background 0.18s, border-color 0.18s;
        }
        .js-btn-ghost:hover { background: #f2f0ec; border-color: #e8e4de; }

        @media (max-width: 768px) {
          .js-root { grid-template-columns: 1fr; }
          .js-panel-left { display: none; }
        }
      `}</style>

      <div className="js-root">
        {/* Left panel */}
        <div className="js-panel-left">
          <div className="js-wordmark">
            <div className="js-wordmark-icon">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M2 14L9 2L16 14Z" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round"/>
                <line x1="5" y1="10" x2="13" y2="10" stroke="#fff" strokeWidth="1.8"/>
              </svg>
            </div>
            <span className="js-wordmark-text">Scriptframe</span>
          </div>

          <h1 className="js-headline">
            Turn words<br/>into <em>moving</em><br/>pictures.
          </h1>
          <p className="js-subtext">
            Paste a script, hit generate. Our pipeline handles voices, visuals, and timing automatically.
          </p>

          <div className="js-steps">
            {[
              { n: 1, title: "Write your script", desc: "Any length, any format" },
              { n: 2, title: "AI processes your job", desc: "Renders scenes & audio", active: true },
              { n: 3, title: "Download your video", desc: "MP4 ready to publish" },
            ].map(s => (
              <div key={s.n} className="js-step">
                <div className={`js-step-num${s.active ? " active" : ""}`}>{s.n}</div>
                <div>
                  <div className="js-step-title">{s.title}</div>
                  <div className="js-step-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="js-panel-right">
          <div className="js-eyebrow">Step 02 — Rendering</div>
          <h2 className="js-title">Generating your video</h2>
          <p className="js-sub">Sit tight. This usually takes 1–3 minutes.</p>

          {/* Job ID */}
          <div className="js-id-chip">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M9 9h6M9 12h6M9 15h4"/>
            </svg>
            Job <span>{jobId}</span>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="js-state-msg js-state-loading">
              <span className="js-spinner"/>
              Fetching job status…
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="js-state-msg js-state-error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Failed to fetch job status. Retrying…
            </div>
          )}

          {/* Status badge */}
          {data && (
            <div className={`js-badge ${badgeCfg.cls}`}>
              <span className={`js-dot${badgeCfg.pulse ? " js-dot-pulse" : ""}`}/>
              {badgeCfg.label}
            </div>
          )}

          {/* Progress bar */}
          {data && (
            <div className="js-progress-wrap">
              <div className="js-progress-header">
                <span className="js-progress-label">Render progress</span>
                <span className="js-progress-pct">{progress}%</span>
              </div>
              <div className="js-track">
                <div className="js-fill" style={{ width: `${progress}%` }}/>
              </div>
            </div>
          )}

          {/* Event log */}
          {data && (
            <div className="js-log">
              {logEntries.map((e, i) => (
                <div key={i} className="js-log-entry">
                  <span className="js-log-time">{e.time}</span>
                  <span className={`js-log-dot ${e.done ? "js-log-dot-done" : "js-log-dot-active"}`}/>
                  <span className="js-log-msg">{e.msg}</span>
                </div>
              ))}
            </div>
          )}

          {/* Video result */}
          <VideoResult job={data ?? null} />

          {/* Footer */}
          <div className="js-nav-row">
            <span className="js-nav-hint">
              {status === "done" ? "Video rendered successfully!" : "Processing your script…"}
            </span>
            <button type="button" className="js-btn-ghost" onClick={onReset}>
              ← Start over
            </button>
          </div>
        </div>
      </div>
    </>
  );
}