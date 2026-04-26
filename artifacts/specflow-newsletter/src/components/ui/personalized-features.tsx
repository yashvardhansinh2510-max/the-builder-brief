'use client'

import { cn } from '@/lib/utils'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Bold, Calendar1, Ellipsis, Italic, Strikethrough, Underline } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function PersonalizedBuildBriefFeatures() {
    return (
        <section className="bg-background/50 border-y border-border/40 py-24">
            <div className="mx-auto w-full max-w-5xl px-6 text-center">
                <div className="mb-16">
                    <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Ship faster</p>
                    <h2 className="text-foreground mt-4 text-4xl md:text-5xl font-serif">Personal Startup Assistant</h2>
                    <p className="text-muted-foreground mt-4 text-balance text-lg max-w-2xl mx-auto">The Build Brief lives a single blueprint away - ready to guide you through every step of your build. Get instant roadmaps whether you're validating, coding, or scaling.</p>
                </div>

                <div className="grid gap-8 sm:grid-cols-2">
                    <Card
                        className="p-8 border-border/40 bg-card/60 backdrop-blur-sm rounded-[2rem]">
                        <div className="flex aspect-video items-center justify-center mb-8">
                            <CodeIllustration className="w-full" />
                        </div>
                        <div>
                            <h3 className="text-foreground text-2xl font-serif">Marketing Campaigns</h3>
                            <p className="text-muted-foreground mt-4 text-balance">Effortlessly plan and execute your marketing campaigns with our automated blueprints.</p>
                        </div>
                    </Card>
                    <Card
                        className="p-8 border-border/40 bg-card/60 backdrop-blur-sm rounded-[2rem]">
                        <div className="flex aspect-video items-center justify-center mb-8">
                            <ScheduleIllustation className="border border-border/40" />
                        </div>
                        <div>
                            <h3 className="text-foreground text-2xl font-serif">Build Scheduler</h3>
                            <p className="text-muted-foreground mt-4 text-balance">Stay on track with daily milestones and automated reminders for your next venture.</p>
                        </div>
                    </Card>
                </div>
            </div>
        </section>
    )
}

type IllustrationProps = {
    className?: string
    variant?: 'elevated' | 'outlined' | 'mixed'
}

export const ScheduleIllustation = ({ className, variant = 'mixed' }: IllustrationProps) => {
    return (
        <div className={cn('relative', className)}>
            <div
                className={cn('bg-background -translate-x-1/8 absolute flex -translate-y-[110%] items-center gap-2 rounded-lg p-2 border border-border/40 shadow-xl', {
                    'shadow-black-950/10 shadow-lg': variant === 'elevated',
                    'border-foreground/10 border': variant === 'outlined',
                    'border-foreground/10 border shadow-md shadow-black/5': variant === 'mixed',
                })}>
                <Button
                    size="sm"
                    className="rounded-md bg-primary text-primary-foreground">
                    <Calendar1 className="size-3 mr-2" />
                    <span className="text-xs font-medium">Schedule Build</span>
                </Button>
                <span className="bg-border block h-4 w-px"></span>
                <ToggleGroup
                    type="multiple"
                    size="sm"
                    className="gap-0.5 *:rounded-md">
                    <ToggleGroupItem
                        value="bold"
                        aria-label="Toggle bold">
                        <Bold className="size-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value="italic"
                        aria-label="Toggle italic">
                        <Italic className="size-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value="underline"
                        aria-label="Toggle underline">
                        <Underline className="size-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value="strikethrough"
                        aria-label="Toggle strikethrough">
                        <Strikethrough className="size-4" />
                    </ToggleGroupItem>
                </ToggleGroup>
                <span className="bg-border block h-4 w-px"></span>
                <Button
                    size="icon"
                    className="size-8"
                    variant="ghost">
                    <Ellipsis className="size-3" />
                </Button>
            </div>
            <div className="p-4 bg-muted/30 rounded-xl">
                <span className="bg-primary/20 text-primary py-1 px-2 rounded-md font-medium">Friday 8:30 pm</span> <span className="text-muted-foreground">is our priority launch.</span>
            </div>
        </div>
    )
}

export const CodeIllustration = ({ className }: { className?: string }) => {
    return (
        <div className={cn('[mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_50%,transparent_100%)]', className)}>
            <ul className="text-muted-foreground mx-auto w-fit font-serif text-3xl font-medium space-y-2">
                {['Validation', 'Blueprint', 'MVP Build', 'First Revenue', 'Growth'].map((item, index) => (
                    <li
                        key={index}
                        className={cn("transition-all duration-300", index === 2 ? "text-primary scale-110" : "opacity-40")}>
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    )
} 
