import type { StyleKey } from "./types";

export type CompanyType = { id: string; label: string; sub: string; style: StyleKey; companies: string[] };
export type Family = { id: string; label: string; role: string; types: CompanyType[]; worries: string[] };

const P = (id: string, label: string, sub: string, style: StyleKey, companies: string[]): CompanyType => ({ id, label, sub, style, companies });

export const FAMILIES: Family[] = [
  { id: "sde", label: "Software Engineering", role: "Software Engineer (SDE)", worries: ["DSA / CS fundamentals", "System design", "Explaining my projects", "Nerves and blanking out"], types: [
    P("sde-product", "Product-based", "Amazon, Google, Microsoft", "product", ["Amazon", "Google", "Microsoft", "Adobe", "Atlassian", "Flipkart", "Uber", "Walmart Global Tech"]),
    P("sde-service", "Service-based", "TCS, Infosys, Wipro", "service", ["TCS", "Infosys", "Wipro", "HCLTech", "Cognizant", "Capgemini", "Accenture", "LTIMindtree"]),
    P("sde-startup", "Startup", "Razorpay, CRED, Zepto", "startup", ["Razorpay", "CRED", "Zepto", "Groww", "Swiggy", "PhonePe", "Meesho", "Postman"]),
    P("sde-fin", "Fintech / Finance tech", "Goldman, JP Morgan", "product", ["Goldman Sachs", "JP Morgan", "Morgan Stanley", "American Express", "Visa", "Mastercard", "Deutsche Bank"]),
  ]},
  { id: "data", label: "Data / AI / Analytics", role: "Data Scientist / Analyst", worries: ["Statistics and ML theory", "SQL and case studies", "Explaining my projects", "Nerves and blanking out"], types: [
    P("data-product", "Big tech / AI teams", "Google, Microsoft, Amazon", "product", ["Google", "Microsoft", "Amazon", "Flipkart", "Walmart Global Tech", "Adobe", "Uber"]),
    P("data-analytics", "Analytics firms", "Fractal, Mu Sigma, ZS", "service", ["Fractal Analytics", "Mu Sigma", "ZS Associates", "Tiger Analytics", "LatentView", "Tredence", "Genpact"]),
    P("data-startup", "Startups", "Zepto, Swiggy, Groww", "startup", ["Zepto", "Swiggy", "Groww", "CRED", "Razorpay", "Meesho", "PhonePe"]),
    P("data-bfsi", "Banks and finance", "JP Morgan, Amex, HDFC", "service", ["JP Morgan", "Goldman Sachs", "American Express", "HDFC Bank", "Axis Bank", "Barclays"]),
  ]},
  { id: "consulting", label: "Consulting", role: "Business / Technology Consultant", worries: ["Case structuring", "Guesstimates and mental math", "Fit and behavioural questions", "Nerves and blanking out"], types: [
    P("con-big4", "Big Four", "Deloitte, PwC, EY, KPMG", "consulting", ["Deloitte", "PwC", "EY", "KPMG"]),
    P("con-strategy", "Strategy firms", "McKinsey, BCG, Bain", "consulting", ["McKinsey", "BCG", "Bain", "Oliver Wyman", "Kearney"]),
    P("con-mid", "Mid-tier consulting", "ZS, Kearney, Alvarez", "consulting", ["ZS Associates", "Kearney", "Alvarez & Marsal", "L.E.K.", "Simon-Kucher", "Avalon Consulting"]),
    P("con-tech", "Tech consulting", "Accenture, Capgemini Invent", "consulting", ["Accenture", "Capgemini Invent", "IBM Consulting", "Thoughtworks", "Cognizant Consulting", "Deloitte Digital"]),
  ]},
  { id: "pm", label: "Product Management", role: "Associate Product Manager", worries: ["Product sense", "Metrics and analytics", "Execution and prioritisation", "Nerves and blanking out"], types: [
    P("pm-bigtech", "Big tech", "Google, Microsoft, Amazon", "product", ["Google", "Microsoft", "Amazon", "Adobe", "Atlassian", "Uber"]),
    P("pm-startup", "Consumer startups", "Zepto, Swiggy, Meesho", "startup", ["Zepto", "Swiggy", "Meesho", "CRED", "Groww", "PhonePe"]),
    P("pm-saas", "B2B SaaS", "Freshworks, Zoho, Postman", "product", ["Freshworks", "Zoho", "Postman", "Chargebee", "Atlassian", "Salesforce"]),
  ]},
];

export const familyById = (id: string) => FAMILIES.find((f) => f.id === id);
export const typeById = (famId: string, typeId: string) => familyById(famId)?.types.find((t) => t.id === typeId);
export const ROLES = FAMILIES.map((f) => f.role).concat(["Frontend Developer", "Backend Developer", "HR / General"]);
export const TONES = [
  { id: "friendly", name: "Friendly", sub: "Patient, encouraging", persona: "Priya", voice: "Nalini" },
  { id: "balanced", name: "Balanced", sub: "Professional, fair", persona: "Arjun", voice: "Deepak" },
  { id: "strict", name: "Strict", sub: "Skeptical, high bar", persona: "Mr. Kapoor", voice: "Deepak" },
] as const;
export const DURATIONS = [{ m: 5, name: "Quick", sub: "5 min" }, { m: 10, name: "Standard", sub: "10 min" }, { m: 15, name: "Deep", sub: "15 min" }, { m: 20, name: "Long", sub: "20 min" }, { m: 30, name: "Marathon", sub: "30 min" }];
