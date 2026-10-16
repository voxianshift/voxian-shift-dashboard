// Static demo data (spec: Customer Support Specialist, routine-heavy workload)
import { computeExposure } from "@voxian/shared"

export const ROLE = {
  title: "Customer Support Specialist",
  code: "ISCO-08 4222 · O*NET 43-4051.00",
}

export const TASKS = [
  { name: "Standard FAQ & billing inquiries", exposure: 0.95, weight: 0.45, moat: false },
  { name: "Ticket categorisation & CRM routing", exposure: 0.85, weight: 0.3, moat: false },
  { name: "Dispute de-escalation & churn retention", exposure: 0.2, weight: 0.15, moat: true },
  { name: "Cross-team engineering diplomacy", exposure: 0.35, weight: 0.1, moat: true },
]

export const EXPOSURE = computeExposure(TASKS)

export const BRANCHES = [
  {
    name: "AI Support Ops",
    color: "bg-chart-3",
    roles: ["Frontend Support Integrator", "RAG Pipeline Architect", "Head of CX Automation"],
    fit: "Systems",
  },
  {
    name: "Strategic Client Advocate",
    color: "bg-warning",
    roles: ["Escalation Lead", "Client Success Partner", "VP of Customer Trust"],
    fit: "Empathy",
  },
  {
    name: "AI Ethics & Evaluation",
    color: "bg-tertiary",
    roles: ["Conversational QA Lead", "Sentiment Specialist", "AI Ethics Auditor"],
    fit: "Governance",
  },
]

export const OCCUPATIONS = [
  { title: "Customer Support Specialist", code: "4222", exposure: 74.8, status: "Available" },
  {
    title: "Administrative & Executive Assistant",
    code: "4120",
    exposure: 68.2,
    status: "Available",
  },
  { title: "Loan Officer", code: "3312", exposure: 61.5, status: "Coming soon" },
  { title: "Paralegal", code: "3411", exposure: 57.9, status: "Coming soon" },
]

export const MILESTONES = [
  {
    phase: "Foundation",
    days: "Days 1–30",
    goal: "Audit your ticket queue and find where bots fail.",
    done: true,
  },
  {
    phase: "Bridge project",
    days: "Days 31–75",
    goal: "Build a human-in-the-loop fallback for complex cases.",
    done: false,
  },
  {
    phase: "Target role",
    days: "Days 76–120",
    goal: "Move into an escalation lead or AI operations role.",
    done: false,
  },
]

export const SKILLS = [
  { name: "Conflict de-escalation", level: 80 },
  { name: "Workflow automation", level: 35 },
  { name: "Prompt design", level: 25 },
  { name: "Data literacy", level: 45 },
]

export const RESOURCES = [
  { title: "Prompt engineering basics", provider: "Google Cloud Skills Boost", free: true },
  { title: "Generative AI and jobs", provider: "International Labour Organization", free: true },
  { title: "AI Risk Management Framework", provider: "NIST", free: true },
  { title: "AI governance certification", provider: "IAPP", free: false },
  { title: "Generative AI for everyone", provider: "DeepLearning.AI", free: false },
]

export const INSIGHTS = [
  {
    date: "2024",
    label: "Observed",
    text: "Tier-1 chat agents widely piloted in contact centres.",
  },
  {
    date: "May 2025",
    label: "Source",
    text: "ILO refined index on generative AI exposure by occupation.",
  },
  {
    date: "2026",
    label: "Now",
    text: "Routine triage largely automated; complex disputes rising.",
  },
  {
    date: "2027–28",
    label: "Scenario",
    text: "Augmentation, autonomy or regulation: three possible paths.",
  },
]
