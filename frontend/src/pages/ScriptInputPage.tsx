import { useState } from "react";
import { useCreateVideoJob } from "../hooks/useCreateVideoJob";

interface Props {
  onJobCreated: (jobId: string) => void;
}

export default function ScriptInputPage({ onJobCreated }: Props) {
  const [script, setScript] = useState("");
  const createJob = useCreateVideoJob();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = script.trim();
    if (!trimmed) return;
    const result = await createJob.mutateAsync({ script: trimmed });
    onJobCreated(result.jobId);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500;600&display=swap');

        .sf-root {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 100vh;
          font-family: 'Outfit', sans-serif;
          background: #faf9f7;
          color: #0f0e11;
        }

        /* ── Left panel ── */
        .sf-panel-left {
          background: #0f0e11;
          padding: 48px 40px;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }
        .sf-panel-left::before {
          content: '';
          position: absolute;
          top: -80px; right: -80px;
          width: 320px; height: 320px;
          background: radial-gradient(circle, rgba(200,80,42,0.18) 0%, transparent 70%);
          pointer-events: none;
        }
        .sf-panel-left::after {
          content: '';
          position: absolute;
          bottom: -60px; left: -60px;
          width: 240px; height: 240px;
          background: radial-gradient(circle, rgba(212,168,67,0.1) 0%, transparent 70%);
          pointer-events: none;
        }

        .sf-wordmark {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 56px;
        }
        .sf-wordmark-icon {
          width: 34px; height: 34px;
          background: #c8502a;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
        }
        .sf-wordmark-text {
          font-family: 'Outfit', sans-serif;
          font-size: 14px; font-weight: 500;
          color: rgba(255,255,255,0.85);
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .sf-headline {
          font-family: 'DM Serif Display', serif;
          font-size: 42px; line-height: 1.1;
          color: #fff;
          margin-bottom: 14px;
        }
        .sf-headline em {
          color: #e8754f;
          font-style: italic;
        }
        .sf-subtext {
          font-size: 14px; font-weight: 300;
          color: rgba(255,255,255,0.4);
          line-height: 1.75;
          max-width: 280px;
          margin-bottom: 52px;
        }

        .sf-steps {
          display: flex;
          flex-direction: column;
          gap: 22px;
          margin-top: auto;
        }
        .sf-step {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }
        .sf-step-num {
          width: 28px; height: 28px; min-width: 28px;
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: rgba(255,255,255,0.35);
          margin-top: 1px;
          transition: all 0.2s;
        }
        .sf-step-num.active {
          background: #c8502a;
          border-color: #c8502a;
          color: #fff;
        }
        .sf-step-title {
          font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,0.82);
          margin-bottom: 2px;
        }
        .sf-step-desc {
          font-size: 12px; font-weight: 300;
          color: rgba(255,255,255,0.32);
        }

        /* ── Right panel ── */
        .sf-panel-right {
          padding: 48px 44px;
          display: flex;
          flex-direction: column;
          background: #faf9f7;
        }

        .sf-eyebrow {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #7c7889;
          margin-bottom: 28px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .sf-eyebrow::before {
          content: '';
          display: inline-block;
          width: 20px; height: 1px;
          background: #c8502a;
        }

        .sf-form-title {
          font-family: 'DM Serif Display', serif;
          font-size: 30px;
          color: #0f0e11;
          margin-bottom: 6px;
          line-height: 1.2;
        }
        .sf-form-sub {
          font-size: 13px; font-weight: 300;
          color: #7c7889;
          line-height: 1.65;
          margin-bottom: 32px;
        }

        .sf-textarea-wrap {
          position: relative;
          flex: 1;
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
        }
        .sf-textarea {
          flex: 1;
          min-height: 220px;
          resize: none;
          background: #f2f0ec;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 14px;
          padding: 18px 20px;
          font-family: 'Outfit', sans-serif;
          font-size: 14px; font-weight: 300;
          color: #0f0e11;
          line-height: 1.75;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
        }
        .sf-textarea::placeholder {
          color: #9e9aa8;
          font-style: italic;
        }
        .sf-textarea:focus {
          border-color: #c8502a;
          box-shadow: 0 0 0 3px rgba(200,80,42,0.08);
          background: #faf9f7;
        }
        .sf-char-count {
          position: absolute;
          bottom: 12px; right: 14px;
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: #b0aab8;
          pointer-events: none;
        }

        .sf-btn-primary {
          background: #c8502a;
          border: none;
          border-radius: 10px;
          padding: 14px 28px;
          font-family: 'Outfit', sans-serif;
          font-size: 14px; font-weight: 500;
          color: #fff;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: background 0.2s, transform 0.15s;
          letter-spacing: 0.01em;
        }
        .sf-btn-primary:hover:not(:disabled) {
          background: #b34420;
          transform: translateY(-1px);
        }
        .sf-btn-primary:active:not(:disabled) {
          transform: translateY(0);
        }
        .sf-btn-primary:disabled {
          background: #e8e4de;
          color: #9e9aa8;
          cursor: not-allowed;
        }

        .sf-error {
          margin-top: 14px;
          padding: 10px 14px;
          background: rgba(200,50,42,0.07);
          border: 1px solid rgba(200,50,42,0.2);
          border-radius: 8px;
          font-size: 13px; font-weight: 300;
          color: #8b2015;
          display: flex; align-items: center; gap: 8px;
        }

        @media (max-width: 768px) {
          .sf-root { grid-template-columns: 1fr; }
          .sf-panel-left { display: none; }
        }
      `}</style>

      <div className="sf-root">
        {/* Left — branding & steps */}
        <div className="sf-panel-left">
          <div className="sf-wordmark">
            <div className="sf-wordmark-icon">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M2 14L9 2L16 14Z" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round"/>
                <line x1="5" y1="10" x2="13" y2="10" stroke="#fff" strokeWidth="1.8"/>
              </svg>
            </div>
            <span className="sf-wordmark-text">Scriptframe</span>
          </div>

          <h1 className="sf-headline">
            Turn words<br/>into <em>moving</em><br/>pictures.
          </h1>
          <p className="sf-subtext">
            Paste a script, hit generate. Our pipeline handles voices, visuals, and timing automatically.
          </p>

          <div className="sf-steps">
            {[
              { n: 1, title: "Write your script", desc: "Any length, any format", active: true },
              { n: 2, title: "AI processes your job", desc: "Renders scenes & audio" },
              { n: 3, title: "Download your video", desc: "MP4 ready to publish" },
            ].map(s => (
              <div key={s.n} className="sf-step">
                <div className={`sf-step-num${s.active ? " active" : ""}`}>{s.n}</div>
                <div>
                  <div className="sf-step-title">{s.title}</div>
                  <div className="sf-step-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — form */}
        <div className="sf-panel-right">
          <div className="sf-eyebrow">Step 01 — Script</div>
          <h2 className="sf-form-title">Write your script</h2>
          <p className="sf-form-sub">
            Describe scenes, narration, or dialogue.<br/>Plain English works great.
          </p>

          <form
            onSubmit={onSubmit}
            style={{ display: "flex", flexDirection: "column", flex: 1 }}
          >
            <div className="sf-textarea-wrap">
              <textarea
                className="sf-textarea"
                value={script}
                onChange={e => setScript(e.target.value)}
                placeholder="Scene 1: A lone cyclist crests a sunlit hill at dawn. Narrator: 'Every journey begins with a single choice…'"
              />
              <span className="sf-char-count">{script.length} chars</span>
            </div>

            <button
              type="submit"
              className="sf-btn-primary"
              disabled={createJob.isPending || !script.trim()}
            >
              {createJob.isPending ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                  Creating job…
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                  Generate video
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>

            {createJob.isError && (
              <div className="sf-error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Failed to create job. Please try again.
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}