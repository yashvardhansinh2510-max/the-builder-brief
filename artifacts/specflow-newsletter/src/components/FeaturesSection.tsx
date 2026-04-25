import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Target, LucideIcon, Users } from 'lucide-react'
import { ReactNode } from 'react'

export function FeaturesSection() {
    return (
        <section className="bg-background py-16 md:py-32 relative z-10">
            <div className="mx-auto max-w-2xl px-6 lg:max-w-5xl">
                <div className="text-center mb-16">
                    <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Complete Ecosystem</p>
                    <h2 className="font-serif text-4xl md:text-5xl">
                        Everything you need to ship.
                    </h2>
                </div>
                <div className="mx-auto grid gap-4 lg:grid-cols-2">
                    <FeatureCard>
                        <CardHeader className="pb-3">
                            <CardHeading
                                icon={Users}
                                title="The Alliance Network"
                                description="Connect with verified founders. Share playbooks, co-build, and scale together."
                            />
                        </CardHeader>

                        <div className="relative mb-6 border-t border-dashed border-border/40 sm:mb-0">
                            <div className="absolute inset-0 [background:radial-gradient(125%_125%_at_50%_0%,transparent_40%,hsl(var(--primary)/0.1),transparent_125%)]"></div>
                            <div className="aspect-[76/59] p-1 px-6">
                                <DualModeImage
                                    darkSrc="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80"
                                    lightSrc="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80"
                                    alt="Alliance Network"
                                    width={1207}
                                    height={929}
                                    className="rounded-xl border border-border/50 shadow-2xl grayscale hover:grayscale-0 transition-all duration-500"
                                />
                            </div>
                        </div>
                    </FeatureCard>

                    <FeatureCard>
                        <CardHeader className="pb-3">
                            <CardHeading
                                icon={Target}
                                title="Growth Milestones"
                                description="Automated roadmaps from $0 to $10K MRR. Track daily execution tasks."
                            />
                        </CardHeader>

                        <CardContent>
                            <div className="relative mb-6 sm:mb-0">
                                <div className="absolute -inset-6 [background:radial-gradient(50%_50%_at_75%_50%,transparent,hsl(var(--background))_100%)] z-10"></div>
                                <div className="aspect-[76/59] border border-border/40 rounded-xl overflow-hidden relative">
                                    <DualModeImage
                                        darkSrc="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80"
                                        lightSrc="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80"
                                        alt="Growth Analytics"
                                        width={1207}
                                        height={929}
                                        className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-500"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </FeatureCard>

                    <FeatureCard className="p-8 lg:col-span-2 bg-card/40 border-primary/20">
                        <p className="mx-auto my-6 max-w-xl text-balance text-center text-2xl font-serif text-foreground/90">
                            Smart matching with co-founders and automated reminders for your next venture milestone.
                        </p>

                        <div className="flex flex-wrap justify-center gap-6 overflow-hidden mt-10">
                            <CircularUI
                                label="Validation"
                                circles={[{ pattern: 'border' }, { pattern: 'border' }]}
                            />

                            <CircularUI
                                label="MVP Build"
                                circles={[{ pattern: 'none' }, { pattern: 'primary' }]}
                            />

                            <CircularUI
                                label="First 10 Users"
                                circles={[{ pattern: 'primary' }, { pattern: 'none' }]}
                            />

                            <CircularUI
                                label="Scale"
                                circles={[{ pattern: 'border' }, { pattern: 'primary' }]}
                                className="hidden sm:block"
                            />
                        </div>
                    </FeatureCard>
                </div>
            </div>
        </section>
    )
}

interface FeatureCardProps {
    children: ReactNode
    className?: string
}

const FeatureCard = ({ children, className }: FeatureCardProps) => (
    <Card className={cn('group relative rounded-[2rem] bg-card/60 backdrop-blur-sm border-border/40 shadow-2xl overflow-hidden', className)}>
        <CardDecorator />
        {children}
    </Card>
)

const CardDecorator = () => (
    <>
        <span className="border-primary/50 absolute -left-px -top-px block size-3 border-l-2 border-t-2 rounded-tl-lg"></span>
        <span className="border-primary/50 absolute -right-px -top-px block size-3 border-r-2 border-t-2 rounded-tr-lg"></span>
        <span className="border-primary/50 absolute -bottom-px -left-px block size-3 border-b-2 border-l-2 rounded-bl-lg"></span>
        <span className="border-primary/50 absolute -bottom-px -right-px block size-3 border-b-2 border-r-2 rounded-br-lg"></span>
    </>
)

interface CardHeadingProps {
    icon: LucideIcon
    title: string
    description: string
}

const CardHeading = ({ icon: Icon, title, description }: CardHeadingProps) => (
    <div className="p-6 md:p-8">
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2 mb-4">
            <Icon className="w-4 h-4" />
            {title}
        </span>
        <p className="text-2xl md:text-3xl font-serif text-foreground/90 leading-tight">{description}</p>
    </div>
)

interface DualModeImageProps {
    darkSrc: string
    lightSrc: string
    alt: string
    width: number
    height: number
    className?: string
}

const DualModeImage = ({ darkSrc, lightSrc, alt, width, height, className }: DualModeImageProps) => (
    <>
        <img
            src={darkSrc}
            className={cn('hidden dark:block', className)}
            alt={`${alt} dark`}
            width={width}
            height={height}
        />
        <img
            src={lightSrc}
            className={cn('shadow dark:hidden', className)}
            alt={`${alt} light`}
            width={width}
            height={height}
        />
    </>
)

interface CircleConfig {
    pattern: 'none' | 'border' | 'primary' | 'blue'
}

interface CircularUIProps {
    label: string
    circles: CircleConfig[]
    className?: string
}

const CircularUI = ({ label, circles, className }: CircularUIProps) => (
    <div className={className}>
        <div className="bg-gradient-to-b from-border/50 size-fit rounded-2xl to-transparent p-px">
            <div className="bg-gradient-to-b from-background to-muted/20 relative flex aspect-square w-fit items-center -space-x-4 rounded-[15px] p-5 shadow-inner">
                {circles.map((circle, i) => (
                    <div
                        key={i}
                        className={cn('size-8 rounded-full border border-border sm:size-10 shadow-lg', {
                            'border-primary/50 bg-background/50': circle.pattern === 'none',
                            'border-primary/30 bg-[repeating-linear-gradient(-45deg,hsl(var(--border)),hsl(var(--border))_1px,transparent_1px,transparent_4px)]': circle.pattern === 'border',
                            'border-primary bg-primary/10 bg-[repeating-linear-gradient(-45deg,hsl(var(--primary)),hsl(var(--primary))_1px,transparent_1px,transparent_4px)]': circle.pattern === 'primary',
                            'bg-background z-1 border-blue-500 bg-[repeating-linear-gradient(-45deg,theme(colors.blue.500),theme(colors.blue.500)_1px,transparent_1px,transparent_4px)]': circle.pattern === 'blue',
                        })}></div>
                ))}
            </div>
        </div>
        <span className="text-muted-foreground mt-3 block text-center text-xs font-medium uppercase tracking-wider">{label}</span>
    </div>
)
