import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";

export interface ArchitectureDiagramProps {
  mermaidCode: string;
  description: string;
}

export default function ArchitectureDiagram({
  mermaidCode,
  description
}: ArchitectureDiagramProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize mermaid once on mount
  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: "default" });
  }, []);

  // Re-render diagram when mermaidCode changes
  useEffect(() => {
    if (containerRef.current) {
      const mermaidDiv = containerRef.current.querySelector('.mermaid');
      if (mermaidDiv) {
        mermaidDiv.removeAttribute('data-processed');
      }
      mermaid.run();
    }
  }, [mermaidCode]);

  return (
    <section className="py-12 border-b border-border">
      <h2 className="text-2xl font-serif mb-4">Technical Architecture</h2>
      <p className="text-muted-foreground mb-8">{description}</p>
      <div
        ref={containerRef}
        className="bg-slate-50 p-8 rounded-lg overflow-x-auto border border-border"
        aria-label="Technical architecture diagram"
      >
        <div className="mermaid" aria-hidden="true">{mermaidCode}</div>
      </div>
    </section>
  );
}
