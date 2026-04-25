import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Globe, Zap, Shield, Workflow } from 'lucide-react'

export function Features() {
    return (
        <section className="py-16 md:py-24">
            <div className="mx-auto max-w-6xl px-6">
                <div className="mb-16 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6">
                        <Zap className="w-3 h-3 text-primary" />
                        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary">SpecFlow AI Integration</span>
                    </div>
                    <h2 className="font-serif text-4xl md:text-6xl tracking-tight mb-6">
                        Discovery to Spec in <span className="italic text-primary">12 Minutes.</span>
                    </h2>
                    <p className="text-muted-foreground text-lg font-light max-w-2xl mx-auto">
                        The Max tier includes full access to SpecFlow AI — the product discovery engine used by teams at Stripe, Vercel, and Linear to turn raw research into stakeholder-ready specs.
                    </p>
                </div>

                <div className="mx-auto grid gap-4 sm:grid-cols-5">
                    {/* Feature 1: Raw Research to Specs */}
                    <Card className="group overflow-hidden shadow-black/5 sm:col-span-3 sm:rounded-3xl border-border bg-card">
                        <CardHeader>
                            <div className="md:p-6">
                                <p className="font-serif text-2xl tracking-tight">Zero-Hallucination <span className="italic text-primary">Discovery</span></p>
                                <p className="text-muted-foreground mt-3 max-w-sm text-sm font-light">
                                    SpecFlow turns raw interviews, support tickets, and Slack threads into actionable feature specs. Every requirement is traceable back to real customer data.
                                </p>
                            </div>
                        </CardHeader>

                        <div className="relative h-fit pl-6 md:pl-12">
                            <div className="absolute -inset-6 [background:radial-gradient(75%_95%_at_50%_0%,transparent,hsl(var(--background))_100%)]"></div>
                            <div className="bg-background overflow-hidden rounded-tl-3xl border-l border-t border-border pl-2 pt-2 dark:bg-zinc-950">
                                <img
                                    src="https://tailark.com/_next/image?url=%2Fmail2.png&w=3840&q=75"
                                    className="hidden dark:block opacity-80 group-hover:opacity-100 transition-opacity"
                                    alt="SpecFlow Interface"
                                    width={1207}
                                    height={929}
                                />
                                <img
                                    src="https://tailark.com/_next/image?url=%2Fmail2-light.png&w=3840&q=75"
                                    className="shadow dark:hidden opacity-80 group-hover:opacity-100 transition-opacity"
                                    alt="SpecFlow Interface"
                                    width={1207}
                                    height={929}
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Feature 2: High Velocity */}
                    <Card className="group overflow-hidden shadow-zinc-950/5 sm:col-span-2 sm:rounded-3xl border-border bg-card flex flex-col">
                        <div className="p-8 md:p-12 text-center">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                                <Zap className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="font-serif text-3xl tracking-tight mb-4">11.8m <span className="italic text-primary">Average.</span></h3>
                            <p className="text-muted-foreground text-sm font-light">
                                Reduce spec creation time from 5 days to minutes. Generate stakeholder-ready briefs with full rationale and engineering tasks.
                            </p>
                        </div>

                        <CardContent className="mt-auto h-fit">
                            <div className="relative mb-6 sm:mb-0">
                                <div className="absolute -inset-6 [background:radial-gradient(50%_75%_at_75%_50%,transparent,hsl(var(--background))_100%)]"></div>
                                <div className="aspect-video overflow-hidden rounded-xl border border-border">
                                    <img
                                        src="https://tailark.com/_next/image?url=%2Forigin-cal-dark.png&w=3840&q=75"
                                        className="hidden dark:block h-full w-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                                        alt="Workflow"
                                    />
                                    <img
                                        src="https://tailark.com/_next/image?url=%2Forigin-cal.png&w=3840&q=75"
                                        className="shadow dark:hidden h-full w-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                                        alt="Workflow"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Feature 3: Security */}
                    <Card className="group p-8 shadow-black/5 sm:col-span-2 sm:rounded-3xl border-border bg-card md:p-12 flex flex-col justify-center">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
                            <Shield className="w-6 h-6 text-emerald-500" />
                        </div>
                        <h3 className="font-serif text-3xl tracking-tight mb-4 text-left">SOC 2 <span className="italic text-emerald-500">Certified.</span></h3>
                        <p className="text-muted-foreground text-sm font-light leading-relaxed mb-10">
                            Your data is never used for training. Encrypted at rest and in transit. SpecFlow is trusted by product teams at Stripe and Notion.
                        </p>

                        <div className="flex justify-start gap-4">
                            <div className="bg-muted/35 relative flex aspect-square size-12 items-center rounded-xl border border-border p-2 shadow-sm">
                                <Globe className="m-auto size-5 text-primary" />
                            </div>
                            <div className="bg-muted/35 flex aspect-square size-12 items-center justify-center rounded-xl border border-border p-2 shadow-sm font-serif italic text-lg text-primary">
                                S
                            </div>
                        </div>
                    </Card>

                    {/* Feature 4: Integrations */}
                    <Card className="group relative shadow-black/5 sm:col-span-3 sm:rounded-3xl border-border bg-card">
                        <CardHeader className="p-8 md:p-12">
                            <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.3em] uppercase text-muted-foreground mb-4">
                                <Workflow className="w-3 h-3" />
                                Ecosystem Integration
                            </div>
                            <p className="font-serif text-3xl tracking-tight">One-Click <span className="italic text-primary">Push.</span></p>
                            <p className="text-muted-foreground mt-3 max-w-sm text-sm font-light">
                                Seamlessly export to Linear, Jira, GitHub, or Notion. Close the loop between customer research and engineering execution.
                            </p>
                        </CardHeader>
                        <CardContent className="relative h-fit px-8 pb-8 md:px-12 md:pb-12">
                            <div className="grid grid-cols-4 gap-4 md:grid-cols-6">
                                {[
                                    "https://oxymor-ns.tailus.io/logos/linear.svg",
                                    "https://oxymor-ns.tailus.io/logos/github.svg",
                                    "https://oxymor-ns.tailus.io/logos/netlify.svg"
                                ].map((url, i) => (
                                    <div key={i} className="rounded-xl bg-muted/50 flex aspect-square items-center justify-center border border-border p-4 hover:bg-muted transition-colors">
                                        <img className="m-auto size-8 invert dark:invert-0" src={url} alt="integration logo" width="32" height="32" />
                                    </div>
                                ))}
                                <div className="rounded-xl aspect-square border border-dashed border-border flex items-center justify-center text-muted-foreground/30 font-serif italic">+5 more</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    )
}
