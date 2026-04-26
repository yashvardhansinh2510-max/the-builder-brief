'use client'

import { Activity, ArrowRight, Files, Flower, GalleryVerticalEnd, MapPin } from 'lucide-react'
import DottedMap from 'dotted-map'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, TooltipProps } from 'recharts'
import { Card } from '@/components/ui/card'
import * as React from "react"
import { cn } from "@/lib/utils"

export default function CombinedFeaturedSection() {
  const featuredCasestudy = {
    logo: '/ruixen_dark.png',
    company: 'SpecFlowAI',
    tags: 'AI Integration',
    title: 'How we powered SpecFlowAI',
    subtitle: 'with advanced neural architectures and seamless real-time data flows',
  }

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 md:grid-rows-2">

        {/* 1. MAP - Top Left */}
        <div className="relative rounded-none overflow-hidden bg-muted border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <MapPin className="w-4 h-4" />
            SpecFlowAI Distribution
          </div>
          <h3 className="text-xl font-normal text-gray-900 dark:text-white">
            Global reach powered by AI.{" "}
            <span className="text-gray-500 dark:text-gray-400">Scaling intelligence across every continent in real-time.</span>
          </h3>

          <div className="relative mt-4">
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 px-3 py-1 bg-white dark:bg-black text-black dark:text-white rounded-md text-xs font-medium shadow flex items-center gap-2">
              🌍 New node active in Europe
            </div>
            <Map />
          </div>
        </div>

        {/* ✅ 2. FEATURED CASE STUDY BLOCK - Top Right */}
        <div className="flex flex-col justify-between gap-4 p-6 rounded-none border border-gray-200 dark:border-gray-800 bg-card">
          <div>
            <span className="text-xs flex items-center gap-2 text-sm text-gray-500">
              <GalleryVerticalEnd className="w-4 h-4" /> {featuredCasestudy.tags}
            </span>
            <h3 className="text-xl font-normal text-gray-900 dark:text-white">
              {featuredCasestudy.title}{" "}
              <span className="text-gray-500 dark:text-gray-400">{featuredCasestudy.subtitle}</span>
            </h3>
          </div>
          <div className="flex justify-center items-center w-full">
            <RuixenFeaturedMessageCard />
          </div>
        </div>

        {/* 3. CHART - Bottom Left */}
        <div className="rounded-none border border-gray-200 dark:border-gray-800 bg-muted p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Activity className="w-4 h-4" />
            Neural Processing Load
          </div>
          <h3 className="text-xl font-normal text-gray-900 dark:text-white">
            SpecFlowAI processing efficiency.{" "}
            <span className="text-gray-500 dark:text-gray-400">Optimizing inference times for millisecond latency.</span>
          </h3>
          <MonitoringChart />
        </div>

        {/* ✅ 4. ALL FEATURE CARDS - Bottom Right */}
        <div className="grid sm:grid-cols-2 rounded-none bg-card">
          <FeatureCard
            icon={<Files className="w-4 h-4" />}
            image="https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1000&auto=format&fit=crop"
            title="AI Model Library"
            subtitle="Ready to Deploy"
            description="Access our curated library of SpecFlowAI optimized models."
          />
          <FeatureCard
            icon={<Flower className="w-4 h-4" />}
            image="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1000&auto=format&fit=crop"
            title="Seamless API"
            subtitle="Developer First"
            description="Integrate SpecFlowAI with a single line of code into any stack."
          />
        </div>
      </div>
    </section>
  )
}

// ----------------- Feature Card Component -------------------
function FeatureCard({ icon, image, title, subtitle, description }: { icon: React.ReactNode, image: string, title: string, subtitle: string, description: string }) {
  return (
    <div className="relative flex flex-col gap-3 p-4 border border-gray-200 dark:border-gray-800 bg-background transition">
      <div className="flex items-center gap-4">
        <div>
          <span className="text-xs flex items-center gap-2 text-sm text-gray-500 mb-4">
            {icon}
            {title}
          </span>
          <h3 className="text-lg font-normal text-gray-900 dark:text-white">
            {subtitle}{" "}
            <span className="text-gray-500 dark:text-gray-400">{description}</span>
          </h3>
        </div>
      </div>

      {/* Card pinned to bottom right */}
      <Card className="absolute bottom-0 right-0 w-24 h-20 sm:w-32 sm:h-28 md:w-40 md:h-32 border-8 border-r-0 border-b-0 rounded-tl-xl rounded-br-none rounded-tr-none rounded-bl-none overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </Card>

      {/* Arrow icon on top of Card (optional) */}
      <div className="absolute bottom-2 right-2 p-3 flex items-center gap-2 border border-gray-200 dark:border-gray-800 rounded-full hover:-rotate-45 transition z-10 bg-background">
        <ArrowRight className="w-4 h-4 text-primary" />
      </div>
    </div>

  )
}

// ----------------- Map -------------------
const map = new DottedMap({ height: 55, grid: 'diagonal' })
const points = map.getPoints()

const Map = () => (
  <svg viewBox="0 0 120 60" className="w-full h-auto text-primary/70 dark:text-white/30">
    {points.map((point, i) => (
      <circle key={i} cx={point.x} cy={point.y} r={0.15} fill="currentColor" />
    ))}
  </svg>
)

// ----------------- Chart -------------------
const chartData = [
  { month: 'May', desktop: 56, mobile: 224 },
  { month: 'June', desktop: 90, mobile: 300 },
  { month: 'July', desktop: 126, mobile: 252 },
  { month: 'Aug', desktop: 205, mobile: 410 },
  { month: 'Sep', desktop: 200, mobile: 126 },
  { month: 'Oct', desktop: 400, mobile: 800 },
]

const chartConfig = {
  desktop: {
    label: 'SpecFlowAI Load',
    color: '#2563eb', // Primary Blue
  },
  mobile: {
    label: 'Edge Processing',
    color: '#60a5fa', // Lighter Blue
  },
}


function MonitoringChart() {
  return (
    <ChartContainer className="h-60 aspect-auto" config={chartConfig}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-desktop)" stopOpacity={0.8} />
            <stop offset="55%" stopColor="var(--color-desktop)" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-mobile)" stopOpacity={0.8} />
            <stop offset="55%" stopColor="var(--color-mobile)" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <XAxis hide />
        <YAxis hide />
        <CartesianGrid vertical={false} horizontal={false} />
        <Tooltip cursor={false} content={<ChartTooltipContent className="dark:bg-muted" />} />
        <Area strokeWidth={2} dataKey="mobile" type="monotone" fill="url(#fillMobile)" stroke="var(--color-mobile)" />
        <Area strokeWidth={2} dataKey="desktop" type="monotone" fill="url(#fillDesktop)" stroke="var(--color-desktop)" />
      </AreaChart>
    </ChartContainer>
  )
}


interface Message {
  title: string;
  time: string;
  content: string;
  color: string;
}

const messages: Message[] = [
    {
      title: "SpecFlowAI Engine",
      time: "1m ago",
      content: "Neural core optimization complete.",
      color: "from-pink-400 to-indigo-500",
    },
    {
      title: "Integrations Manager",
      time: "3m ago",
      content: "New endpoint connected successfully.",
      color: "from-orange-500 to-pink-500",
    },
    {
      title: "Data Stream",
      time: "6m ago",
      content: "Real-time sync established with SpecFlowAI.",
      color: "from-yellow-400 to-red-400",
    },
    {
      title: "Model Hub",
      time: "10m ago",
      content: "v2.4 neural weights deployed.",
      color: "from-sky-400 to-blue-700",
    },
    {
      title: "Analytics Bot",
      time: "12m ago",
      content: "User interaction patterns analyzed.",
      color: "from-orange-300 to-fuchsia-500",
    },
    {
      title: "System Update",
      time: "15m ago",
      content: "Edge node latency reduced by 40%.",
      color: "from-green-400 to-blue-500",
    },
  ];

const RuixenFeaturedMessageCard = () => {
  return (
    <div className="w-full max-w-sm h-[280px] bg-white dark:bg-gray-900 p-2 overflow-hidden font-sans relative">
      {/* Fade shadow overlay */}
      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white dark:from-gray-900 to-transparent z-10"></div>
      
      <div className="space-y-2 relative z-0">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 items-start p-3 border border-gray-200 dark:border-gray-700 rounded-lg transform transition duration-300 ease-in-out cursor-pointer animate-scaleUp`}
            style={{
              animationDelay: `${i * 300}ms`,
              animationFillMode: "forwards",
              opacity: 0,
            }}
          >
            <div
              className={`w-8 h-8 min-w-[2rem] min-h-[2rem] rounded-lg bg-gradient-to-br ${msg.color}`}
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-800 dark:text-white">
                {msg.title}
                <span className="text-xs text-gray-500 before:content-['•'] before:mr-1">
                  {msg.time}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 line-clamp-1">
                {msg.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


// ----------------- Chart Utilities (Simplified for this component) -----------------
const ChartContext = React.createContext<{ config: any } | null>(null)

function ChartContainer({ config, children, className }: { config: any, children: React.ReactNode, className?: string }) {
  const id = React.useId()
  return (
    <ChartContext.Provider value={{ config }}>
      <div className={cn("flex aspect-video justify-center text-xs", className)}>
        <style dangerouslySetInnerHTML={{
          __html: `
            [data-chart="${id}"] {
              ${Object.entries(config).map(([key, value]: [string, any]) => `--color-${key}: ${value.color};`).join('\n')}
            }
          `
        }} />
        <div data-chart={id} className="w-full h-full">
          <ResponsiveContainer>{children as any}</ResponsiveContainer>
        </div>
      </div>
    </ChartContext.Provider>
  )
}

function ChartTooltipContent({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border bg-background p-2 shadow-md", className)}>
      <p className="text-xs font-medium">Processing Load</p>
    </div>
  )
}
