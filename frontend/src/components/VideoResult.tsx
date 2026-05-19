 import type { VideoJobResponse } from "../api/videoApi";

interface Props {
  job: VideoJobResponse | null;
}

export default function VideoResult({ job }: Props) {
  if (!job) return null;

  if (job.status === "failed") {
    return (
      <div className="card">
        <h3>Result</h3>
        <p>Video generation failed. Please try a different script.</p>
      </div>
    );
  }

  if (job.status !== "done" || !job.videoUrl) {
    return (
      <div className="card">
        <h3>Result</h3>
        <p>Rendering in progress. Download will appear when ready.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3>Result</h3>
      <p>Your video is ready.</p>
      <a href={job.videoUrl} download>
        <button type="button">Download MP4</button>
      </a>
    </div>
  );
}
