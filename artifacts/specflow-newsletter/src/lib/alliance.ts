export interface AllianceMember {
  id: string;
  name: string;
  role: string;
  specialty: string;
  status: "building" | "scaling" | "exited";
  currentVenture: string;
  joined: string;
}

export const allianceMembers: AllianceMember[] = [
  {
    id: "m1",
    name: "Vikram Malhotra",
    role: "Full-stack SaaS Founder",
    specialty: "Distribution Rails & GTM",
    status: "scaling",
    currentVenture: "ShipReady.ai",
    joined: "April 2024"
  },
  {
    id: "m2",
    name: "Sarah Chen",
    role: "Technical Architect",
    specialty: "High-Performance Infrastructure",
    status: "building",
    currentVenture: "ProtocolZero",
    joined: "May 2024"
  },
  {
    id: "m3",
    name: "Marcus Thorne",
    role: "Serial Entrepreneur",
    specialty: "Venture Math & Equity",
    status: "exited",
    currentVenture: "Alchemist Labs",
    joined: "June 2024"
  },
  {
    id: "m4",
    name: "Anya Ivanova",
    role: "Lead Engineer",
    specialty: "AI Integration & LLM Ops",
    status: "building",
    currentVenture: "NeuralMoat",
    joined: "July 2024"
  },
  {
    id: "m5",
    name: "David Park",
    role: "Product Visionary",
    specialty: "User Psychology & UI/UX",
    status: "scaling",
    currentVenture: "FlowState Workspace",
    joined: "August 2024"
  },
  {
    id: "m6",
    name: "Elena Rodriguez",
    role: "GTM Strategist",
    specialty: "B2B Sales Automations",
    status: "building",
    currentVenture: "ForgePipeline",
    joined: "September 2024"
  }
];
