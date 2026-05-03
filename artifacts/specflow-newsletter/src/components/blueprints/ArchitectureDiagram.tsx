import { useEffect, useRef } from "react";
import mermaid from "mermaid";

export interface ArchitectureDiagramProps {
  mermaidCode: string;
  description: string;
}

export default function ArchitectureDiagram({ mermaidCode, description }: ArchitectureDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      mermaid.initialize({ startOnLoad: true, theme: "default" });
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
      >
        <div className="mermaid">{mermaidCode}</div>
      </div>
    </section>
  );
}
