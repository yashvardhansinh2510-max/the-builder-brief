import { ArrowRight, Lock, Sparkles } from "lucide-react";
import type { Lesson } from "@/lib/playbook";

interface PlaybookModule {
  id?: string;
  slug?: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

interface PlaybookTabProps {
  activePlaybook: PlaybookModule[];
  isPro: boolean;
  onLessonOpen: (lesson: Lesson) => void;
}

export default function PlaybookTab({
  activePlaybook,
  isPro,
  onLessonOpen,
}: PlaybookTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {activePlaybook.map((module) => (
        <div
          key={module.id || module.slug}
          className="group flex flex-col bg-card/40 border border-border/20 rounded-[2.5rem] p-8 hover:border-primary/30 transition-all overflow-hidden relative backdrop-blur-sm shadow-xl shadow-primary/[0.02]"
        >
          <div className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 italic opacity-60">
              FOUNDRY_INTERNAL://
              {(module.id || module.slug || "").toUpperCase()}
            </p>
            <h3 className="font-serif text-2xl mb-3 group-hover:text-primary transition-colors">
              {module.title}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed font-sans line-clamp-2">
              {module.description}
            </p>
          </div>

          <div className="space-y-3">
            {module.lessons.map((lesson: Lesson) => (
              <button
                key={lesson.id || (lesson as any).slug}
                onClick={() => onLessonOpen(lesson)}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left ${lesson.free || isPro ? "bg-background/30 border-border/40 hover:border-primary/40 hover:bg-background/50" : "bg-background/10 border-dashed border-border/20 opacity-50 cursor-not-allowed"}`}
              >
                <div className="flex items-center gap-3">
                  {lesson.free || isPro ? (
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                  <span className="text-[11px] font-medium tracking-tight font-sans">
                    {lesson.title}
                  </span>
                </div>
                {lesson.free || isPro ? (
                  <ArrowRight className="w-3 h-3 text-primary" />
                ) : (
                  <span className="text-[9px] font-bold text-muted-foreground/40 uppercase">
                    SERIES_A
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
