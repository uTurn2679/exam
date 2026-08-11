"use client";

import { X, Download, Maximize2, ExternalLink } from "lucide-react";

type MediaViewerModalProps = {
  url: string | null;
  title?: string;
  isOpen: boolean;
  onClose: () => void;
};

export default function MediaViewerModal({ url, title = "Attachment Viewer", isOpen, onClose }: MediaViewerModalProps) {
  if (!isOpen || !url) return null;

  const isPdf = url.toLowerCase().endsWith(".pdf");

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = url;
    link.download = url.split("/").pop() || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 100,
      background: "rgba(11, 15, 25, 0.95)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      display: "flex",
      flexDirection: "column",
      padding: "1rem"
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.75rem 1.25rem",
        background: "rgba(30, 41, 59, 0.8)",
        borderRadius: "1rem",
        marginBottom: "1rem",
        border: "1px solid rgba(255, 255, 255, 0.1)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "white" }}>
          <Maximize2 size={18} color="#818cf8" />
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>{title}</h3>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline"
            style={{ background: "white", color: "#0f172a", fontSize: "0.85rem", padding: "0.4rem 0.85rem", borderRadius: "0.6rem" }}
          >
            <ExternalLink size={14} /> Open in New Tab
          </a>

          <button
            onClick={handleDownload}
            className="btn btn-primary"
            style={{ fontSize: "0.85rem", padding: "0.4rem 0.85rem", borderRadius: "0.6rem" }}
          >
            <Download size={14} /> Download File
          </button>

          <button
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer"
            }}
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: "1rem" }}>
        {isPdf ? (
          <iframe
            src={url}
            style={{ width: "100%", height: "100%", border: "none", borderRadius: "1rem" }}
            title={title}
          />
        ) : (
          <img
            src={url}
            alt={title}
            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: "1rem", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}
          />
        )}
      </div>
    </div>
  );
}
