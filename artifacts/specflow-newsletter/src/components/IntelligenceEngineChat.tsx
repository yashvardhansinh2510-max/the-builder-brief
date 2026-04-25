"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
    ImageIcon,
    FileUp,
    Figma,
    MonitorIcon,
    CircleUserRound,
    ArrowUpIcon,
    Terminal,
    Megaphone,
    Briefcase,
} from "lucide-react";

interface UseAutoResizeTextareaProps {
    minHeight: number;
    maxHeight?: number;
}

function useAutoResizeTextarea({
    minHeight,
    maxHeight,
}: UseAutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            // Temporarily shrink to get the right scrollHeight
            textarea.style.height = `${minHeight}px`;

            // Calculate new height
            const newHeight = Math.max(
                minHeight,
                Math.min(
                    textarea.scrollHeight,
                    maxHeight ?? Number.POSITIVE_INFINITY
                )
            );

            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        // Set initial height
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    // Adjust height on window resize
    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

export function IntelligenceEngineChat() {
    const [value, setValue] = useState("");
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 60,
        maxHeight: 200,
    });

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (value.trim()) {
                setValue("");
                adjustHeight(true);
            }
        }
    };

    return (
        <div className="flex flex-col items-center w-full mx-auto space-y-6 h-full justify-center">
            <h3 className="font-serif text-3xl font-bold text-foreground text-center">
                What can I help you ship?
            </h3>

            <div className="w-full">
                <div className="relative bg-card/60 backdrop-blur-xl rounded-[2rem] border border-border/40 shadow-2xl overflow-hidden focus-within:border-primary/50 transition-colors duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                    <div className="overflow-y-auto relative z-10 p-2">
                        <Textarea
                            ref={textareaRef}
                            value={value}
                            onChange={(e) => {
                                setValue(e.target.value);
                                adjustHeight();
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask the Intelligence Engine..."
                            className={cn(
                                "w-full px-4 py-3",
                                "resize-none",
                                "bg-transparent",
                                "border-none",
                                "text-foreground text-sm",
                                "focus:outline-none",
                                "focus-visible:ring-0 focus-visible:ring-offset-0",
                                "placeholder:text-muted-foreground placeholder:text-sm",
                                "min-h-[60px]"
                            )}
                            style={{
                                overflow: "hidden",
                            }}
                        />
                    </div>

                    <div className="flex items-center justify-between p-3 relative z-10 border-t border-border/40 bg-background/50">
                        <div className="flex items-center gap-2">
                            {/* Attachments are currently disabled in the platform */}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                className={cn(
                                    "px-2.5 py-2.5 rounded-xl text-sm transition-all border flex items-center justify-center gap-1",
                                    value.trim()
                                        ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
                                        : "bg-muted border-border/50 text-muted-foreground"
                                )}
                            >
                                <ArrowUpIcon
                                    className="w-4 h-4"
                                />
                                <span className="sr-only">Send</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
                    <ActionButton
                        icon={<Terminal className="w-3.5 h-3.5" />}
                        label="Act as a Technical Founder"
                    />
                    <ActionButton
                        icon={<Megaphone className="w-3.5 h-3.5" />}
                        label="Act as a Growth Marketer"
                    />
                    <ActionButton
                        icon={<Briefcase className="w-3.5 h-3.5" />}
                        label="Act as a Venture Capitalist"
                    />
                </div>
            </div>
        </div>
    );
}

interface ActionButtonProps {
    icon: React.ReactNode;
    label: string;
}

function ActionButton({ icon, label }: ActionButtonProps) {
    return (
        <button
            type="button"
            className="flex items-center gap-2 px-3 py-1.5 bg-card/50 hover:bg-primary/10 rounded-full border border-border/50 hover:border-primary/30 text-muted-foreground hover:text-primary transition-all text-xs shadow-sm hover:shadow-primary/5 hover:-translate-y-0.5"
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}
