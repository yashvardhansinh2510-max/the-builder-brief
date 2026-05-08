export type Country =
  | "India"
  | "United States"
  | "United Kingdom"
  | "Australia"
  | "UAE"
  | "Southeast Asia"
  | "Rest of World";

export type Category =
  | "Food & Hospitality"
  | "Health & Wellness"
  | "Trade & Home Services"
  | "Education & Coaching"
  | "Micro-Manufacturing"
  | "Family Business Transformation"
  | "AI-Augmented Offline";

export type InvestmentRange = "Bootstrap" | "Low" | "Mid" | "Capital-Heavy";

export interface GroundGameIdea {
  id: string;
  country: Country;
  category: Category;
  mode: "OFFLINE" | "HYBRID";
  title: string;
  hook: string;
  investmentRange: InvestmentRange;
  trendSparkline: number[];
  tier: "free" | "pro" | "max";
  theGap: string;
  whyNow: string;
  marketSize: string;
  trendChartData: { month: string; value: number }[];
  aiAngle: string;
  gtmSteps: string[];
  revenueModel: string;
  defensibility: string;
  difficulty: "Founder-Friendly" | "Requires Local Network" | "Capital Intensive";
  worksIn: Country[];
}

const generateTrendData = (base: number, growth: number) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months.map((month, i) => ({
    month,
    value: Math.round(base * Math.pow(1 + growth, i) + Math.random() * (base * 0.1)),
  }));
};

const generateSparkline = () => {
  let val = 20;
  return Array.from({ length: 8 }, () => {
    val += Math.random() * 10 + 2;
    return Math.round(val);
  });
};

export const groundGameIdeas: GroundGameIdea[] = [
  // INDIA
  {
    id: "in-1",
    country: "India",
    category: "AI-Augmented Offline",
    mode: "HYBRID",
    title: "AI-Vernacular Voice Commerce for Kiranas",
    hook: "WhatsApp + voice AI for Tier 2/3 inventory & orders.",
    investmentRange: "Low",
    trendSparkline: generateSparkline(),
    tier: "free",
    theGap: "Kirana owners in Tier 2/3 cities struggle with digital inventory apps due to UI friction and language barriers. They still rely on phone calls to distributors.",
    whyNow: "LLMs now process regional Indian languages and dialects with near-perfect accuracy via WhatsApp voice notes.",
    marketSize: "12M+ Kirana stores in India. TAM: $1B+ in SaaS/Transaction fees.",
    trendChartData: generateTrendData(100, 0.15),
    aiAngle: "Merchants speak into WhatsApp ('Send 2 cartons of Maggi'). AI parses the vernacular audio, checks local distributor API, places the order, and updates a ledger automatically.",
    gtmSteps: [
      "Partner with 5 local FMCG distributors in one Tier 2 city.",
      "Onboard 50 kirana owners with a freemium WhatsApp bot.",
      "Expand via distributor referral networks."
    ],
    revenueModel: "₹500/month flat fee per store + 1% transaction fee on distributor orders.",
    defensibility: "Sticky integration with distributor ERPs and proprietary fine-tuned regional language models.",
    difficulty: "Founder-Friendly",
    worksIn: ["India", "Southeast Asia", "Rest of World"]
  },
  {
    id: "in-2",
    country: "India",
    category: "Health & Wellness",
    mode: "OFFLINE",
    title: "Premium Senior Care Micro-Homes",
    hook: "Lifestyle-first assisted living for Tier 1 DINK parents.",
    investmentRange: "Capital-Heavy",
    trendSparkline: generateSparkline(),
    tier: "free",
    theGap: "Existing old-age homes are depressing. High-income NRIs and DINK couples want premium, community-driven living spaces for their aging parents in Tier 1 cities.",
    whyNow: "Rapid nuclearization of wealthy Indian families and a massive demographic shift towards an aging upper-middle class.",
    marketSize: "Estimated 1.5M affluent seniors needing assisted living by 2030.",
    trendChartData: generateTrendData(50, 0.08),
    aiAngle: "Ambient AI sensors (no cameras) for fall detection, sleep tracking, and predictive health alerts sent to children's app.",
    gtmSteps: [
      "Lease a large villa/boutique property in a premium neighborhood (e.g., Koramangala or South Delhi).",
      "Retrofit for senior mobility and ambient tech.",
      "Market directly to NRIs and high-earning tech workers."
    ],
    revenueModel: "₹80k–150k/month per resident + onboarding deposit.",
    defensibility: "High trust barrier, regulatory licensing, and significant CAPEX moat.",
    difficulty: "Capital Intensive",
    worksIn: ["India", "United States", "United Kingdom"]
  },
  {
    id: "in-3",
    country: "India",
    category: "Trade & Home Services",
    mode: "HYBRID",
    title: "Modular Wedding Mandap Rental with AR",
    hook: "Real-time AR preview for B2B wedding planners.",
    investmentRange: "Mid",
    trendSparkline: generateSparkline(),
    tier: "free",
    theGap: "Wedding planners waste days coordinating physical mockups for clients. Inventory is disorganized and difficult to visualize in specific venues.",
    whyNow: "iPad Pro Lidar and WebAR are now good enough to render photorealistic mandaps in physical spaces.",
    marketSize: "$50B Indian wedding industry. High margins on decor rentals.",
    trendChartData: generateTrendData(200, 0.12),
    aiAngle: "Generative AI allows clients to describe a theme ('Royal Rajasthani with pink florals') and instantly generates 3D modular setups from the existing physical inventory.",
    gtmSteps: [
      "Acquire a starter inventory of high-quality, modular mandap structures.",
      "3D scan all components into a custom iPad AR app.",
      "Sell subscription + rental packages to 20 local wedding planners."
    ],
    revenueModel: "₹10k/month SaaS for planners + high-margin physical rentals (₹50k-₹2L per event).",
    defensibility: "Proprietary 3D asset library mapped perfectly to physical inventory.",
    difficulty: "Requires Local Network",
    worksIn: ["India", "UAE", "United Kingdom"]
  },
  {
    id: "in-4",
    country: "India",
    category: "Health & Wellness",
    mode: "OFFLINE",
    title: "Ayurvedic Diagnostic Walk-In Centers",
    hook: "Lab-backed, custom formulations based on bloodwork.",
    investmentRange: "Mid",
    trendSparkline: generateSparkline(),
    tier: "pro",
    theGap: "Ayurveda is largely unstandardized and based on pulse-reading. Modern consumers want the natural benefits of Ayurveda backed by allopathic lab diagnostics.",
    whyNow: "Post-COVID surge in preventative health, coupled with a demand for data-backed holistic medicine.",
    marketSize: "$5B+ alternative medicine market in India.",
    trendChartData: generateTrendData(80, 0.1),
    aiAngle: "AI cross-references modern blood panel data (liver function, hormones) with Ayurvedic compound databases to generate safe, personalized herbal prescriptions.",
    gtmSteps: [
      "Partner with an existing NABL lab for backend blood processing.",
      "Open a high-end, clinical-looking retail front in a premium mall/street.",
      "Hire certified Ayurvedic doctors trained on the AI diagnostic software."
    ],
    revenueModel: "₹2,500 diagnostic fee + ₹3,000-₹5,000/month for custom compounded supplements.",
    defensibility: "Medical licensing, proprietary AI matching algorithm, and retail brand trust.",
    difficulty: "Capital Intensive",
    worksIn: ["India", "United States", "UAE"]
  },
  {
    id: "in-5",
    country: "India",
    category: "Trade & Home Services",
    mode: "HYBRID",
    title: "AI-Powered Garage Chain",
    hook: "Blue-collar franchise model with transparent pricing.",
    investmentRange: "Mid",
    trendSparkline: generateSparkline(),
    tier: "pro",
    theGap: "Local garages are untrustworthy and opaque with pricing. Authorized service centers are too expensive. The middle market is completely unorganized.",
    whyNow: "Rising out-of-warranty car ownership and normalization of tech-enabled offline services.",
    marketSize: "$10B+ auto aftermarket in India.",
    trendChartData: generateTrendData(150, 0.09),
    aiAngle: "Mechanics take a video of the engine bay. AI computer vision identifies worn parts, instantly cross-references OEM part prices, and WhatsApps an itemized quote to the customer.",
    gtmSteps: [
      "Acquire or partner with 2 existing, high-traffic independent garages.",
      "Rebrand, install cameras, and implement the pricing software.",
      "Run local geo-targeted performance marketing on trust and transparency."
    ],
    revenueModel: "Average Order Value of ₹6,000. 40% margin on labor and parts.",
    defensibility: "Brand reputation, standardized SOPs, and difficulty of scaling blue-collar management.",
    difficulty: "Requires Local Network",
    worksIn: ["India", "Southeast Asia", "Rest of World"]
  },
  {
    id: "in-6",
    country: "India",
    category: "Family Business Transformation",
    mode: "HYBRID",
    title: "Textile Mill Yield Optimization",
    hook: "Computer vision QA for legacy fabric manufacturers.",
    investmentRange: "Low",
    trendSparkline: generateSparkline(),
    tier: "max",
    theGap: "Tier 2/3 textile mills lose 5-8% of revenue to fabric defects caught too late in the supply chain. Manual QA is slow and error-prone.",
    whyNow: "Edge computing hardware and industrial cameras are now cheap enough for SMB adoption.",
    marketSize: "Thousands of legacy textile mills in hubs like Surat, Tirupur, and Bhilwara.",
    trendChartData: generateTrendData(40, 0.18),
    aiAngle: "Edge AI cameras mounted on weaving machines detect micro-tears and color variations in real-time, stopping the machine before yards of fabric are ruined.",
    gtmSteps: [
      "Build a proof-of-concept using off-the-shelf cameras and a fine-tuned vision model.",
      "Offer a free 1-month pilot to a mid-sized mill in Surat.",
      "Use case study to sell annual contracts."
    ],
    revenueModel: "₹1L installation fee + ₹25k/month software and maintenance retainer per machine line.",
    defensibility: "High switching costs and highly localized sales networks.",
    difficulty: "Requires Local Network",
    worksIn: ["India", "Southeast Asia"]
  },
  {
    id: "in-7",
    country: "India",
    category: "Micro-Manufacturing",
    mode: "OFFLINE",
    title: "Hyperlocal Cloud Kitchens for Pets",
    hook: "Human-grade, fresh cooked meals delivered daily.",
    investmentRange: "Mid",
    trendSparkline: generateSparkline(),
    tier: "max",
    theGap: "Commercial kibble is increasingly viewed as unhealthy. Imported fresh pet food is prohibitively expensive due to cold chain logistics.",
    whyNow: "Massive spike in pet ownership post-pandemic in India's top 10 cities.",
    marketSize: "$500M+ growing pet care market in India.",
    trendChartData: generateTrendData(60, 0.2),
    aiAngle: "AI generates exact macronutrient formulations based on breed, age, and activity level data from the owner's app, optimizing batch cooking in the kitchen.",
    gtmSteps: [
      "Setup a 500 sq ft commercial kitchen with FSSAI compliance.",
      "Source local meat/veg and test formulations with a veterinary nutritionist.",
      "Launch hyper-local D2C subscriptions within a 10km radius."
    ],
    revenueModel: "₹4,000-₹8,000/month recurring subscription per dog. 60% gross margin.",
    defensibility: "Cold chain logistics density and strong brand loyalty (pets are picky).",
    difficulty: "Founder-Friendly",
    worksIn: ["India", "United States", "United Kingdom", "Australia"]
  },
  {
    id: "in-8",
    country: "India",
    category: "Education & Coaching",
    mode: "HYBRID",
    title: "Blue-Collar Upskilling Hubs",
    hook: "Physical training centers for solar and EV technicians.",
    investmentRange: "Capital-Heavy",
    trendSparkline: generateSparkline(),
    tier: "pro",
    theGap: "Massive gap between government green energy targets and available skilled labor to install/repair EV chargers and solar panels.",
    whyNow: "Government subsidies driving rapid EV and solar adoption across the country.",
    marketSize: "Requirement for 500,000+ skilled green-tech workers by 2030.",
    trendChartData: generateTrendData(90, 0.14),
    aiAngle: "VR simulation labs where students practice high-voltage repairs safely, guided by an AI tutor that scores their procedures before they touch physical hardware.",
    gtmSteps: [
      "Lease a warehouse in an industrial hub.",
      "Partner with EV/Solar companies to guarantee placement for graduates.",
      "Enroll students using a 'Pay After Placement' income share agreement."
    ],
    revenueModel: "₹50k per student (paid by employer or via ISA).",
    defensibility: "B2B employer partnerships and specialized physical equipment.",
    difficulty: "Capital Intensive",
    worksIn: ["India", "United States", "Australia"]
  },

  // UNITED STATES
  {
    id: "us-1",
    country: "United States",
    category: "Trade & Home Services",
    mode: "HYBRID",
    title: "Skilled Trades Staffing with AI",
    hook: "AI matching for electricians and plumbers.",
    investmentRange: "Low",
    trendSparkline: generateSparkline(),
    tier: "free",
    theGap: "Massive acute shortage of skilled tradespeople. Traditional staffing agencies are slow and don't understand the nuances of specific trade certifications.",
    whyNow: "Generational gap: older tradespeople retiring faster than younger ones enter the workforce. Infrastructure bills creating excess demand.",
    marketSize: "$150B+ temporary staffing market in the US. Trades segment growing fastest.",
    trendChartData: generateTrendData(250, 0.11),
    aiAngle: "AI parses disorganized resumes, unverified certifications, and SMS conversations to build verified worker profiles, instantly matching them to contractor sub-job requirements.",
    gtmSteps: [
      "Focus exclusively on one trade (e.g., commercial electricians) in one booming metro (e.g., Austin).",
      "Scrape job boards and use SMS automation to build a talent pool.",
      "Cold call major subcontractors with guaranteed 48-hour placement."
    ],
    revenueModel: "20-30% markup on hourly wages for temp-to-hire. Flat $5k finder fee for direct placement.",
    defensibility: "Proprietary database of verified tradespeople and deep contractor relationships.",
    difficulty: "Requires Local Network",
    worksIn: ["United States", "United Kingdom", "Australia"]
  },
  {
    id: "us-2",
    country: "United States",
    category: "Food & Hospitality",
    mode: "OFFLINE",
    title: "Premium Indoor Hydroponic Micro-Farms",
    hook: "Hyperlocal B2B subscription for restaurants.",
    investmentRange: "Capital-Heavy",
    trendSparkline: generateSparkline(),
    tier: "free",
    theGap: "High-end restaurants struggle with inconsistent quality and high prices of specialty herbs, microgreens, and rare produce due to long supply chains.",
    whyNow: "Hyperlocal food movement is peaking, and commercial real estate (empty warehouses) is relatively cheap.",
    marketSize: "$5B+ specialty produce market for food service.",
    trendChartData: generateTrendData(120, 0.08),
    aiAngle: "Computer vision and IoT sensors monitor crop health 24/7, using predictive AI to optimize lighting spectrums and nutrient dosing to guarantee harvest dates for chefs.",
    gtmSteps: [
      "Secure a small industrial space near downtown.",
      "Install automated hydroponic racks and focus on 3 high-value crops.",
      "Offer Michelin/high-end chefs a 'farm-to-table in 2 miles' subscription."
    ],
    revenueModel: "$500-$2,000/month recurring contracts per restaurant.",
    defensibility: "High CAPEX setup and strict food safety compliance. High switching cost for chefs who design menus around your produce.",
    difficulty: "Capital Intensive",
    worksIn: ["United States", "UAE", "United Kingdom"]
  },
  {
    id: "us-3",
    country: "United States",
    category: "Health & Wellness",
    mode: "HYBRID",
    title: "Senior Tech Concierge Service",
    hook: "In-home setup and ongoing support for the elderly.",
    investmentRange: "Low",
    trendSparkline: generateSparkline(),
    tier: "pro",
    theGap: "Seniors are increasingly isolated but struggle to use iPads, smart TVs, and telehealth platforms. Children live far away and get frustrated doing IT support.",
    whyNow: "The 'Silver Tsunami'—10,000 Baby Boomers turn 65 every day. Telehealth is now standard.",
    marketSize: "50M+ seniors in the US. Massive underserved TAM.",
    trendChartData: generateTrendData(80, 0.15),
    aiAngle: "Technicians use an AI diagnostic tool that analyzes the senior's home network, devices, and usage patterns to suggest accessibility settings and proactive fixes before things break.",
    gtmSteps: [
      "Launch in a high-density retirement community (e.g., Florida or Arizona).",
      "Market directly to adult children ('Give your parents the gift of connection').",
      "Hire patient, empathetic technicians (retirees or college students)."
    ],
    revenueModel: "$150 initial home setup fee + $50/month for unlimited remote/phone support.",
    defensibility: "Extreme trust barrier. Once you are trusted inside a senior's home, churn is near zero.",
    difficulty: "Founder-Friendly",
    worksIn: ["United States", "Australia", "United Kingdom"]
  },
  {
    id: "us-4",
    country: "United States",
    category: "Family Business Transformation",
    mode: "HYBRID",
    title: "AI Succession Planning for SMBs",
    hook: "Digitizing operational knowledge before boomers retire.",
    investmentRange: "Bootstrap",
    trendSparkline: generateSparkline(),
    tier: "max",
    theGap: "Boomer owners of profitable manufacturing, HVAC, and plumbing businesses have all operational knowledge in their heads. Buyers won't acquire them without SOPs.",
    whyNow: "The 'Great Wealth Transfer'—millions of SMBs will be sold or close in the next decade.",
    marketSize: "$10T+ in business value transferring hands.",
    trendChartData: generateTrendData(40, 0.25),
    aiAngle: "The owner wears a GoPro and lapel mic for a week. AI processes the audio/video to automatically generate standard operating procedures, training manuals, and decision trees.",
    gtmSteps: [
      "Partner with local SMB business brokers.",
      "Offer the service to owners preparing for a sale to increase their valuation.",
      "Execute the shadowing and deliver a digital 'Company Brain'."
    ],
    revenueModel: "$10,000 - $25,000 one-time fee per business.",
    defensibility: "High-ticket B2B sales skills and proprietary data processing pipelines.",
    difficulty: "Requires Local Network",
    worksIn: ["United States", "Australia", "United Kingdom"]
  },
  {
    id: "us-5",
    country: "United States",
    category: "Micro-Manufacturing",
    mode: "OFFLINE",
    title: "Local ADU Assembly Plants",
    hook: "Prefab Accessory Dwelling Units for suburban backyards.",
    investmentRange: "Capital-Heavy",
    trendSparkline: generateSparkline(),
    tier: "max",
    theGap: "Housing crisis is driving massive demand for ADUs, but traditional stick-built construction takes 6-12 months and is plagued by delays.",
    whyNow: "California and other states have radically relaxed zoning laws for ADUs.",
    marketSize: "$10B+ growing market for backyard homes.",
    trendChartData: generateTrendData(200, 0.12),
    aiAngle: "AI generative design software instantly creates permit-ready blueprints optimized for the specific dimensions, slopes, and setbacks of the customer's exact parcel.",
    gtmSteps: [
      "Lease a mid-size warehouse.",
      "Design 3 standardized, flat-pack ADU models.",
      "Pre-build panels indoors and assemble on-site in 2 weeks."
    ],
    revenueModel: "$100k-$150k per unit. ~30% gross margin.",
    defensibility: "Navigating local permitting, logistics, and capital requirements.",
    difficulty: "Capital Intensive",
    worksIn: ["United States", "Australia"]
  },

  // UK
  {
    id: "uk-1",
    country: "United Kingdom",
    category: "Trade & Home Services",
    mode: "HYBRID",
    title: "Heat Pump Retrofit Specialists",
    hook: "Turnkey heat pump installation for heritage homes.",
    investmentRange: "Mid",
    trendSparkline: generateSparkline(),
    tier: "free",
    theGap: "The UK has the oldest housing stock in Europe. Standard heat pump installers refuse complex retrofits in Victorian/Edwardian homes.",
    whyNow: "Government mandates to phase out gas boilers and massive grants available.",
    marketSize: "25M homes in the UK needing retrofits.",
    trendChartData: generateTrendData(150, 0.16),
    aiAngle: "AI thermal imaging analysis of the home's facade instantly calculates heat loss and generates a custom micro-piping schematic to avoid damaging historical features.",
    gtmSteps: [
      "Get certified for heat pump installations and government grant processing.",
      "Target affluent neighborhoods with older housing stock.",
      "Market as 'heritage-safe' heating modernization."
    ],
    revenueModel: "£10k-£15k per installation (often subsidized).",
    defensibility: "Specialized engineering knowledge and accreditation.",
    difficulty: "Requires Local Network",
    worksIn: ["United Kingdom", "Rest of World"]
  },
  {
    id: "uk-2",
    country: "United Kingdom",
    category: "Food & Hospitality",
    mode: "OFFLINE",
    title: "Automated Micro-Pubs",
    hook: "Cashless, staff-light craft beer spaces in villages.",
    investmentRange: "Mid",
    trendSparkline: generateSparkline(),
    tier: "pro",
    theGap: "Traditional village pubs are closing at record rates due to high staffing costs and overhead, leaving communities without social hubs.",
    whyNow: "Contactless tech is universally accepted, and commercial retail space in small towns is cheap.",
    marketSize: "£20B+ UK pub industry undergoing radical restructuring.",
    trendChartData: generateTrendData(60, 0.05),
    aiAngle: "AI predicts local consumption patterns to optimize keg orders, while computer vision age-verification systems at self-pour taps eliminate the need for bartenders.",
    gtmSteps: [
      "Lease a small vacant retail shop in a village that lost its pub.",
      "Install self-pour taps, smart security, and basic seating.",
      "Run with 1 staff member for cleaning/restocking."
    ],
    revenueModel: "High-margin wet-led sales. Drastically reduced OPEX.",
    defensibility: "Licensing barriers and local community buy-in.",
    difficulty: "Capital Intensive",
    worksIn: ["United Kingdom", "Australia"]
  },
  {
    id: "uk-3",
    country: "United Kingdom",
    category: "AI-Augmented Offline",
    mode: "HYBRID",
    title: "High-Street Dark Pharmacies",
    hook: "15-minute prescription delivery hubs.",
    investmentRange: "Mid",
    trendSparkline: generateSparkline(),
    tier: "max",
    theGap: "NHS prescription fulfillment is incredibly slow. Patients wait days or queue in crowded pharmacies.",
    whyNow: "E-prescriptions are standard. Quick-commerce habits (Deliveroo/Getir) are entrenched.",
    marketSize: "£15B+ UK pharmacy market.",
    trendChartData: generateTrendData(200, 0.1),
    aiAngle: "AI routing software integrates with NHS electronic prescriptions, optimizing courier routes and robot-assisted picking inside the dark store.",
    gtmSteps: [
      "Secure a pharmacy license and a small warehouse space.",
      "Integrate with NHS EPS (Electronic Prescription Service).",
      "Deploy e-bike couriers for a tight 3-mile radius."
    ],
    revenueModel: "NHS dispensing fees + £3.99 premium for express delivery + OTC upsells.",
    defensibility: "NHS integration complexity and regulatory licensing.",
    difficulty: "Requires Local Network",
    worksIn: ["United Kingdom", "UAE", "Australia"]
  },
  {
    id: "uk-4",
    country: "United Kingdom",
    category: "Education & Coaching",
    mode: "OFFLINE",
    title: "Neurodivergent Tutoring Pods",
    hook: "Physical spaces designed for ADHD/Autism learning.",
    investmentRange: "Low",
    trendSparkline: generateSparkline(),
    tier: "free",
    theGap: "Mainstream schools are failing neurodivergent kids. Online tutoring doesn't work for them. Parents are desperate for specialized physical environments.",
    whyNow: "Massive rise in neurodivergence diagnoses and increased parental willingness to spend on tailored education.",
    marketSize: "£2B+ private tutoring market in the UK.",
    trendChartData: generateTrendData(80, 0.12),
    aiAngle: "AI analyzes the student's focus patterns via biometric wearables to dynamically adjust room lighting, white noise, and break schedules during the session.",
    gtmSteps: [
      "Rent a small office space and retrofit it with sensory-friendly lighting/furniture.",
      "Hire SEN (Special Educational Needs) certified tutors.",
      "Market directly to parent support groups on Facebook."
    ],
    revenueModel: "£60-£100/hour premium tutoring rates.",
    defensibility: "Deep trust, specialized staff, and physical infrastructure.",
    difficulty: "Founder-Friendly",
    worksIn: ["United Kingdom", "United States", "Australia"]
  },
  {
    id: "uk-5",
    country: "United Kingdom",
    category: "Health & Wellness",
    mode: "OFFLINE",
    title: "Boutique Menopause Clinics",
    hook: "Walk-in HRT optimization and holistic care.",
    investmentRange: "Capital-Heavy",
    tier: "pro",
    trendSparkline: generateSparkline(),
    theGap: "The NHS is severely under-equipped for menopause care. Women wait months for 10-minute appointments that result in generic HRT prescriptions.",
    whyNow: "Menopause is destigmatized. Gen X women have high disposable income and demand better care.",
    marketSize: "13M peri/menopausal women in the UK.",
    trendChartData: generateTrendData(100, 0.18),
    aiAngle: "AI symptom tracker app integrates with clinic blood panels to constantly refine transdermal HRT dosages, predicting symptom flare-ups before they happen.",
    gtmSteps: [
      "Open a premium clinic in an affluent suburb.",
      "Hire private GPs specializing in women's health.",
      "Offer comprehensive packages (bloodwork, HRT, nutrition, therapy)."
    ],
    revenueModel: "£500 initial consultation + £100/month subscription for ongoing care/prescriptions.",
    defensibility: "Medical regulation, brand prestige, and holistic service bundling.",
    difficulty: "Capital Intensive",
    worksIn: ["United Kingdom", "United States", "Australia"]
  },

  // AUSTRALIA
  {
    id: "au-1",
    country: "Australia",
    category: "Trade & Home Services",
    mode: "HYBRID",
    title: "Off-Grid Solar Rescue",
    hook: "Repairing and upgrading abandoned regional solar setups.",
    investmentRange: "Low",
    trendSparkline: generateSparkline(),
    tier: "free",
    theGap: "Thousands of regional/rural properties bought cheap solar setups that failed. The original companies went bust, leaving owners stranded.",
    whyNow: "Energy prices in Australia are soaring. The first wave of cheap solar is reaching end-of-life.",
    marketSize: "$1B+ solar maintenance market.",
    trendChartData: generateTrendData(70, 0.15),
    aiAngle: "Drone-based AI thermal scanning of roof panels to instantly identify dead cells without climbing, auto-generating a repair quote on the spot.",
    gtmSteps: [
      "Target regional areas with high solar penetration.",
      "Use drones for free inspections.",
      "Sell premium battery/inverter upgrades."
    ],
    revenueModel: "$500 inspection fees + high-margin hardware upgrades ($5k-$15k).",
    defensibility: "Technical expertise in legacy systems and regional travel logistics.",
    difficulty: "Requires Local Network",
    worksIn: ["Australia", "United States"]
  },
  {
    id: "au-2",
    country: "Australia",
    category: "Food & Hospitality",
    mode: "OFFLINE",
    title: "Premium Drive-Thru Coffee Franchises",
    hook: "Specialty coffee at scale for commuters.",
    investmentRange: "Capital-Heavy",
    trendSparkline: generateSparkline(),
    tier: "pro",
    theGap: "Australians are coffee snobs but drive-thrus are dominated by mediocre chains. Commuters want specialty third-wave coffee without leaving their cars.",
    whyNow: "Suburban sprawl and increased reliance on cars post-COVID.",
    marketSize: "$5B+ cafe market in Australia.",
    trendChartData: generateTrendData(180, 0.08),
    aiAngle: "AI license plate recognition links to loyalty profiles, pulling up the customer's usual order and payment details before they even reach the speaker box.",
    gtmSteps: [
      "Secure a small footprint lease on a major outbound arterial road.",
      "Install high-end espresso gear and train specialized fast-workflow baristas.",
      "Focus purely on speed and quality—no food."
    ],
    revenueModel: "High volume (500+ cars/day) x $6 average spend.",
    defensibility: "Real estate (zoning for drive-thrus is hard to get) and operational speed.",
    difficulty: "Capital Intensive",
    worksIn: ["Australia", "United States", "UAE"]
  },
  {
    id: "au-3",
    country: "Australia",
    category: "Health & Wellness",
    mode: "OFFLINE",
    title: "Mobile IV & Recovery Vans",
    hook: "Post-sport and hangover recovery delivered to your door.",
    investmentRange: "Mid",
    trendSparkline: generateSparkline(),
    tier: "max",
    theGap: "Athletes and high-earning professionals want clinical recovery (IV drips, compression, cryo) but don't want to travel to a clinic.",
    whyNow: "The wellness/recovery sector is booming. People value extreme convenience.",
    marketSize: "$200M+ niche wellness recovery market.",
    trendChartData: generateTrendData(40, 0.22),
    aiAngle: "AI routing optimization dynamically repositions vans based on historical demand heatmaps (e.g., near marathons on Sundays, corporate hubs on Fridays).",
    gtmSteps: [
      "Retrofit a Mercedes Sprinter van with clinical seating and medical supplies.",
      "Hire registered nurses on contract.",
      "Market via Instagram and partnerships with high-end gyms/CrossFit boxes."
    ],
    revenueModel: "$250-$400 per IV treatment. High margins.",
    defensibility: "Medical regulations (hiring RNs, prescribing doctors) and fleet logistics.",
    difficulty: "Requires Local Network",
    worksIn: ["Australia", "United States", "UAE", "United Kingdom"]
  },
  {
    id: "au-4",
    country: "Australia",
    category: "Education & Coaching",
    mode: "HYBRID",
    title: "Mining Tech Upskilling",
    hook: "Training operators for autonomous heavy machinery.",
    investmentRange: "Low",
    trendSparkline: generateSparkline(),
    tier: "pro",
    theGap: "Mining companies are deploying autonomous trucks, but traditional operators lack the software skills to monitor and troubleshoot them from control rooms.",
    whyNow: "Perth/WA mining sector is fully transitioning to autonomous operations to cut costs.",
    marketSize: "Huge B2B training budgets in the resources sector.",
    trendChartData: generateTrendData(90, 0.1),
    aiAngle: "AI-driven simulator software that creates dynamic, unpredictable crisis scenarios tailored to the specific mine site's topology.",
    gtmSteps: [
      "Partner with simulator hardware providers.",
      "Develop a specialized curriculum with former mining engineers.",
      "Sell B2B contracts directly to Rio Tinto, BHP, etc."
    ],
    revenueModel: "$10k+ per student, paid by the mining corporation.",
    defensibility: "Deep industry connections in WA and highly specialized curriculum.",
    difficulty: "Requires Local Network",
    worksIn: ["Australia", "Rest of World"]
  },
  {
    id: "au-5",
    country: "Australia",
    category: "Family Business Transformation",
    mode: "HYBRID",
    title: "Agriculture Drone Surveying",
    hook: "Precision mapping for legacy cattle stations.",
    investmentRange: "Mid",
    trendSparkline: generateSparkline(),
    tier: "max",
    theGap: "Massive cattle stations lose millions to inefficient fencing, lost cattle, and poor water management. Traditional helicopter mustering is dangerous and expensive.",
    whyNow: "Enterprise drones with thermal cameras and long range are now commercially accessible.",
    marketSize: "$1B+ ag-tech market in Australia.",
    trendChartData: generateTrendData(60, 0.18),
    aiAngle: "AI processes thermal drone footage to automatically count cattle, identify broken fences, and map water levels without human review.",
    gtmSteps: [
      "Invest in fixed-wing and multi-rotor enterprise drones.",
      "Obtain commercial pilot licenses.",
      "Run free pilot surveys for influential station owners to build case studies."
    ],
    revenueModel: "$5k-$10k per mapping mission, or $2k/month retainers.",
    defensibility: "Harsh operating environment, aviation licensing, and specialized hardware.",
    difficulty: "Founder-Friendly",
    worksIn: ["Australia", "United States", "Rest of World"]
  },

  // UAE
  {
    id: "uae-1",
    country: "UAE",
    category: "Trade & Home Services",
    mode: "HYBRID",
    title: "Premium Smart Home Integrators",
    hook: "White-glove home automation for luxury villas.",
    investmentRange: "Low",
    trendSparkline: generateSparkline(),
    tier: "free",
    theGap: "Luxury real estate is booming, but standard smart home setups are fragmented. High-net-worth expats want a single, flawless system (Control4/Crestron).",
    whyNow: "Massive influx of global wealth into Dubai/Abu Dhabi post-2020.",
    marketSize: "$500M+ luxury smart home market in the UAE.",
    trendChartData: generateTrendData(150, 0.15),
    aiAngle: "AI proactive monitoring detects offline devices or slow networks and auto-dispatches a technician before the homeowner even notices.",
    gtmSteps: [
      "Get certified in high-end systems (Control4, KNX).",
      "Network aggressively with luxury real estate developers and interior designers.",
      "Offer an ultra-responsive SLA (2-hour on-site guarantee)."
    ],
    revenueModel: "50k-200k AED per installation + 5k AED/month maintenance retainer.",
    defensibility: "Brand prestige, elite networking, and technical complexity.",
    difficulty: "Requires Local Network",
    worksIn: ["UAE", "United Kingdom", "United States", "Rest of World"]
  },
  {
    id: "uae-2",
    country: "UAE",
    category: "Food & Hospitality",
    mode: "OFFLINE",
    title: "Ultra-Premium Meal Prep",
    hook: "Chef-prepared macros for high-performing expats.",
    investmentRange: "Mid",
    trendSparkline: generateSparkline(),
    tier: "pro",
    theGap: "Existing meal prep services are bland. Wealthy expats and fitness influencers want restaurant-quality meals tailored to exact macros.",
    whyNow: "Dubai's hyper-focus on fitness aesthetics and convenience.",
    marketSize: "$300M+ meal delivery market.",
    trendChartData: generateTrendData(80, 0.1),
    aiAngle: "AI dynamically generates menus based on the user's connected Oura ring data, adjusting macros based on sleep quality and workout intensity.",
    gtmSteps: [
      "Rent a cloud kitchen.",
      "Hire an executive chef from a high-end hotel.",
      "Market exclusively via fitness influencers in DIFC and Marina."
    ],
    revenueModel: "4,000-6,000 AED/month subscription. 50% margin.",
    defensibility: "Culinary quality and logistics precision in extreme heat.",
    difficulty: "Founder-Friendly",
    worksIn: ["UAE", "United Kingdom", "Australia"]
  },
  {
    id: "uae-3",
    country: "UAE",
    category: "AI-Augmented Offline",
    mode: "HYBRID",
    title: "AI Valet & Parking Optimization",
    hook: "Ticketless, frictionless valet for luxury venues.",
    investmentRange: "Low",
    trendSparkline: generateSparkline(),
    tier: "max",
    theGap: "Hotels and malls lose millions in valet inefficiency and damage claims. Customers hate waiting for paper tickets and cash payments.",
    whyNow: "Everything in Dubai is moving to ticketless/cashless.",
    marketSize: "Thousands of luxury hotels, clubs, and malls in the GCC.",
    trendChartData: generateTrendData(120, 0.12),
    aiAngle: "Computer vision logs the car's condition on entry to nullify fake damage claims. AI predicts when the guest will leave based on venue data and pre-fetches the car.",
    gtmSteps: [
      "Build the software platform using off-the-shelf LPR (License Plate Recognition) cameras.",
      "Run a free pilot at a high-end beach club.",
      "Sell B2B SaaS to hotel management groups."
    ],
    revenueModel: "10k AED/month SaaS per venue + setup fees.",
    defensibility: "B2B enterprise sales cycle and hardware integration.",
    difficulty: "Requires Local Network",
    worksIn: ["UAE", "Southeast Asia", "Rest of World"]
  },
  {
    id: "uae-4",
    country: "UAE",
    category: "Health & Wellness",
    mode: "OFFLINE",
    title: "Corporate Biohacking Pods",
    hook: "Recovery and focus stations for DIFC executives.",
    investmentRange: "Capital-Heavy",
    trendSparkline: generateSparkline(),
    tier: "pro",
    theGap: "High-stress financial workers in DIFC/ADGM need midday recovery but don't have time for a spa. They need 20-minute, high-impact interventions.",
    whyNow: "Biohacking is mainstream. Employers are investing heavily in executive performance.",
    marketSize: "Massive corporate wellness budgets in the GCC.",
    trendChartData: generateTrendData(60, 0.2),
    aiAngle: "AI adjusts the pod's light therapy, binaural beats, and temperature based on the executive's real-time HRV (Heart Rate Variability) to induce flow state or deep rest.",
    gtmSteps: [
      "Lease premium commercial space directly in DIFC.",
      "Install red light therapy, hyperbaric chambers, and cold plunges.",
      "Sell corporate memberships to banks and law firms."
    ],
    revenueModel: "2,500 AED/month individual memberships. 100k+ AED annual corporate deals.",
    defensibility: "Prime real estate access and high CAPEX.",
    difficulty: "Capital Intensive",
    worksIn: ["UAE", "United Kingdom", "United States"]
  },
  {
    id: "uae-5",
    country: "UAE",
    category: "Micro-Manufacturing",
    mode: "OFFLINE",
    title: "Luxury Auto Detailing & PPF",
    hook: "High-end protection for supercars.",
    investmentRange: "Mid",
    trendSparkline: generateSparkline(),
    tier: "max",
    theGap: "Dubai has the highest density of supercars globally. Owners want flawless Paint Protection Film (PPF) and ceramic coatings, but standard shops are dusty and careless.",
    whyNow: "Continuous growth in the ultra-luxury auto segment.",
    marketSize: "$200M+ aftermarket auto care in the UAE.",
    trendChartData: generateTrendData(90, 0.08),
    aiAngle: "AI optical scanners detect microscopic paint imperfections before coating, generating a visual 'health report' that justifies premium pricing to the owner.",
    gtmSteps: [
      "Set up a surgically clean, climate-controlled workshop in Al Quoz.",
      "Hire top-tier detailing talent from Europe or Asia.",
      "Partner with high-end dealerships for point-of-sale upselling."
    ],
    revenueModel: "15k-30k AED per full PPF wrap. 70% margin.",
    defensibility: "Extreme skill barrier for flawless PPF application and brand reputation.",
    difficulty: "Founder-Friendly",
    worksIn: ["UAE", "Rest of World"]
  },

  // SOUTHEAST ASIA
  {
    id: "sea-1",
    country: "Southeast Asia",
    category: "Food & Hospitality",
    mode: "HYBRID",
    title: "B2B Halal Cloud Ingredients",
    hook: "Certified halal pre-prepped ingredients for restaurants.",
    investmentRange: "Mid",
    trendSparkline: generateSparkline(),
    tier: "free",
    theGap: "Restaurants in Malaysia/Indonesia struggle to maintain consistent halal certification and prep quality across multiple outlets.",
    whyNow: "Rapid expansion of domestic restaurant chains in SEA.",
    marketSize: "$50B+ halal food industry in SEA.",
    trendChartData: generateTrendData(150, 0.12),
    aiAngle: "Blockchain+AI tracking ensures absolute traceability of every ingredient back to the farm, auto-generating compliance reports for halal auditors.",
    gtmSteps: [
      "Establish a central, fully certified prep kitchen in KL or Jakarta.",
      "Target mid-sized chains that lack their own central commissaries.",
      "Supply chopped veg, marinated meats, and base sauces."
    ],
    revenueModel: "B2B volume sales. High retention, low margin, massive scale.",
    defensibility: "Halal certification bureaucracy and logistics scale.",
    difficulty: "Requires Local Network",
    worksIn: ["Southeast Asia", "UAE", "Rest of World"]
  },
  {
    id: "sea-2",
    country: "Southeast Asia",
    category: "Trade & Home Services",
    mode: "HYBRID",
    title: "Motorbike Fleet Maintenance",
    hook: "B2B servicing for delivery gig fleets.",
    investmentRange: "Low",
    trendSparkline: generateSparkline(),
    tier: "pro",
    theGap: "Millions of Grab/Gojek drivers rely on informal street mechanics. Fleet operators (cloud kitchens, logistics cos) have no standardized way to maintain their bikes.",
    whyNow: "The gig economy in SEA is massive and totally dependent on two-wheelers.",
    marketSize: "10M+ commercial motorbikes in SEA.",
    trendChartData: generateTrendData(200, 0.09),
    aiAngle: "AI analyzes IoT telematics data from the bikes to predict breakdowns, auto-scheduling preventative maintenance during the driver's off-hours.",
    gtmSteps: [
      "Set up a central workshop and 5 mobile repair vans.",
      "Pitch fleet managers on reducing downtime.",
      "Offer subscription maintenance plans."
    ],
    revenueModel: "B2B retainers: $30/month per bike for standard maintenance.",
    defensibility: "Scale, operational efficiency, and B2B contracts.",
    difficulty: "Requires Local Network",
    worksIn: ["Southeast Asia", "India", "Rest of World"]
  },
  {
    id: "sea-3",
    country: "Southeast Asia",
    category: "Health & Wellness",
    mode: "OFFLINE",
    title: "Premium Confinement Centers",
    hook: "Modernized postpartum care for the rising middle class.",
    investmentRange: "Capital-Heavy",
    trendSparkline: generateSparkline(),
    tier: "max",
    theGap: "Traditional confinement practices (staying home for 30 days post-birth) are clashing with modern lifestyles. Urban couples want a hotel-like medical environment.",
    whyNow: "Rising disposable income and delayed childbirth means parents have more money to spend on postpartum care.",
    marketSize: "Rapidly growing $1B+ niche in SEA/East Asia.",
    trendChartData: generateTrendData(80, 0.16),
    aiAngle: "AI monitors baby's sleep and feeding patterns, generating personalized lactation and rest schedules for the mother to accelerate recovery.",
    gtmSteps: [
      "Lease a boutique hotel or large property.",
      "Hire trained nurses and traditional care experts.",
      "Market premium 28-day packages."
    ],
    revenueModel: "$5k-$15k per 28-day stay. High margins on add-ons (spa, consulting).",
    defensibility: "High CAPEX, operational intensity, and extreme brand trust.",
    difficulty: "Capital Intensive",
    worksIn: ["Southeast Asia", "Rest of World"]
  },
  {
    id: "sea-4",
    country: "Southeast Asia",
    category: "Education & Coaching",
    mode: "OFFLINE",
    title: "English Immersion Micro-Schools",
    hook: "After-school hubs run entirely in English.",
    investmentRange: "Low",
    trendSparkline: generateSparkline(),
    tier: "pro",
    theGap: "Public schools in Vietnam/Thailand teach rote English grammar. Parents want conversational fluency but international schools are too expensive.",
    whyNow: "A booming middle class desperate to give their kids global mobility.",
    marketSize: "$5B+ private tutoring market in SEA.",
    trendChartData: generateTrendData(120, 0.1),
    aiAngle: "AI language models power interactive role-playing kiosks where kids negotiate, order food, or solve mysteries in English, removing the pressure of human judgement.",
    gtmSteps: [
      "Rent a retail space in a middle-class suburb (e.g., in HCMC or Bangkok).",
      "Hire native speakers and design an activity-based curriculum (no textbooks).",
      "Market to aspirational parents."
    ],
    revenueModel: "$150-$300/month per student.",
    defensibility: "Brand reputation and quality of teachers.",
    difficulty: "Founder-Friendly",
    worksIn: ["Southeast Asia", "Rest of World"]
  },
  {
    id: "sea-5",
    country: "Southeast Asia",
    category: "Micro-Manufacturing",
    mode: "OFFLINE",
    title: "Upcycled Furniture Ateliers",
    hook: "Turning plastic waste into premium design pieces.",
    investmentRange: "Mid",
    trendSparkline: generateSparkline(),
    tier: "max",
    theGap: "SEA has a massive plastic waste problem. Concurrently, eco-conscious expat and upper-class markets want sustainable, high-design furniture.",
    whyNow: "Sustainability is moving from a buzzword to a purchasing requirement in premium segments.",
    marketSize: "Growing niche in the $20B+ SEA furniture market.",
    trendChartData: generateTrendData(50, 0.2),
    aiAngle: "AI generative design optimizes the structural integrity of recycled plastic beams, allowing for thinner, more elegant furniture designs that don't look 'recycled'.",
    gtmSteps: [
      "Acquire plastic shredding and extrusion machinery.",
      "Partner with local waste pickers for raw material.",
      "Design 3 core products (chair, table, lamp) and sell D2C/B2B to eco-resorts."
    ],
    revenueModel: "High margin premium products ($300+ per chair).",
    defensibility: "Brand narrative, specialized manufacturing process, and supply chain.",
    difficulty: "Founder-Friendly",
    worksIn: ["Southeast Asia", "Rest of World"]
  },

  // REST OF WORLD
  {
    id: "row-1",
    country: "Rest of World",
    category: "Trade & Home Services",
    mode: "HYBRID",
    title: "Drone Cleaning for Skyscrapers",
    hook: "Safer, faster window cleaning via tethered drones.",
    investmentRange: "Mid",
    trendSparkline: generateSparkline(),
    tier: "free",
    theGap: "Human window washing on high-rises is dangerous, slow, and expensive. Insurance premiums are skyrocketing.",
    whyNow: "Heavy-lift tethered drones are now reliable and legal in many jurisdictions.",
    marketSize: "$40B+ global commercial cleaning market.",
    trendChartData: generateTrendData(60, 0.25),
    aiAngle: "AI computer vision maps the building facade, identifying heavily soiled areas and automatically adjusting the drone's pressure washer intensity to avoid breaking glass.",
    gtmSteps: [
      "Purchase industrial tethered cleaning drones.",
      "Obtain commercial aviation clearances.",
      "Pitch facility managers of mid-rise buildings on cost/safety benefits."
    ],
    revenueModel: "$2k-$5k per building clean. Much lower OPEX than scaffolding.",
    defensibility: "Aviation regulations and heavy specialized hardware.",
    difficulty: "Requires Local Network",
    worksIn: ["Rest of World", "UAE", "United States", "Australia"]
  },
  {
    id: "row-2",
    country: "Rest of World",
    category: "AI-Augmented Offline",
    mode: "HYBRID",
    title: "AI Security Camera Retrofitting",
    hook: "Turning dumb CCTV into smart security for SMBs.",
    investmentRange: "Low",
    trendSparkline: generateSparkline(),
    tier: "pro",
    theGap: "Millions of retail stores have legacy CCTV systems that are only useful *after* a crime. Upgrading to full smart systems is too expensive.",
    whyNow: "Edge AI boxes can now process RTSP streams locally without cloud lag.",
    marketSize: "Huge global base of legacy CCTV installations.",
    trendChartData: generateTrendData(150, 0.18),
    aiAngle: "Plug an AI edge device into the existing DVR. It detects loitering, weapons, or shoplifting behaviors and instantly triggers alarms/notifications to the owner.",
    gtmSteps: [
      "Source white-label edge AI hardware.",
      "Partner with local security installers.",
      "Sell a 'smart upgrade' package to local retailers."
    ],
    revenueModel: "$500 installation + $50/month SaaS monitoring.",
    defensibility: "Sticky SaaS revenue and low customer acquisition friction (no ripping out old cameras).",
    difficulty: "Founder-Friendly",
    worksIn: ["Rest of World", "Southeast Asia", "India"]
  },
  {
    id: "row-3",
    country: "Rest of World",
    category: "Micro-Manufacturing",
    mode: "OFFLINE",
    title: "Hyperlocal 3D Printing Hubs",
    hook: "On-demand spare parts for industrial machinery.",
    investmentRange: "Capital-Heavy",
    trendSparkline: generateSparkline(),
    tier: "max",
    theGap: "Factories in emerging markets face massive downtime waiting weeks for specialized spare parts to be shipped from Europe or China.",
    whyNow: "Industrial metal and carbon-fiber 3D printing is faster and cheaper than ever.",
    marketSize: "Trillions lost globally to industrial downtime.",
    trendChartData: generateTrendData(80, 0.15),
    aiAngle: "AI analyzes broken parts via 3D scans, automatically reverse-engineers the CAD file, and optimizes the internal lattice structure for faster printing and higher strength.",
    gtmSteps: [
      "Set up a facility with industrial SLS and FDM printers.",
      "Target specific industries (e.g., maritime, agriculture, textiles).",
      "Offer guaranteed 48-hour part replacement."
    ],
    revenueModel: "Extremely high margin per part ($500-$5k+ depending on complexity).",
    defensibility: "High CAPEX, deep engineering expertise, and B2B trust.",
    difficulty: "Capital Intensive",
    worksIn: ["Rest of World", "Southeast Asia", "India"]
  },
  {
    id: "row-4",
    country: "Rest of World",
    category: "Family Business Transformation",
    mode: "HYBRID",
    title: "Digital Freight Forwarding Brokers",
    hook: "Tech-enabled logistics for legacy importers.",
    investmentRange: "Low",
    trendSparkline: generateSparkline(),
    tier: "pro",
    theGap: "Local importers/exporters still manage global shipping via WhatsApp, Excel, and PDFs. It's opaque, slow, and error-prone.",
    whyNow: "APIs from shipping lines and customs authorities are finally standardizing.",
    marketSize: "Massive, fragmented global freight forwarding market.",
    trendChartData: generateTrendData(110, 0.12),
    aiAngle: "AI OCR extracts data from messy PDFs and emails, automatically generating customs declarations and finding the optimal routing across multiple carriers.",
    gtmSteps: [
      "Build a modern dashboard (using no-code/low-code tools).",
      "Act as a digital-first broker for 5-10 local importing businesses.",
      "Scale by taking a margin on the freight cost."
    ],
    revenueModel: "10-15% margin on freight bookings.",
    defensibility: "Deep integration into the customer's supply chain.",
    difficulty: "Requires Local Network",
    worksIn: ["Rest of World", "Southeast Asia", "UAE"]
  },
  {
    id: "row-5",
    country: "Rest of World",
    category: "Health & Wellness",
    mode: "OFFLINE",
    title: "Mobile Dental Clinics",
    hook: "B2B preventative dental care at corporate offices.",
    investmentRange: "Mid",
    trendSparkline: generateSparkline(),
    tier: "max",
    theGap: "Professionals skip dentist appointments because they are inconvenient. HR departments are looking for high-impact wellness perks.",
    whyNow: "Mobile medical infrastructure is proven post-COVID.",
    marketSize: "Growing corporate wellness market globally.",
    trendChartData: generateTrendData(70, 0.14),
    aiAngle: "AI-assisted X-ray analysis instantly highlights early cavities or issues, providing a visual report that increases the conversion rate for follow-up treatments.",
    gtmSteps: [
      "Retrofit a van into a compliant mobile dental suite.",
      "Hire a hygienist and a dentist.",
      "Pitch HR directors at large corporate parks."
    ],
    revenueModel: "Billed directly to employee insurance + corporate retainer.",
    defensibility: "Regulatory compliance and B2B corporate contracts.",
    difficulty: "Capital Intensive",
    worksIn: ["Rest of World", "United States", "United Kingdom", "Australia"]
  }
];
