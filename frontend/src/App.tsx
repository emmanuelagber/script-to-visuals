import { useState } from "react";
import ScriptInputPage from "./pages/ScriptInputPage";
import JobStatusPage from "./pages/JobStatusPage";

export default function App() {
  const [jobId, setJobId] = useState<string | null>(null);

  return (
    <main className="app-shell">
      <h1>Script → Video Generator</h1>
      {!jobId ? (
        <ScriptInputPage onJobCreated={setJobId} />
      ) : (
        <JobStatusPage jobId={jobId} onReset={() => setJobId(null)} />
      )}
    </main>
  );
}
