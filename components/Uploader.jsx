// frontend/components/Uploader.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import { apiGet, apiPost, absoluteMediaUrl } from "../lib/api";

export default function Uploader({ styleKey = "anime", isPro = false }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [job, setJob] = useState(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [pro, setPro] = useState(!!isPro);
  const [sel, setSel] = useState(styleKey); // selected style comes from parent

  const inputRef = useRef(null);

  // Keep selected style in sync with parent prop
  useEffect(() => {
    setSel(styleKey || "anime");
  }, [styleKey]);

  // detect PRO (cookie)
  useEffect(() => {
    (async () => {
      try {
        const j = await apiGet("/api/me");
        if (j?.ok) setPro(!!j.pro);
      } catch {}
    })();
  }, []);

  function pickLocal(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/^video\//.test(f.type) && !/\.(mp4|mov|mkv|webm|3gp|3g2)$/i.test(f.name)) {
      setError("Please select a valid video file.");
      return;
    }
    setError("");
    setFile(f);
  }

  function onDragOver(e){ e.preventDefault(); e.stopPropagation(); setDragging(true); }
  function onDrop(e){
    e.preventDefault(); e.stopPropagation();
    const f = e.dataTransfer?.files?.[0];
    setDragging(false);
    if (!f) return;
    if (!/^video\//.test(f.type) && !/\.(mp4|mov|mkv|webm|3gp|3g2)$/i.test(f.name)) {
      setError("Please drop a valid video file.");
      return;
    }
    setError(""); setFile(f);
  }
  function onDragLeave(e){ e.preventDefault(); e.stopPropagation(); setDragging(false); }

  async function startUpload() {
    try {
      if (!file) { setError("Please choose a clip first."); return; }
      setUploading(true); setError(""); setJob(null);

      const form = new FormData();
      form.append("video", file);
      form.append("style", sel || "anime");  // use parent-provided style only
      form.append("pro", pro ? "1" : "0");
      form.append("wmStyle", "ribbon");

      const j = await apiPost("/api/remix", form);
      if (!j?.jobId) throw new Error("No job id returned from server.");
      setJob({ id: j.jobId, status: "queued" });

      let done = false;
      while (!done) {
        await new Promise(r => setTimeout(r, 1400));
        const s = await apiGet(`/api/status/${j.jobId}`);
        setJob(s);
        done = ["completed", "failed", "error"].includes(s?.status);
      }
    } catch (e) {
      console.error(e);
      setError(e?.message?.slice(0, 400) || "Something went wrong. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div id="uploader" className="uploader">
      {/* Drop zone */}
      <div
        className={`u-dropzone ${dragging ? "is-dragging" : ""}`}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragLeave={onDragLeave}
      >
        <div className="u-dropzone-inner">
          <div className="u-kaleido" />
          <div className="u-border" />
          <div className="u-content">
            <div className="u-icon">🎬</div>
            <div className="u-title">Drop your clip here</div>
            <div className="u-sub">MP4, MOV, MKV, WEBM (≤ 200 MB)</div>

            <button type="button" className="btn u-cta" onClick={() => inputRef.current?.click()} disabled={uploading}>
              Choose file
            </button>

            <input
              ref={inputRef}
              className="u-input"
              type="file"
              accept="video/*,.mp4,.mov,.mkv,.webm,.3gp,.3g2"
              onChange={pickLocal}
            />
          </div>
        </div>
      </div>

      {/* (No style grid here anymore) */}

      {/* Selected file row */}
      {file && (
        <div className="u-file-row">
          <div className="u-file-name" title={file.name}>{file.name}</div>
          <button type="button" className="btn" onClick={() => setFile(null)} disabled={uploading}>Clear</button>
          <button type="button" className="btn" onClick={startUpload} disabled={uploading}>
            {uploading ? "Uploading…" : "Remix"}
          </button>
        </div>
      )}

      {/* Status / errors */}
      {!!error && <div className="u-err">{error}</div>}
      {job && (
        <div className="mt-3 text-sm text-gray-300">
          Status: <strong>{job.status}</strong>
          {job?.watermarkApplied !== undefined && <> · Watermark: <strong>{job.watermarkApplied ? "ON" : "OFF"}</strong></>}
          {job?.wmStyle && <> · Style: <strong>{job.wmStyle}</strong></>}
          {job?.wmEngine && <> · Engine: <strong>{job.wmEngine}</strong></>}
        </div>
      )}

      {/* Result */}
      {job?.status === "completed" && job?.mediaUrl && (() => {
        const fileName = job.mediaUrl.split("/").pop();
        const directUrl = absoluteMediaUrl(job.mediaUrl);
        const downloadUrl = fileName ? absoluteMediaUrl(`/api/download/${fileName}`) : null;
        const dlLabel = (job?.pro || pro) ? "Download MP4 (HD • no watermark)" : "Download MP4 (watermarked)";
        return (
          <div className="u-result card p-6">
            <video src={directUrl} controls className="w-full rounded-lg" />
            <div className="mt-4 flex flex-wrap gap-2">
              {downloadUrl && <a className="btn" href={downloadUrl}>{dlLabel}</a>}
              <a className="btn secondary" href={directUrl} target="_blank" rel="noopener">Open in new tab</a>
              <button className="btn" onClick={() => navigator.clipboard.writeText(downloadUrl || directUrl)} type="button">
                Copy link
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
