// Verbatim navigator / curated-role logic extracted from voxian-shift-v2.3.8.html (single-file prototype).
// Reference only: not imported by the app. Section headers give original line ranges.

// ════ ROLE_DATA: role catalogue (ISCO, gradient, keywords used for matching) — source lines 1252-1280 ════
const ROLE_DATA = {
  cs_rep: {
    name: "Customer Service Representative (4222)",
    isco: "4222",
    gradient: "G3",
    mu: 0.58,
    sigma: 0.12,
    score: 74.8,
    keywords: [
      "customer service",
      "customer support",
      "call centre",
      "call center",
      "cx",
      "service rep",
      "support specialist",
      "customer care",
      "helpdesk",
      "help desk",
      "service agent",
      "contact centre",
    ],
  },
  admin_asst: {
    name: "Administrative / Secretary Assistant (4120)",
    isco: "4120",
    gradient: "G3",
    mu: 0.56,
    sigma: 0.13,
    score: 71.2,
    keywords: [
      "admin",
      "administrative",
      "secretary",
      "office assistant",
      "executive assistant",
      "personal assistant",
      "office manager",
      "clerical",
      "administrator",
      "ea",
      "pa",
    ],
  },
  bank_teller: {
    name: "Bank Teller / Financial Clerk (4211)",
    isco: "4211",
    gradient: "G4",
    mu: 0.72,
    sigma: 0.1,
    score: 88.5,
    keywords: [
      "bank teller",
      "teller",
      "banking",
      "financial clerk",
      "bank clerk",
      "cashier bank",
      "branch banking",
      "bank officer",
      "retail banking",
    ],
  },
  data_entry: {
    name: "Data Entry / Processing Clerk (4132)",
    isco: "4132",
    gradient: "G4",
    mu: 0.74,
    sigma: 0.09,
    score: 91.3,
    keywords: [
      "data entry",
      "data processing",
      "data clerk",
      "typing",
      "encoder",
      "keying",
      "input clerk",
      "bpo",
      "transcription",
      "records clerk",
      "document processing",
    ],
  },
  bookkeeper: {
    name: "Bookkeeper / Accounts Payable Clerk (4311)",
    isco: "4311",
    gradient: "G4",
    mu: 0.68,
    sigma: 0.11,
    score: 82.4,
    keywords: [
      "bookkeeper",
      "bookkeeping",
      "accounts payable",
      "accounts receivable",
      "ap clerk",
      "ar clerk",
      "accounting clerk",
      "junior accountant",
      "finance clerk",
      "ledger",
    ],
  },
  payroll_hr: {
    name: "Payroll / HR Admin Specialist (4415/4110)",
    isco: "4415/4110",
    gradient: "G3",
    mu: 0.54,
    sigma: 0.12,
    score: 68.9,
    keywords: [
      "payroll",
      "hr admin",
      "human resources admin",
      "hris",
      "compensation",
      "benefits admin",
      "hr coordinator",
      "hr officer",
      "people ops",
    ],
  },
  paralegal: {
    name: "Paralegal / Legal Researcher (3411)",
    isco: "3411",
    gradient: "G3",
    mu: 0.52,
    sigma: 0.13,
    score: 65.4,
    keywords: [
      "paralegal",
      "legal assistant",
      "legal researcher",
      "legal secretary",
      "law clerk",
      "legal aide",
      "legal support",
      "contracts reviewer",
    ],
  },
  content_mod: {
    name: "Content Moderator / Trust & Safety (3521)",
    isco: "3521",
    gradient: "G3",
    mu: 0.55,
    sigma: 0.12,
    score: 70.1,
    keywords: [
      "content moderator",
      "content moderation",
      "trust safety",
      "t&s",
      "platform safety",
      "community manager",
      "policy enforcement",
      "review analyst",
      "moderation",
    ],
  },
  hr_recruiter: {
    name: "HR Recruiter / Talent Acquisition (1212)",
    isco: "1212",
    gradient: "G3",
    mu: 0.5,
    sigma: 0.13,
    score: 62.7,
    keywords: [
      "recruiter",
      "talent acquisition",
      "hr recruiter",
      "headhunter",
      "sourcer",
      "staffing",
      "hiring manager",
      "talent specialist",
      "recruitment",
      "ta specialist",
    ],
  },
  software_dev: {
    name: "Software Developer / Applications Programmer (2512/2514/2519)",
    isco: "2512/2514/2519",
    gradient: "G2",
    mu: 0.44,
    sigma: 0.11,
    score: 48.2,
    keywords: [
      "software developer",
      "programmer",
      "developer",
      "software engineer",
      "application developer",
      "coder",
      "full stack",
      "frontend",
      "backend",
      "web developer",
      "app developer",
    ],
  },
  logistics_coord: {
    name: "Logistics / Supply Chain Coordinator (3331)",
    isco: "3331",
    gradient: "G3",
    mu: 0.53,
    sigma: 0.12,
    score: 67.3,
    keywords: [
      "logistics",
      "supply chain",
      "logistics coordinator",
      "freight",
      "shipping",
      "warehouse",
      "operations coordinator",
      "dispatch",
      "procurement",
      "inventory",
    ],
  },
  sales_rep: {
    name: "Sales Representative / Account Executive (3322/2434)",
    isco: "3322/2434",
    gradient: "G3",
    mu: 0.51,
    sigma: 0.13,
    score: 63.8,
    keywords: [
      "sales rep",
      "sales representative",
      "account executive",
      "business development",
      "bdm",
      "sales executive",
      "field sales",
      "inside sales",
      "ict sales",
      "commercial executive",
    ],
  },
  graphic_designer: {
    name: "Graphic / Visual Designer (2166)",
    isco: "2166",
    gradient: "G2",
    mu: 0.45,
    sigma: 0.12,
    score: 50.6,
    keywords: [
      "graphic designer",
      "visual designer",
      "designer",
      "illustrator",
      "brand designer",
      "creative designer",
      "art director",
      "ui designer",
      "ux designer",
      "motion designer",
    ],
  },
  ecom_coord: {
    name: "E-Commerce / Retail Coordinator (5223)",
    isco: "5223",
    gradient: "G3",
    mu: 0.55,
    sigma: 0.12,
    score: 69.8,
    keywords: [
      "ecommerce",
      "e-commerce",
      "retail",
      "online store",
      "marketplace",
      "shopify",
      "tokopedia",
      "lazada",
      "shopee",
      "product listing",
      "merchandise coordinator",
    ],
  },
  call_centre_lead: {
    name: "Call Centre / CX Team Leader (1120)",
    isco: "1120",
    gradient: "G3",
    mu: 0.5,
    sigma: 0.13,
    score: 62.1,
    keywords: [
      "call centre leader",
      "call center manager",
      "cx manager",
      "team leader call",
      "contact centre manager",
      "customer experience lead",
      "cx lead",
      "support manager",
      "service manager",
    ],
  },
  financial_analyst: {
    name: "Financial Analyst / Investment Analyst (2413)",
    isco: "2413",
    gradient: "G2",
    mu: 0.46,
    sigma: 0.11,
    score: 52.3,
    keywords: [
      "financial analyst",
      "investment analyst",
      "equity analyst",
      "finance analyst",
      "equity research",
      "portfolio analyst",
      "fp&a",
      "financial modelling",
      "risk analyst",
      "credit analyst",
    ],
  },
  accountant: {
    name: "Accountant / Auditor (2411)",
    isco: "2411",
    gradient: "G2",
    mu: 0.45,
    sigma: 0.12,
    score: 50.1,
    keywords: [
      "accountant",
      "auditor",
      "chartered accountant",
      "ca",
      "cpa",
      "audit",
      "tax accountant",
      "management accountant",
      "financial accountant",
      "external audit",
    ],
  },
  medical_records: {
    name: "Medical Records / Health Info Technician (3252)",
    isco: "3252",
    gradient: "G3",
    mu: 0.58,
    sigma: 0.11,
    score: 73.9,
    keywords: [
      "medical records",
      "health information",
      "medical coder",
      "icd coding",
      "clinical coder",
      "health data",
      "hospital admin",
      "medical admin",
      "emr",
      "ehr",
    ],
  },
  insurance_claims: {
    name: "Insurance Claims / Underwriting Assistant (3322)",
    isco: "3322",
    gradient: "G3",
    mu: 0.56,
    sigma: 0.12,
    score: 71.5,
    keywords: [
      "insurance",
      "claims",
      "underwriter",
      "insurance adjuster",
      "loss adjuster",
      "claims analyst",
      "insurance clerk",
      "policy admin",
      "actuarial",
    ],
  },
  journalist_writer: {
    name: "Journalist / Content Writer (2642)",
    isco: "2642",
    gradient: "G2",
    mu: 0.47,
    sigma: 0.13,
    score: 54.7,
    keywords: [
      "journalist",
      "writer",
      "content writer",
      "copywriter",
      "editor",
      "blogger",
      "reporter",
      "editorial",
      "news writer",
      "content creator",
      "technical writer",
    ],
  },
  teacher_trainer: {
    name: "Teacher / Corporate Trainer (2320/2330)",
    isco: "2320/2330",
    gradient: "G2",
    mu: 0.42,
    sigma: 0.13,
    score: 45.8,
    keywords: [
      "teacher",
      "trainer",
      "educator",
      "instructor",
      "lecturer",
      "tutor",
      "corporate trainer",
      "learning development",
      "l&d",
      "facilitator",
      "professor",
    ],
  },
  digital_marketer: {
    name: "Digital Marketer / SEO Specialist (2431)",
    isco: "2431",
    gradient: "G2",
    mu: 0.48,
    sigma: 0.12,
    score: 57.2,
    keywords: [
      "digital marketer",
      "marketing",
      "seo",
      "sem",
      "social media",
      "growth hacker",
      "performance marketer",
      "paid media",
      "google ads",
      "facebook ads",
      "content marketer",
    ],
  },
  project_manager: {
    name: "Project / Programme Manager (2421)",
    isco: "2421",
    gradient: "G2",
    mu: 0.43,
    sigma: 0.12,
    score: 47.5,
    keywords: [
      "project manager",
      "programme manager",
      "pm",
      "pmo",
      "scrum master",
      "delivery manager",
      "agile",
      "prince2",
      "pmp",
      "project lead",
      "portfolio manager",
    ],
  },
  data_analyst: {
    name: "Data / Business Intelligence Analyst (2512)",
    isco: "2512",
    gradient: "G2",
    mu: 0.44,
    sigma: 0.11,
    score: 48.9,
    keywords: [
      "data analyst",
      "business analyst",
      "bi analyst",
      "business intelligence",
      "data science",
      "sql",
      "tableau",
      "power bi",
      "analytics",
      "reporting analyst",
    ],
  },
  architect_designer: {
    name: "Architect / Interior & Industrial Designer (2161/2163)",
    isco: "2161/2163",
    gradient: "G2",
    mu: 0.41,
    sigma: 0.12,
    score: 44.3,
    keywords: [
      "architect",
      "interior designer",
      "industrial designer",
      "bim",
      "autocad",
      "revit",
      "product designer",
      "ux product",
      "spatial designer",
      "building designer",
    ],
  },
  translator: {
    name: "Translator / Interpreter / Localisation (2643)",
    isco: "2643",
    gradient: "G2",
    mu: 0.49,
    sigma: 0.13,
    score: 59.8,
    keywords: [
      "translator",
      "interpreter",
      "localisation",
      "localization",
      "language specialist",
      "subtitler",
      "transcriber",
      "language service",
      "content localiser",
      "post-editor",
    ],
  },
  travel_agent: {
    name: "Travel Agent / Tour Coordinator (4221)",
    isco: "4221",
    gradient: "G3",
    mu: 0.6,
    sigma: 0.11,
    score: 77.3,
    keywords: [
      "travel agent",
      "tour coordinator",
      "travel consultant",
      "ticketing agent",
      "travel planner",
      "holiday planner",
      "gds",
      "amadeus",
      "sabre",
      "airline ticketing",
      "tourism",
    ],
  },
}

// ════ ROLE_BRANCHES: curated 4-branch roles per occupation (foundation + leaves) — source lines 1284-2018 ════
const ROLE_BRANCHES = {
  cs_rep: [
    {
      id: "branch_ops",
      name: "AI Support Ops & Engineering",
      color: "#00f2fe",
      glowClass: "glow-cyan",
      curvePoints: "M 140 380 C 260 380, 320 180, 480 180",
      midX: 480,
      midY: 180,
      midTitle: "SUPPORT OPS ENGINEER",
      midSkills: ["Prompt Tuning: 92%", "Zapier/n8n: 88%", "API Flow: 85%"],
      foundation: {
        title: "Prompt Tuning & Exception Triage",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30 (Weeks 1–4)",
        description:
          "Audit automated bot conversation logs, identify escalation failure triggers, and calibrate domain prompts.",
        humanEdge:
          "Catching contextual hallucinations, compliance breaches, and customer emotional tone misalignments.",
        skills: ["RAG Knowledge Base QA", "Prompt Engineering", "Ticket Taxonomy"],
        resources: [
          {
            type: "free",
            title: "Google Cloud Prompt Engineering Course",
            platform: "Google Cloud Skills Boost",
            badge: "Free Certified",
            link: "https://www.cloudskillsboost.google/",
          },
          {
            type: "paid",
            title: "Enterprise LLM Evaluator & Guardrails Certification",
            platform: "DeepLearning.AI / Coursera Plus",
            badge: "Premium Cert ($49)",
            link: "https://www.coursera.org/",
          },
        ],
      },
      leaves: [
        {
          id: "leaf_fe",
          title: "Frontend Support Integrator",
          x: 740,
          y: 120,
          pathD: "M 480 180 C 580 180, 640 120, 740 120",
          stage: "Intermediate Specialist",
          duration: "Days 31–60",
          skills: ["React CX Components", "Widget SDKs", "Session Logging"],
          humanEdge: "Designing interfaces that hand off to humans at the right moment.",
          resources: [],
        },
        {
          id: "leaf_be",
          title: "Agentic RAG Pipeline Architect",
          x: 740,
          y: 180,
          pathD: "M 480 180 L 740 180",
          stage: "Advanced Destination",
          duration: "Days 61–90",
          skills: ["Vector DB Hygiene", "RAG Chunking", "Fallback Triggers"],
          humanEdge: "Understanding when retrieval precision matters more than speed.",
          resources: [],
        },
        {
          id: "leaf_devops",
          title: "Head of CX Automation",
          x: 740,
          y: 240,
          pathD: "M 480 180 C 580 180, 640 240, 740 240",
          stage: "Target Leadership",
          duration: "Days 91–120+",
          skills: ["Vendor AI Benchmarks", "Retention Economics", "Cross-Silo Leadership"],
          humanEdge: "Cross-functional trust and boardroom-level communication of risk.",
          resources: [],
        },
      ],
    },
    {
      id: "branch_ai_specialist",
      name: "AI Specialist & Evaluation",
      color: "#b000ff",
      glowClass: "glow-purple",
      curvePoints: "M 140 380 C 260 380, 340 320, 520 320",
      midX: 520,
      midY: 320,
      midTitle: "AI EVALUATION SPECIALIST",
      midSkills: ["Red Teaming: 95%", "Bias Audit: 90%", "Eval Rubrics: 89%"],
      foundation: {
        title: "Conversational Vulnerability Testing",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30 (Weeks 1–4)",
        description:
          "Stress-test enterprise chatbots for edge cases, bias, and safety failures using structured red-teaming methodologies.",
        humanEdge:
          "Adversarial social intuition — knowing how real users push systems beyond their guardrails.",
        skills: ["AI Red Teaming", "Responsible AI Standards", "Data Privacy Rules"],
        resources: [
          {
            type: "free",
            title: "Responsible AI & Prompt Red Teaming Guide",
            platform: "Microsoft Learn",
            badge: "Free Certified",
            link: "https://learn.microsoft.com/",
          },
          {
            type: "paid",
            title: "Certified AI Governance Professional (AIGP)",
            platform: "IAPP",
            badge: "Global Standard ($550)",
            link: "https://iapp.org/certify/aigp/",
          },
        ],
      },
      leaves: [
        {
          id: "leaf_ml",
          title: "Conversational Vulnerability Lead",
          x: 820,
          y: 280,
          pathD: "M 520 320 C 640 320, 720 280, 820 280",
          stage: "Intermediate Specialist",
          duration: "Days 31–75",
          skills: ["Jailbreak Identification", "Safety Rubrics", "Policy Mapping"],
          humanEdge: "Empathy for how real users deviate from expected flows.",
          resources: [],
        },
        {
          id: "leaf_nlp",
          title: "NLP Voice & Sentiment Specialist",
          x: 820,
          y: 360,
          pathD: "M 520 320 C 640 320, 720 360, 820 360",
          stage: "Advanced Destination",
          duration: "Days 76–120+",
          skills: ["Vocal Tone Telemetry", "Sentiment Modeling", "Speech-to-Text Auditing"],
          humanEdge: "Reading emotional subtext that models still miss.",
          resources: [],
        },
      ],
    },
    {
      id: "branch_product",
      name: "Strategic Client Advocate & PM",
      color: "#f59e0b",
      glowClass: "glow-amber",
      curvePoints: "M 140 380 C 260 380, 340 480, 520 480",
      midX: 520,
      midY: 480,
      midTitle: "PRODUCT & CX STRATEGIST",
      midSkills: ["Dispute Mediation: 94%", "VOC Synthesis: 91%", "Retention Law: 88%"],
      foundation: {
        title: "Complex Negotiation & Dispute Mediation",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30 (Weeks 1–4)",
        description:
          "Take ownership of top-tier escalated disputes requiring discretion, authority and human accountability.",
        humanEdge:
          "High EQ, empathetic listening, and understanding of power dynamics in commercial disputes.",
        skills: ["Crisis De-escalation", "Commercial Dispute Law", "Active Listening"],
        resources: [
          {
            type: "free",
            title: "Harvard PON: Negotiation & Dispute Working Paper",
            platform: "Program on Negotiation (Harvard Law)",
            badge: "Free Academic",
            link: "https://www.pon.harvard.edu/",
          },
          {
            type: "paid",
            title: "Advanced Crisis Communication & High-Conflict Mediation",
            platform: "High Conflict Institute",
            badge: "Premium Cert ($99)",
            link: "https://highconflictinstitute.com/",
          },
        ],
      },
      leaves: [
        {
          id: "leaf_pm1",
          title: "High-Stakes Escalation Lead",
          x: 820,
          y: 440,
          pathD: "M 520 480 C 640 480, 720 440, 820 440",
          stage: "Intermediate Specialist",
          duration: "Days 31–75",
          skills: ["Crisis Communication", "Discretionary Settlements", "De-escalation"],
          humanEdge: "Reading power dynamics in high-value disputes.",
          resources: [],
        },
        {
          id: "leaf_pm2",
          title: "Enterprise Client Success Partner",
          x: 820,
          y: 520,
          pathD: "M 520 480 C 640 480, 720 520, 820 520",
          stage: "Target Leadership",
          duration: "Days 76–120+",
          skills: ["Contract Renegotiation", "Executive Advisory", "Relationship Trust"],
          humanEdge: "Long-term trust that no AI can substitute.",
          resources: [],
        },
      ],
    },
    {
      id: "branch_governance",
      name: "Enterprise AI Ethics Auditor",
      color: "#f72585",
      glowClass: "glow-magenta",
      curvePoints: "M 140 380 C 260 380, 320 620, 480 620",
      midX: 480,
      midY: 620,
      midTitle: "ETHICS & AUDIT SPECIALIST",
      midSkills: ["Regulatory Audit: 96%", "Compliance: 92%", "Privacy: 90%"],
      foundation: {
        title: "Corporate AI Compliance & Risk Mapping",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30 (Weeks 1–4)",
        description:
          "Formulate corporate AI moderation standards and map regulatory risk across jurisdictions.",
        humanEdge: "Navigating ethical ambiguity and translating policy into practice.",
        skills: ["AI Compliance Frameworks", "Risk Assessment", "Audit Logging"],
        resources: [
          {
            type: "free",
            title: "NIST AI Risk Management Framework (AI RMF 1.0)",
            platform: "NIST Gov Open Docs",
            badge: "Free Standard",
            link: "https://www.nist.gov/itl/ai-risk-management-framework",
          },
          {
            type: "paid",
            title: "Certified AI Governance Professional (AIGP)",
            platform: "IAPP",
            badge: "Global Standard ($550)",
            link: "https://iapp.org/certify/aigp/",
          },
        ],
      },
      leaves: [
        {
          id: "leaf_gov1",
          title: "Responsible AI Standards Lead",
          x: 740,
          y: 590,
          pathD: "M 480 620 C 580 620, 640 590, 740 590",
          stage: "Intermediate Specialist",
          duration: "Days 31–75",
          skills: ["EU AI Act Alignment", "Algorithmic Impact", "Audit Logs"],
          humanEdge: "Translating regulatory language into human-scale decisions.",
          resources: [],
        },
        {
          id: "leaf_gov2",
          title: "Enterprise AI Safety Auditor",
          x: 740,
          y: 650,
          pathD: "M 480 620 C 580 620, 640 650, 740 650",
          stage: "Target Leadership",
          duration: "Days 76–120+",
          skills: ["Independent Verification", "Model Governance", "Legal Risk"],
          humanEdge: "Independent moral accountability in gray-area decisions.",
          resources: [],
        },
      ],
    },
  ],
  admin_asst: [
    {
      id: "br_offauto",
      name: "Office Automation Specialist",
      color: "#00f2fe",
      glowClass: "glow-cyan",
      curvePoints: "M 140 380 C 260 380, 320 180, 480 180",
      midX: 480,
      midY: 180,
      midTitle: "AUTOMATION SPECIALIST",
      midSkills: ["Workflow AI: 91%", "No-Code Tools: 87%", "Doc Automation: 85%"],
      foundation: {
        title: "Workflow Automation & AI Tools Setup",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Automate routine admin tasks using no-code tools like Zapier, Make, and Microsoft Power Automate. Build document templates and scheduling systems.",
        humanEdge: "Judgment about when automation fails and human discretion is needed.",
        skills: ["Power Automate", "Zapier", "Document Templating"],
        resources: [
          {
            type: "free",
            title: "Microsoft Power Automate Learning Path",
            platform: "Microsoft Learn",
            badge: "Free Certified",
            link: "https://learn.microsoft.com/",
          },
          {
            type: "paid",
            title: "No-Code Automation Certification",
            platform: "Zapier Academy",
            badge: "Professional Cert ($99)",
            link: "https://zapier.com/learn",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Process Automation Lead",
          x: 740,
          y: 120,
          pathD: "M 480 180 C 580 180, 640 120, 740 120",
          stage: "Intermediate",
          duration: "Days 31–60",
          skills: ["RPA Design", "API Connectors", "Workflow QA"],
          humanEdge: "Identifying edge cases humans catch that bots miss.",
          resources: [],
        },
        {
          id: "l2",
          title: "Digital Operations Manager",
          x: 740,
          y: 180,
          pathD: "M 480 180 L 740 180",
          stage: "Advanced",
          duration: "Days 61–90",
          skills: ["Process Mining", "OKR Dashboards", "Change Management"],
          humanEdge: "Stakeholder alignment and change leadership.",
          resources: [],
        },
        {
          id: "l3",
          title: "Enterprise Transformation Lead",
          x: 740,
          y: 240,
          pathD: "M 480 180 C 580 180, 640 240, 740 240",
          stage: "Leadership",
          duration: "Days 91–120+",
          skills: ["Business Architecture", "ERP Integration", "C-Suite Advisory"],
          humanEdge: "Translating digital strategy into human outcomes.",
          resources: [],
        },
      ],
    },
    {
      id: "br_execai",
      name: "Executive AI Assistant",
      color: "#b000ff",
      glowClass: "glow-purple",
      curvePoints: "M 140 380 C 260 380, 340 320, 520 320",
      midX: 520,
      midY: 320,
      midTitle: "EXEC AI ASSISTANT",
      midSkills: ["AI Scheduling: 93%", "Briefing Gen: 90%", "Strategic Comms: 88%"],
      foundation: {
        title: "AI-Augmented Executive Support",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Use AI tools to prepare executive briefings, manage complex schedules, and synthesize information for leadership.",
        humanEdge:
          "Trust, confidentiality, and reading what the exec truly needs vs. what they asked for.",
        skills: ["AI Briefing Tools", "Calendar Intelligence", "Executive Communications"],
        resources: [
          {
            type: "free",
            title: "AI Productivity for Administrative Professionals",
            platform: "LinkedIn Learning",
            badge: "Free Trial",
            link: "https://www.linkedin.com/learning/",
          },
          {
            type: "paid",
            title: "Executive Assistant Masterclass",
            platform: "Udemy",
            badge: "Course ($89)",
            link: "https://www.udemy.com/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Chief of Staff Coordinator",
          x: 820,
          y: 280,
          pathD: "M 520 320 C 640 320, 720 280, 820 280",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["Strategic Planning Support", "Board Prep", "OKR Tracking"],
          humanEdge: "Organizational memory and political awareness.",
          resources: [],
        },
        {
          id: "l2",
          title: "Strategic Intelligence Lead",
          x: 820,
          y: 360,
          pathD: "M 520 320 C 640 320, 720 360, 820 360",
          stage: "Advanced",
          duration: "Days 76–120+",
          skills: ["Competitive Intel", "Executive Dashboard", "Decision Synthesis"],
          humanEdge: "Knowing which information shapes decisions and why.",
          resources: [],
        },
      ],
    },
    {
      id: "br_opscoord",
      name: "Operations Coordinator",
      color: "#f59e0b",
      glowClass: "glow-amber",
      curvePoints: "M 140 380 C 260 380, 340 480, 520 480",
      midX: 520,
      midY: 480,
      midTitle: "OPERATIONS COORDINATOR",
      midSkills: ["Project Tools: 92%", "Cross-Dept Comms: 89%", "Compliance: 85%"],
      foundation: {
        title: "Project Coordination & Cross-Team Operations",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Coordinate multi-team projects, manage dependencies, track compliance documentation, and facilitate cross-functional communication.",
        humanEdge: "Human relationship capital across departments that builds over years.",
        skills: ["Asana/Monday", "Cross-Functional Facilitation", "Risk Registers"],
        resources: [
          {
            type: "free",
            title: "Project Management Essentials",
            platform: "Google Project Management Certificate",
            badge: "Free Audit",
            link: "https://www.coursera.org/",
          },
          {
            type: "paid",
            title: "PMP Certification Prep",
            platform: "PMI",
            badge: "Global Standard ($555)",
            link: "https://www.pmi.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Programme Operations Lead",
          x: 820,
          y: 440,
          pathD: "M 520 480 C 640 480, 720 440, 820 440",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["Portfolio Oversight", "Dependency Management", "Stakeholder Reporting"],
          humanEdge: "Building trust networks that accelerate delivery.",
          resources: [],
        },
        {
          id: "l2",
          title: "Head of Business Operations",
          x: 820,
          y: 520,
          pathD: "M 520 480 C 640 480, 720 520, 820 520",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: ["Operational Excellence", "Business Architecture", "P&L Literacy"],
          humanEdge: "Institutional knowledge and long-term relationship equity.",
          resources: [],
        },
      ],
    },
    {
      id: "br_workgov",
      name: "Workplace Governance Advisor",
      color: "#f72585",
      glowClass: "glow-magenta",
      curvePoints: "M 140 380 C 260 380, 320 620, 480 620",
      midX: 480,
      midY: 620,
      midTitle: "GOVERNANCE ADVISOR",
      midSkills: ["Policy Design: 94%", "Compliance Audit: 91%", "Ethics Review: 89%"],
      foundation: {
        title: "AI Policy & Workplace Compliance Design",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Design AI usage policies for the workplace, review compliance frameworks, and assess ethical risk in administrative AI deployment.",
        humanEdge:
          "Navigating organizational politics and building consensus around sensitive policy changes.",
        skills: ["AI Policy Frameworks", "HR Compliance", "Risk Documentation"],
        resources: [
          {
            type: "free",
            title: "AI in the Workplace: Ethical Considerations",
            platform: "SHRM Learning",
            badge: "Free Access",
            link: "https://www.shrm.org/",
          },
          {
            type: "paid",
            title: "Workplace AI Governance Certificate",
            platform: "IAPP",
            badge: "Professional Cert",
            link: "https://iapp.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "AI Workplace Policy Lead",
          x: 740,
          y: 590,
          pathD: "M 480 620 C 580 620, 640 590, 740 590",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["Policy Drafting", "Stakeholder Alignment", "Audit Readiness"],
          humanEdge: "Translating abstract governance frameworks into practical org behavior.",
          resources: [],
        },
        {
          id: "l2",
          title: "Chief Administrative AI Officer",
          x: 740,
          y: 650,
          pathD: "M 480 620 C 580 620, 640 650, 740 650",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: ["Board Governance", "AI Risk Reporting", "Cross-Jurisdictional Compliance"],
          humanEdge: "Independent ethical accountability at executive level.",
          resources: [],
        },
      ],
    },
  ],

  bank_teller: [
    {
      id: "br_fintechops",
      name: "Fintech Operations Specialist",
      color: "#00f2fe",
      glowClass: "glow-cyan",
      curvePoints: "M 140 380 C 260 380, 320 180, 480 180",
      midX: 480,
      midY: 180,
      midTitle: "FINTECH OPS SPECIALIST",
      midSkills: ["Digital Banking: 93%", "Fraud Detection: 90%", "API Banking: 87%"],
      foundation: {
        title: "Digital Banking & Fintech Operations",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Transition from manual teller operations to digital banking platforms, fraud monitoring dashboards, and fintech API interfaces.",
        humanEdge: "Human judgment in flagging anomalous customer behavior that algorithms miss.",
        skills: ["Core Banking Systems", "Fraud Pattern Recognition", "Digital KYC"],
        resources: [
          {
            type: "free",
            title: "Fintech Foundations: Digital Banking",
            platform: "edX / Harvard Online",
            badge: "Free Audit",
            link: "https://www.edx.org/",
          },
          {
            type: "paid",
            title: "Certified Fintech Professional",
            platform: "CFTE",
            badge: "Industry Cert ($350)",
            link: "https://cfte.education/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Digital Banking Operations Lead",
          x: 740,
          y: 120,
          pathD: "M 480 180 C 580 180, 640 120, 740 120",
          stage: "Intermediate",
          duration: "Days 31–60",
          skills: ["Open Banking APIs", "Transaction Monitoring", "Digital Onboarding QA"],
          humanEdge: "Spotting synthetic identity fraud that AI models overfit around.",
          resources: [],
        },
        {
          id: "l2",
          title: "Payments & Settlements Analyst",
          x: 740,
          y: 180,
          pathD: "M 480 180 L 740 180",
          stage: "Advanced",
          duration: "Days 61–90",
          skills: ["SWIFT/ISO 20022", "Real-Time Gross Settlement", "FX Operations"],
          humanEdge: "Institutional knowledge of edge-case settlement rules.",
          resources: [],
        },
        {
          id: "l3",
          title: "Fintech Product Manager",
          x: 740,
          y: 240,
          pathD: "M 480 180 C 580 180, 640 240, 740 240",
          stage: "Leadership",
          duration: "Days 91–120+",
          skills: ["Product Roadmapping", "Regulatory Sandboxes", "Banking API Strategy"],
          humanEdge: "Bridging customer empathy with regulatory complexity.",
          resources: [],
        },
      ],
    },
    {
      id: "br_wealthadv",
      name: "Digital Banking Advisor",
      color: "#b000ff",
      glowClass: "glow-purple",
      curvePoints: "M 140 380 C 260 380, 340 320, 520 320",
      midX: 520,
      midY: 320,
      midTitle: "DIGITAL BANKING ADVISOR",
      midSkills: ["Client Advisory: 94%", "Financial Planning: 91%", "Wealth Tools: 88%"],
      foundation: {
        title: "Relationship Banking & Financial Advisory",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Pivot from transactional teller to relationship-first advisor role, using AI tools to prepare personalized financial recommendations.",
        humanEdge:
          "Trust-building with clients navigating financial vulnerability and life transitions.",
        skills: ["Financial Planning Basics", "CRM for Banking", "Advisory Conversations"],
        resources: [
          {
            type: "free",
            title: "Introduction to Personal Finance",
            platform: "Khan Academy",
            badge: "Free",
            link: "https://www.khanacademy.org/",
          },
          {
            type: "paid",
            title: "CFP Certification Prep",
            platform: "CFP Board",
            badge: "Professional ($925)",
            link: "https://www.cfp.net/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Mass Affluent Banking Specialist",
          x: 820,
          y: 280,
          pathD: "M 520 320 C 640 320, 720 280, 820 280",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["Portfolio Review", "Investment Products", "Client Segmentation"],
          humanEdge: "Emotional intelligence in wealth conversations.",
          resources: [],
        },
        {
          id: "l2",
          title: "Private Wealth Manager",
          x: 820,
          y: 360,
          pathD: "M 520 320 C 640 320, 720 360, 820 360",
          stage: "Advanced",
          duration: "Days 76–120+",
          skills: ["Estate Planning", "Family Office Services", "Tax Optimization"],
          humanEdge: "Long-term trust relationships no robo-advisor replicates.",
          resources: [],
        },
      ],
    },
    {
      id: "br_insuretech",
      name: "Wealth & Insurance Advisor",
      color: "#f59e0b",
      glowClass: "glow-amber",
      curvePoints: "M 140 380 C 260 380, 340 480, 520 480",
      midX: 520,
      midY: 480,
      midTitle: "WEALTH & INSURANCE ADVISOR",
      midSkills: ["Risk Profiling: 92%", "Insurance Products: 89%", "Client Trust: 95%"],
      foundation: {
        title: "Financial Risk Profiling & Insurance Planning",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Learn to assess client financial risk profiles and recommend appropriate insurance and savings products using AI-assisted planning tools.",
        humanEdge:
          "Human conversations about mortality, health, and family security that require deep empathy.",
        skills: ["Risk Profiling", "Insurance Product Knowledge", "Needs Analysis"],
        resources: [
          {
            type: "free",
            title: "Insurance Fundamentals",
            platform: "Insurance Institute",
            badge: "Free Module",
            link: "https://www.insuranceinstitute.ca/",
          },
          {
            type: "paid",
            title: "Certified Financial Planner (CFP)",
            platform: "CFP Board",
            badge: "Gold Standard ($925)",
            link: "https://www.cfp.net/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Insurance Solutions Advisor",
          x: 820,
          y: 440,
          pathD: "M 520 480 C 640 480, 720 440, 820 440",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["Policy Structuring", "Claims Liaison", "Renewal Advisory"],
          humanEdge: "Empathy during claims and life events.",
          resources: [],
        },
        {
          id: "l2",
          title: "Financial Planning Director",
          x: 820,
          y: 520,
          pathD: "M 520 480 C 640 480, 720 520, 820 520",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: ["Holistic Financial Planning", "Client Portfolio Direction", "Team Leadership"],
          humanEdge: "Multi-generational client relationships.",
          resources: [],
        },
      ],
    },
    {
      id: "br_finregtech",
      name: "Fintech Compliance Officer",
      color: "#f72585",
      glowClass: "glow-magenta",
      curvePoints: "M 140 380 C 260 380, 320 620, 480 620",
      midX: 480,
      midY: 620,
      midTitle: "FINTECH COMPLIANCE OFFICER",
      midSkills: ["AML/KYC: 96%", "RegTech: 93%", "Audit: 90%"],
      foundation: {
        title: "AML / KYC & Financial Crime Compliance",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Transition teller experience into AML/KYC compliance review, using AI-assisted transaction monitoring and suspicious activity reporting.",
        humanEdge:
          "Pattern intuition developed through years of seeing real customer transaction behavior.",
        skills: ["AML Frameworks", "KYC Procedures", "SAR Reporting"],
        resources: [
          {
            type: "free",
            title: "ACAMS AML Essentials",
            platform: "ACAMS",
            badge: "Free Intro",
            link: "https://www.acams.org/",
          },
          {
            type: "paid",
            title: "Certified Anti-Money Laundering Specialist (CAMS)",
            platform: "ACAMS",
            badge: "Industry Gold ($1,150)",
            link: "https://www.acams.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Financial Crime Investigations Lead",
          x: 740,
          y: 590,
          pathD: "M 480 620 C 580 620, 640 590, 740 590",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["Case Investigation", "STR Analysis", "Regulatory Liaison"],
          humanEdge: "Reading behavioral intent that transaction data alone cannot reveal.",
          resources: [],
        },
        {
          id: "l2",
          title: "RegTech Compliance Director",
          x: 740,
          y: 650,
          pathD: "M 480 620 C 580 620, 640 650, 740 650",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: ["RegTech Platforms", "Compliance Architecture", "Board Reporting"],
          humanEdge: "Institutional integrity and ethical leadership under regulatory pressure.",
          resources: [],
        },
      ],
    },
  ],
  data_entry: [
    {
      id: "br_dqe",
      name: "Data Quality Engineer",
      color: "#00f2fe",
      glowClass: "glow-cyan",
      curvePoints: "M 140 380 C 260 380, 320 180, 480 180",
      midX: 480,
      midY: 180,
      midTitle: "DATA QUALITY ENGINEER",
      midSkills: ["ETL Pipelines: 93%", "Data Validation: 91%", "Python/SQL: 88%"],
      foundation: {
        title: "Data Validation & Quality Automation",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Apply your domain knowledge of data patterns to build validation rules, anomaly detection scripts, and quality gates using Python and SQL.",
        humanEdge:
          "Domain intuition for what valid data looks like that pure statistical models miss.",
        skills: ["SQL Proficiency", "Python Pandas", "Data Profiling"],
        resources: [
          {
            type: "free",
            title: "SQL for Data Science",
            platform: "Coursera / UC Davis",
            badge: "Free Audit",
            link: "https://www.coursera.org/",
          },
          {
            type: "paid",
            title: "dbt Analytics Engineering Certification",
            platform: "dbt Labs",
            badge: "Industry Standard ($200)",
            link: "https://www.getdbt.com/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "ETL Pipeline Developer",
          x: 740,
          y: 120,
          pathD: "M 480 180 C 580 180, 640 120, 740 120",
          stage: "Intermediate",
          duration: "Days 31–60",
          skills: ["Apache Airflow", "dbt Transforms", "Data Lineage"],
          humanEdge: "Understanding why data breaks — from lived experience, not just logs.",
          resources: [],
        },
        {
          id: "l2",
          title: "Data Platform Engineer",
          x: 740,
          y: 180,
          pathD: "M 480 180 L 740 180",
          stage: "Advanced",
          duration: "Days 61–90",
          skills: ["Snowflake/BigQuery", "Stream Processing", "Data Contracts"],
          humanEdge: "Knowing the business impact of downstream data failures.",
          resources: [],
        },
        {
          id: "l3",
          title: "Head of Data Operations",
          x: 740,
          y: 240,
          pathD: "M 480 180 C 580 180, 640 240, 740 240",
          stage: "Leadership",
          duration: "Days 91–120+",
          skills: ["Data Mesh Architecture", "OKR-Driven Data Strategy", "Platform Governance"],
          humanEdge: "Translating data quality into business trust and decision speed.",
          resources: [],
        },
      ],
    },
    {
      id: "br_dva",
      name: "Data Validation Analyst",
      color: "#b000ff",
      glowClass: "glow-purple",
      curvePoints: "M 140 380 C 260 380, 340 320, 520 320",
      midX: 520,
      midY: 320,
      midTitle: "DATA VALIDATION ANALYST",
      midSkills: ["Data QA: 94%", "Reconciliation: 91%", "Reporting: 89%"],
      foundation: {
        title: "Automated Reconciliation & Quality Assurance",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Build automated reconciliation checks between data sources, flag discrepancies, and generate quality reports using Excel Power Query and SQL.",
        humanEdge:
          "Pattern memory from thousands of manual checks that builds intuition for subtle data corruption.",
        skills: ["Excel Power Query", "Reconciliation Logic", "Data Dictionaries"],
        resources: [
          {
            type: "free",
            title: "Power Query & Data Modeling Fundamentals",
            platform: "Microsoft Learn",
            badge: "Free",
            link: "https://learn.microsoft.com/",
          },
          {
            type: "paid",
            title: "Data Analyst Associate Certification",
            platform: "Microsoft (DP-500)",
            badge: "Professional ($165)",
            link: "https://learn.microsoft.com/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Business Intelligence Analyst",
          x: 820,
          y: 280,
          pathD: "M 520 320 C 640 320, 720 280, 820 280",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["Tableau/Power BI", "KPI Dashboards", "Executive Reporting"],
          humanEdge: "Understanding what business questions the data is actually answering.",
          resources: [],
        },
        {
          id: "l2",
          title: "Data Analytics Team Lead",
          x: 820,
          y: 360,
          pathD: "M 520 320 C 640 320, 720 360, 820 360",
          stage: "Advanced",
          duration: "Days 76–120+",
          skills: ["Analytics Strategy", "Data Storytelling", "Stakeholder Alignment"],
          humanEdge: "Communicating uncertainty and limitations to non-technical decision-makers.",
          resources: [],
        },
      ],
    },
    {
      id: "br_bi",
      name: "BI & Reporting Analyst",
      color: "#f59e0b",
      glowClass: "glow-amber",
      curvePoints: "M 140 380 C 260 380, 340 480, 520 480",
      midX: 520,
      midY: 480,
      midTitle: "BI & REPORTING ANALYST",
      midSkills: ["Power BI: 92%", "DAX/SQL: 90%", "Data Viz: 88%"],
      foundation: {
        title: "Business Intelligence Dashboard Development",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Build operational dashboards in Power BI or Tableau, replacing manual report generation with automated visual insights.",
        humanEdge: "Knowing which metrics actually drive decisions for specific business users.",
        skills: ["Power BI / Tableau", "DAX Formulas", "Report Automation"],
        resources: [
          {
            type: "free",
            title: "Microsoft Power BI Learning Path",
            platform: "Microsoft Learn",
            badge: "Free Certified",
            link: "https://learn.microsoft.com/",
          },
          {
            type: "paid",
            title: "Tableau Desktop Specialist",
            platform: "Tableau/Salesforce",
            badge: "Professional ($250)",
            link: "https://www.tableau.com/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Analytics Engineering Lead",
          x: 820,
          y: 440,
          pathD: "M 520 480 C 640 480, 720 440, 820 440",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["Data Modeling", "Semantic Layer Design", "Self-Serve Analytics"],
          humanEdge: "Designing for how real users actually find and interpret data.",
          resources: [],
        },
        {
          id: "l2",
          title: "Head of Business Intelligence",
          x: 820,
          y: 520,
          pathD: "M 520 480 C 640 480, 720 520, 820 520",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: ["Analytics COE", "Data Product Strategy", "Enterprise Reporting Governance"],
          humanEdge: "Organizational trust in data as a shared resource.",
          resources: [],
        },
      ],
    },
    {
      id: "br_dgov",
      name: "Data Governance Officer",
      color: "#f72585",
      glowClass: "glow-magenta",
      curvePoints: "M 140 380 C 260 380, 320 620, 480 620",
      midX: 480,
      midY: 620,
      midTitle: "DATA GOVERNANCE OFFICER",
      midSkills: ["GDPR/PDPA: 96%", "Data Cataloguing: 93%", "Policy Design: 91%"],
      foundation: {
        title: "Data Governance & Privacy Compliance",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Design data classification frameworks, privacy impact assessments, and governance policies aligned with GDPR and PDPA requirements.",
        humanEdge: "Understanding real-world data misuse scenarios from operational experience.",
        skills: ["Data Classification", "GDPR / PDPA Fundamentals", "Data Catalogues"],
        resources: [
          {
            type: "free",
            title: "Introduction to Data Privacy",
            platform: "IAPP Foundation Course",
            badge: "Free Intro",
            link: "https://iapp.org/",
          },
          {
            type: "paid",
            title: "Certified Information Privacy Professional (CIPP)",
            platform: "IAPP",
            badge: "Gold Standard ($550)",
            link: "https://iapp.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Data Steward & Quality Champion",
          x: 740,
          y: 590,
          pathD: "M 480 620 C 580 620, 640 590, 740 590",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["Metadata Management", "Data Lineage Governance", "Policy Enforcement"],
          humanEdge: "Practical empathy for how teams actually use and misuse data.",
          resources: [],
        },
        {
          id: "l2",
          title: "Chief Data Privacy Officer",
          x: 740,
          y: 650,
          pathD: "M 480 620 C 580 620, 640 650, 740 650",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: ["Cross-Border Data Flows", "Board-Level Privacy Reporting", "Incident Response"],
          humanEdge: "Ethical accountability under regulatory and reputational pressure.",
          resources: [],
        },
      ],
    },
  ],

  bookkeeper: [
    {
      id: "br_aiaccspec",
      name: "AI Accounting Specialist",
      color: "#00f2fe",
      glowClass: "glow-cyan",
      curvePoints: "M 140 380 C 260 380, 320 180, 480 180",
      midX: 480,
      midY: 180,
      midTitle: "AI ACCOUNTING SPECIALIST",
      midSkills: ["AI Reconciliation: 93%", "Xero/QBO: 91%", "Audit Trails: 89%"],
      foundation: {
        title: "AI-Augmented Bookkeeping & Reconciliation",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Transition from manual bookkeeping to AI-augmented accounting platforms. Master exception handling, rule-based automation validation, and anomaly review.",
        humanEdge: "Understanding business context behind transactions that AI misclassifies.",
        skills: ["Xero / QuickBooks Online", "Bank Reconciliation AI", "Exception Handling"],
        resources: [
          {
            type: "free",
            title: "Xero Advisor Certification",
            platform: "Xero Academy",
            badge: "Free Certified",
            link: "https://www.xero.com/",
          },
          {
            type: "paid",
            title: "QuickBooks ProAdvisor Certification",
            platform: "Intuit",
            badge: "Professional (Free+)",
            link: "https://quickbooks.intuit.com/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Automated Accounts Payable Lead",
          x: 740,
          y: 120,
          pathD: "M 480 180 C 580 180, 640 120, 740 120",
          stage: "Intermediate",
          duration: "Days 31–60",
          skills: ["AP Automation", "Invoice AI QA", "Vendor Reconciliation"],
          humanEdge: "Relationship management with vendors when automation fails.",
          resources: [],
        },
        {
          id: "l2",
          title: "Finance Systems Analyst",
          x: 740,
          y: 180,
          pathD: "M 480 180 L 740 180",
          stage: "Advanced",
          duration: "Days 61–90",
          skills: ["ERP Integration", "Financial Data Mapping", "System Testing"],
          humanEdge: "Knowing where accounting systems break under real-world edge cases.",
          resources: [],
        },
        {
          id: "l3",
          title: "Finance Operations Manager",
          x: 740,
          y: 240,
          pathD: "M 480 180 C 580 180, 640 240, 740 240",
          stage: "Leadership",
          duration: "Days 91–120+",
          skills: ["Month-End Close Optimization", "Audit Readiness", "Finance Team Leadership"],
          humanEdge: "Team trust and cross-functional financial accountability.",
          resources: [],
        },
      ],
    },
    {
      id: "br_fincontrol",
      name: "Financial Controller Track",
      color: "#b000ff",
      glowClass: "glow-purple",
      curvePoints: "M 140 380 C 260 380, 340 320, 520 320",
      midX: 520,
      midY: 320,
      midTitle: "FINANCIAL CONTROLLER",
      midSkills: ["IFRS/GAAP: 95%", "Consolidated Reporting: 92%", "Internal Controls: 90%"],
      foundation: {
        title: "Financial Reporting & Internal Controls",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Build expertise in financial statement preparation, internal control testing, and consolidated reporting aligned with IFRS/GAAP standards.",
        humanEdge: "Judgment under time pressure at month-end close that AI cannot fully automate.",
        skills: ["IFRS Fundamentals", "Internal Control Testing", "Management Accounts"],
        resources: [
          {
            type: "free",
            title: "ACCA Financial Accounting Study Pack",
            platform: "ACCA Global",
            badge: "Free Study Materials",
            link: "https://www.accaglobal.com/",
          },
          {
            type: "paid",
            title: "ACCA / CMA Professional Qualification",
            platform: "ACCA / IMA",
            badge: "Professional Cert ($1,500+)",
            link: "https://www.accaglobal.com/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Senior Financial Analyst",
          x: 820,
          y: 280,
          pathD: "M 520 320 C 640 320, 720 280, 820 280",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["Variance Analysis", "Budget vs Actuals", "FP&A Modeling"],
          humanEdge: "Contextual explanation of financial variances to non-finance leaders.",
          resources: [],
        },
        {
          id: "l2",
          title: "Group Financial Controller",
          x: 820,
          y: 360,
          pathD: "M 520 320 C 640 320, 720 360, 820 360",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: ["Group Consolidation", "Statutory Audit Management", "CFO Support"],
          humanEdge: "Integrity and accountability in financial governance.",
          resources: [],
        },
      ],
    },
    {
      id: "br_taxadv",
      name: "Tax & Planning Advisor",
      color: "#f59e0b",
      glowClass: "glow-amber",
      curvePoints: "M 140 380 C 260 380, 340 480, 520 480",
      midX: 520,
      midY: 480,
      midTitle: "TAX & PLANNING ADVISOR",
      midSkills: ["Tax Compliance: 94%", "Transfer Pricing: 91%", "Advisory: 89%"],
      foundation: {
        title: "Tax Compliance & Advisory Foundations",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Move from bookkeeping to tax compliance specialist, covering VAT, corporate tax, and advisory conversations with small business clients.",
        humanEdge:
          "Client trust built through reliable, accurate filings over years of relationship.",
        skills: ["Corporate Tax Basics", "VAT / GST Returns", "Tax Planning Concepts"],
        resources: [
          {
            type: "free",
            title: "Taxation Fundamentals",
            platform: "ACCA / Tax Institutes Free Resources",
            badge: "Free",
            link: "https://www.accaglobal.com/",
          },
          {
            type: "paid",
            title: "CTA (Chartered Tax Adviser)",
            platform: "CIOT",
            badge: "Professional Qualification ($2,000+)",
            link: "https://www.tax.org.uk/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "SME Tax & Business Advisor",
          x: 820,
          y: 440,
          pathD: "M 520 480 C 640 480, 720 440, 820 440",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["Business Tax Planning", "R&D Tax Credits", "Advisory Conversations"],
          humanEdge: "Trusted advisor relationship over automated tax software.",
          resources: [],
        },
        {
          id: "l2",
          title: "Tax Strategy Director",
          x: 820,
          y: 520,
          pathD: "M 520 480 C 640 480, 720 520, 820 520",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: ["International Tax Strategy", "M&A Tax", "Board Tax Advisory"],
          humanEdge: "Strategic judgment where regulations intersect with commercial reality.",
          resources: [],
        },
      ],
    },
    {
      id: "br_finrisk",
      name: "Finance Risk & Compliance",
      color: "#f72585",
      glowClass: "glow-magenta",
      curvePoints: "M 140 380 C 260 380, 320 620, 480 620",
      midX: 480,
      midY: 620,
      midTitle: "FINANCE RISK OFFICER",
      midSkills: ["Internal Audit: 96%", "Risk Frameworks: 93%", "SOX Compliance: 91%"],
      foundation: {
        title: "Internal Audit & Financial Risk Assessment",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Apply bookkeeping experience to internal audit, risk control matrix design, and SOX/financial regulatory compliance.",
        humanEdge:
          "Practical intuition for where financial controls break in real organizational settings.",
        skills: ["Internal Audit Standards", "Risk Control Matrix", "SOX Compliance"],
        resources: [
          {
            type: "free",
            title: "IIA Internal Audit Competency Framework",
            platform: "Institute of Internal Auditors",
            badge: "Free Framework",
            link: "https://www.theiia.org/",
          },
          {
            type: "paid",
            title: "Certified Internal Auditor (CIA)",
            platform: "IIA",
            badge: "Gold Standard ($1,000+)",
            link: "https://www.theiia.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Risk & Controls Specialist",
          x: 740,
          y: 590,
          pathD: "M 480 620 C 580 620, 640 590, 740 590",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["Control Testing", "Risk Registers", "Audit Workpapers"],
          humanEdge: "Independent ethical voice in governance processes.",
          resources: [],
        },
        {
          id: "l2",
          title: "Chief Risk & Compliance Officer",
          x: 740,
          y: 650,
          pathD: "M 480 620 C 580 620, 640 650, 740 650",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: ["Enterprise Risk Management", "Board Risk Reporting", "Regulatory Strategy"],
          humanEdge: "Moral courage to escalate issues against commercial pressure.",
          resources: [],
        },
      ],
    },
  ],
  payroll_hr: [
    {
      id: "br_hrtech",
      name: "HR Technology Specialist",
      color: "#00f2fe",
      glowClass: "glow-cyan",
      curvePoints: "M 140 380 C 260 380, 320 180, 480 180",
      midX: 480,
      midY: 180,
      midTitle: "HR TECH SPECIALIST",
      midSkills: ["HRIS Config: 92%", "Payroll Automation: 90%", "Data Analytics: 88%"],
      foundation: {
        title: "HRIS Configuration & Payroll Automation",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Configure HRIS platforms (Workday, SAP SuccessFactors), automate payroll workflows, and build audit controls for compliance.",
        humanEdge: "Understanding why edge-case payroll errors matter deeply to employees.",
        skills: ["Workday / SuccessFactors", "Payroll Compliance", "Data Migration QA"],
        resources: [
          {
            type: "free",
            title: "Workday Rising Community Learning",
            platform: "Workday",
            badge: "Free Access",
            link: "https://community.workday.com/",
          },
          {
            type: "paid",
            title: "SHRM-CP Certification",
            platform: "SHRM",
            badge: "Professional ($300)",
            link: "https://www.shrm.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Payroll Systems Analyst",
          x: 740,
          y: 120,
          pathD: "M 480 180 C 580 180, 640 120, 740 120",
          stage: "Intermediate",
          duration: "Days 31–60",
          skills: ["Multi-Country Payroll", "Tax Compliance Integration", "System Testing"],
          humanEdge: "Employee trust when payroll errors occur.",
          resources: [],
        },
        {
          id: "l2",
          title: "HR Systems Manager",
          x: 740,
          y: 180,
          pathD: "M 480 180 L 740 180",
          stage: "Advanced",
          duration: "Days 61–90",
          skills: ["HR System Architecture", "Integrations", "Data Governance"],
          humanEdge: "People-first configuration decisions.",
          resources: [],
        },
        {
          id: "l3",
          title: "VP of HR Technology",
          x: 740,
          y: 240,
          pathD: "M 480 180 C 580 180, 640 240, 740 240",
          stage: "Leadership",
          duration: "Days 91–120+",
          skills: ["HR Tech Strategy", "Vendor Management", "ROI of People Systems"],
          humanEdge: "Balancing technology efficiency with employee experience.",
          resources: [],
        },
      ],
    },
    {
      id: "br_peopleana",
      name: "People Analytics Specialist",
      color: "#b000ff",
      glowClass: "glow-purple",
      curvePoints: "M 140 380 C 260 380, 340 320, 520 320",
      midX: 520,
      midY: 320,
      midTitle: "PEOPLE ANALYTICS SPECIALIST",
      midSkills: ["Workforce Analytics: 94%", "Attrition Modeling: 91%", "DEI Metrics: 88%"],
      foundation: {
        title: "Workforce Data & People Analytics",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Build workforce dashboards tracking attrition, performance, diversity, and compensation equity using people data.",
        humanEdge: "Sensitivity to how people data analysis can harm vulnerable employees.",
        skills: ["R / Python for HR Data", "Attrition Analysis", "Compensation Benchmarking"],
        resources: [
          {
            type: "free",
            title: "People Analytics Course",
            platform: "Wharton / Coursera",
            badge: "Free Audit",
            link: "https://www.coursera.org/",
          },
          {
            type: "paid",
            title: "CIPD Level 5 People Management",
            platform: "CIPD",
            badge: "Professional Qual.",
            link: "https://www.cipd.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "HR Data Scientist",
          x: 820,
          y: 280,
          pathD: "M 520 320 C 640 320, 720 280, 820 280",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["Predictive HR Modeling", "Organizational Network Analysis", "ML for HR"],
          humanEdge: "Ethical interpretation of sensitive workforce patterns.",
          resources: [],
        },
        {
          id: "l2",
          title: "Chief People Analytics Officer",
          x: 820,
          y: 360,
          pathD: "M 520 320 C 640 320, 720 360, 820 360",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: ["Board Workforce Reporting", "DEI Strategy", "Predictive Talent Intelligence"],
          humanEdge: "Accountable use of sensitive people data at board level.",
          resources: [],
        },
      ],
    },
    {
      id: "br_hrbp",
      name: "HR Business Partner",
      color: "#f59e0b",
      glowClass: "glow-amber",
      curvePoints: "M 140 380 C 260 380, 340 480, 520 480",
      midX: 520,
      midY: 480,
      midTitle: "HR BUSINESS PARTNER",
      midSkills: ["Employee Relations: 94%", "Org Design: 91%", "Change Mgmt: 90%"],
      foundation: {
        title: "Strategic HR Business Partnering",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Evolve from HR admin to strategic HRBP — supporting business leaders with organizational design, workforce planning, and employee relations.",
        humanEdge:
          "Navigating difficult people conversations where data-driven answers are not enough.",
        skills: ["Org Design Basics", "Employee Relations", "Workforce Planning"],
        resources: [
          {
            type: "free",
            title: "SHRM HR Business Partner Resources",
            platform: "SHRM",
            badge: "Free Member Resources",
            link: "https://www.shrm.org/",
          },
          {
            type: "paid",
            title: "SHRM-SCP Certification",
            platform: "SHRM",
            badge: "Senior Professional ($475)",
            link: "https://www.shrm.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Senior HR Business Partner",
          x: 820,
          y: 440,
          pathD: "M 520 480 C 640 480, 720 440, 820 440",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["Executive Coaching Support", "Talent Reviews", "Succession Planning"],
          humanEdge: "Trusted confidential advisor to leaders.",
          resources: [],
        },
        {
          id: "l2",
          title: "VP of People & Culture",
          x: 820,
          y: 520,
          pathD: "M 520 480 C 640 480, 720 520, 820 520",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: ["Culture Strategy", "CHRO Advisory", "People Transformation"],
          humanEdge: "Culture stewardship that shapes organizational identity.",
          resources: [],
        },
      ],
    },
    {
      id: "br_hrethics",
      name: "People & AI Ethics Lead",
      color: "#f72585",
      glowClass: "glow-magenta",
      curvePoints: "M 140 380 C 260 380, 320 620, 480 620",
      midX: 480,
      midY: 620,
      midTitle: "PEOPLE ETHICS LEAD",
      midSkills: ["AI HR Ethics: 96%", "Bias Auditing: 93%", "DEI Policy: 91%"],
      foundation: {
        title: "AI in HR: Bias Auditing & Ethical Frameworks",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Audit AI tools used in HR (screening algorithms, performance tools) for bias, and design ethical use frameworks and governance policies.",
        humanEdge: "Lived experience of how hiring and pay decisions affect real people.",
        skills: ["Algorithmic Bias Assessment", "HR AI Governance", "DEI Analytics"],
        resources: [
          {
            type: "free",
            title: "Responsible AI in HR Hiring Tools",
            platform: "IBM SkillsBuild",
            badge: "Free",
            link: "https://skillsbuild.org/",
          },
          {
            type: "paid",
            title: "Certified Diversity Professional (CDP)",
            platform: "Institute for Diversity Certification",
            badge: "Professional",
            link: "https://www.diversitycertification.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "AI Ethics Auditor (HR Systems)",
          x: 740,
          y: 590,
          pathD: "M 480 620 C 580 620, 640 590, 740 590",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["Algorithmic Audit Reports", "Legal Risk Assessment", "Policy Design"],
          humanEdge: "Empathy for vulnerable candidates affected by biased systems.",
          resources: [],
        },
        {
          id: "l2",
          title: "Chief People & Ethics Officer",
          x: 740,
          y: 650,
          pathD: "M 480 620 C 580 620, 640 650, 740 650",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: ["Board-Level DEI", "AI People Policy", "Ethics Governance"],
          humanEdge: "Moral courage in structurally inequitable systems.",
          resources: [],
        },
      ],
    },
  ],

  paralegal: [
    {
      id: "br_legaltech",
      name: "Legal Technology Specialist",
      color: "#00f2fe",
      glowClass: "glow-cyan",
      curvePoints: "M 140 380 C 260 380, 320 180, 480 180",
      midX: 480,
      midY: 180,
      midTitle: "LEGAL TECH SPECIALIST",
      midSkills: ["Contract AI QA: 93%", "eDiscovery: 90%", "LegalTech Tools: 88%"],
      foundation: {
        title: "Legal AI Tools & Contract Review Automation",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Learn to operate AI-assisted contract review platforms (Ironclad, Kira, Lexis+AI), validate AI-extracted contract clauses, and manage eDiscovery workflows.",
        humanEdge: "Legal judgment about which AI clause extractions require human review.",
        skills: ["Contract AI Platforms", "eDiscovery Management", "Clause Risk Assessment"],
        resources: [
          {
            type: "free",
            title: "Legal Technology Fundamentals",
            platform: "Stanford CodeX / Coursera",
            badge: "Free Audit",
            link: "https://www.coursera.org/",
          },
          {
            type: "paid",
            title: "Certified Legal Manager (CLM)",
            platform: "Association of Legal Administrators",
            badge: "Professional ($350)",
            link: "https://www.alanet.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Contract Intelligence Analyst",
          x: 740,
          y: 120,
          pathD: "M 480 180 C 580 180, 640 120, 740 120",
          stage: "Intermediate",
          duration: "Days 31–60",
          skills: [
            "Risk Clause Extraction",
            "Obligation Tracking",
            "Contract Repository Management",
          ],
          humanEdge: "Understanding commercial intent behind contract language.",
          resources: [],
        },
        {
          id: "l2",
          title: "Legal Operations Technology Manager",
          x: 740,
          y: 180,
          pathD: "M 480 180 L 740 180",
          stage: "Advanced",
          duration: "Days 61–90",
          skills: ["LegalOps Platform Implementation", "Workflow Design", "Spend Analytics"],
          humanEdge: "Cross-functional legal-business collaboration.",
          resources: [],
        },
        {
          id: "l3",
          title: "Head of Legal Technology",
          x: 740,
          y: 240,
          pathD: "M 480 180 C 580 180, 640 240, 740 240",
          stage: "Leadership",
          duration: "Days 91–120+",
          skills: ["Legal AI Strategy", "Vendor Selection", "Governance & Ethics"],
          humanEdge: "Ensuring AI-assisted legal work maintains professional accountability.",
          resources: [],
        },
      ],
    },
    {
      id: "br_contractint",
      name: "Contract Intelligence Lead",
      color: "#b000ff",
      glowClass: "glow-purple",
      curvePoints: "M 140 380 C 260 380, 340 320, 520 320",
      midX: 520,
      midY: 320,
      midTitle: "CONTRACT INTELLIGENCE LEAD",
      midSkills: ["Contract Drafting AI: 94%", "NDA Review: 92%", "Risk Clauses: 90%"],
      foundation: {
        title: "AI-Assisted Contract Drafting & Risk Analysis",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Use LLM-based drafting tools to prepare first-draft contracts, identify unusual risk clauses, and generate obligation checklists for legal review.",
        humanEdge:
          "Commercial context and relationship history that shapes contract interpretation.",
        skills: ["AI Contract Drafting", "Risk Clause Identification", "Obligation Mapping"],
        resources: [
          {
            type: "free",
            title: "Contract Management Essentials",
            platform: "World Commerce & Contracting",
            badge: "Free Intro",
            link: "https://www.worldcc.com/",
          },
          {
            type: "paid",
            title: "CCCM Contract Management Certification",
            platform: "NCMA",
            badge: "Professional ($495)",
            link: "https://www.ncmahq.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Commercial Contracts Manager",
          x: 820,
          y: 280,
          pathD: "M 520 320 C 640 320, 720 280, 820 280",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["End-to-End Contract Management", "Negotiation Support", "Playbook Design"],
          humanEdge: "Negotiation intuition and relationship preservation.",
          resources: [],
        },
        {
          id: "l2",
          title: "General Counsel Deputy",
          x: 820,
          y: 360,
          pathD: "M 520 320 C 640 320, 720 360, 820 360",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: ["Corporate Legal Strategy", "Board Governance", "M&A Due Diligence"],
          humanEdge: "Legal judgment at the intersection of strategy and risk.",
          resources: [],
        },
      ],
    },
    {
      id: "br_legalops",
      name: "Legal Operations Director",
      color: "#f59e0b",
      glowClass: "glow-amber",
      curvePoints: "M 140 380 C 260 380, 340 480, 520 480",
      midX: 520,
      midY: 480,
      midTitle: "LEGAL OPS DIRECTOR",
      midSkills: ["Legal Spend Analytics: 93%", "Matter Management: 91%", "Process Design: 89%"],
      foundation: {
        title: "Legal Operations & Process Optimization",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Design streamlined matter management workflows, track legal spend efficiency, and implement process improvements across the legal function.",
        humanEdge: "Cross-departmental empathy for what legal stakeholders actually need.",
        skills: ["Matter Management Systems", "Legal Spend Analytics", "Process Mapping"],
        resources: [
          {
            type: "free",
            title: "Legal Operations Core Curriculum",
            platform: "CLOC",
            badge: "Free Member Resources",
            link: "https://cloc.org/",
          },
          {
            type: "paid",
            title: "Certified Legal Operations Professional",
            platform: "CLOC",
            badge: "Industry Standard",
            link: "https://cloc.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Legal Technology Programme Lead",
          x: 820,
          y: 440,
          pathD: "M 520 480 C 640 480, 720 440, 820 440",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["LegalTech Roadmap", "Change Management", "ROI Measurement"],
          humanEdge: "Legal team trust through transparent transformation.",
          resources: [],
        },
        {
          id: "l2",
          title: "Chief Legal Operations Officer",
          x: 820,
          y: 520,
          pathD: "M 520 480 C 640 480, 720 520, 820 520",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: ["Legal Department Strategy", "AI Governance", "GC Partnership"],
          humanEdge: "Organizational integrity across the legal function.",
          resources: [],
        },
      ],
    },
    {
      id: "br_ailawpol",
      name: "AI Law & Policy Advisor",
      color: "#f72585",
      glowClass: "glow-magenta",
      curvePoints: "M 140 380 C 260 380, 320 620, 480 620",
      midX: 480,
      midY: 620,
      midTitle: "AI LAW & POLICY ADVISOR",
      midSkills: ["EU AI Act: 96%", "IP in AI: 93%", "Regulatory: 91%"],
      foundation: {
        title: "AI Legal Frameworks & Regulatory Compliance",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Study AI-specific legal frameworks (EU AI Act, model liability, IP ownership in generated content) and advise on compliant AI deployment.",
        humanEdge: "Legal research skills sharpened through years of case and statute analysis.",
        skills: ["EU AI Act", "IP & AI Copyright", "AI Liability Frameworks"],
        resources: [
          {
            type: "free",
            title: "EU AI Act Official Text & Summary",
            platform: "European Commission",
            badge: "Free Official",
            link: "https://digital-strategy.ec.europa.eu/",
          },
          {
            type: "paid",
            title: "AI Law & Regulation Certification",
            platform: "LawWithoutWalls / University of Miami",
            badge: "Professional Cert",
            link: "https://www.lawwithoutwalls.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "AI Compliance Counsel",
          x: 740,
          y: 590,
          pathD: "M 480 620 C 580 620, 640 590, 740 590",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["Regulatory Risk Mapping", "AI Audit Frameworks", "Cross-Jurisdictional Policy"],
          humanEdge: "Translating regulatory ambiguity into practical legal guidance.",
          resources: [],
        },
        {
          id: "l2",
          title: "Director of AI Policy & Law",
          x: 740,
          y: 650,
          pathD: "M 480 620 C 580 620, 640 650, 740 650",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: ["Policy Drafting", "Government Relations", "International AI Regulation"],
          humanEdge: "Moral and legal accountability in AI governance.",
          resources: [],
        },
      ],
    },
  ],
  content_mod: [
    {
      id: "br_tse",
      name: "Trust & Safety Engineer",
      color: "#00f2fe",
      glowClass: "glow-cyan",
      curvePoints: "M 140 380 C 260 380, 320 180, 480 180",
      midX: 480,
      midY: 180,
      midTitle: "TRUST & SAFETY ENGINEER",
      midSkills: ["Policy Dev: 93%", "Classifier QA: 91%", "Tooling: 89%"],
      foundation: {
        title: "Content Policy Systems & Classifier QA",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Transition from manual moderation to designing content classifiers, testing AI moderation systems, and maintaining policy decision trees.",
        humanEdge: "Hard-won judgment about cultural and contextual nuance that classifiers miss.",
        skills: ["AI Content Classification", "Policy Tree Design", "Safety Tooling"],
        resources: [
          {
            type: "free",
            title: "Trust & Safety Professional Community",
            platform: "TSPA (tspalliance.org)",
            badge: "Free Access",
            link: "https://www.tspalliance.org/",
          },
          {
            type: "paid",
            title: "Certified Trust & Safety Professional",
            platform: "TSPA",
            badge: "Industry Cert",
            link: "https://www.tspalliance.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Classifier QA Engineer",
          x: 740,
          y: 120,
          pathD: "M 480 180 C 580 180, 640 120, 740 120",
          stage: "Intermediate",
          duration: "Days 31–60",
          skills: ["False Positive/Negative Analysis", "Edge Case Curation", "Annotation QA"],
          humanEdge: "Cultural intuition that improves classifier precision.",
          resources: [],
        },
        {
          id: "l2",
          title: "Safety Platform Architect",
          x: 740,
          y: 180,
          pathD: "M 480 180 L 740 180",
          stage: "Advanced",
          duration: "Days 61–90",
          skills: ["Moderation Infrastructure", "Appeals Workflow Design", "Velocity Rules"],
          humanEdge: "Systemic fairness in automated systems.",
          resources: [],
        },
        {
          id: "l3",
          title: "Head of Platform Safety Engineering",
          x: 740,
          y: 240,
          pathD: "M 480 180 C 580 180, 640 240, 740 240",
          stage: "Leadership",
          duration: "Days 91–120+",
          skills: [
            "Safety Architecture Strategy",
            "Cross-Platform Policy",
            "Regulatory Engagement",
          ],
          humanEdge: "Accountability for systemic decisions affecting millions of users.",
          resources: [],
        },
      ],
    },
    {
      id: "br_platsat",
      name: "Platform Safety Specialist",
      color: "#b000ff",
      glowClass: "glow-purple",
      curvePoints: "M 140 380 C 260 380, 340 320, 520 320",
      midX: 520,
      midY: 320,
      midTitle: "PLATFORM SAFETY SPECIALIST",
      midSkills: ["Policy QA: 94%", "Escalation Protocols: 92%", "Trauma-Informed: 89%"],
      foundation: {
        title: "Trauma-Informed Policy & Escalation Design",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Develop trauma-informed escalation protocols, specialist review queues for sensitive content (CSAM, self-harm, terrorism), and reviewer wellbeing standards.",
        humanEdge: "Trauma literacy and human resilience in high-impact review environments.",
        skills: [
          "Trauma-Informed Practice",
          "Sensitive Content Protocols",
          "Escalation Frameworks",
        ],
        resources: [
          {
            type: "free",
            title: "Digital Wellness for Trust & Safety",
            platform: "TSPA / Dart Center",
            badge: "Free",
            link: "https://dartcenter.org/",
          },
          {
            type: "paid",
            title: "Mental Health First Aid Certification",
            platform: "MHFA International",
            badge: "Certified ($150)",
            link: "https://www.mhfa.com.au/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Sensitive Content Policy Lead",
          x: 820,
          y: 280,
          pathD: "M 520 320 C 640 320, 720 280, 820 280",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["CSAM/Extremism Protocols", "Legal Reporting Requirements", "Case Management"],
          humanEdge: "Moral weight-bearing in legally and ethically extreme decisions.",
          resources: [],
        },
        {
          id: "l2",
          title: "Global Policy Operations Manager",
          x: 820,
          y: 360,
          pathD: "M 520 320 C 640 320, 720 360, 820 360",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: ["Cross-Region Policy", "Government Relations", "Reviewer Wellbeing Programs"],
          humanEdge: "Sustaining human review teams in psychologically taxing environments.",
          resources: [],
        },
      ],
    },
    {
      id: "br_digwell",
      name: "Digital Wellness Designer",
      color: "#f59e0b",
      glowClass: "glow-amber",
      curvePoints: "M 140 380 C 260 380, 340 480, 520 480",
      midX: 520,
      midY: 480,
      midTitle: "DIGITAL WELLNESS DESIGNER",
      midSkills: ["UX Ethics: 92%", "Wellbeing Research: 90%", "Policy UX: 88%"],
      foundation: {
        title: "Digital Wellbeing UX & Product Policy",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Design platform features that reduce addictive design patterns, support user mental health, and comply with digital wellbeing regulations.",
        humanEdge: "First-hand experience of how dark patterns harm real users.",
        skills: [
          "Digital Wellbeing Design Principles",
          "UX Research",
          "Regulatory Landscape (DSA/KOSA)",
        ],
        resources: [
          {
            type: "free",
            title: "Humane Technology Design Principles",
            platform: "Center for Humane Technology",
            badge: "Free",
            link: "https://www.humanetech.com/",
          },
          {
            type: "paid",
            title: "UX Research Certification",
            platform: "Nielsen Norman Group",
            badge: "Professional ($1,000)",
            link: "https://www.nngroup.com/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Product Policy Designer",
          x: 820,
          y: 440,
          pathD: "M 520 480 C 640 480, 720 440, 820 440",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["Feature Risk Assessment", "Policy-Product Alignment", "Stakeholder Advocacy"],
          humanEdge: "User advocacy inside product decision-making.",
          resources: [],
        },
        {
          id: "l2",
          title: "Director of Digital Wellbeing",
          x: 820,
          y: 520,
          pathD: "M 520 480 C 640 480, 720 520, 820 520",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: ["Platform Health Strategy", "Regulatory Compliance", "Public Interest Research"],
          humanEdge: "Long-term societal accountability over short-term engagement metrics.",
          resources: [],
        },
      ],
    },
    {
      id: "br_contethics",
      name: "Content Ethics Auditor",
      color: "#f72585",
      glowClass: "glow-magenta",
      curvePoints: "M 140 380 C 260 380, 320 620, 480 620",
      midX: 480,
      midY: 620,
      midTitle: "CONTENT ETHICS AUDITOR",
      midSkills: ["Policy Audit: 96%", "AI Fairness: 93%", "Regulatory: 91%"],
      foundation: {
        title: "AI Content Moderation Audit & Ethics",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Audit AI content moderation systems for bias, false positive rates across demographic groups, and alignment with human rights standards.",
        humanEdge:
          "Lived moderation experience that reveals where automated systems systematically fail.",
        skills: ["AI Fairness Metrics", "Content Audit Methodology", "Human Rights Frameworks"],
        resources: [
          {
            type: "free",
            title: "AI Fairness 360 Toolkit Documentation",
            platform: "IBM Research",
            badge: "Free Open Source",
            link: "https://aif360.mybluemix.net/",
          },
          {
            type: "paid",
            title: "Responsible AI Governance Program",
            platform: "IEEE",
            badge: "Professional Cert",
            link: "https://www.ieee.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "AI Moderation Fairness Analyst",
          x: 740,
          y: 590,
          pathD: "M 480 620 C 580 620, 640 590, 740 590",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["Disparate Impact Analysis", "Audit Reporting", "Redress Frameworks"],
          humanEdge: "Ethical witness for communities disproportionately harmed.",
          resources: [],
        },
        {
          id: "l2",
          title: "Head of Content Ethics & Compliance",
          x: 740,
          y: 650,
          pathD: "M 480 620 C 580 620, 640 650, 740 650",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: [
            "Ethics Board Participation",
            "Policy Transparency Reporting",
            "Regulatory Engagement",
          ],
          humanEdge: "Public accountability and moral leadership.",
          resources: [],
        },
      ],
    },
  ],

  hr_recruiter: [
    {
      id: "br_airec",
      name: "AI Recruiting Specialist",
      color: "#00f2fe",
      glowClass: "glow-cyan",
      curvePoints: "M 140 380 C 260 380, 320 180, 480 180",
      midX: 480,
      midY: 180,
      midTitle: "AI RECRUITING SPECIALIST",
      midSkills: ["ATS AI Config: 93%", "Sourcing Automation: 90%", "Bias Detection: 88%"],
      foundation: {
        title: "AI-Augmented Sourcing & ATS Optimization",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Configure AI-assisted ATS platforms, automate sourcing workflows, and implement bias detection reviews for AI-screened candidate shortlists.",
        humanEdge: "Recruiting intuition that reads between the lines of candidate profiles.",
        skills: ["Workday Recruiting / Greenhouse", "AI Sourcing Tools", "Bias-Free Screening"],
        resources: [
          {
            type: "free",
            title: "AI in Recruiting: Ethical Use Guide",
            platform: "SHRM",
            badge: "Free Member",
            link: "https://www.shrm.org/",
          },
          {
            type: "paid",
            title: "Professional Recruiter Certification (CIR)",
            platform: "AIRS",
            badge: "Industry Standard ($395)",
            link: "https://www.airsdirectory.com/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Technical Talent Sourcer",
          x: 740,
          y: 120,
          pathD: "M 480 180 C 580 180, 640 120, 740 120",
          stage: "Intermediate",
          duration: "Days 31–60",
          skills: [
            "Boolean Search Advanced",
            "GitHub/LinkedIn Sourcing",
            "Passive Candidate Engagement",
          ],
          humanEdge: "Human connection with passive candidates.",
          resources: [],
        },
        {
          id: "l2",
          title: "Talent Acquisition Tech Lead",
          x: 740,
          y: 180,
          pathD: "M 480 180 L 740 180",
          stage: "Advanced",
          duration: "Days 61–90",
          skills: [
            "TA Tech Stack Management",
            "Recruiting Analytics",
            "Interview Intelligence Tools",
          ],
          humanEdge: "System judgment for where AI-screening distorts rather than aids.",
          resources: [],
        },
        {
          id: "l3",
          title: "Head of Talent Acquisition",
          x: 740,
          y: 240,
          pathD: "M 480 180 C 580 180, 640 240, 740 240",
          stage: "Leadership",
          duration: "Days 91–120+",
          skills: ["Employer Brand Strategy", "Global TA Operations", "Executive Hiring"],
          humanEdge: "Company culture stewardship through hiring decisions.",
          resources: [],
        },
      ],
    },
    {
      id: "br_talentint",
      name: "Talent Intelligence Analyst",
      color: "#b000ff",
      glowClass: "glow-purple",
      curvePoints: "M 140 380 C 260 380, 340 320, 520 320",
      midX: 520,
      midY: 320,
      midTitle: "TALENT INTELLIGENCE ANALYST",
      midSkills: ["Labor Market Data: 94%", "Skills Forecasting: 91%", "Competitive Intel: 89%"],
      foundation: {
        title: "Labor Market & Workforce Intelligence",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Use workforce analytics platforms (LinkedIn Talent Insights, Lightcast) to map talent supply/demand, competitor hiring trends, and skills gap forecasts.",
        humanEdge:
          "Recruiter intuition about why candidates move and what really drives career decisions.",
        skills: [
          "LinkedIn Talent Insights",
          "Lightcast / Burning Glass",
          "Workforce Planning Fundamentals",
        ],
        resources: [
          {
            type: "free",
            title: "LinkedIn Talent Insights Learning Path",
            platform: "LinkedIn Learning",
            badge: "Free Trial",
            link: "https://www.linkedin.com/learning/",
          },
          {
            type: "paid",
            title: "Certified Talent Intelligence Professional",
            platform: "Aptitude Research",
            badge: "Emerging Cert",
            link: "https://www.aptituderesearch.com/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Strategic Workforce Planner",
          x: 820,
          y: 280,
          pathD: "M 520 320 C 640 320, 720 280, 820 280",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: [
            "Scenario Workforce Modeling",
            "Supply Chain of Talent",
            "Skills Taxonomy Design",
          ],
          humanEdge: "Human judgment about cultural fit beyond skills matching.",
          resources: [],
        },
        {
          id: "l2",
          title: "VP Talent Intelligence",
          x: 820,
          y: 360,
          pathD: "M 520 320 C 640 320, 720 360, 820 360",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: [
            "Board Workforce Reporting",
            "M&A Talent Due Diligence",
            "Future of Work Strategy",
          ],
          humanEdge: "Strategic foresight informed by human behavioral patterns.",
          resources: [],
        },
      ],
    },
    {
      id: "br_eex",
      name: "Employee Experience Designer",
      color: "#f59e0b",
      glowClass: "glow-amber",
      curvePoints: "M 140 380 C 260 380, 340 480, 520 480",
      midX: 520,
      midY: 480,
      midTitle: "EMPLOYEE EX DESIGNER",
      midSkills: ["Journey Mapping: 92%", "Engagement Analytics: 90%", "Culture Design: 89%"],
      foundation: {
        title: "Employee Journey Mapping & Experience Design",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Design AI-assisted onboarding journeys, map the full employee lifecycle experience, and build engagement survey programs.",
        humanEdge: "Recruiter empathy for the anxiety and hope of career transitions.",
        skills: ["EX Journey Mapping", "Onboarding Program Design", "Engagement Surveys"],
        resources: [
          {
            type: "free",
            title: "Employee Experience Design Fundamentals",
            platform: "SHRM / LinkedIn Learning",
            badge: "Free Audit",
            link: "https://www.linkedin.com/learning/",
          },
          {
            type: "paid",
            title: "SHRM-CP Employee Experience Module",
            platform: "SHRM",
            badge: "Professional ($300)",
            link: "https://www.shrm.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Employee Lifecycle Program Lead",
          x: 820,
          y: 440,
          pathD: "M 520 480 C 640 480, 720 440, 820 440",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["Pulse Survey Analysis", "EX Technology", "Retention Programs"],
          humanEdge: "Understanding what employees actually need vs what HR thinks they need.",
          resources: [],
        },
        {
          id: "l2",
          title: "Chief Employee Experience Officer",
          x: 820,
          y: 520,
          pathD: "M 520 480 C 640 480, 720 520, 820 520",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: ["Culture Transformation", "HR Design Thinking", "Board People Reporting"],
          humanEdge: "Authentic culture advocacy at executive level.",
          resources: [],
        },
      ],
    },
    {
      id: "br_ethicalhire",
      name: "Ethical Hiring & DEI Lead",
      color: "#f72585",
      glowClass: "glow-magenta",
      curvePoints: "M 140 380 C 260 380, 320 620, 480 620",
      midX: 480,
      midY: 620,
      midTitle: "ETHICAL HIRING LEAD",
      midSkills: ["DEI Audit: 96%", "Bias Frameworks: 93%", "Inclusive Design: 91%"],
      foundation: {
        title: "Inclusive Hiring Frameworks & DEI Audit",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Audit hiring pipelines for demographic bias, design structured interview frameworks, and implement inclusive job description tooling.",
        humanEdge:
          "Recruiter self-awareness about unconscious bias developed through honest reflection.",
        skills: ["Structured Interviewing", "Bias Audit Methodology", "Inclusive JD Design"],
        resources: [
          {
            type: "free",
            title: "Unconscious Bias Training",
            platform: "Google re:Work",
            badge: "Free",
            link: "https://rework.withgoogle.com/",
          },
          {
            type: "paid",
            title: "Certified Diversity Recruiter",
            platform: "AIRS",
            badge: "Professional ($495)",
            link: "https://www.airsdirectory.com/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "DEI Talent Strategy Lead",
          x: 740,
          y: 590,
          pathD: "M 480 620 C 580 620, 640 590, 740 590",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: [
            "Pipeline Diversity Analytics",
            "ERG Partnership",
            "Inclusive Assessment Design",
          ],
          humanEdge: "Moral authority built through consistent advocacy.",
          resources: [],
        },
        {
          id: "l2",
          title: "Chief Diversity Officer",
          x: 740,
          y: 650,
          pathD: "M 480 620 C 580 620, 640 650, 740 650",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: ["DEI Board Reporting", "Systemic Equity Programs", "Pay Equity Analysis"],
          humanEdge: "Courageous advocacy for structural equity.",
          resources: [],
        },
      ],
    },
  ],
  software_dev: [
    {
      id: "br_aiaugdev",
      name: "AI-Augmented Full Stack Engineer",
      color: "#00f2fe",
      glowClass: "glow-cyan",
      curvePoints: "M 140 380 C 260 380, 320 180, 480 180",
      midX: 480,
      midY: 180,
      midTitle: "AI-AUGMENTED ENGINEER",
      midSkills: ["LLM APIs: 94%", "Agent Frameworks: 91%", "Code Review AI: 89%"],
      foundation: {
        title: "AI-Augmented Development Workflows",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Master AI-assisted coding workflows using GitHub Copilot, Claude Code, and Cursor. Build expertise in validating AI-generated code for security, correctness, and performance.",
        humanEdge:
          "Developer judgment in reviewing AI output for subtle logic errors and security flaws.",
        skills: [
          "GitHub Copilot / Claude Code",
          "Prompt Engineering for Code",
          "Security Code Review",
        ],
        resources: [
          {
            type: "free",
            title: "GitHub Copilot Documentation & Labs",
            platform: "GitHub",
            badge: "Free Docs",
            link: "https://github.com/features/copilot",
          },
          {
            type: "paid",
            title: "AWS Certified Developer – Associate",
            platform: "AWS",
            badge: "Cloud Cert ($300)",
            link: "https://aws.amazon.com/certification/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "AI-Powered Application Developer",
          x: 740,
          y: 120,
          pathD: "M 480 180 C 580 180, 640 120, 740 120",
          stage: "Intermediate",
          duration: "Days 31–60",
          skills: ["LLM API Integration", "RAG Application Dev", "Agentic System Design"],
          humanEdge: "Architectural judgment for when AI components should and should not be used.",
          resources: [],
        },
        {
          id: "l2",
          title: "Platform Engineering Lead",
          x: 740,
          y: 180,
          pathD: "M 480 180 L 740 180",
          stage: "Advanced",
          duration: "Days 61–90",
          skills: ["Developer Platforms", "Internal Tooling", "AI Dev Productivity"],
          humanEdge: "Empathy for developer experience and team velocity.",
          resources: [],
        },
        {
          id: "l3",
          title: "Principal Engineer / CTO Track",
          x: 740,
          y: 240,
          pathD: "M 480 180 C 580 180, 640 240, 740 240",
          stage: "Leadership",
          duration: "Days 91–120+",
          skills: ["Technical Strategy", "AI Architecture", "Engineering Culture"],
          humanEdge: "Vision and trust that builds engineering organizations.",
          resources: [],
        },
      ],
    },
    {
      id: "br_mle",
      name: "ML / AI Integration Engineer",
      color: "#b000ff",
      glowClass: "glow-purple",
      curvePoints: "M 140 380 C 260 380, 340 320, 520 320",
      midX: 520,
      midY: 320,
      midTitle: "ML INTEGRATION ENGINEER",
      midSkills: ["ML Pipelines: 95%", "Model Serving: 92%", "MLOps: 90%"],
      foundation: {
        title: "ML Pipelines & Model Integration",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Build ML-integrated applications, design inference pipelines, and deploy models to production using cloud ML platforms and MLOps tools.",
        humanEdge:
          "Software engineering discipline that keeps ML systems maintainable and observable.",
        skills: ["Python ML Libraries", "Model APIs (Vertex AI, Bedrock)", "MLOps Fundamentals"],
        resources: [
          {
            type: "free",
            title: "Machine Learning Specialization",
            platform: "DeepLearning.AI / Coursera",
            badge: "Free Audit",
            link: "https://www.coursera.org/",
          },
          {
            type: "paid",
            title: "Google Professional ML Engineer",
            platform: "Google Cloud",
            badge: "Industry Cert ($200)",
            link: "https://cloud.google.com/certification/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "ML Platform Engineer",
          x: 820,
          y: 280,
          pathD: "M 520 320 C 640 320, 720 280, 820 280",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["Feature Stores", "Model Registry", "A/B Testing for ML"],
          humanEdge: "Ensuring ML systems behave reliably under real production conditions.",
          resources: [],
        },
        {
          id: "l2",
          title: "Head of ML Engineering",
          x: 820,
          y: 360,
          pathD: "M 520 320 C 640 320, 720 360, 820 360",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: [
            "ML System Design",
            "Research-to-Production Bridge",
            "AI Infrastructure Strategy",
          ],
          humanEdge: "Translation between research aspirations and engineering realities.",
          resources: [],
        },
      ],
    },
    {
      id: "br_pmdev",
      name: "Technical Product Manager",
      color: "#f59e0b",
      glowClass: "glow-amber",
      curvePoints: "M 140 380 C 260 380, 340 480, 520 480",
      midX: 520,
      midY: 480,
      midTitle: "TECHNICAL PRODUCT MANAGER",
      midSkills: ["Product Strategy: 93%", "Technical PM: 91%", "AI Roadmapping: 90%"],
      foundation: {
        title: "Technical Product Management for AI Products",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Transition from dev to PM for AI-powered products. Learn product discovery, user research, and roadmapping specific to AI feature development.",
        humanEdge: "Technical credibility with engineering teams combined with user empathy.",
        skills: ["Product Discovery", "User Research", "AI Feature Roadmapping"],
        resources: [
          {
            type: "free",
            title: "Product Management Fundamentals",
            platform: "Google / Coursera",
            badge: "Free Audit",
            link: "https://www.coursera.org/",
          },
          {
            type: "paid",
            title: "Pragmatic Marketing Certification",
            platform: "Pragmatic Institute",
            badge: "Professional ($1,500)",
            link: "https://www.pragmaticinstitute.com/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Senior AI Product Manager",
          x: 820,
          y: 440,
          pathD: "M 520 480 C 640 480, 720 440, 820 440",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["AI Product Strategy", "Cross-Functional Leadership", "Metrics & OKRs"],
          humanEdge: "Building product strategies where technical and human insight intersect.",
          resources: [],
        },
        {
          id: "l2",
          title: "VP of Product",
          x: 820,
          y: 520,
          pathD: "M 520 480 C 640 480, 720 520, 820 520",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: ["Portfolio Product Strategy", "P&L Ownership", "Company Vision Execution"],
          humanEdge: "Long-term product vision that balances innovation with trust.",
          resources: [],
        },
      ],
    },
    {
      id: "br_aisafety",
      name: "AI Safety & Red Team Lead",
      color: "#f72585",
      glowClass: "glow-magenta",
      curvePoints: "M 140 380 C 260 380, 320 620, 480 620",
      midX: 480,
      midY: 620,
      midTitle: "AI SAFETY LEAD",
      midSkills: ["Red Teaming: 96%", "Safety Evals: 94%", "Interpretability: 91%"],
      foundation: {
        title: "AI Safety Engineering & Red Teaming",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Apply software engineering skills to AI safety: build safety evaluation frameworks, conduct adversarial testing (jailbreaking, prompt injection), and implement safety guardrails.",
        humanEdge: "Developer intuition about how systems fail under adversarial pressure.",
        skills: ["Prompt Injection Testing", "Safety Eval Frameworks", "Interpretability Tools"],
        resources: [
          {
            type: "free",
            title: "AI Safety Fundamentals Course",
            platform: "BlueDot Impact",
            badge: "Free",
            link: "https://aisafetyfundamentals.com/",
          },
          {
            type: "paid",
            title: "AI Red Teaming Professional Certificate",
            platform: "DeepLearning.AI",
            badge: "Professional ($49)",
            link: "https://www.deeplearning.ai/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "AI Safety Researcher",
          x: 740,
          y: 590,
          pathD: "M 480 620 C 580 620, 640 590, 740 590",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["Mechanistic Interpretability", "Alignment Research", "Safety Benchmarks"],
          humanEdge: "Technical rigor applied to existential risk questions.",
          resources: [],
        },
        {
          id: "l2",
          title: "Head of AI Safety",
          x: 740,
          y: 650,
          pathD: "M 480 620 C 580 620, 640 650, 740 650",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: ["AI Governance", "Safety Culture", "External Research Collaboration"],
          humanEdge: "Moral clarity in navigating high-stakes AI development decisions.",
          resources: [],
        },
      ],
    },
  ],

  logistics_coord: [
    {
      id: "br_scaispec",
      name: "Supply Chain AI Analyst",
      color: "#00f2fe",
      glowClass: "glow-cyan",
      curvePoints: "M 140 380 C 260 380, 320 180, 480 180",
      midX: 480,
      midY: 180,
      midTitle: "SUPPLY CHAIN AI ANALYST",
      midSkills: ["Demand Forecasting: 93%", "TMS/WMS: 90%", "Route Optimization: 88%"],
      foundation: {
        title: "AI-Driven Supply Chain Analytics",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Use AI-powered TMS/WMS platforms to optimize routing, predict demand, and identify supply chain disruption signals before they cascade.",
        humanEdge:
          "Operational intuition about why standard forecasting models fail during real-world disruptions.",
        skills: ["TMS / WMS Systems", "Demand Planning Fundamentals", "Supply Chain Data Analysis"],
        resources: [
          {
            type: "free",
            title: "Supply Chain Analytics Fundamentals",
            platform: "Coursera / Rutgers",
            badge: "Free Audit",
            link: "https://www.coursera.org/",
          },
          {
            type: "paid",
            title: "APICS CSCP Certification",
            platform: "APICS",
            badge: "Global Standard ($995)",
            link: "https://www.ascm.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Demand Planning Specialist",
          x: 740,
          y: 120,
          pathD: "M 480 180 C 580 180, 640 120, 740 120",
          stage: "Intermediate",
          duration: "Days 31–60",
          skills: [
            "Statistical Forecasting",
            "Inventory Optimization",
            "Consensus Demand Planning",
          ],
          humanEdge: "Reading market signals that algorithmic models miss.",
          resources: [],
        },
        {
          id: "l2",
          title: "Supply Chain Operations Manager",
          x: 740,
          y: 180,
          pathD: "M 480 180 L 740 180",
          stage: "Advanced",
          duration: "Days 61–90",
          skills: ["S&OP Process", "Multi-Echelon Inventory", "Supplier Performance"],
          humanEdge: "Cross-stakeholder trust in high-pressure supply decisions.",
          resources: [],
        },
        {
          id: "l3",
          title: "VP Supply Chain Innovation",
          x: 740,
          y: 240,
          pathD: "M 480 180 C 580 180, 640 240, 740 240",
          stage: "Leadership",
          duration: "Days 91–120+",
          skills: ["Supply Chain Strategy", "Digital Twin Implementation", "Ecosystem Partnership"],
          humanEdge: "Strategic foresight for building resilient supply networks.",
          resources: [],
        },
      ],
    },
    {
      id: "br_procuremgr",
      name: "Procurement & Sourcing Manager",
      color: "#b000ff",
      glowClass: "glow-purple",
      curvePoints: "M 140 380 C 260 380, 340 320, 520 320",
      midX: 520,
      midY: 320,
      midTitle: "PROCUREMENT MANAGER",
      midSkills: ["Supplier Negotiation: 94%", "Category Mgmt: 91%", "Risk Sourcing: 89%"],
      foundation: {
        title: "Strategic Procurement & Supplier Management",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Evolve from logistics coordination to strategic procurement using AI-powered spend analysis, supplier risk tools, and category management.",
        humanEdge: "Supplier relationship trust that enables favorable commercial terms.",
        skills: ["Spend Analytics", "Supplier Risk Assessment", "Category Management Basics"],
        resources: [
          {
            type: "free",
            title: "CIPS Procurement Learning Resources",
            platform: "CIPS",
            badge: "Free Member",
            link: "https://www.cips.org/",
          },
          {
            type: "paid",
            title: "CIPS Diploma in Procurement & Supply",
            platform: "CIPS",
            badge: "Professional Qual. ($1,200)",
            link: "https://www.cips.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Category Procurement Lead",
          x: 820,
          y: 280,
          pathD: "M 520 320 C 640 320, 720 280, 820 280",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["RFP Design", "Total Cost of Ownership", "Contract Negotiation"],
          humanEdge: "Commercial relationship intelligence.",
          resources: [],
        },
        {
          id: "l2",
          title: "Chief Procurement Officer",
          x: 820,
          y: 360,
          pathD: "M 520 320 C 640 320, 720 360, 820 360",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: ["Procurement Strategy", "Supplier Diversity", "Board-Level Cost Stewardship"],
          humanEdge: "Supply chain integrity and long-term partnership ethics.",
          resources: [],
        },
      ],
    },
    {
      id: "br_scpmlead",
      name: "SCM Platform & Digital Lead",
      color: "#f59e0b",
      glowClass: "glow-amber",
      curvePoints: "M 140 380 C 260 380, 340 480, 520 480",
      midX: 520,
      midY: 480,
      midTitle: "SCM DIGITAL LEAD",
      midSkills: ["ERP/SCM Systems: 93%", "Digital Twin: 90%", "IoT Logistics: 88%"],
      foundation: {
        title: "Digital Supply Chain Platform Management",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Implement and manage digital supply chain platforms including SAP SCM, Oracle SCM, and IoT-integrated logistics systems.",
        humanEdge:
          "Operational grounding that prevents digital implementations from losing touch with physical reality.",
        skills: ["SAP / Oracle SCM", "IoT Sensor Integration", "Digital Twin Concepts"],
        resources: [
          {
            type: "free",
            title: "SAP Learning Hub: SCM Basics",
            platform: "SAP Learning",
            badge: "Free Intro",
            link: "https://learning.sap.com/",
          },
          {
            type: "paid",
            title: "SAP Certified Application Associate – SCM",
            platform: "SAP",
            badge: "Professional Cert ($500)",
            link: "https://training.sap.com/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "SCM Systems Implementation Lead",
          x: 820,
          y: 440,
          pathD: "M 520 480 C 640 480, 720 440, 820 440",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["ERP Implementation", "Change Management", "System Integration"],
          humanEdge: "Translating operational realities into system design requirements.",
          resources: [],
        },
        {
          id: "l2",
          title: "VP Supply Chain Technology",
          x: 820,
          y: 520,
          pathD: "M 520 480 C 640 480, 720 520, 820 520",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: ["Digital SC Strategy", "Platform Ecosystem", "AI Supply Chain Governance"],
          humanEdge: "Bridging technology investment with sustainable operational impact.",
          resources: [],
        },
      ],
    },
    {
      id: "br_scresilience",
      name: "Supply Chain Resilience Officer",
      color: "#f72585",
      glowClass: "glow-magenta",
      curvePoints: "M 140 380 C 260 380, 320 620, 480 620",
      midX: 480,
      midY: 620,
      midTitle: "SC RESILIENCE OFFICER",
      midSkills: ["Risk Mapping: 96%", "Crisis Response: 93%", "ESG Compliance: 91%"],
      foundation: {
        title: "Supply Chain Risk & Resilience Frameworks",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Map supply chain vulnerabilities using AI risk tools, design business continuity protocols, and implement ESG supplier compliance frameworks.",
        humanEdge: "Operational experience that reveals which risks are real vs. theoretical.",
        skills: ["Supply Chain Risk Mapping", "BCP Design", "ESG Supplier Assessment"],
        resources: [
          {
            type: "free",
            title: "Supply Chain Resilience Guide",
            platform: "BSI Group",
            badge: "Free White Papers",
            link: "https://www.bsigroup.com/",
          },
          {
            type: "paid",
            title: "Business Continuity Management Certification",
            platform: "BCI",
            badge: "Professional (CBCI)",
            link: "https://www.thebci.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Supply Chain Risk Manager",
          x: 740,
          y: 590,
          pathD: "M 480 620 C 580 620, 640 590, 740 590",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["Crisis Playbooks", "Multi-Tier Supplier Visibility", "Insurance & Hedging"],
          humanEdge: "Crisis leadership under supply disruption pressure.",
          resources: [],
        },
        {
          id: "l2",
          title: "Chief Supply Chain Resilience Officer",
          x: 740,
          y: 650,
          pathD: "M 480 620 C 580 620, 640 650, 740 650",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: ["Board SC Risk Reporting", "Geopolitical Risk Strategy", "Global Trade Policy"],
          humanEdge: "Ethical sourcing decisions under systemic economic pressure.",
          resources: [],
        },
      ],
    },
  ],
  sales_rep: [
    {
      id: "br_aisaleseng",
      name: "AI Sales Engineer",
      color: "#00f2fe",
      glowClass: "glow-cyan",
      curvePoints: "M 140 380 C 260 380, 320 180, 480 180",
      midX: 480,
      midY: 180,
      midTitle: "AI SALES ENGINEER",
      midSkills: ["CRM AI: 94%", "Revenue Intelligence: 91%", "Demo Engineering: 89%"],
      foundation: {
        title: "AI-Augmented Sales & Revenue Intelligence",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Master AI-powered CRM tools (Salesforce Einstein, HubSpot AI), revenue intelligence platforms (Gong, Chorus), and automated outreach sequencing.",
        humanEdge:
          "Relationship intelligence and timing instinct that AI prospecting tools cannot replicate.",
        skills: ["Salesforce Einstein / HubSpot AI", "Gong / Chorus", "Outreach Sequencing"],
        resources: [
          {
            type: "free",
            title: "Salesforce Trailhead: AI for Sales",
            platform: "Salesforce",
            badge: "Free Certified",
            link: "https://trailhead.salesforce.com/",
          },
          {
            type: "paid",
            title: "Certified Sales Professional (CSP)",
            platform: "NASP",
            badge: "Professional ($495)",
            link: "https://www.nasp.com/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Revenue Operations Analyst",
          x: 740,
          y: 120,
          pathD: "M 480 180 C 580 180, 640 120, 740 120",
          stage: "Intermediate",
          duration: "Days 31–60",
          skills: ["Pipeline Analytics", "Sales Forecasting AI", "CRM Data Hygiene"],
          humanEdge: "Understanding why pipeline data gets misrepresented by salespeople.",
          resources: [],
        },
        {
          id: "l2",
          title: "Enterprise Sales Strategist",
          x: 740,
          y: 180,
          pathD: "M 480 180 L 740 180",
          stage: "Advanced",
          duration: "Days 61–90",
          skills: [
            "Complex Deal Strategy",
            "Multi-Stakeholder Mapping",
            "Strategic Account Planning",
          ],
          humanEdge: "Long-term trust and political navigation in enterprise accounts.",
          resources: [],
        },
        {
          id: "l3",
          title: "VP of Sales",
          x: 740,
          y: 240,
          pathD: "M 480 180 C 580 180, 640 240, 740 240",
          stage: "Leadership",
          duration: "Days 91–120+",
          skills: ["Sales Organization Design", "GTM Strategy", "Revenue Target Ownership"],
          humanEdge: "Culture of authentic customer partnership.",
          resources: [],
        },
      ],
    },
    {
      id: "br_solconsult",
      name: "Solution Consultant / Pre-Sales",
      color: "#b000ff",
      glowClass: "glow-purple",
      curvePoints: "M 140 380 C 260 380, 340 320, 520 320",
      midX: 520,
      midY: 320,
      midTitle: "SOLUTION CONSULTANT",
      midSkills: ["Technical Demo: 95%", "RFP Response: 92%", "Value Engineering: 90%"],
      foundation: {
        title: "Technical Solution Consulting & Pre-Sales",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Transition from field sales to pre-sales consulting — building technical demos, responding to RFPs, and articulating ROI frameworks for AI-powered solutions.",
        humanEdge: "Customer context and business problem empathy that generic demos miss.",
        skills: ["Demo Engineering", "Business Case Modeling", "RFP/RFI Response"],
        resources: [
          {
            type: "free",
            title: "Pre-Sales Collective Community Resources",
            platform: "Pre-Sales Collective",
            badge: "Free Community",
            link: "https://www.presalescollective.com/",
          },
          {
            type: "paid",
            title: "NASP Certified Solution Selling Professional",
            platform: "NASP",
            badge: "Professional ($595)",
            link: "https://www.nasp.com/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Senior Solution Architect",
          x: 820,
          y: 280,
          pathD: "M 520 320 C 640 320, 720 280, 820 280",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: [
            "Technical Architecture",
            "Proof of Concept Leadership",
            "Competitive Positioning",
          ],
          humanEdge: "Genuine curiosity about customer problems.",
          resources: [],
        },
        {
          id: "l2",
          title: "Practice Director: AI Solutions",
          x: 820,
          y: 360,
          pathD: "M 520 320 C 640 320, 720 360, 820 360",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: ["Solution Practice Leadership", "Field Enablement", "Partnership Strategy"],
          humanEdge: "Market empathy that shapes product direction.",
          resources: [],
        },
      ],
    },
    {
      id: "br_kamgr",
      name: "Key Account Manager",
      color: "#f59e0b",
      glowClass: "glow-amber",
      curvePoints: "M 140 380 C 260 380, 340 480, 520 480",
      midX: 520,
      midY: 480,
      midTitle: "KEY ACCOUNT MANAGER",
      midSkills: [
        "Strategic Account: 94%",
        "Executive Relationships: 92%",
        "Value Co-Creation: 90%",
      ],
      foundation: {
        title: "Strategic Account Management & Executive Relationships",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Build strategic account management capability: executive mapping, joint business planning, and value co-creation frameworks for tier-1 accounts.",
        humanEdge: "Trust earned through consistent delivery and genuine client advocacy.",
        skills: [
          "Executive Relationship Mapping",
          "Joint Business Planning",
          "NPS & Health Score Management",
        ],
        resources: [
          {
            type: "free",
            title: "Strategic Account Management Resources",
            platform: "SAMA",
            badge: "Free Member",
            link: "https://www.strategicaccounts.org/",
          },
          {
            type: "paid",
            title: "Certified Strategic Account Manager (CSAM)",
            platform: "SAMA",
            badge: "Professional ($1,200)",
            link: "https://www.strategicaccounts.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Global Strategic Account Director",
          x: 820,
          y: 440,
          pathD: "M 520 480 C 640 480, 720 440, 820 440",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: [
            "Multi-Country Account Strategy",
            "C-Suite Engagement",
            "Revenue Expansion Planning",
          ],
          humanEdge: "Cross-cultural relationship intelligence.",
          resources: [],
        },
        {
          id: "l2",
          title: "Chief Revenue Officer",
          x: 820,
          y: 520,
          pathD: "M 520 480 C 640 480, 720 520, 820 520",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: ["Revenue Architecture", "GTM Strategy", "Sales-Marketing-CS Alignment"],
          humanEdge: "Customer-first culture that generates compound revenue growth.",
          resources: [],
        },
      ],
    },
    {
      id: "br_salesethics",
      name: "B2B Ethics & Value Advisor",
      color: "#f72585",
      glowClass: "glow-magenta",
      curvePoints: "M 140 380 C 260 380, 320 620, 480 620",
      midX: 480,
      midY: 620,
      midTitle: "B2B ETHICS ADVISOR",
      midSkills: ["Ethical Selling: 96%", "Procurement Ethics: 93%", "AI Sales Audit: 91%"],
      foundation: {
        title: "Ethical Sales Practices & AI Sales Governance",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Design ethical AI sales tool governance: audit AI prospecting for bias, assess predatory pricing tool practices, and champion honest selling standards.",
        humanEdge: "Firsthand experience of how sales pressure creates ethical gray zones.",
        skills: ["AI Sales Tool Audit", "Ethical Selling Standards", "Buyer Protection Advocacy"],
        resources: [
          {
            type: "free",
            title: "Ethical Selling Standards",
            platform: "Sales Management Association",
            badge: "Free Resources",
            link: "https://www.salesmanagement.org/",
          },
          {
            type: "paid",
            title: "Certified Ethical Sales Professional",
            platform: "NASP",
            badge: "Emerging Certification",
            link: "https://www.nasp.com/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Sales Integrity & Compliance Lead",
          x: 740,
          y: 590,
          pathD: "M 480 620 C 580 620, 640 590, 740 590",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["Commission Ethics Design", "Pricing Governance", "Sales Practice Audits"],
          humanEdge: "Courage to enforce ethical standards under revenue pressure.",
          resources: [],
        },
        {
          id: "l2",
          title: "Chief Commercial Ethics Officer",
          x: 740,
          y: 650,
          pathD: "M 480 620 C 580 620, 640 650, 740 650",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: [
            "Commercial Policy Governance",
            "AI Sales Ethics Board",
            "Customer Trust Standards",
          ],
          humanEdge: "Commercial integrity as a long-term competitive advantage.",
          resources: [],
        },
      ],
    },
  ],

  graphic_designer: [
    {
      id: "br_aicd",
      name: "AI Creative Director",
      color: "#00f2fe",
      glowClass: "glow-cyan",
      curvePoints: "M 140 380 C 260 380, 320 180, 480 180",
      midX: 480,
      midY: 180,
      midTitle: "AI CREATIVE DIRECTOR",
      midSkills: ["Gen AI Art Direction: 94%", "Brand Consistency: 92%", "Prompt Design: 90%"],
      foundation: {
        title: "AI-Augmented Design & Art Direction",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Master AI image generation tools (Midjourney, DALL-E, Firefly) for brand-consistent creative work. Learn to art-direct AI outputs, maintaining visual identity standards.",
        humanEdge:
          "Aesthetic judgment and brand intuition that distinguishes excellent AI-assisted design from generic output.",
        skills: [
          "Midjourney / Firefly Art Direction",
          "Brand Guidelines Application",
          "AI Image QA",
        ],
        resources: [
          {
            type: "free",
            title: "Adobe Firefly & Generative AI for Designers",
            platform: "Adobe Learn",
            badge: "Free",
            link: "https://www.adobe.com/learn/",
          },
          {
            type: "paid",
            title: "Adobe Certified Professional",
            platform: "Adobe",
            badge: "Professional Cert ($180)",
            link: "https://www.adobe.com/products/certifications.html",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Brand AI Systems Designer",
          x: 740,
          y: 120,
          pathD: "M 480 180 C 580 180, 640 120, 740 120",
          stage: "Intermediate",
          duration: "Days 31–60",
          skills: ["Design System Management", "Brand Token Architecture", "AI Asset Libraries"],
          humanEdge: "Design integrity across AI-generated brand touchpoints.",
          resources: [],
        },
        {
          id: "l2",
          title: "Creative Technology Director",
          x: 740,
          y: 180,
          pathD: "M 480 180 L 740 180",
          stage: "Advanced",
          duration: "Days 61–90",
          skills: [
            "Creative Automation Systems",
            "Campaign AI Integration",
            "Cross-Channel Creative Ops",
          ],
          humanEdge: "Creative vision that AI executes but cannot originate.",
          resources: [],
        },
        {
          id: "l3",
          title: "VP Creative & Brand",
          x: 740,
          y: 240,
          pathD: "M 480 180 C 580 180, 640 240, 740 240",
          stage: "Leadership",
          duration: "Days 91–120+",
          skills: ["Brand Architecture", "Creative Department Leadership", "Cultural Strategy"],
          humanEdge: "Cultural empathy and creative courage at brand leadership level.",
          resources: [],
        },
      ],
    },
    {
      id: "br_brandstrat",
      name: "Brand Strategy Director",
      color: "#b000ff",
      glowClass: "glow-purple",
      curvePoints: "M 140 380 C 260 380, 340 320, 520 320",
      midX: 520,
      midY: 320,
      midTitle: "BRAND STRATEGY DIRECTOR",
      midSkills: ["Brand Positioning: 95%", "Consumer Insight: 92%", "Market Research: 90%"],
      foundation: {
        title: "Brand Strategy & Consumer Insight",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Develop brand strategy skills: positioning, audience segmentation, competitive analysis, and cultural trend mapping to complement visual design capabilities.",
        humanEdge:
          "Visual storytelling intuition that translates cultural insight into distinctive brand language.",
        skills: [
          "Brand Positioning Frameworks",
          "Consumer Research Methods",
          "Competitive Brand Audit",
        ],
        resources: [
          {
            type: "free",
            title: "Brand Strategy & Identity Design",
            platform: "The Futur / YouTube",
            badge: "Free",
            link: "https://thefutur.com/",
          },
          {
            type: "paid",
            title: "Brand Management Certificate",
            platform: "Kellogg Executive Education",
            badge: "Executive ($3,000)",
            link: "https://execed.kellogg.northwestern.edu/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Global Brand Manager",
          x: 820,
          y: 280,
          pathD: "M 520 320 C 640 320, 720 280, 820 280",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["Brand P&L", "Global Campaign Management", "Retail Brand Execution"],
          humanEdge: "Cultural nuance in multi-market brand expression.",
          resources: [],
        },
        {
          id: "l2",
          title: "Chief Brand Officer",
          x: 820,
          y: 360,
          pathD: "M 520 320 C 640 320, 720 360, 820 360",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: [
            "Corporate Brand Architecture",
            "M&A Brand Integration",
            "Purpose-Led Brand Leadership",
          ],
          humanEdge: "Brand conviction that builds enduring loyalty.",
          resources: [],
        },
      ],
    },
    {
      id: "br_uxprod",
      name: "UX / Product Designer",
      color: "#f59e0b",
      glowClass: "glow-amber",
      curvePoints: "M 140 380 C 260 380, 340 480, 520 480",
      midX: 520,
      midY: 480,
      midTitle: "UX / PRODUCT DESIGNER",
      midSkills: ["Figma/UX: 94%", "User Research: 91%", "Prototyping: 90%"],
      foundation: {
        title: "UX Research & Product Design",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Transition from visual design to UX/product design: learn user research methods, interaction design principles, and Figma prototyping for digital products.",
        humanEdge:
          "Visual communication clarity and aesthetic judgment that reduces user friction.",
        skills: ["Figma Advanced", "UX Research Methods", "Interaction Design Principles"],
        resources: [
          {
            type: "free",
            title: "Google UX Design Certificate",
            platform: "Coursera",
            badge: "Free Audit",
            link: "https://www.coursera.org/",
          },
          {
            type: "paid",
            title: "Nielsen Norman Group UX Certification",
            platform: "NN/g",
            badge: "Industry Standard ($1,000+)",
            link: "https://www.nngroup.com/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Senior Product Designer",
          x: 820,
          y: 440,
          pathD: "M 520 480 C 640 480, 720 440, 820 440",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["Design Systems", "0-to-1 Product Design", "AI Feature UX"],
          humanEdge: "User empathy that prevents technologically impressive but unusable products.",
          resources: [],
        },
        {
          id: "l2",
          title: "Head of Design",
          x: 820,
          y: 520,
          pathD: "M 520 480 C 640 480, 720 520, 820 520",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: ["Design Organization Leadership", "Design Strategy", "C-Suite Design Advocacy"],
          humanEdge: "Design culture stewardship.",
          resources: [],
        },
      ],
    },
    {
      id: "br_creativeeth",
      name: "Creative Ethics Lead",
      color: "#f72585",
      glowClass: "glow-magenta",
      curvePoints: "M 140 380 C 260 380, 320 620, 480 620",
      midX: 480,
      midY: 620,
      midTitle: "CREATIVE ETHICS LEAD",
      midSkills: ["AI Art Ethics: 96%", "IP Law Basics: 93%", "Creator Rights: 91%"],
      foundation: {
        title: "AI Art Ethics, IP Rights & Creator Advocacy",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Navigate the ethical and legal landscape of AI-generated art: copyright, artist attribution, training data consent, and creator compensation models.",
        humanEdge: "First-person creator experience that gives authentic authority in advocacy.",
        skills: ["AI Art Copyright Law", "Creator Rights Frameworks", "Ethical AI Image Use"],
        resources: [
          {
            type: "free",
            title: "Creative Commons & AI Art: Legal Overview",
            platform: "Creative Commons",
            badge: "Free",
            link: "https://creativecommons.org/",
          },
          {
            type: "paid",
            title: "IP Law for Creatives",
            platform: "Harvard Online (edX)",
            badge: "Certificate ($350)",
            link: "https://www.edx.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Creative Industry AI Policy Lead",
          x: 740,
          y: 590,
          pathD: "M 480 620 C 580 620, 640 590, 740 590",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: [
            "Creative Industry Advocacy",
            "Policy Consultation",
            "AI Watermarking Standards",
          ],
          humanEdge: "Authentic voice from within the creative community.",
          resources: [],
        },
        {
          id: "l2",
          title: "Director of Creative Ethics & Standards",
          x: 740,
          y: 650,
          pathD: "M 480 620 C 580 620, 640 650, 740 650",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: ["Industry Policy Shaping", "Creator Rights Governance", "AI Ethics Boards"],
          humanEdge: "Moral authority in redefining creative ownership in the AI era.",
          resources: [],
        },
      ],
    },
  ],
  ecom_coord: [
    {
      id: "br_ecommerch",
      name: "E-Commerce AI Merchandiser",
      color: "#00f2fe",
      glowClass: "glow-cyan",
      curvePoints: "M 140 380 C 260 380, 320 180, 480 180",
      midX: 480,
      midY: 180,
      midTitle: "ECOM AI MERCHANDISER",
      midSkills: ["AI Merchandising: 93%", "Pricing Intelligence: 90%", "Catalogue AI: 88%"],
      foundation: {
        title: "AI-Driven Product Merchandising & Pricing",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Master AI merchandising tools: dynamic pricing engines, automated catalogue enrichment, AI-generated product descriptions, and personalized recommendation systems on SEA marketplace platforms.",
        humanEdge:
          "Merchandising intuition for category trends, seasonality, and consumer psychology beyond algorithms.",
        skills: [
          "Tokopedia/Shopee Seller Tools",
          "Dynamic Pricing Concepts",
          "AI Product Description QA",
        ],
        resources: [
          {
            type: "free",
            title: "E-Commerce Fundamentals",
            platform: "Google Digital Garage",
            badge: "Free Certified",
            link: "https://learndigital.withgoogle.com/",
          },
          {
            type: "paid",
            title: "Digital Marketing & E-Commerce Certificate",
            platform: "Google / Coursera",
            badge: "Professional Cert ($199)",
            link: "https://www.coursera.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "AI Category Manager",
          x: 740,
          y: 120,
          pathD: "M 480 180 C 580 180, 640 120, 740 120",
          stage: "Intermediate",
          duration: "Days 31–60",
          skills: ["Category P&L", "Assortment AI Analytics", "Vendor Negotiation"],
          humanEdge: "Category intuition that pricing data alone cannot provide.",
          resources: [],
        },
        {
          id: "l2",
          title: "Marketplace Growth Strategist",
          x: 740,
          y: 180,
          pathD: "M 480 180 L 740 180",
          stage: "Advanced",
          duration: "Days 61–90",
          skills: [
            "Multi-Platform Strategy",
            "Cross-Border E-Commerce",
            "Customer Lifetime Value Optimization",
          ],
          humanEdge: "Local market empathy for SEA consumer behavior.",
          resources: [],
        },
        {
          id: "l3",
          title: "Head of E-Commerce",
          x: 740,
          y: 240,
          pathD: "M 480 180 C 580 180, 640 240, 740 240",
          stage: "Leadership",
          duration: "Days 91–120+",
          skills: ["E-Commerce P&L Ownership", "Omnichannel Strategy", "Platform Partnership"],
          humanEdge:
            "Strategic vision balancing automation efficiency with authentic brand experience.",
          resources: [],
        },
      ],
    },
    {
      id: "br_digicommstrat",
      name: "Digital Commerce Strategist",
      color: "#b000ff",
      glowClass: "glow-purple",
      curvePoints: "M 140 380 C 260 380, 340 320, 520 320",
      midX: 520,
      midY: 320,
      midTitle: "DIGITAL COMMERCE STRATEGIST",
      midSkills: ["GTM Strategy: 94%", "D2C Playbooks: 91%", "CX Analytics: 89%"],
      foundation: {
        title: "D2C Digital Commerce Strategy",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Design D2C brand digital commerce strategies: customer acquisition funnels, retention programs, and multi-channel marketplace strategy across SEA platforms.",
        humanEdge:
          "Consumer journey empathy that shapes strategy beyond what analytics dashboards reveal.",
        skills: [
          "D2C Commerce Fundamentals",
          "Customer Acquisition Funnels",
          "Retention Program Design",
        ],
        resources: [
          {
            type: "free",
            title: "Shopify Academy: E-Commerce Fundamentals",
            platform: "Shopify Academy",
            badge: "Free",
            link: "https://academy.shopify.com/",
          },
          {
            type: "paid",
            title: "Digital Commerce Specialist Certification",
            platform: "DMI",
            badge: "Professional Cert ($375)",
            link: "https://digitalmarketinginstitute.com/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Digital Commerce Director",
          x: 820,
          y: 280,
          pathD: "M 520 320 C 640 320, 720 280, 820 280",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["Revenue Channel Strategy", "Marketplace P&L", "Cross-Border Commerce"],
          humanEdge: "Commercial intuition for when consumer trust is fragile.",
          resources: [],
        },
        {
          id: "l2",
          title: "VP Digital & E-Commerce",
          x: 820,
          y: 360,
          pathD: "M 520 320 C 640 320, 720 360, 820 360",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: [
            "Digital Business Model Innovation",
            "M&A Digital Integration",
            "Platform Ecosystem Strategy",
          ],
          humanEdge: "Long-term brand stewardship in volatile digital commerce markets.",
          resources: [],
        },
      ],
    },
    {
      id: "br_catmgr",
      name: "Category & Retail Analytics Manager",
      color: "#f59e0b",
      glowClass: "glow-amber",
      curvePoints: "M 140 380 C 260 380, 340 480, 520 480",
      midX: 520,
      midY: 480,
      midTitle: "CATEGORY ANALYTICS MANAGER",
      midSkills: ["Category Analytics: 93%", "Shopper Insight: 91%", "Pricing Strategy: 89%"],
      foundation: {
        title: "Category Management & Shopper Analytics",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Build category management expertise using AI-powered shopper analytics, market basket analysis, and planogram optimization tools.",
        humanEdge: "Shopper behavioral intuition that pure data analysis misses.",
        skills: ["Category Management Fundamentals", "Shopper Analytics", "Market Basket Analysis"],
        resources: [
          {
            type: "free",
            title: "Category Management Association Resources",
            platform: "CMA",
            badge: "Free Member",
            link: "https://www.cpgcatnet.org/",
          },
          {
            type: "paid",
            title: "Certified Category Management Professional (CCMP)",
            platform: "CMA",
            badge: "Professional ($495)",
            link: "https://www.cpgcatnet.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Senior Category Manager",
          x: 820,
          y: 440,
          pathD: "M 520 480 C 640 480, 720 440, 820 440",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["JBP with Suppliers", "Space Management", "Range Optimization"],
          humanEdge: "Supplier relationship trust that accelerates joint value creation.",
          resources: [],
        },
        {
          id: "l2",
          title: "Head of Category & Insights",
          x: 820,
          y: 520,
          pathD: "M 520 480 C 640 480, 720 520, 820 520",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: [
            "Category Portfolio Strategy",
            "Retail Media Strategy",
            "Consumer Insights Leadership",
          ],
          humanEdge: "Consumer empathy at strategic scale.",
          resources: [],
        },
      ],
    },
    {
      id: "br_ecomethics",
      name: "E-Commerce Ethics & Sustainability Lead",
      color: "#f72585",
      glowClass: "glow-magenta",
      curvePoints: "M 140 380 C 260 380, 320 620, 480 620",
      midX: 480,
      midY: 620,
      midTitle: "ECOM ETHICS LEAD",
      midSkills: ["Dark Pattern Audit: 96%", "Sustainable Commerce: 93%", "Consumer Rights: 91%"],
      foundation: {
        title: "Ethical E-Commerce Design & Consumer Protection",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Audit e-commerce platforms for dark patterns, deceptive pricing, counterfeit product risks, and design ethical consumer experience standards.",
        humanEdge:
          "Merchant-side experience revealing which dark patterns are systemic vs. incidental.",
        skills: [
          "Dark Pattern Recognition",
          "Consumer Protection Law",
          "Sustainable Commerce Principles",
        ],
        resources: [
          {
            type: "free",
            title: "Deceptive Design Pattern Library",
            platform: "deceptive.design",
            badge: "Free Resource",
            link: "https://www.deceptive.design/",
          },
          {
            type: "paid",
            title: "Ethical Business Certification",
            platform: "B Corp / B Lab",
            badge: "B Corp Certification",
            link: "https://www.bcorporation.net/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Consumer Trust & Ethics Lead",
          x: 740,
          y: 590,
          pathD: "M 480 620 C 580 620, 640 590, 740 590",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["Platform Policy Design", "Consumer Redress", "Transparency Reporting"],
          humanEdge: "Consumer advocacy from operational experience.",
          resources: [],
        },
        {
          id: "l2",
          title: "Chief Sustainability & Commerce Ethics Officer",
          x: 740,
          y: 650,
          pathD: "M 480 620 C 580 620, 640 650, 740 650",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: ["ESG Commerce Strategy", "Regulatory Engagement", "Supply Chain Ethics"],
          humanEdge: "Long-term ethical accountability in digital commerce.",
          resources: [],
        },
      ],
    },
  ],

  call_centre_lead: [
    {
      id: "br_aiworkforcemgr",
      name: "AI Workforce Manager",
      color: "#00f2fe",
      glowClass: "glow-cyan",
      curvePoints: "M 140 380 C 260 380, 320 180, 480 180",
      midX: 480,
      midY: 180,
      midTitle: "AI WORKFORCE MANAGER",
      midSkills: ["WFM AI Tools: 93%", "Human-AI Blending: 91%", "Real-Time Analytics: 89%"],
      foundation: {
        title: "AI-Human Workforce Blending & WFM",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Manage blended AI-human contact centre operations: configure AI routing, define human escalation triggers, and optimize workforce schedules using AI WFM platforms.",
        humanEdge: "Team leadership that sustains human motivation alongside automation.",
        skills: [
          "AI WFM Platforms (Verint/NICE)",
          "Blended Queue Design",
          "Real-Time Agent Supervision",
        ],
        resources: [
          {
            type: "free",
            title: "NICE CXone Learning Resources",
            platform: "NICE",
            badge: "Free Trial",
            link: "https://www.nice.com/",
          },
          {
            type: "paid",
            title: "CCXP Certification (Customer Experience)",
            platform: "CXPA",
            badge: "Professional ($395)",
            link: "https://www.cxpa.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "CX Operations Director",
          x: 740,
          y: 120,
          pathD: "M 480 180 C 580 180, 640 120, 740 120",
          stage: "Intermediate",
          duration: "Days 31–60",
          skills: ["Contact Centre P&L", "Channel Strategy", "AI Vendor Management"],
          humanEdge: "Operational empathy for frontline agent experience.",
          resources: [],
        },
        {
          id: "l2",
          title: "VP Customer Experience Operations",
          x: 740,
          y: 180,
          pathD: "M 480 180 L 740 180",
          stage: "Advanced",
          duration: "Days 61–90",
          skills: [
            "CX Technology Strategy",
            "Global Contact Centre Management",
            "Outsourcing Governance",
          ],
          humanEdge: "Balancing automation ROI with human service quality.",
          resources: [],
        },
        {
          id: "l3",
          title: "Chief Customer Officer",
          x: 740,
          y: 240,
          pathD: "M 480 180 C 580 180, 640 240, 740 240",
          stage: "Leadership",
          duration: "Days 91–120+",
          skills: ["CX Board Strategy", "Brand-to-Service Alignment", "NPS Programme Leadership"],
          humanEdge: "Human-centric CX vision at board level.",
          resources: [],
        },
      ],
    },
    {
      id: "br_cxtech",
      name: "CX Technology Lead",
      color: "#b000ff",
      glowClass: "glow-purple",
      curvePoints: "M 140 380 C 260 380, 340 320, 520 320",
      midX: 520,
      midY: 320,
      midTitle: "CX TECHNOLOGY LEAD",
      midSkills: ["CCaaS Platforms: 94%", "Chatbot Config: 91%", "Analytics Dashboards: 89%"],
      foundation: {
        title: "Contact Centre Technology & Platform Management",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Manage CX technology stacks: CCaaS platforms (Genesys, Avaya), chatbot configuration, conversational AI tuning, and quality analytics dashboards.",
        humanEdge:
          "Frontline operational experience that prevents technology decisions disconnected from agent reality.",
        skills: [
          "Genesys / Avaya CCaaS",
          "Conversational AI Config",
          "Quality Analytics Platforms",
        ],
        resources: [
          {
            type: "free",
            title: "Genesys Cloud CX Learning",
            platform: "Genesys",
            badge: "Free Community",
            link: "https://learn.genesys.com/",
          },
          {
            type: "paid",
            title: "CX Cloud Technology Certification",
            platform: "Genesys / NICE",
            badge: "Professional Cert",
            link: "https://www.genesys.com/certifications",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "CX Technology Programme Manager",
          x: 820,
          y: 280,
          pathD: "M 520 320 C 640 320, 720 280, 820 280",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["Platform Migration", "Agent Desktop Design", "API Integrations"],
          humanEdge: "Change management through operational empathy.",
          resources: [],
        },
        {
          id: "l2",
          title: "Head of CX Technology",
          x: 820,
          y: 360,
          pathD: "M 520 320 C 640 320, 720 360, 820 360",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: ["CX Tech Strategy", "Vendor Ecosystem", "AI Investment ROI"],
          humanEdge: "Technology judgment informed by real customer impact.",
          resources: [],
        },
      ],
    },
    {
      id: "br_cxdir",
      name: "CX Strategy Director",
      color: "#f59e0b",
      glowClass: "glow-amber",
      curvePoints: "M 140 380 C 260 380, 340 480, 520 480",
      midX: 520,
      midY: 480,
      midTitle: "CX STRATEGY DIRECTOR",
      midSkills: ["CX Strategy: 94%", "Journey Design: 91%", "VOC Programs: 89%"],
      foundation: {
        title: "Customer Experience Strategy & Journey Design",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Develop CX strategy skills: customer journey mapping, voice of customer (VOC) program management, and experience measurement frameworks.",
        humanEdge: "Operations experience that grounds strategy in what is actually deliverable.",
        skills: ["CX Journey Mapping", "VOC Program Design", "CX Measurement Frameworks"],
        resources: [
          {
            type: "free",
            title: "CX Learning Hub",
            platform: "CXPA",
            badge: "Free Member Resources",
            link: "https://www.cxpa.org/",
          },
          {
            type: "paid",
            title: "CCXP Certification",
            platform: "CXPA",
            badge: "Gold Standard ($395)",
            link: "https://www.cxpa.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Head of Customer Experience",
          x: 820,
          y: 440,
          pathD: "M 520 480 C 640 480, 720 440, 820 440",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["CX Governance", "NPS & CSAT Programs", "Cross-Functional CX Leadership"],
          humanEdge: "Customer advocacy that bridges operations and strategy.",
          resources: [],
        },
        {
          id: "l2",
          title: "Chief Experience Officer",
          x: 820,
          y: 520,
          pathD: "M 520 480 C 640 480, 720 520, 820 520",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: ["Experience-Led Growth", "CX Brand Integration", "Board CX Reporting"],
          humanEdge: "CX vision that makes customer trust a competitive moat.",
          resources: [],
        },
      ],
    },
    {
      id: "br_cxethics",
      name: "CX Quality & Ethics Lead",
      color: "#f72585",
      glowClass: "glow-magenta",
      curvePoints: "M 140 380 C 260 380, 320 620, 480 620",
      midX: 480,
      midY: 620,
      midTitle: "CX QUALITY ETHICS LEAD",
      midSkills: ["QA Frameworks: 96%", "Agent Ethics: 93%", "Conversation AI Audit: 91%"],
      foundation: {
        title: "CX Quality Assurance & AI Conversation Ethics",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Design AI conversation quality audit frameworks, agent ethics standards, and consumer protection protocols for AI-mediated customer interactions.",
        humanEdge: "Frontline experience of where scripts and AI responses fail real customers.",
        skills: ["QA Scorecard Design", "AI Conversation Audit", "Consumer Protection Standards"],
        resources: [
          {
            type: "free",
            title: "ISO 9001 QMS Fundamentals",
            platform: "ISO",
            badge: "Free Overview",
            link: "https://www.iso.org/",
          },
          {
            type: "paid",
            title: "Certified Customer Experience Professional",
            platform: "CXPA",
            badge: "Gold Standard ($395)",
            link: "https://www.cxpa.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "CX Compliance & Ethics Manager",
          x: 740,
          y: 590,
          pathD: "M 480 620 C 580 620, 640 590, 740 590",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: [
            "Regulatory Compliance CX",
            "AI Conversation Policy",
            "Vulnerable Customer Protocols",
          ],
          humanEdge: "Moral stewardship of customer interactions.",
          resources: [],
        },
        {
          id: "l2",
          title: "Head of CX Ethics & Assurance",
          x: 740,
          y: 650,
          pathD: "M 480 620 C 580 620, 640 650, 740 650",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: ["Consumer Rights Policy", "AI Bias in CX Audit", "Board Quality Reporting"],
          humanEdge: "Long-term customer trust as the ultimate quality standard.",
          resources: [],
        },
      ],
    },
  ],
  financial_analyst: [
    {
      id: "br_quantai",
      name: "Quant AI Modeler",
      color: "#00f2fe",
      glowClass: "glow-cyan",
      curvePoints: "M 140 380 C 260 380, 320 180, 480 180",
      midX: 480,
      midY: 180,
      midTitle: "QUANT AI MODELER",
      midSkills: ["Python Quant: 94%", "ML Finance: 91%", "Alt Data: 89%"],
      foundation: {
        title: "Quantitative Analysis & ML Finance Modeling",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Apply financial analysis skills to quantitative ML model development: factor models, risk attribution, and alternative data analysis using Python.",
        humanEdge:
          "Financial intuition that catches model overfitting to historical regimes that will not repeat.",
        skills: [
          "Python (pandas, numpy, sklearn)",
          "Quantitative Finance Fundamentals",
          "Backtesting Frameworks",
        ],
        resources: [
          {
            type: "free",
            title: "Quantitative Finance with Python",
            platform: "Coursera / NYU Stern",
            badge: "Free Audit",
            link: "https://www.coursera.org/",
          },
          {
            type: "paid",
            title: "CFA Level I (Foundation)",
            platform: "CFA Institute",
            badge: "Global Standard ($1,200)",
            link: "https://www.cfainstitute.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Quantitative Research Analyst",
          x: 740,
          y: 120,
          pathD: "M 480 180 C 580 180, 640 120, 740 120",
          stage: "Intermediate",
          duration: "Days 31–60",
          skills: ["Factor Investing Models", "Alt Data Pipelines", "Risk Attribution"],
          humanEdge: "Market intuition that validates or questions model signals.",
          resources: [],
        },
        {
          id: "l2",
          title: "Head of Quantitative Research",
          x: 740,
          y: 180,
          pathD: "M 480 180 L 740 180",
          stage: "Advanced",
          duration: "Days 61–90",
          skills: ["Alpha Strategy Development", "Portfolio Optimization", "Model Risk Management"],
          humanEdge: "Independent judgment on when quantitative signals lose predictive validity.",
          resources: [],
        },
        {
          id: "l3",
          title: "Chief Investment Officer (Quant)",
          x: 740,
          y: 240,
          pathD: "M 480 180 C 580 180, 640 240, 740 240",
          stage: "Leadership",
          duration: "Days 91–120+",
          skills: [
            "Systematic Investment Strategy",
            "Investment Committee Leadership",
            "Capital Allocation",
          ],
          humanEdge: "Conviction under uncertainty at capital-deployment scale.",
          resources: [],
        },
      ],
    },
    {
      id: "br_invtechana",
      name: "Investment Technology Analyst",
      color: "#b000ff",
      glowClass: "glow-purple",
      curvePoints: "M 140 380 C 260 380, 340 320, 520 320",
      midX: 520,
      midY: 320,
      midTitle: "INVESTMENT TECH ANALYST",
      midSkills: ["FinTech Valuation: 94%", "AI Company Analysis: 92%", "Tech Sector: 90%"],
      foundation: {
        title: "Technology Sector Investment Research",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Specialize in technology and AI company investment research: valuation frameworks for AI businesses, competitive moat analysis, and regulatory risk assessment for AI portfolios.",
        humanEdge:
          "Analyst judgment about management quality and technology credibility beyond the numbers.",
        skills: [
          "DCF for Tech Companies",
          "AI Business Model Analysis",
          "Competitive Moat Assessment",
        ],
        resources: [
          {
            type: "free",
            title: "Technology Sector Analysis",
            platform: "Investopedia / Seeking Alpha",
            badge: "Free Resources",
            link: "https://www.investopedia.com/",
          },
          {
            type: "paid",
            title: "CFA Level II with Tech Focus",
            platform: "CFA Institute",
            badge: "Advanced ($1,500)",
            link: "https://www.cfainstitute.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Senior Technology Equity Analyst",
          x: 820,
          y: 280,
          pathD: "M 520 320 C 640 320, 720 280, 820 280",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: [
            "Earnings Model Mastery",
            "Management Channel Checks",
            "Initiating Coverage Reports",
          ],
          humanEdge:
            "Analyst intuition about what conference call language reveals about management character.",
          resources: [],
        },
        {
          id: "l2",
          title: "Head of Technology Research",
          x: 820,
          y: 360,
          pathD: "M 520 320 C 640 320, 720 360, 820 360",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: ["Research Strategy", "Client Advisory", "Analyst Team Leadership"],
          humanEdge: "Research culture of intellectual honesty.",
          resources: [],
        },
      ],
    },
    {
      id: "br_portmgr",
      name: "Portfolio Manager",
      color: "#f59e0b",
      glowClass: "glow-amber",
      curvePoints: "M 140 380 C 260 380, 340 480, 520 480",
      midX: 520,
      midY: 480,
      midTitle: "PORTFOLIO MANAGER",
      midSkills: ["Portfolio Construction: 94%", "Risk Budgeting: 92%", "Client Advisory: 90%"],
      foundation: {
        title: "Portfolio Construction & Risk Management",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Build portfolio management capability: asset allocation, risk budgeting, factor exposure management, and client investment policy statement design.",
        humanEdge:
          "Behavioral finance understanding of how client psychology affects investment decisions.",
        skills: ["Asset Allocation Frameworks", "Risk Budgeting", "Performance Attribution"],
        resources: [
          {
            type: "free",
            title: "Portfolio Construction Masterclass",
            platform: "CFA Institute / YouTube",
            badge: "Free",
            link: "https://www.cfainstitute.org/",
          },
          {
            type: "paid",
            title: "CFA Charterholder",
            platform: "CFA Institute",
            badge: "Gold Standard ($3,000+)",
            link: "https://www.cfainstitute.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Portfolio Manager (Multi-Asset)",
          x: 820,
          y: 440,
          pathD: "M 520 480 C 640 480, 720 440, 820 440",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["Multi-Asset Allocation", "Tactical Overlay", "Client Reporting"],
          humanEdge: "Conviction in maintaining positions against behavioral pressure.",
          resources: [],
        },
        {
          id: "l2",
          title: "Chief Investment Officer",
          x: 820,
          y: 520,
          pathD: "M 520 480 C 640 480, 720 520, 820 520",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: ["Investment Committee Chair", "Capital Allocation", "Fiduciary Governance"],
          humanEdge: "Stewardship of client capital with full fiduciary accountability.",
          resources: [],
        },
      ],
    },
    {
      id: "br_systemicrisk",
      name: "Systemic Risk Officer",
      color: "#f72585",
      glowClass: "glow-magenta",
      curvePoints: "M 140 380 C 260 380, 320 620, 480 620",
      midX: 480,
      midY: 620,
      midTitle: "SYSTEMIC RISK OFFICER",
      midSkills: ["Macro Risk: 96%", "Stress Testing: 93%", "Regulatory Capital: 91%"],
      foundation: {
        title: "Systemic Risk, Stress Testing & Financial Regulation",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Develop systemic risk analysis skills: macro stress testing, contagion modeling, AI model risk governance, and Basel regulatory capital framework expertise.",
        humanEdge: "Institutional experience of how risks that seem contained become systemic.",
        skills: ["Stress Testing Frameworks", "Model Risk Management", "Basel III/IV Fundamentals"],
        resources: [
          {
            type: "free",
            title: "BIS Working Papers on Systemic Risk",
            platform: "Bank for International Settlements",
            badge: "Free Academic",
            link: "https://www.bis.org/",
          },
          {
            type: "paid",
            title: "FRM Certification",
            platform: "GARP",
            badge: "Gold Standard ($1,000)",
            link: "https://www.garp.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Model Risk & Validation Specialist",
          x: 740,
          y: 590,
          pathD: "M 480 620 C 580 620, 640 590, 740 590",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["Model Validation", "SR 11-7 Compliance", "AI Model Governance"],
          humanEdge:
            "Independent technical and ethical review of models with significant financial impact.",
          resources: [],
        },
        {
          id: "l2",
          title: "Chief Risk Officer",
          x: 740,
          y: 650,
          pathD: "M 480 620 C 580 620, 640 650, 740 650",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: ["Enterprise Risk Framework", "Board Risk Committee", "Regulatory Relations"],
          humanEdge:
            "Moral courage to constrain profit-seeking behavior at systemic risk boundaries.",
          resources: [],
        },
      ],
    },
  ],

  accountant: [
    {
      id: "br_aiaudit",
      name: "AI Audit Specialist",
      color: "#00f2fe",
      glowClass: "glow-cyan",
      curvePoints: "M 140 380 C 260 380, 320 180, 480 180",
      midX: 480,
      midY: 180,
      midTitle: "AI AUDIT SPECIALIST",
      midSkills: ["AI Audit Tools: 93%", "Data Analytics Audit: 91%", "Continuous Audit: 89%"],
      foundation: {
        title: "Data-Driven Auditing & AI Audit Tools",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Modernize audit practice with data analytics tools (IDEA, ACL/Galvanize), continuous monitoring, and AI-assisted risk assessment for 100% population testing.",
        humanEdge:
          "Professional skepticism and judgment about where AI audit tools produce false assurance.",
        skills: [
          "IDEA / ACL Data Analytics",
          "Continuous Monitoring Design",
          "Risk-Based Audit Approach",
        ],
        resources: [
          {
            type: "free",
            title: "AICPA: Analytics in Audit",
            platform: "AICPA",
            badge: "Free Member",
            link: "https://www.aicpa.org/",
          },
          {
            type: "paid",
            title: "CIA (Certified Internal Auditor)",
            platform: "IIA",
            badge: "Gold Standard ($1,000)",
            link: "https://www.theiia.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Data Analytics Audit Manager",
          x: 740,
          y: 120,
          pathD: "M 480 180 C 580 180, 640 120, 740 120",
          stage: "Intermediate",
          duration: "Days 31–60",
          skills: [
            "Population Testing",
            "Benford's Law Analysis",
            "Anomaly Detection in Transactions",
          ],
          humanEdge:
            "Auditor judgment about which anomalies indicate real risk vs statistical noise.",
          resources: [],
        },
        {
          id: "l2",
          title: "Head of AI-Augmented Audit",
          x: 740,
          y: 180,
          pathD: "M 480 180 L 740 180",
          stage: "Advanced",
          duration: "Days 61–90",
          skills: [
            "AI Audit Tool Selection",
            "Firm-Wide Analytics Strategy",
            "Quality Control for AI Audits",
          ],
          humanEdge: "Professional standards leadership in a rapidly changing audit landscape.",
          resources: [],
        },
        {
          id: "l3",
          title: "Partner / Audit Practice Leader",
          x: 740,
          y: 240,
          pathD: "M 480 180 C 580 180, 640 240, 740 240",
          stage: "Leadership",
          duration: "Days 91–120+",
          skills: [
            "Client Audit Relationship Leadership",
            "Regulatory Liaison",
            "Audit Innovation Strategy",
          ],
          humanEdge: "Independence, integrity, and public trust accountability.",
          resources: [],
        },
      ],
    },
    {
      id: "br_fintechconsult",
      name: "Finance Technology Consultant",
      color: "#b000ff",
      glowClass: "glow-purple",
      curvePoints: "M 140 380 C 260 380, 340 320, 520 320",
      midX: 520,
      midY: 320,
      midTitle: "FINANCE TECH CONSULTANT",
      midSkills: ["ERP Finance: 94%", "Finance Process Design: 92%", "Digital Finance: 89%"],
      foundation: {
        title: "ERP Finance & Digital Finance Transformation",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Build consulting capability in finance technology transformation: ERP implementation (SAP/Oracle Finance), digital close optimization, and finance process redesign.",
        humanEdge:
          "Accounting depth that prevents consulting recommendations unworkable in real finance teams.",
        skills: ["SAP S/4HANA Finance", "Finance Process Mapping", "Digital Close Optimization"],
        resources: [
          {
            type: "free",
            title: "SAP FinancialServicesCloud Learning",
            platform: "SAP Learning",
            badge: "Free Intro",
            link: "https://learning.sap.com/",
          },
          {
            type: "paid",
            title: "CGMA (Chartered Global Management Accountant)",
            platform: "AICPA-CIMA",
            badge: "Professional ($1,500)",
            link: "https://www.cgma.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Finance Transformation Manager",
          x: 820,
          y: 280,
          pathD: "M 520 320 C 640 320, 720 280, 820 280",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: [
            "Transformation Programme Management",
            "Finance Operating Model Design",
            "Change Readiness",
          ],
          humanEdge: "Credibility from lived accounting experience.",
          resources: [],
        },
        {
          id: "l2",
          title: "CFO Advisory Director",
          x: 820,
          y: 360,
          pathD: "M 520 320 C 640 320, 720 360, 820 360",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: ["CFO Agenda Advisory", "Finance Strategy", "Board Finance Reporting"],
          humanEdge: "Strategic finance partnership trusted by C-suite leaders.",
          resources: [],
        },
      ],
    },
    {
      id: "br_taxstrat",
      name: "Tax Strategy Advisor",
      color: "#f59e0b",
      glowClass: "glow-amber",
      curvePoints: "M 140 380 C 260 380, 340 480, 520 480",
      midX: 520,
      midY: 480,
      midTitle: "TAX STRATEGY ADVISOR",
      midSkills: ["International Tax: 94%", "Transfer Pricing: 92%", "M&A Tax: 90%"],
      foundation: {
        title: "Advanced Tax Strategy & International Tax",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Develop advanced tax strategy expertise: transfer pricing, international tax planning, OECD BEPS frameworks, and AI-assisted tax research.",
        humanEdge:
          "Commercial judgment about which tax planning structures survive scrutiny from both regulators and public opinion.",
        skills: ["Transfer Pricing Fundamentals", "OECD BEPS Framework", "AI Tax Research Tools"],
        resources: [
          {
            type: "free",
            title: "OECD BEPS Documentation",
            platform: "OECD",
            badge: "Free Official",
            link: "https://www.oecd.org/tax/beps/",
          },
          {
            type: "paid",
            title: "CTA (Chartered Tax Adviser)",
            platform: "CIOT / ATT",
            badge: "Professional Qual ($2,000+)",
            link: "https://www.tax.org.uk/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "International Tax Manager",
          x: 820,
          y: 440,
          pathD: "M 520 480 C 640 480, 720 440, 820 440",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["Cross-Border Structuring", "Tax Treaty Network", "Pillar Two Modeling"],
          humanEdge: "Commercial reality check on theoretical tax structures.",
          resources: [],
        },
        {
          id: "l2",
          title: "Head of Tax / Tax Director",
          x: 820,
          y: 520,
          pathD: "M 520 480 C 640 480, 720 520, 820 520",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: ["Group Tax Strategy", "Board Tax Governance", "M&A Tax Leadership"],
          humanEdge: "Tax ethics stewardship alongside legal optimization.",
          resources: [],
        },
      ],
    },
    {
      id: "br_cfoadv",
      name: "CFO Advisory & Finance Leadership",
      color: "#f72585",
      glowClass: "glow-magenta",
      curvePoints: "M 140 380 C 260 380, 320 620, 480 620",
      midX: 480,
      midY: 620,
      midTitle: "CFO ADVISORY LEAD",
      midSkills: ["CFO Agenda: 96%", "Finance Strategy: 93%", "Investor Relations: 91%"],
      foundation: {
        title: "Finance Leadership & CFO Advisory",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Build towards CFO advisory: FP&A excellence, investor relations skills, capital markets literacy, and business partnership with executive leadership.",
        humanEdge:
          "Credibility earned through technical accounting depth combined with commercial acumen.",
        skills: ["FP&A Leadership", "Investor Relations Fundamentals", "Business Partnering"],
        resources: [
          {
            type: "free",
            title: "CFO Programme Resources",
            platform: "ACCA CFO Centre",
            badge: "Free Member Resources",
            link: "https://www.accaglobal.com/",
          },
          {
            type: "paid",
            title: "CGMA Strategic Case Study",
            platform: "CIMA",
            badge: "Senior Qualification",
            link: "https://www.cimaglobal.com/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Finance Business Partner / VP Finance",
          x: 740,
          y: 590,
          pathD: "M 480 620 C 580 620, 640 590, 740 590",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["Commercial Finance", "Performance Management", "Investor Reporting"],
          humanEdge: "Cross-functional credibility that positions finance as a growth partner.",
          resources: [],
        },
        {
          id: "l2",
          title: "CFO / Group Finance Director",
          x: 740,
          y: 650,
          pathD: "M 480 620 C 580 620, 640 650, 740 650",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: ["Capital Structure", "Board Finance Leadership", "M&A Finance Strategy"],
          humanEdge: "Financial integrity and courage at board governance level.",
          resources: [],
        },
      ],
    },
  ],
  medical_records: [
    {
      id: "br_healthdata",
      name: "Health Data Specialist",
      color: "#00f2fe",
      glowClass: "glow-cyan",
      curvePoints: "M 140 380 C 260 380, 320 180, 480 180",
      midX: 480,
      midY: 180,
      midTitle: "HEALTH DATA SPECIALIST",
      midSkills: ["Healthcare Analytics: 93%", "FHIR/HL7: 91%", "Clinical NLP: 88%"],
      foundation: {
        title: "Health Informatics & Clinical Data Standards",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Build health informatics capability: FHIR/HL7 standards, clinical coding (ICD-10, SNOMED CT), healthcare data warehousing, and HIPAA/GDPR compliance for health data.",
        humanEdge:
          "Understanding of clinical workflows that ensures data standards work in real care settings.",
        skills: [
          "FHIR / HL7 Standards",
          "ICD-10 / SNOMED CT Clinical Coding",
          "HIPAA Compliance & De-identification",
        ],
        resources: [
          {
            type: "free",
            title: "HL7 FHIR Learning",
            platform: "HL7 International",
            badge: "Free Official Docs",
            link: "https://www.hl7.org/fhir/",
          },
          {
            type: "paid",
            title: "RHIA (Registered Health Information Administrator)",
            platform: "AHIMA",
            badge: "Gold Standard ($400)",
            link: "https://www.ahima.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Clinical Data Analyst",
          x: 740,
          y: 120,
          pathD: "M 480 180 C 580 180, 640 120, 740 120",
          stage: "Intermediate",
          duration: "Days 31–60",
          skills: [
            "Clinical Data Quality",
            "EHR Analytics (Epic/Cerner)",
            "Population Health Dashboards",
          ],
          humanEdge:
            "Clinical context that distinguishes data errors from genuine clinical patterns.",
          resources: [],
        },
        {
          id: "l2",
          title: "Health Analytics Manager",
          x: 740,
          y: 180,
          pathD: "M 480 180 L 740 180",
          stage: "Advanced",
          duration: "Days 61–90",
          skills: [
            "Value-Based Care Analytics",
            "Quality Measure Reporting (HEDIS)",
            "AI Clinical Decision Support",
          ],
          humanEdge:
            "Advocacy for patients whose conditions may be underrepresented in training data.",
          resources: [],
        },
        {
          id: "l3",
          title: "Chief Health Information Officer",
          x: 740,
          y: 240,
          pathD: "M 480 180 C 580 180, 640 240, 740 240",
          stage: "Leadership",
          duration: "Days 91–120+",
          skills: ["Health Data Strategy", "Interoperability Leadership", "Health IT Governance"],
          humanEdge:
            "Stewardship of health data as a patient trust asset, not just an organizational resource.",
          resources: [],
        },
      ],
    },
    {
      id: "br_clinicaldq",
      name: "Clinical Data Quality Lead",
      color: "#b000ff",
      glowClass: "glow-purple",
      curvePoints: "M 140 380 C 260 380, 340 320, 520 320",
      midX: 520,
      midY: 320,
      midTitle: "CLINICAL DATA QUALITY LEAD",
      midSkills: ["Data Quality Frameworks: 93%", "Clinical Audit: 91%", "EHR Optimization: 89%"],
      foundation: {
        title: "Clinical Documentation Quality & EHR Optimization",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Specialize in clinical documentation improvement: CDI program management, physician query resolution, DRG optimization, and AI-assisted coding quality review.",
        humanEdge:
          "Medical records expertise that catches AI coding errors with real clinical consequence.",
        skills: [
          "CDI Program Management",
          "Physician Query Writing",
          "DRG / Case Mix Optimization",
        ],
        resources: [
          {
            type: "free",
            title: "AHIMA CDI Resources",
            platform: "AHIMA",
            badge: "Free Member Resources",
            link: "https://www.ahima.org/",
          },
          {
            type: "paid",
            title: "CDIP (Certified Documentation Improvement Practitioner)",
            platform: "AHIMA",
            badge: "CDI Standard ($300)",
            link: "https://www.ahima.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Clinical Documentation Improvement Manager",
          x: 820,
          y: 280,
          pathD: "M 520 320 C 640 320, 720 280, 820 280",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["CDI Team Leadership", "Physician Education", "AI Coding Audit"],
          humanEdge: "Clinical credibility needed to challenge physician documentation practices.",
          resources: [],
        },
        {
          id: "l2",
          title: "Director of Health Information Management",
          x: 820,
          y: 360,
          pathD: "M 520 320 C 640 320, 720 360, 820 360",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: [
            "HIM Department Strategy",
            "Revenue Cycle Integration",
            "Accreditation Compliance",
          ],
          humanEdge:
            "Organizational authority to align clinical, financial and compliance data goals.",
          resources: [],
        },
      ],
    },
    {
      id: "br_healthit",
      name: "Health IT Manager",
      color: "#f59e0b",
      glowClass: "glow-amber",
      curvePoints: "M 140 380 C 260 380, 340 480, 520 480",
      midX: 520,
      midY: 480,
      midTitle: "HEALTH IT MANAGER",
      midSkills: [
        "EHR Implementation: 93%",
        "Healthcare Interoperability: 91%",
        "Health IT Project Mgmt: 89%",
      ],
      foundation: {
        title: "EHR Implementation & Healthcare Interoperability",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Build health IT project management skills: EHR go-live management, HL7 interface design, clinical workflow analysis, and healthcare data migration.",
        humanEdge:
          "Clinical workflow empathy that prevents IT implementations that harm care quality.",
        skills: [
          "EHR Go-Live Project Management",
          "HL7 Interface Design",
          "Clinical Workflow Analysis",
        ],
        resources: [
          {
            type: "free",
            title: "Epic UserWeb Learning",
            platform: "Epic Systems",
            badge: "Partner Access",
            link: "https://www.epic.com/",
          },
          {
            type: "paid",
            title: "PMP with Healthcare Focus",
            platform: "PMI",
            badge: "Professional ($555)",
            link: "https://www.pmi.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Health IT Project Director",
          x: 820,
          y: 440,
          pathD: "M 520 480 C 640 480, 720 440, 820 440",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: [
            "Multi-Site EHR Rollout",
            "Healthcare Vendor Management",
            "Clinical Change Management",
          ],
          humanEdge: "Balanced advocacy for clinical staff impacted by IT change.",
          resources: [],
        },
        {
          id: "l2",
          title: "Chief Digital Health Officer",
          x: 820,
          y: 520,
          pathD: "M 520 480 C 640 480, 720 520, 820 520",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: [
            "Digital Health Strategy",
            "AI Clinical Integration",
            "Telehealth Platform Leadership",
          ],
          humanEdge:
            "Patient-centered digital transformation that preserves the care relationship.",
          resources: [],
        },
      ],
    },
    {
      id: "br_medethics",
      name: "Medical Data Ethics Officer",
      color: "#f72585",
      glowClass: "glow-magenta",
      curvePoints: "M 140 380 C 260 380, 320 620, 480 620",
      midX: 480,
      midY: 620,
      midTitle: "MEDICAL ETHICS OFFICER",
      midSkills: ["Health AI Ethics: 96%", "Patient Rights: 93%", "IRB Governance: 91%"],
      foundation: {
        title: "Health Data Ethics, AI Governance & Patient Rights",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Develop health data ethics expertise: AI bias in clinical algorithms, patient consent frameworks, IRB governance, algorithmic fairness in healthcare, and GDPR/HIPAA intersection.",
        humanEdge:
          "Patient advocate perspective that holds AI clinical tools to human rights standards.",
        skills: [
          "Health AI Bias Assessment",
          "Patient Consent Frameworks",
          "IRB / Ethics Review Processes",
        ],
        resources: [
          {
            type: "free",
            title: "WHO AI Health Ethics Guidelines",
            platform: "World Health Organization",
            badge: "Free Official",
            link: "https://www.who.int/",
          },
          {
            type: "paid",
            title: "Bioethics Certification",
            platform: "Johns Hopkins / Coursera",
            badge: "Professional ($600)",
            link: "https://www.coursera.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "AI Ethics Review Specialist (Health)",
          x: 740,
          y: 590,
          pathD: "M 480 620 C 580 620, 640 590, 740 590",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: [
            "Clinical Algorithm Audit",
            "Algorithmic Fairness Assessment",
            "Patient Advocacy in AI Design",
          ],
          humanEdge:
            "Moral courage to halt AI clinical tools that show disparate harm to specific populations.",
          resources: [],
        },
        {
          id: "l2",
          title: "Chief Health Ethics Officer",
          x: 740,
          y: 650,
          pathD: "M 480 620 C 580 620, 640 650, 740 650",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: [
            "Health Ethics Policy",
            "Board-Level Ethics Governance",
            "Public Health AI Standards",
          ],
          humanEdge:
            "Institutional authority to embed patient rights into AI-driven care delivery.",
          resources: [],
        },
      ],
    },
  ],

  insurance_claims: [
    {
      id: "br_insurtechclaims",
      name: "Insurtech Claims Analyst",
      color: "#00f2fe",
      glowClass: "glow-cyan",
      curvePoints: "M 140 380 C 260 380, 320 180, 480 180",
      midX: 480,
      midY: 180,
      midTitle: "INSURTECH CLAIMS ANALYST",
      midSkills: ["AI Claims Processing: 93%", "Fraud Analytics: 91%", "Insurance Data: 88%"],
      foundation: {
        title: "AI-Augmented Claims Processing & Fraud Detection",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Modernize claims expertise with AI tools: automated claims triage, fraud pattern detection using ML, computer vision for property damage assessment, and claims analytics dashboards.",
        humanEdge:
          "Claims judgment that overrides AI decisions in ambiguous coverage interpretation cases.",
        skills: [
          "AI Claims Triage Tools",
          "Fraud Detection Fundamentals",
          "Computer Vision Damage Assessment",
        ],
        resources: [
          {
            type: "free",
            title: "Insurance Data Science Resources",
            platform: "Insurance Information Institute",
            badge: "Free Industry",
            link: "https://www.iii.org/",
          },
          {
            type: "paid",
            title: "AINS (Associate in Insurance)",
            platform: "The Institutes",
            badge: "Industry Standard ($400)",
            link: "https://www.theinstitutes.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Claims Analytics Manager",
          x: 740,
          y: 120,
          pathD: "M 480 180 C 580 180, 640 120, 740 120",
          stage: "Intermediate",
          duration: "Days 31–60",
          skills: ["Claims KPI Dashboards", "Leakage Analytics", "SIU Integration"],
          humanEdge: "Claims experience that contextualizes statistical fraud signals.",
          resources: [],
        },
        {
          id: "l2",
          title: "Director of Claims Innovation",
          x: 740,
          y: 180,
          pathD: "M 480 180 L 740 180",
          stage: "Advanced",
          duration: "Days 61–90",
          skills: [
            "InsurTech Vendor Evaluation",
            "Straight-Through Processing Design",
            "Claims Automation Strategy",
          ],
          humanEdge: "Balanced innovation that keeps human review for complex claims.",
          resources: [],
        },
        {
          id: "l3",
          title: "Chief Claims Officer",
          x: 740,
          y: 240,
          pathD: "M 480 180 C 580 180, 640 240, 740 240",
          stage: "Leadership",
          duration: "Days 91–120+",
          skills: ["Claims Strategy", "P&L Accountability for Claims", "Regulatory Relations"],
          humanEdge: "Customer fairness leadership at enterprise claims decision scale.",
          resources: [],
        },
      ],
    },
    {
      id: "br_airiskassess",
      name: "AI Risk Assessor",
      color: "#b000ff",
      glowClass: "glow-purple",
      curvePoints: "M 140 380 C 260 380, 340 320, 520 320",
      midX: 520,
      midY: 320,
      midTitle: "AI RISK ASSESSOR",
      midSkills: [
        "Actuarial AI Tools: 93%",
        "Predictive Risk Modeling: 91%",
        "Underwriting Analytics: 89%",
      ],
      foundation: {
        title: "Predictive Risk Modeling & AI Underwriting",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Build predictive risk assessment skills: telematics data analysis, IoT risk signal integration, ML-assisted underwriting, and pricing model validation.",
        humanEdge:
          "Insurance domain expertise that prevents ML risk models from encoding discriminatory proxies.",
        skills: [
          "Telematics & IoT Risk Signals",
          "ML Underwriting Models",
          "Pricing Actuarial Fundamentals",
        ],
        resources: [
          {
            type: "free",
            title: "CAS (Casualty Actuarial Society) Resources",
            platform: "CAS",
            badge: "Free Student Resources",
            link: "https://www.casact.org/",
          },
          {
            type: "paid",
            title: "CPCU (Chartered Property Casualty Underwriter)",
            platform: "The Institutes",
            badge: "Gold Standard ($1,500)",
            link: "https://www.theinstitutes.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Underwriting Analytics Specialist",
          x: 820,
          y: 280,
          pathD: "M 520 320 C 640 320, 720 280, 820 280",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["Risk Segmentation", "Alternative Data Underwriting", "Portfolio Risk Analysis"],
          humanEdge:
            "Fair underwriting judgment that identifies when data correlates with protected class.",
          resources: [],
        },
        {
          id: "l2",
          title: "Head of AI Underwriting",
          x: 820,
          y: 360,
          pathD: "M 520 320 C 640 320, 720 360, 820 360",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: [
            "AI Underwriting Strategy",
            "Regulatory Model Validation",
            "Underwriting Governance",
          ],
          humanEdge:
            "Responsible AI leadership in pricing decisions that affect access to coverage.",
          resources: [],
        },
      ],
    },
    {
      id: "br_insurinno",
      name: "Insurance Innovation Lead",
      color: "#f59e0b",
      glowClass: "glow-amber",
      curvePoints: "M 140 380 C 260 380, 340 480, 520 480",
      midX: 520,
      midY: 480,
      midTitle: "INSURANCE INNOVATION LEAD",
      midSkills: ["InsurTech Strategy: 93%", "Embedded Insurance: 91%", "Product Innovation: 89%"],
      foundation: {
        title: "InsurTech Product Innovation & Embedded Insurance",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Develop insurance product innovation skills: parametric insurance design, embedded insurance distribution, usage-based product development, and InsurTech partnership models.",
        humanEdge:
          "Claims experience that ensures innovative products pay when customers genuinely need them.",
        skills: [
          "Parametric Insurance Design",
          "Embedded Distribution Channels",
          "Usage-Based Product Development",
        ],
        resources: [
          {
            type: "free",
            title: "InsurTech Insights Blog",
            platform: "InsurTech Insights",
            badge: "Free Industry",
            link: "https://insurtechinsights.com/",
          },
          {
            type: "paid",
            title: "Innovation Management Certification",
            platform: "IDEO/Coursera",
            badge: "Innovation Skill ($300)",
            link: "https://www.coursera.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Product Manager (Insurance)",
          x: 820,
          y: 440,
          pathD: "M 520 480 C 640 480, 720 440, 820 440",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: [
            "Insurance Product Design",
            "Digital Distribution",
            "Customer Journey for Insurance",
          ],
          humanEdge:
            "Customer empathy that designs products people understand when they need to claim.",
          resources: [],
        },
        {
          id: "l2",
          title: "Chief Innovation Officer (Insurance)",
          x: 820,
          y: 520,
          pathD: "M 520 480 C 640 480, 720 520, 820 520",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: [
            "InsurTech Ecosystem Strategy",
            "Corporate Venture Partnerships",
            "Innovation Culture Leadership",
          ],
          humanEdge:
            "Insurance purpose leadership that innovation serves customer protection, not premium avoidance.",
          resources: [],
        },
      ],
    },
    {
      id: "br_insurethics",
      name: "Insurance AI Ethics Advisor",
      color: "#f72585",
      glowClass: "glow-magenta",
      curvePoints: "M 140 380 C 260 380, 320 620, 480 620",
      midX: 480,
      midY: 620,
      midTitle: "INSURANCE AI ETHICS ADVISOR",
      midSkills: [
        "Insurance Regulation: 96%",
        "Algorithmic Fairness: 93%",
        "Consumer Advocacy: 91%",
      ],
      foundation: {
        title: "Insurance Regulation, AI Fairness & Consumer Protection",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Build insurance AI ethics expertise: algorithmic pricing fairness analysis, state insurance regulation compliance, consumer rights in automated underwriting, and NAIC AI governance frameworks.",
        humanEdge: "Claims experience of how denial decisions affect real people.",
        skills: [
          "NAIC AI Governance Framework",
          "Algorithmic Pricing Fairness",
          "State Insurance Regulation",
        ],
        resources: [
          {
            type: "free",
            title: "NAIC Innovation, Cybersecurity & Technology",
            platform: "NAIC",
            badge: "Free Official",
            link: "https://content.naic.org/",
          },
          {
            type: "paid",
            title: "CIPP/US (Privacy Law)",
            platform: "IAPP",
            badge: "Regulatory ($550)",
            link: "https://iapp.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Regulatory Affairs Specialist (Insurance)",
          x: 740,
          y: 590,
          pathD: "M 480 620 C 580 620, 640 590, 740 590",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["AI Model Filing & Approval", "Rate Equity Analysis", "Regulatory Exam Support"],
          humanEdge: "Actuary-level technical depth combined with consumer protection perspective.",
          resources: [],
        },
        {
          id: "l2",
          title: "Chief Compliance & Ethics Officer (Insurance)",
          x: 740,
          y: 650,
          pathD: "M 480 620 C 580 620, 640 650, 740 650",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: [
            "Enterprise AI Governance",
            "Board Ethics Committee",
            "Multi-State Regulatory Strategy",
          ],
          humanEdge:
            "Institutional voice ensuring AI systems treat every policyholder with equal dignity.",
          resources: [],
        },
      ],
    },
  ],
  journalist_writer: [
    {
      id: "br_aicontentops",
      name: "AI Content Operations Lead",
      color: "#00f2fe",
      glowClass: "glow-cyan",
      curvePoints: "M 140 380 C 260 380, 320 180, 480 180",
      midX: 480,
      midY: 180,
      midTitle: "AI CONTENT OPS LEAD",
      midSkills: ["AI Editorial Tools: 93%", "Content Automation: 91%", "SEO Intelligence: 88%"],
      foundation: {
        title: "AI-Augmented Content Production & Editorial Tools",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Modernize content workflows with AI: AI-assisted research tools, automated content briefs, structured journalism templates, fact-checking workflows, and CMS automation.",
        humanEdge:
          "Editorial judgment that distinguishes AI-generated plausibility from verified fact.",
        skills: [
          "AI Research & Briefing Tools",
          "Automated Content Pipelines",
          "Fact-Check Workflow Design",
        ],
        resources: [
          {
            type: "free",
            title: "Reuters Institute Digital News Report",
            platform: "Reuters Institute",
            badge: "Free Research",
            link: "https://reutersinstitute.politics.ox.ac.uk/",
          },
          {
            type: "paid",
            title: "Google News Initiative Training",
            platform: "Google",
            badge: "Free Professional",
            link: "https://newsinitiative.withgoogle.com/training/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Managing Editor (Digital)",
          x: 740,
          y: 120,
          pathD: "M 480 180 C 580 180, 640 120, 740 120",
          stage: "Intermediate",
          duration: "Days 31–60",
          skills: [
            "Editorial Calendar Management",
            "AI Tool Governance for Newsrooms",
            "Audience Analytics",
          ],
          humanEdge: "Editorial responsibility for accuracy that AI cannot take.",
          resources: [],
        },
        {
          id: "l2",
          title: "Director of Content Operations",
          x: 740,
          y: 180,
          pathD: "M 480 180 L 740 180",
          stage: "Advanced",
          duration: "Days 61–90",
          skills: [
            "Cross-Platform Content Strategy",
            "Newsroom Automation Design",
            "Contributor Network Management",
          ],
          humanEdge:
            "Newsroom culture of verification that does not erode under production pressure.",
          resources: [],
        },
        {
          id: "l3",
          title: "Chief Content Officer",
          x: 740,
          y: 240,
          pathD: "M 480 180 C 580 180, 640 240, 740 240",
          stage: "Leadership",
          duration: "Days 91–120+",
          skills: [
            "Content P&L Leadership",
            "Editorial Brand Strategy",
            "AI Governance for Content",
          ],
          humanEdge: "Institutional commitment to information integrity as audience trust.",
          resources: [],
        },
      ],
    },
    {
      id: "br_editorialai",
      name: "Editorial AI Lead",
      color: "#b000ff",
      glowClass: "glow-purple",
      curvePoints: "M 140 380 C 260 380, 340 320, 520 320",
      midX: 520,
      midY: 320,
      midTitle: "EDITORIAL AI LEAD",
      midSkills: [
        "Investigative Data Journalism: 94%",
        "OSINT: 91%",
        "Narrative Intelligence: 89%",
      ],
      foundation: {
        title: "Data Journalism, OSINT & Investigative Research",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Build data journalism capability: OSINT techniques, document analysis with AI tools, geospatial journalism, financial document investigation, and public records research.",
        humanEdge: "Source protection ethics and public interest judgment that AI cannot exercise.",
        skills: [
          "OSINT Fundamentals",
          "Data Journalism with Python/R",
          "Document Intelligence Tools",
        ],
        resources: [
          {
            type: "free",
            title: "GIJN (Global Investigative Journalism Network)",
            platform: "GIJN",
            badge: "Free Professional Network",
            link: "https://gijn.org/",
          },
          {
            type: "paid",
            title: "IRE (Investigative Reporters & Editors) Training",
            platform: "IRE",
            badge: "Industry Standard ($200)",
            link: "https://www.ire.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Investigative Data Journalist",
          x: 820,
          y: 280,
          pathD: "M 520 320 C 640 320, 720 280, 820 280",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: [
            "Advanced OSINT",
            "Financial Document Analysis",
            "Interactive Data Visualization",
          ],
          humanEdge: "Courage and ethics in source handling and story publication decisions.",
          resources: [],
        },
        {
          id: "l2",
          title: "Head of Investigative Unit",
          x: 820,
          y: 360,
          pathD: "M 520 320 C 640 320, 720 360, 820 360",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: [
            "Investigative Unit Leadership",
            "Legal Review Collaboration",
            "Press Freedom Advocacy",
          ],
          humanEdge: "Editorial courage to publish in the face of pressure.",
          resources: [],
        },
      ],
    },
    {
      id: "br_contstrat",
      name: "Content Strategy Director",
      color: "#f59e0b",
      glowClass: "glow-amber",
      curvePoints: "M 140 380 C 260 380, 340 480, 520 480",
      midX: 520,
      midY: 480,
      midTitle: "CONTENT STRATEGY DIRECTOR",
      midSkills: ["Audience Strategy: 93%", "Content Monetization: 91%", "Brand Journalism: 89%"],
      foundation: {
        title: "Content Strategy, Audience Development & Monetization",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Develop content strategy skills: audience segmentation, subscription revenue models, newsletter strategy, branded content design, and content performance analytics.",
        humanEdge:
          "Journalistic voice that maintains editorial credibility within commercial content models.",
        skills: [
          "Audience Segmentation & Personas",
          "Subscription Revenue Models",
          "Content Performance Analytics",
        ],
        resources: [
          {
            type: "free",
            title: "Nieman Lab Strategy Coverage",
            platform: "Nieman Foundation",
            badge: "Free Research",
            link: "https://www.niemanlab.org/",
          },
          {
            type: "paid",
            title: "Content Marketing Certification",
            platform: "HubSpot Academy",
            badge: "Free Cert",
            link: "https://academy.hubspot.com/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "VP of Audience & Revenue",
          x: 820,
          y: 440,
          pathD: "M 520 480 C 640 480, 720 440, 820 440",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: [
            "Subscription Growth Strategy",
            "Newsletter Monetization",
            "B2B Content Licensing",
          ],
          humanEdge: "Balance of commercial viability with editorial mission.",
          resources: [],
        },
        {
          id: "l2",
          title: "Publisher / Chief Strategy Officer",
          x: 820,
          y: 520,
          pathD: "M 520 480 C 640 480, 720 520, 820 520",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: [
            "Media Business Model Innovation",
            "Platform Partnership Strategy",
            "Board-Level Strategy",
          ],
          humanEdge: "Stewardship of press freedom as a business value, not just an editorial one.",
          resources: [],
        },
      ],
    },
    {
      id: "br_mediaethics",
      name: "Media Ethics Lead",
      color: "#f72585",
      glowClass: "glow-magenta",
      curvePoints: "M 140 380 C 260 380, 320 620, 480 620",
      midX: 480,
      midY: 620,
      midTitle: "MEDIA ETHICS LEAD",
      midSkills: ["AI Media Ethics: 96%", "Disinformation Research: 93%", "Press Law: 91%"],
      foundation: {
        title: "AI Media Ethics, Disinformation & Press Freedom",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Build media ethics expertise: AI-generated content disclosure standards, deepfake detection, disinformation research methods, press law fundamentals, and editorial ethics frameworks.",
        humanEdge:
          "Journalist experience of real-world source relationships and information verification.",
        skills: [
          "AI Content Disclosure Standards",
          "Deepfake Detection Tools",
          "Disinformation Research Methods",
        ],
        resources: [
          {
            type: "free",
            title: "First Draft: Information Disorder",
            platform: "First Draft",
            badge: "Free Research",
            link: "https://firstdraftnews.org/",
          },
          {
            type: "paid",
            title: "Media Law & Ethics (LLM module)",
            platform: "Various Law Schools",
            badge: "Academic ($2,000+)",
            link: "https://www.coursera.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Fact-Check & Verification Lead",
          x: 740,
          y: 590,
          pathD: "M 480 620 C 580 620, 640 590, 740 590",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: [
            "Structured Fact-Checking (IFCN)",
            "Verification Tool Suite",
            "Cross-Newsroom Collaboration",
          ],
          humanEdge:
            "Commitment to truth that resists algorithmic pressure toward engagement over accuracy.",
          resources: [],
        },
        {
          id: "l2",
          title: "Chief Ethics Officer (Media)",
          x: 740,
          y: 650,
          pathD: "M 480 620 C 580 620, 640 650, 740 650",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: [
            "Editorial Ethics Policy",
            "Industry Standards Leadership",
            "AI Governance for Newsrooms",
          ],
          humanEdge:
            "Institutional accountability for information integrity in the public interest.",
          resources: [],
        },
      ],
    },
  ],

  teacher_trainer: [
    {
      id: "br_edtechfac",
      name: "EdTech Facilitator",
      color: "#00f2fe",
      glowClass: "glow-cyan",
      curvePoints: "M 140 380 C 260 380, 320 180, 480 180",
      midX: 480,
      midY: 180,
      midTitle: "EDTECH FACILITATOR",
      midSkills: ["LMS Platforms: 93%", "AI Tutoring Tools: 91%", "Learning Design: 88%"],
      foundation: {
        title: "EdTech Tools & AI-Augmented Learning Design",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Modernize teaching with EdTech: LMS platforms (Canvas, Moodle), AI tutoring tools, adaptive learning design, accessibility standards (WCAG), and learning analytics.",
        humanEdge:
          "Pedagogical judgment about when AI tutoring replaces vs. reduces student learning depth.",
        skills: [
          "LMS Administration (Canvas/Moodle)",
          "AI Tutoring Tool Integration",
          "Learning Analytics Dashboards",
        ],
        resources: [
          {
            type: "free",
            title: "Google for Education Certification",
            platform: "Google",
            badge: "Free Professional",
            link: "https://edu.google.com/intl/ALL_au/products/teacher-center/",
          },
          {
            type: "paid",
            title: "eLearning Instructional Design Certificate",
            platform: "ATD",
            badge: "Professional ($800)",
            link: "https://www.td.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "EdTech Integration Specialist",
          x: 740,
          y: 120,
          pathD: "M 480 180 C 580 180, 640 120, 740 120",
          stage: "Intermediate",
          duration: "Days 31–60",
          skills: [
            "School-Wide EdTech Rollout",
            "Teacher Training Facilitation",
            "Digital Resource Curation",
          ],
          humanEdge:
            "Teacher empathy that identifies when technology creates extra burden rather than relief.",
          resources: [],
        },
        {
          id: "l2",
          title: "Head of Learning Technology",
          x: 740,
          y: 180,
          pathD: "M 480 180 L 740 180",
          stage: "Advanced",
          duration: "Days 61–90",
          skills: ["EdTech Strategy", "Vendor Evaluation", "Learning Data Governance"],
          humanEdge: "Student-centered technology selection criteria.",
          resources: [],
        },
        {
          id: "l3",
          title: "Chief Learning Technology Officer",
          x: 740,
          y: 240,
          pathD: "M 480 180 C 580 180, 640 240, 740 240",
          stage: "Leadership",
          duration: "Days 91–120+",
          skills: [
            "Digital Learning Ecosystem",
            "AI in Education Governance",
            "Board Education Strategy",
          ],
          humanEdge: "Long-term commitment to learning quality over technological novelty.",
          resources: [],
        },
      ],
    },
    {
      id: "br_perslrn",
      name: "Personalised Learning Designer",
      color: "#b000ff",
      glowClass: "glow-purple",
      curvePoints: "M 140 380 C 260 380, 340 320, 520 320",
      midX: 520,
      midY: 320,
      midTitle: "PERSONALISED LEARNING DESIGNER",
      midSkills: ["Adaptive Learning: 94%", "Curriculum Design: 92%", "Learner Analytics: 89%"],
      foundation: {
        title: "Adaptive Learning Design & Curriculum Innovation",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Build personalized learning design capability: competency-based curriculum design, adaptive learning platforms (Knewton, DreamBox), learning experience design (LXD), and formative assessment strategies.",
        humanEdge:
          "Teacher insight about individual student motivation, not just performance data.",
        skills: [
          "Competency-Based Curriculum Design",
          "Learning Experience Design (LXD)",
          "Adaptive Platform Configuration",
        ],
        resources: [
          {
            type: "free",
            title: "Coursera Learning Design Specialization",
            platform: "Coursera",
            badge: "Audit Free",
            link: "https://www.coursera.org/",
          },
          {
            type: "paid",
            title: "ATD Master Instructional Designer",
            platform: "ATD",
            badge: "Gold Standard ($1,500)",
            link: "https://www.td.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Curriculum Innovation Lead",
          x: 820,
          y: 280,
          pathD: "M 520 320 C 640 320, 720 280, 820 280",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: [
            "Subject-Matter Expert Collaboration",
            "Assessment Innovation",
            "Skills-Based Learning Frameworks",
          ],
          humanEdge:
            "Awareness of equity gaps that personalized learning can amplify without correction.",
          resources: [],
        },
        {
          id: "l2",
          title: "Head of Curriculum & Learning Design",
          x: 820,
          y: 360,
          pathD: "M 520 320 C 640 320, 720 360, 820 360",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: [
            "Institutional Curriculum Strategy",
            "Learning Outcomes Governance",
            "Teacher Professional Development",
          ],
          humanEdge: "Commitment to educational equity across diverse learning contexts.",
          resources: [],
        },
      ],
    },
    {
      id: "br_educinno",
      name: "Education Innovation Lead",
      color: "#f59e0b",
      glowClass: "glow-amber",
      curvePoints: "M 140 380 C 260 380, 340 480, 520 480",
      midX: 520,
      midY: 480,
      midTitle: "EDUCATION INNOVATION LEAD",
      midSkills: ["EdTech Entrepreneurship: 93%", "Learning Science: 91%", "Program Design: 89%"],
      foundation: {
        title: "Education Innovation, EdTech Product & Program Design",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Develop education innovation skills: EdTech product design, learning science application, program impact evaluation, and education-industry partnership development.",
        humanEdge:
          "Teaching experience that grounds innovation in real classroom and learner realities.",
        skills: [
          "EdTech Product Design Thinking",
          "Learning Science (Cognitive Load, Spaced Practice)",
          "Impact Evaluation Frameworks",
        ],
        resources: [
          {
            type: "free",
            title: "MIT OpenCourseWare: Education Innovation",
            platform: "MIT OCW",
            badge: "Free Academic",
            link: "https://ocw.mit.edu/",
          },
          {
            type: "paid",
            title: "Education Leadership (Ed.D.)",
            platform: "Various Universities",
            badge: "Advanced ($15,000+)",
            link: "https://www.coursera.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Education Program Director",
          x: 820,
          y: 440,
          pathD: "M 520 480 C 640 480, 720 440, 820 440",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: [
            "Program Portfolio Management",
            "Grant Management",
            "Education Partnership Development",
          ],
          humanEdge:
            "Systems thinking about how innovation affects the full teacher and student experience.",
          resources: [],
        },
        {
          id: "l2",
          title: "Chief Academic Officer",
          x: 820,
          y: 520,
          pathD: "M 520 480 C 640 480, 720 520, 820 520",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: [
            "Academic Strategy",
            "Institution-Wide Learning Culture",
            "AI in Education Policy",
          ],
          humanEdge:
            "Moral commitment to equitable learning outcomes regardless of student background.",
          resources: [],
        },
      ],
    },
    {
      id: "br_edtechethics",
      name: "EdTech Ethics Officer",
      color: "#f72585",
      glowClass: "glow-magenta",
      curvePoints: "M 140 380 C 260 380, 320 620, 480 620",
      midX: 480,
      midY: 620,
      midTitle: "EDTECH ETHICS OFFICER",
      midSkills: ["Student Data Privacy: 96%", "AI Bias in Education: 93%", "Digital Equity: 91%"],
      foundation: {
        title: "EdTech Ethics, Student Data Privacy & Digital Equity",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Build EdTech ethics expertise: student data privacy (COPPA, FERPA), AI algorithmic bias in education assessment, surveillance technology in classrooms, and digital equity advocacy.",
        humanEdge:
          "Teacher experience of how children respond to surveillance and data collection.",
        skills: [
          "FERPA / COPPA Compliance",
          "Algorithmic Fairness in Education AI",
          "Digital Equity Assessment",
        ],
        resources: [
          {
            type: "free",
            title: "Future of Privacy Forum: Student Privacy",
            platform: "FPF",
            badge: "Free Research",
            link: "https://fpf.org/",
          },
          {
            type: "paid",
            title: "CIPP/US (Student Privacy Focus)",
            platform: "IAPP",
            badge: "Regulatory ($550)",
            link: "https://iapp.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Student Data Privacy Officer",
          x: 740,
          y: 590,
          pathD: "M 480 620 C 580 620, 640 590, 740 590",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: [
            "Privacy Impact Assessments for EdTech",
            "Vendor Privacy Evaluation",
            "Parent & Student Rights",
          ],
          humanEdge:
            "Teacher advocacy for student rights against institutional and commercial data pressure.",
          resources: [],
        },
        {
          id: "l2",
          title: "Chief Ethics Officer (Education)",
          x: 740,
          y: 650,
          pathD: "M 480 620 C 580 620, 640 650, 740 650",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: [
            "AI Ethics Policy for Schools",
            "Digital Rights Advocacy",
            "Board Governance for Student Privacy",
          ],
          humanEdge:
            "Institutional authority to protect student dignity in AI-driven educational systems.",
          resources: [],
        },
      ],
    },
  ],
  digital_marketer: [
    {
      id: "br_aimarkauto",
      name: "AI Marketing Automation Lead",
      color: "#00f2fe",
      glowClass: "glow-cyan",
      curvePoints: "M 140 380 C 260 380, 320 180, 480 180",
      midX: 480,
      midY: 180,
      midTitle: "AI MARKETING AUTO LEAD",
      midSkills: ["Marketing AI Stack: 93%", "Automation Design: 91%", "Martech Integration: 88%"],
      foundation: {
        title: "Marketing Automation, AI Tools & MarTech Stack",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Modernize digital marketing with AI automation: HubSpot/Marketo/Salesforce Marketing Cloud, AI copywriting tools, programmatic ad platforms, and customer journey automation.",
        humanEdge:
          "Brand intuition about when automated personalization crosses into customer discomfort.",
        skills: [
          "Marketing Automation Platforms (HubSpot/Marketo)",
          "AI Copywriting Tool Integration",
          "Customer Journey Automation Design",
        ],
        resources: [
          {
            type: "free",
            title: "HubSpot Academy Marketing Certification",
            platform: "HubSpot",
            badge: "Free Cert",
            link: "https://academy.hubspot.com/",
          },
          {
            type: "paid",
            title: "Salesforce Marketing Cloud Certification",
            platform: "Salesforce",
            badge: "Professional ($200)",
            link: "https://www.salesforce.com/training/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Marketing Automation Manager",
          x: 740,
          y: 120,
          pathD: "M 480 180 C 580 180, 640 120, 740 120",
          stage: "Intermediate",
          duration: "Days 31–60",
          skills: [
            "Lead Scoring & Nurturing",
            "Email Deliverability Optimization",
            "Attribution Modeling",
          ],
          humanEdge: "Marketing empathy that keeps automation feeling human.",
          resources: [],
        },
        {
          id: "l2",
          title: "Director of Marketing Technology",
          x: 740,
          y: 180,
          pathD: "M 480 180 L 740 180",
          stage: "Advanced",
          duration: "Days 61–90",
          skills: ["MarTech Stack Architecture", "CDP Implementation", "Marketing Data Governance"],
          humanEdge: "Human-in-loop judgment at marketing decision automation boundaries.",
          resources: [],
        },
        {
          id: "l3",
          title: "Chief Marketing Technology Officer",
          x: 740,
          y: 240,
          pathD: "M 480 180 C 580 180, 640 240, 740 240",
          stage: "Leadership",
          duration: "Days 91–120+",
          skills: [
            "Enterprise MarTech Strategy",
            "AI Marketing Governance",
            "Board Marketing Reporting",
          ],
          humanEdge: "Customer trust stewardship through marketing data practices.",
          resources: [],
        },
      ],
    },
    {
      id: "br_growthintel",
      name: "Growth Intelligence Analyst",
      color: "#b000ff",
      glowClass: "glow-purple",
      curvePoints: "M 140 380 C 260 380, 340 320, 520 320",
      midX: 520,
      midY: 320,
      midTitle: "GROWTH INTELLIGENCE ANALYST",
      midSkills: [
        "Marketing Analytics: 94%",
        "Predictive Modeling: 92%",
        "Growth Experimentation: 89%",
      ],
      foundation: {
        title: "Marketing Analytics, Growth Modeling & Experimentation",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Build growth intelligence capability: A/B and multivariate testing, predictive LTV modeling, cohort analysis, media mix modeling (MMM), and causal inference for marketing.",
        humanEdge:
          "Marketing intuition about what moves customers that data alone cannot fully explain.",
        skills: [
          "A/B Testing Design & Analysis",
          "Predictive LTV Modeling",
          "Media Mix Modeling (MMM)",
        ],
        resources: [
          {
            type: "free",
            title: "Google Analytics 4 Certification",
            platform: "Google Skillshop",
            badge: "Free Cert",
            link: "https://skillshop.google.com/",
          },
          {
            type: "paid",
            title: "Marketing Analytics (Wharton)",
            platform: "Coursera/Wharton",
            badge: "Professional ($600)",
            link: "https://www.coursera.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Senior Growth Analyst",
          x: 820,
          y: 280,
          pathD: "M 520 320 C 640 320, 720 280, 820 280",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: [
            "Experimentation Programme Management",
            "Incrementality Testing",
            "Customer Intelligence Dashboards",
          ],
          humanEdge:
            "Commercial judgment about which statistical signals justify resource reallocation.",
          resources: [],
        },
        {
          id: "l2",
          title: "VP of Growth & Analytics",
          x: 820,
          y: 360,
          pathD: "M 520 320 C 640 320, 720 360, 820 360",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: ["Growth Strategy", "Marketing P&L Leadership", "C-Suite Analytics Reporting"],
          humanEdge:
            "Business acumen that keeps growth analytics connected to sustainable customer value.",
          resources: [],
        },
      ],
    },
    {
      id: "br_brandstrat",
      name: "Brand Strategy Director",
      color: "#f59e0b",
      glowClass: "glow-amber",
      curvePoints: "M 140 380 C 260 380, 340 480, 520 480",
      midX: 520,
      midY: 480,
      midTitle: "BRAND STRATEGY DIRECTOR",
      midSkills: ["Brand Architecture: 93%", "Consumer Insight: 91%", "Creative Strategy: 89%"],
      foundation: {
        title: "Brand Strategy, Consumer Insight & Creative Direction",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Build brand strategy skills: brand architecture design, consumer insight research, cultural trend mapping, AI-augmented creative strategy, and brand measurement frameworks.",
        humanEdge: "Cultural intuition about how brand decisions resonate beyond demographic data.",
        skills: [
          "Brand Architecture Frameworks",
          "Consumer Insight Research Design",
          "Cultural Trend Analysis",
        ],
        resources: [
          {
            type: "free",
            title: "Brand Strategy Resources",
            platform: "Brand New / Interbrand Insights",
            badge: "Free Industry",
            link: "https://www.underconsideration.com/brandnew/",
          },
          {
            type: "paid",
            title: "Brand Management (Kellogg/Coursera)",
            platform: "Coursera/Northwestern",
            badge: "Professional ($600)",
            link: "https://www.coursera.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Head of Brand",
          x: 820,
          y: 440,
          pathD: "M 520 480 C 640 480, 720 440, 820 440",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["Brand Campaign P&L", "Agency Relationship Management", "Brand Health Tracking"],
          humanEdge: "Creative conviction that keeps brand distinctive amid competitive pressure.",
          resources: [],
        },
        {
          id: "l2",
          title: "Chief Marketing Officer",
          x: 820,
          y: 520,
          pathD: "M 520 480 C 640 480, 720 520, 820 520",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: [
            "Marketing Strategy & P&L",
            "Brand Portfolio Leadership",
            "Board-Level Brand Governance",
          ],
          humanEdge:
            "Long-term brand stewardship versus short-term performance marketing pressure.",
          resources: [],
        },
      ],
    },
    {
      id: "br_adethics",
      name: "Advertising Ethics Lead",
      color: "#f72585",
      glowClass: "glow-magenta",
      curvePoints: "M 140 380 C 260 380, 320 620, 480 620",
      midX: 480,
      midY: 620,
      midTitle: "ADVERTISING ETHICS LEAD",
      midSkills: ["Ad Regulation: 96%", "Privacy Marketing: 93%", "Consumer Rights: 91%"],
      foundation: {
        title: "Advertising Ethics, Privacy Marketing & Consumer Rights",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Build advertising ethics expertise: privacy-first marketing design, GDPR/CCPA ad compliance, dark pattern identification, AI-generated ad content disclosure, and vulnerable audience protection.",
        humanEdge:
          "Marketing experience of audience targeting that identifies when precision becomes manipulation.",
        skills: [
          "Privacy-First Marketing Design",
          "GDPR/CCPA Ad Compliance",
          "Dark Pattern Identification",
        ],
        resources: [
          {
            type: "free",
            title: "IAB Privacy Compliance Resources",
            platform: "IAB",
            badge: "Free Industry",
            link: "https://www.iab.com/",
          },
          {
            type: "paid",
            title: "CIPP/E (European Privacy Law)",
            platform: "IAPP",
            badge: "Regulatory ($550)",
            link: "https://iapp.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Privacy & Compliance Manager (Marketing)",
          x: 740,
          y: 590,
          pathD: "M 480 620 C 580 620, 640 590, 740 590",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: [
            "Consent Management Platforms",
            "Contextual Targeting Strategy",
            "AI Ad Content Disclosure",
          ],
          humanEdge: "Marketing creativity within ethical targeting constraints.",
          resources: [],
        },
        {
          id: "l2",
          title: "Chief Ethics Officer (Marketing)",
          x: 740,
          y: 650,
          pathD: "M 480 620 C 580 620, 640 650, 740 650",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: [
            "Marketing Ethics Policy",
            "Regulatory Affairs Leadership",
            "Industry Standards Committees",
          ],
          humanEdge:
            "Institutional advocacy for consumer rights as a marketing value, not just a compliance burden.",
          resources: [],
        },
      ],
    },
  ],

  project_manager: [
    {
      id: "br_aiprojcoord",
      name: "AI Project Coordinator",
      color: "#00f2fe",
      glowClass: "glow-cyan",
      curvePoints: "M 140 380 C 260 380, 320 180, 480 180",
      midX: 480,
      midY: 180,
      midTitle: "AI PROJECT COORDINATOR",
      midSkills: ["AI PM Tools: 93%", "Agile/Scrum: 91%", "Project Analytics: 88%"],
      foundation: {
        title: "AI-Augmented Project Management Tools & Agile",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Modernize PM practice with AI tools: AI-assisted project planning (Linear, ClickUp AI, Notion AI), risk prediction models, automated status reporting, and agile ceremony facilitation.",
        humanEdge:
          "Stakeholder empathy and political judgment that AI project tools cannot substitute.",
        skills: [
          "AI Project Planning Tools",
          "Automated Status Reporting",
          "Agile Ceremony Facilitation with AI Support",
        ],
        resources: [
          {
            type: "free",
            title: "PMI Agile Practice Guide",
            platform: "PMI",
            badge: "Free Member",
            link: "https://www.pmi.org/",
          },
          {
            type: "paid",
            title: "PMP Certification",
            platform: "PMI",
            badge: "Gold Standard ($555)",
            link: "https://www.pmi.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Senior Project Manager",
          x: 740,
          y: 120,
          pathD: "M 480 180 C 580 180, 640 120, 740 120",
          stage: "Intermediate",
          duration: "Days 31–60",
          skills: [
            "AI Risk Prediction Integration",
            "Resource Optimization",
            "Multi-Workstream Coordination",
          ],
          humanEdge:
            "Judgment about when team dynamics require human intervention that dashboards miss.",
          resources: [],
        },
        {
          id: "l2",
          title: "Head of PMO",
          x: 740,
          y: 180,
          pathD: "M 480 180 L 740 180",
          stage: "Advanced",
          duration: "Days 61–90",
          skills: ["PMO Strategy", "Portfolio Governance", "PM Methodology Design"],
          humanEdge: "Organizational change leadership beyond project metrics.",
          resources: [],
        },
        {
          id: "l3",
          title: "Director of Programme Delivery",
          x: 740,
          y: 240,
          pathD: "M 480 180 C 580 180, 640 240, 740 240",
          stage: "Leadership",
          duration: "Days 91–120+",
          skills: [
            "Executive Programme Reporting",
            "Strategic Portfolio Management",
            "Transformation Leadership",
          ],
          humanEdge: "Accountability for outcomes at enterprise delivery scale.",
          resources: [],
        },
      ],
    },
    {
      id: "br_digtranspm",
      name: "Digital Transformation PM",
      color: "#b000ff",
      glowClass: "glow-purple",
      curvePoints: "M 140 380 C 260 380, 340 320, 520 320",
      midX: 520,
      midY: 320,
      midTitle: "DIGITAL TRANSFORMATION PM",
      midSkills: ["Change Management: 94%", "ERP/Cloud Migration: 92%", "Stakeholder Mgmt: 89%"],
      foundation: {
        title: "Digital Transformation, Change Management & ERP",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Build digital transformation PM capability: change management frameworks (Prosci/ADKAR), ERP migration project management, cloud migration workstreams, and business readiness assessment.",
        humanEdge:
          "Human change leadership that enables technology transformation to actually stick.",
        skills: [
          "Prosci ADKAR Change Management",
          "ERP Migration Project Management",
          "Business Readiness Assessment",
        ],
        resources: [
          {
            type: "free",
            title: "Prosci Change Management Resources",
            platform: "Prosci",
            badge: "Free Articles",
            link: "https://www.prosci.com/",
          },
          {
            type: "paid",
            title: "PgMP (Programme Management Professional)",
            platform: "PMI",
            badge: "Advanced PM ($800)",
            link: "https://www.pmi.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Digital Transformation Manager",
          x: 820,
          y: 280,
          pathD: "M 520 320 C 640 320, 720 280, 820 280",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: [
            "Cross-Functional Transformation Teams",
            "Benefits Realisation Tracking",
            "Executive Sponsorship Engagement",
          ],
          humanEdge:
            "People-first transformation approach that sustains engagement through difficult change.",
          resources: [],
        },
        {
          id: "l2",
          title: "VP of Digital Transformation",
          x: 820,
          y: 360,
          pathD: "M 520 320 C 640 320, 720 360, 820 360",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: [
            "Enterprise Transformation Strategy",
            "Board Change Governance",
            "AI-Enabled Operating Model Design",
          ],
          humanEdge:
            "Transformation leadership that balances pace with organizational absorptive capacity.",
          resources: [],
        },
      ],
    },
    {
      id: "br_progdir",
      name: "Programme Director",
      color: "#f59e0b",
      glowClass: "glow-amber",
      curvePoints: "M 140 380 C 260 380, 340 480, 520 480",
      midX: 520,
      midY: 480,
      midTitle: "PROGRAMME DIRECTOR",
      midSkills: ["Programme Strategy: 93%", "Benefits Management: 91%", "Exec Stakeholders: 89%"],
      foundation: {
        title: "Programme Management, Benefits Realisation & Strategy",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Build programme management capability: MSP (Managing Successful Programmes) framework, benefits management lifecycle, strategic business case development, and senior stakeholder management.",
        humanEdge:
          "Leadership wisdom about organizational readiness that project metrics cannot capture.",
        skills: [
          "MSP Programme Management Framework",
          "Benefits Realisation Management",
          "Strategic Business Case Development",
        ],
        resources: [
          {
            type: "free",
            title: "Managing Successful Programmes (MSP)",
            platform: "AXELOS Resources",
            badge: "Free Introduction",
            link: "https://www.axelos.com/",
          },
          {
            type: "paid",
            title: "MSP Practitioner Certification",
            platform: "AXELOS",
            badge: "Professional ($400)",
            link: "https://www.axelos.com/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Senior Programme Manager",
          x: 820,
          y: 440,
          pathD: "M 520 480 C 640 480, 720 440, 820 440",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: [
            "Multi-Project Portfolio Management",
            "Executive Reporting",
            "Programme Risk Management",
          ],
          humanEdge: "Judgment about which risks require escalation vs. team-level resolution.",
          resources: [],
        },
        {
          id: "l2",
          title: "Chief Operating Officer",
          x: 820,
          y: 520,
          pathD: "M 520 480 C 640 480, 720 520, 820 520",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: [
            "Operational Strategy",
            "Enterprise Portfolio Governance",
            "Organizational Design",
          ],
          humanEdge:
            "Systems-level leadership that connects delivery excellence to strategic outcomes.",
          resources: [],
        },
      ],
    },
    {
      id: "br_progethics",
      name: "Programme Ethics Lead",
      color: "#f72585",
      glowClass: "glow-magenta",
      curvePoints: "M 140 380 C 260 380, 320 620, 480 620",
      midX: 480,
      midY: 620,
      midTitle: "PROGRAMME ETHICS LEAD",
      midSkills: ["AI Project Governance: 96%", "Worker Impact: 93%", "Responsible Delivery: 91%"],
      foundation: {
        title: "Responsible Delivery, AI Project Ethics & Worker Impact",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Build responsible delivery expertise: AI project impact assessment, workforce displacement risk in transformation programmes, ethical supplier management, and responsible automation governance.",
        humanEdge:
          "Project leadership experience of how transformation affects front-line worker lives.",
        skills: [
          "AI Impact Assessment in Projects",
          "Workforce Transition Planning",
          "Responsible Automation Governance",
        ],
        resources: [
          {
            type: "free",
            title: "IEEE Ethically Aligned Design",
            platform: "IEEE",
            badge: "Free Framework",
            link: "https://ethicsinaction.ieee.org/",
          },
          {
            type: "paid",
            title: "ESG Project Management",
            platform: "Various Providers",
            badge: "Emerging Field ($400)",
            link: "https://www.coursera.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Responsible Technology PM",
          x: 740,
          y: 590,
          pathD: "M 480 620 C 580 620, 640 590, 740 590",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: [
            "Ethical Tech Assessment Frameworks",
            "Stakeholder Inclusion Design",
            "Just Transition Planning",
          ],
          humanEdge:
            "Delivery accountability that includes communities affected by transformation.",
          resources: [],
        },
        {
          id: "l2",
          title: "Chief Sustainability & Ethics Officer",
          x: 740,
          y: 650,
          pathD: "M 480 620 C 580 620, 640 650, 740 650",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: [
            "ESG Strategy",
            "Responsible AI Board Governance",
            "Sustainable Delivery Standards",
          ],
          humanEdge:
            "Moral authority to halt or redesign projects causing disproportionate human harm.",
          resources: [],
        },
      ],
    },
  ],
  data_analyst: [
    {
      id: "br_mldatascientist",
      name: "ML Data Scientist",
      color: "#00f2fe",
      glowClass: "glow-cyan",
      curvePoints: "M 140 380 C 260 380, 320 180, 480 180",
      midX: 480,
      midY: 180,
      midTitle: "ML DATA SCIENTIST",
      midSkills: ["ML Model Dev: 94%", "Feature Engineering: 92%", "Model Deployment: 89%"],
      foundation: {
        title: "Machine Learning, Feature Engineering & Model Deployment",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Extend analytical skills into ML: scikit-learn, feature engineering, model evaluation, MLOps basics, and A/B testing for model deployment. Build from business analytics into production ML.",
        humanEdge:
          "Business analyst intuition about which features actually explain business outcomes.",
        skills: [
          "scikit-learn & ML Fundamentals",
          "Feature Engineering",
          "MLOps & Model Monitoring",
        ],
        resources: [
          {
            type: "free",
            title: "fast.ai Practical Deep Learning",
            platform: "fast.ai",
            badge: "Free World-Class",
            link: "https://www.fast.ai/",
          },
          {
            type: "paid",
            title: "MITx MicroMasters: Statistics & Data Science",
            platform: "edX / MIT",
            badge: "Academic ($1,500)",
            link: "https://www.edx.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Applied Machine Learning Engineer",
          x: 740,
          y: 120,
          pathD: "M 480 180 C 580 180, 640 120, 740 120",
          stage: "Intermediate",
          duration: "Days 31–60",
          skills: [
            "Production ML Pipelines",
            "Model Explainability (SHAP/LIME)",
            "Experiment Tracking (MLflow)",
          ],
          humanEdge:
            "Business context that prevents technically correct models from solving the wrong problem.",
          resources: [],
        },
        {
          id: "l2",
          title: "Principal Data Scientist",
          x: 740,
          y: 180,
          pathD: "M 480 180 L 740 180",
          stage: "Advanced",
          duration: "Days 61–90",
          skills: [
            "Research to Production Pipeline",
            "Cross-Functional ML Leadership",
            "Technical Mentorship",
          ],
          humanEdge:
            "Domain expertise that distinguishes meaningful signal from spurious correlation.",
          resources: [],
        },
        {
          id: "l3",
          title: "Head of Data Science",
          x: 740,
          y: 240,
          pathD: "M 480 180 C 580 180, 640 240, 740 240",
          stage: "Leadership",
          duration: "Days 91–120+",
          skills: ["Data Science Strategy", "AI Product Roadmap", "Team & Research Culture"],
          humanEdge: "Scientific integrity leadership in commercial ML environments.",
          resources: [],
        },
      ],
    },
    {
      id: "br_dataintelstrat",
      name: "Data Intelligence Strategist",
      color: "#b000ff",
      glowClass: "glow-purple",
      curvePoints: "M 140 380 C 260 380, 340 320, 520 320",
      midX: 520,
      midY: 320,
      midTitle: "DATA INTELLIGENCE STRATEGIST",
      midSkills: ["BI Strategy: 94%", "Self-Service Analytics: 92%", "Data Storytelling: 89%"],
      foundation: {
        title: "Business Intelligence Strategy & Self-Service Analytics",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Evolve into data strategy: enterprise BI architecture design, self-service analytics enablement, data storytelling for executive audiences, and analytics product management.",
        humanEdge:
          "Analyst communication skills that translate complex data into strategic action.",
        skills: [
          "Enterprise BI Architecture (Tableau/Power BI/Looker)",
          "Self-Service Analytics Design",
          "Executive Data Storytelling",
        ],
        resources: [
          {
            type: "free",
            title: "Tableau Public Learning",
            platform: "Tableau",
            badge: "Free Practice Platform",
            link: "https://public.tableau.com/",
          },
          {
            type: "paid",
            title: "BI Architect Certification (Microsoft/Tableau)",
            platform: "Vendor",
            badge: "Professional ($200-400)",
            link: "https://www.microsoft.com/en-us/learning/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Analytics Engineering Lead",
          x: 820,
          y: 280,
          pathD: "M 520 320 C 640 320, 720 280, 820 280",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["dbt (Data Build Tool)", "Semantic Layer Design", "Data Quality & Testing"],
          humanEdge:
            "Business analyst perspective on what data users actually need vs. what is easy to build.",
          resources: [],
        },
        {
          id: "l2",
          title: "Chief Data & Analytics Officer",
          x: 820,
          y: 360,
          pathD: "M 520 320 C 640 320, 720 360, 820 360",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: ["Enterprise Data Strategy", "Data Monetization", "Board Analytics Reporting"],
          humanEdge:
            "Data democratization leadership that builds organizational decision-making capability.",
          resources: [],
        },
      ],
    },
    {
      id: "br_analyticsPM",
      name: "Analytics Product Manager",
      color: "#f59e0b",
      glowClass: "glow-amber",
      curvePoints: "M 140 380 C 260 380, 340 480, 520 480",
      midX: 520,
      midY: 480,
      midTitle: "ANALYTICS PRODUCT MANAGER",
      midSkills: [
        "Analytics Product Design: 93%",
        "Metric Frameworks: 91%",
        "Data Product Strategy: 89%",
      ],
      foundation: {
        title: "Analytics Product Management & Metric Design",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Build analytics PM skills: metric framework design (OKRs, HEART, North Star), analytics product roadmapping, data product strategy, and cross-functional analytics leadership.",
        humanEdge: "Analyst credibility that grounds PM decisions in what data actually shows.",
        skills: [
          "Metric Framework Design (OKR/HEART/North Star)",
          "Analytics Product Roadmap",
          "User Research for Data Products",
        ],
        resources: [
          {
            type: "free",
            title: "Lenny's Newsletter: Metrics & Analytics",
            platform: "Lenny Rachitsky",
            badge: "Free Articles",
            link: "https://www.lennysnewsletter.com/",
          },
          {
            type: "paid",
            title: "Product Analytics (Reforge)",
            platform: "Reforge",
            badge: "Elite PM ($2,000)",
            link: "https://www.reforge.com/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Senior Analytics PM",
          x: 820,
          y: 440,
          pathD: "M 520 480 C 640 480, 720 440, 820 440",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["AI Feature Analytics", "Experimentation Platform PM", "Analytics API Products"],
          humanEdge: "Bridge role between data science rigour and product delivery pragmatism.",
          resources: [],
        },
        {
          id: "l2",
          title: "VP of Data Products",
          x: 820,
          y: 520,
          pathD: "M 520 480 C 640 480, 720 520, 820 520",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: ["Data Product P&L", "AI Platform Strategy", "Enterprise Analytics Vision"],
          humanEdge:
            "Strategic conviction that data products must serve both business and customer outcomes.",
          resources: [],
        },
      ],
    },
    {
      id: "br_datagovernance",
      name: "Data Governance Officer",
      color: "#f72585",
      glowClass: "glow-magenta",
      curvePoints: "M 140 380 C 260 380, 320 620, 480 620",
      midX: 480,
      midY: 620,
      midTitle: "DATA GOVERNANCE OFFICER",
      midSkills: ["Data Policy: 96%", "Metadata Management: 93%", "Privacy Analytics: 91%"],
      foundation: {
        title: "Data Governance, Privacy & Responsible Analytics",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Build data governance expertise: data cataloguing, data lineage tracking, GDPR/CCPA compliance for analytics, AI ethics in data products, and responsible data use frameworks.",
        humanEdge:
          "Analyst experience of how poor data governance creates analytical misleads at scale.",
        skills: [
          "Data Catalogue & Metadata Management",
          "GDPR/CCPA Analytics Compliance",
          "Data Lineage Frameworks",
        ],
        resources: [
          {
            type: "free",
            title: "DAMA Data Management Body of Knowledge",
            platform: "DAMA International",
            badge: "Free Framework Overview",
            link: "https://www.dama.org/",
          },
          {
            type: "paid",
            title: "CDMP (Certified Data Management Professional)",
            platform: "DAMA",
            badge: "Gold Standard ($500)",
            link: "https://www.dama.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Data Steward & Quality Manager",
          x: 740,
          y: 590,
          pathD: "M 480 620 C 580 620, 640 590, 740 590",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: [
            "Data Quality Rules Design",
            "Master Data Management",
            "Business Glossary Governance",
          ],
          humanEdge:
            "Analyst accountability for the data products that business decisions rest on.",
          resources: [],
        },
        {
          id: "l2",
          title: "Chief Data Officer (Governance)",
          x: 740,
          y: 650,
          pathD: "M 480 620 C 580 620, 640 650, 740 650",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: [
            "Enterprise Data Governance Strategy",
            "AI Data Ethics Framework",
            "Board Data Reporting",
          ],
          humanEdge:
            "Institutional authority to enforce data standards against commercial pressure.",
          resources: [],
        },
      ],
    },
  ],

  architect_designer: [
    {
      id: "br_aibimspec",
      name: "AI Design & BIM Specialist",
      color: "#00f2fe",
      glowClass: "glow-cyan",
      curvePoints: "M 140 380 C 260 380, 320 180, 480 180",
      midX: 480,
      midY: 180,
      midTitle: "AI DESIGN & BIM SPECIALIST",
      midSkills: ["BIM Authoring: 94%", "Generative Design: 91%", "AI Design Tools: 88%"],
      foundation: {
        title: "BIM, Generative Design & AI Architecture Tools",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Advance architectural skills with AI tools: Autodesk Forma, generative design workflows, BIM management, computational design (Rhino/Grasshopper), and AI rendering tools.",
        humanEdge:
          "Design intent and spatial quality judgment that generative tools optimize around the wrong objective.",
        skills: [
          "Autodesk Forma / Revit Advanced BIM",
          "Grasshopper Parametric Design",
          "AI Rendering (Midjourney/Stable Diffusion for Architecture)",
        ],
        resources: [
          {
            type: "free",
            title: "Autodesk Knowledge Network",
            platform: "Autodesk",
            badge: "Free Official",
            link: "https://knowledge.autodesk.com/",
          },
          {
            type: "paid",
            title: "ARB / AIA Architecture Licensure",
            platform: "ARB / NCARB",
            badge: "Professional Licence",
            link: "https://arb.org.uk/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "BIM Manager",
          x: 740,
          y: 120,
          pathD: "M 480 180 C 580 180, 640 120, 740 120",
          stage: "Intermediate",
          duration: "Days 31–60",
          skills: [
            "BIM Execution Plan Management",
            "IFC Standards",
            "Clash Detection & Coordination",
          ],
          humanEdge: "Architectural coordination judgment beyond automated clash detection.",
          resources: [],
        },
        {
          id: "l2",
          title: "Digital Design Lead",
          x: 740,
          y: 180,
          pathD: "M 480 180 L 740 180",
          stage: "Advanced",
          duration: "Days 61–90",
          skills: [
            "Computational Design Leadership",
            "Digital Twin Management",
            "Practice-Wide BIM Standards",
          ],
          humanEdge:
            "Design philosophy leadership that keeps computational tools serving human spatial experience.",
          resources: [],
        },
        {
          id: "l3",
          title: "Director of Digital Practice",
          x: 740,
          y: 240,
          pathD: "M 480 180 C 580 180, 640 240, 740 240",
          stage: "Leadership",
          duration: "Days 91–120+",
          skills: [
            "Digital Strategy for Architecture Practice",
            "PropTech Integration",
            "AI Ethics in Built Environment",
          ],
          humanEdge:
            "Professional stewardship of design quality in AI-mediated architectural production.",
          resources: [],
        },
      ],
    },
    {
      id: "br_compdesign",
      name: "Computational Design Lead",
      color: "#b000ff",
      glowClass: "glow-purple",
      curvePoints: "M 140 380 C 260 380, 340 320, 520 320",
      midX: 520,
      midY: 320,
      midTitle: "COMPUTATIONAL DESIGN LEAD",
      midSkills: [
        "Parametric Design: 94%",
        "Performance Simulation: 92%",
        "Design Algorithms: 89%",
      ],
      foundation: {
        title: "Parametric Design, Performance Simulation & Design Technology",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Build computational design capability: Grasshopper algorithm design, energy performance simulation (IES/EnergyPlus), structural optimization, and design-to-fabrication workflows.",
        humanEdge:
          "Architect's understanding of how computational optimization affects occupant experience.",
        skills: [
          "Grasshopper Algorithm Design",
          "Energy Performance Simulation",
          "Structural Topology Optimization",
        ],
        resources: [
          {
            type: "free",
            title: "Grasshopper 3D Learning Resources",
            platform: "McNeel / Grasshopper3d.com",
            badge: "Free Community",
            link: "https://www.grasshopper3d.com/",
          },
          {
            type: "paid",
            title: "CEDIA / RIBA Computational Design CPD",
            platform: "RIBA",
            badge: "Professional CPD",
            link: "https://www.architecture.com/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Computational Design Researcher",
          x: 820,
          y: 280,
          pathD: "M 520 320 C 640 320, 720 280, 820 280",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["Design Algorithm Research", "Fabrication-Aware Design", "Academic Publication"],
          humanEdge:
            "Design research that asks whether computational efficiency serves human wellbeing.",
          resources: [],
        },
        {
          id: "l2",
          title: "Head of Research & Computational Design",
          x: 820,
          y: 360,
          pathD: "M 520 320 C 640 320, 720 360, 820 360",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: [
            "Practice-Defining Research",
            "Academic Practice Partnership",
            "Computational Design Education",
          ],
          humanEdge:
            "Research leadership that connects technological advance with architectural culture.",
          resources: [],
        },
      ],
    },
    {
      id: "br_designdir",
      name: "Design Director",
      color: "#f59e0b",
      glowClass: "glow-amber",
      curvePoints: "M 140 380 C 260 380, 340 480, 520 480",
      midX: 520,
      midY: 480,
      midTitle: "DESIGN DIRECTOR",
      midSkills: [
        "Design Leadership: 93%",
        "Client Architecture: 91%",
        "Project Architecture: 89%",
      ],
      foundation: {
        title: "Design Leadership, Client Architecture & Project Delivery",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Build design leadership capability: design quality management, client relationship architecture, major project design leadership, and design culture development within practice.",
        humanEdge:
          "Design vision and critical judgment that distinguishes excellent from merely competent work.",
        skills: [
          "Design Quality Management Frameworks",
          "Client Architecture (Major Projects)",
          "Studio Culture Leadership",
        ],
        resources: [
          {
            type: "free",
            title: "RIBA Plan of Work",
            platform: "RIBA",
            badge: "Free Framework",
            link: "https://www.architecture.com/",
          },
          {
            type: "paid",
            title: "RIBA Chartered Architect (ARB Prescribed Qualification)",
            platform: "RIBA",
            badge: "Chartered Status",
            link: "https://www.architecture.com/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Associate Director (Architecture)",
          x: 820,
          y: 440,
          pathD: "M 520 480 C 640 480, 720 440, 820 440",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: [
            "Complex Project Design Leadership",
            "Multi-Discipline Team Management",
            "Technical Design Authority",
          ],
          humanEdge: "Design integrity under commercial delivery pressure.",
          resources: [],
        },
        {
          id: "l2",
          title: "Partner / Principal Architect",
          x: 820,
          y: 520,
          pathD: "M 520 480 C 640 480, 720 520, 820 520",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: ["Practice Leadership", "Business Development", "Architectural Legacy & Culture"],
          humanEdge:
            "Creative courage that defines and defends design excellence at the highest level.",
          resources: [],
        },
      ],
    },
    {
      id: "br_urbanethics",
      name: "Urban Ethics & Sustainability Lead",
      color: "#f72585",
      glowClass: "glow-magenta",
      curvePoints: "M 140 380 C 260 380, 320 620, 480 620",
      midX: 480,
      midY: 620,
      midTitle: "URBAN ETHICS LEAD",
      midSkills: ["Climate Resilience: 96%", "Social Impact Design: 93%", "Urban Policy: 91%"],
      foundation: {
        title: "Climate-Resilient Design, Social Impact & Urban Ethics",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Develop built environment ethics expertise: BREEAM/LEED sustainability leadership, climate resilience design, community participatory design, housing justice, and AI urban planning ethics.",
        humanEdge:
          "Architectural experience of how design decisions affect communities that don't commission buildings.",
        skills: [
          "BREEAM/LEED Sustainability Leadership",
          "Climate Resilience Design",
          "Participatory Community Design",
        ],
        resources: [
          {
            type: "free",
            title: "RIBA Climate Challenge Resources",
            platform: "RIBA",
            badge: "Free Professional",
            link: "https://www.architecture.com/RIBA/Campaigns/Climate-Challenge",
          },
          {
            type: "paid",
            title: "CABE Built Environment Design Quality",
            platform: "CABE / Design Council",
            badge: "Professional CPD",
            link: "https://www.designcouncil.org.uk/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Sustainability Architect / ESG Lead",
          x: 740,
          y: 590,
          pathD: "M 480 620 C 580 620, 640 590, 740 590",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: ["Net Zero Carbon Design", "Social Value Assessment", "Climate Risk in Planning"],
          humanEdge:
            "Design advocacy for communities and ecosystems without client representation.",
          resources: [],
        },
        {
          id: "l2",
          title: "Chief Sustainability Officer (Built Environment)",
          x: 740,
          y: 650,
          pathD: "M 480 620 C 580 620, 640 650, 740 650",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: [
            "Whole Lifecycle Carbon Strategy",
            "Planning Policy Influence",
            "Industry Sustainability Standards",
          ],
          humanEdge:
            "Institutional authority to make climate ethics non-negotiable in architectural practice.",
          resources: [],
        },
      ],
    },
  ],
  translator: [
    {
      id: "br_aiposteditor",
      name: "AI Post-Editor & Localisation Specialist",
      color: "#00f2fe",
      glowClass: "glow-cyan",
      curvePoints: "M 140 380 C 260 380, 320 180, 480 180",
      midX: 480,
      midY: 180,
      midTitle: "AI POST-EDITOR",
      midSkills: ["MT Post-Editing: 94%", "CAT Tools: 92%", "Localisation QA: 89%"],
      foundation: {
        title: "Machine Translation Post-Editing & Localisation Tools",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Transition from translation to MT post-editing: MTPE workflows, CAT tools (Trados, memoQ, Phrase), localisation QA processes, and terminology management.",
        humanEdge:
          "Linguistic judgment that distinguishes fluent-sounding MT errors from accurate translation.",
        skills: [
          "MT Post-Editing (MTPE) Workflows",
          "CAT Tools Advanced (Trados/Phrase/memoQ)",
          "Terminology Management (Multiterm)",
        ],
        resources: [
          {
            type: "free",
            title: "TAUS AI in Translation Resources",
            platform: "TAUS",
            badge: "Free Industry Research",
            link: "https://www.taus.net/",
          },
          {
            type: "paid",
            title: "ATA Certification (American Translators Association)",
            platform: "ATA",
            badge: "Professional Standard ($475)",
            link: "https://www.atanet.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Senior Post-Editor / Localisation QA Lead",
          x: 740,
          y: 120,
          pathD: "M 480 180 C 580 180, 640 120, 740 120",
          stage: "Intermediate",
          duration: "Days 31–60",
          skills: [
            "MTPE Quality Metrics",
            "Linguistic QA Automation",
            "Vendor Management for MTPE",
          ],
          humanEdge:
            "Native cultural intuition for when MT output fails pragmatic or cultural accuracy.",
          resources: [],
        },
        {
          id: "l2",
          title: "Localisation Programme Manager",
          x: 740,
          y: 180,
          pathD: "M 480 180 L 740 180",
          stage: "Advanced",
          duration: "Days 61–90",
          skills: [
            "Localisation Platform Management",
            "AI Workflow Design",
            "Multilingual Content Operations",
          ],
          humanEdge:
            "Cultural mediation that ensures localisation serves genuine audience comprehension.",
          resources: [],
        },
        {
          id: "l3",
          title: "Head of Localisation",
          x: 740,
          y: 240,
          pathD: "M 480 180 C 580 180, 640 240, 740 240",
          stage: "Leadership",
          duration: "Days 91–120+",
          skills: [
            "Global Localisation Strategy",
            "AI MT Governance",
            "Localisation ROI & Quality Standards",
          ],
          humanEdge:
            "Advocacy for linguistic quality standards in commercially pressured MTPE pipelines.",
          resources: [],
        },
      ],
    },
    {
      id: "br_langtechlead",
      name: "Language Technology Lead",
      color: "#b000ff",
      glowClass: "glow-purple",
      curvePoints: "M 140 380 C 260 380, 340 320, 520 320",
      midX: 520,
      midY: 320,
      midTitle: "LANGUAGE TECHNOLOGY LEAD",
      midSkills: ["NLP Engineering: 93%", "MT System Design: 91%", "Language AI: 88%"],
      foundation: {
        title: "NLP Engineering, MT System Design & Language AI",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Build language technology expertise: NLP fundamentals, neural MT fine-tuning (domain adaptation), corpus linguistics, and language model evaluation for translation quality.",
        humanEdge:
          "Translator expertise in what constitutes genuine linguistic equivalence across cultural contexts.",
        skills: [
          "Python NLP (spaCy, transformers)",
          "Neural MT Fine-Tuning",
          "Language Model Evaluation for Translation",
        ],
        resources: [
          {
            type: "free",
            title: "Hugging Face NLP Course",
            platform: "Hugging Face",
            badge: "Free World-Class",
            link: "https://huggingface.co/learn/nlp-course/",
          },
          {
            type: "paid",
            title: "Computational Linguistics (MSc module)",
            platform: "University of Edinburgh / Coursera",
            badge: "Academic ($1,000+)",
            link: "https://www.coursera.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Language AI Engineer",
          x: 820,
          y: 280,
          pathD: "M 520 320 C 640 320, 720 280, 820 280",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: [
            "Domain MT Adaptation",
            "Language Model Evaluation",
            "Multilingual Data Pipeline",
          ],
          humanEdge:
            "Native speaker quality assessment of AI language systems across low-resource languages.",
          resources: [],
        },
        {
          id: "l2",
          title: "Head of Language AI Technology",
          x: 820,
          y: 360,
          pathD: "M 520 320 C 640 320, 720 360, 820 360",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: [
            "Language AI Product Roadmap",
            "Research Collaboration",
            "Language Technology Ethics",
          ],
          humanEdge:
            "Linguistic diversity advocacy that prevents technology from amplifying language inequality.",
          resources: [],
        },
      ],
    },
    {
      id: "br_globalcontent",
      name: "Global Content Director",
      color: "#f59e0b",
      glowClass: "glow-amber",
      curvePoints: "M 140 380 C 260 380, 340 480, 520 480",
      midX: 520,
      midY: 480,
      midTitle: "GLOBAL CONTENT DIRECTOR",
      midSkills: [
        "Multilingual Content Strategy: 93%",
        "International Markets: 91%",
        "Cultural Consulting: 89%",
      ],
      foundation: {
        title: "International Content Strategy & Cultural Consulting",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Develop global content strategy skills: multilingual SEO, transcreation vs. translation strategy, cultural consulting for product expansion, and international brand communication.",
        humanEdge:
          "Cultural intelligence about when direct translation fails and transcreation is required.",
        skills: [
          "Multilingual SEO Strategy",
          "Transcreation Methodology",
          "Cultural Intelligence Frameworks (CQ)",
        ],
        resources: [
          {
            type: "free",
            title: "Multilingual Magazine Resources",
            platform: "MultiLingual",
            badge: "Free Industry",
            link: "https://multilingual.com/",
          },
          {
            type: "paid",
            title: "International Marketing (CIM)",
            platform: "CIM",
            badge: "Professional ($800)",
            link: "https://www.cim.co.uk/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Head of International Content",
          x: 820,
          y: 440,
          pathD: "M 520 480 C 640 480, 720 440, 820 440",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: [
            "Global Content Operations",
            "Regional Marketing Partnerships",
            "Cultural Adaptation QA",
          ],
          humanEdge:
            "Cross-cultural empathy that prevents brand communication failures in new markets.",
          resources: [],
        },
        {
          id: "l2",
          title: "VP of Global Communications",
          x: 820,
          y: 520,
          pathD: "M 520 480 C 640 480, 720 520, 820 520",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: [
            "Global Communications Strategy",
            "Language Access Policy",
            "Multilingual Brand Governance",
          ],
          humanEdge:
            "Institutional commitment to genuine multilingual accessibility, not just translation throughput.",
          resources: [],
        },
      ],
    },
    {
      id: "br_langethics",
      name: "Language Access & Ethics Lead",
      color: "#f72585",
      glowClass: "glow-magenta",
      curvePoints: "M 140 380 C 260 380, 320 620, 480 620",
      midX: 480,
      midY: 620,
      midTitle: "LANGUAGE ETHICS LEAD",
      midSkills: [
        "Language Rights: 96%",
        "AI Bias in Translation: 93%",
        "Language Access Policy: 91%",
      ],
      foundation: {
        title: "Language Access Rights, AI Translation Ethics & Linguistic Equity",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Build language ethics expertise: language access rights law, AI translation bias in high-stakes contexts (legal, medical), low-resource language equity, and certified translation ethics.",
        humanEdge:
          "Translator understanding of real-world consequences when language access fails.",
        skills: [
          "Language Access Rights Frameworks",
          "AI Translation Bias Assessment",
          "Low-Resource Language Advocacy",
        ],
        resources: [
          {
            type: "free",
            title: "UN Language Rights Framework",
            platform: "United Nations",
            badge: "Free Official",
            link: "https://www.un.org/development/desa/indigenous-peoples/",
          },
          {
            type: "paid",
            title: "Legal Translation Certification",
            platform: "ITI / ATA",
            badge: "Specialised ($400)",
            link: "https://www.iti.org.uk/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Language Access Coordinator (Legal/Medical)",
          x: 740,
          y: 590,
          pathD: "M 480 620 C 580 620, 640 590, 740 590",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: [
            "Interpreter Services Management",
            "Legal Translation Quality Standards",
            "AI Translation Audit for High-Stakes Use",
          ],
          humanEdge: "Advocacy for individuals whose rights depend on accurate language access.",
          resources: [],
        },
        {
          id: "l2",
          title: "Chief Language & Inclusion Officer",
          x: 740,
          y: 650,
          pathD: "M 480 620 C 580 620, 640 650, 740 650",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: [
            "Language Policy Leadership",
            "AI Ethics in Language Technology",
            "Multilingual Inclusion Strategy",
          ],
          humanEdge:
            "Institutional authority to ensure AI language technology serves linguistic minorities equitably.",
          resources: [],
        },
      ],
    },
  ],

  travel_agent: [
    {
      id: "br_traveltechspec",
      name: "Travel Technology Specialist",
      color: "#00f2fe",
      glowClass: "glow-cyan",
      curvePoints: "M 140 380 C 260 380, 320 180, 480 180",
      midX: 480,
      midY: 180,
      midTitle: "TRAVEL TECH SPECIALIST",
      midSkills: ["GDS & NDC: 93%", "Travel AI Tools: 91%", "Revenue Management: 88%"],
      foundation: {
        title: "Travel Technology, GDS/NDC & Revenue Management",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Modernize travel skills with technology: advanced GDS expertise (Amadeus/Sabre/Galileo), NDC (New Distribution Capability) content, AI pricing tools, and travel revenue management.",
        humanEdge:
          "Client relationship knowledge and nuanced service capability that AI booking tools cannot replicate for complex itineraries.",
        skills: [
          "Advanced GDS (Amadeus/Sabre)",
          "NDC Distribution & Content",
          "Travel Revenue Management Fundamentals",
        ],
        resources: [
          {
            type: "free",
            title: "Amadeus Academy Training",
            platform: "Amadeus",
            badge: "Free Professional",
            link: "https://amadeus.com/en/solutions/airline-reservations-ticketing/travel-agency-training",
          },
          {
            type: "paid",
            title: "CTA (Certified Travel Associate)",
            platform: "ASTA / ICTA",
            badge: "Industry Standard ($350)",
            link: "https://www.asta.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Travel Technology Product Specialist",
          x: 740,
          y: 120,
          pathD: "M 480 180 C 580 180, 640 120, 740 120",
          stage: "Intermediate",
          duration: "Days 31–60",
          skills: [
            "OTA Platform Management",
            "API Distribution Strategy",
            "Travel Product Analytics",
          ],
          humanEdge:
            "Travel domain expertise that catches technology gaps harming client experience.",
          resources: [],
        },
        {
          id: "l2",
          title: "Travel Technology Manager",
          x: 740,
          y: 180,
          pathD: "M 480 180 L 740 180",
          stage: "Advanced",
          duration: "Days 61–90",
          skills: ["Travel Tech Stack Architecture", "Vendor Evaluation", "Distribution Strategy"],
          humanEdge: "Client-first technology decisions over pure efficiency metrics.",
          resources: [],
        },
        {
          id: "l3",
          title: "VP of Travel Technology",
          x: 740,
          y: 240,
          pathD: "M 480 180 C 580 180, 640 240, 740 240",
          stage: "Leadership",
          duration: "Days 91–120+",
          skills: [
            "Travel Tech Strategy",
            "Platform Investment Leadership",
            "AI in Travel Governance",
          ],
          humanEdge:
            "Strategic foresight about which travel technologies serve clients vs. disintermediate them.",
          resources: [],
        },
      ],
    },
    {
      id: "br_aiexpcurator",
      name: "AI Experience Curator",
      color: "#b000ff",
      glowClass: "glow-purple",
      curvePoints: "M 140 380 C 260 380, 340 320, 520 320",
      midX: 520,
      midY: 320,
      midTitle: "AI EXPERIENCE CURATOR",
      midSkills: ["Luxury Travel Design: 94%", "Experience Curation: 92%", "Concierge AI: 89%"],
      foundation: {
        title: "Luxury Experience Curation, Concierge AI & High-Touch Travel",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Develop high-end travel experience expertise: luxury hospitality partnerships, AI-assisted personalisation for VIP clients, bespoke itinerary design, and concierge service standards.",
        humanEdge:
          "Human warmth, discretion, and personal relationship cultivation that luxury clients specifically seek.",
        skills: [
          "Luxury Hospitality Partnership Development",
          "AI-Assisted VIP Personalisation",
          "Bespoke Itinerary Design",
        ],
        resources: [
          {
            type: "free",
            title: "Virtuoso Travel Partner Resources",
            platform: "Virtuoso",
            badge: "Partner Access",
            link: "https://www.virtuoso.com/",
          },
          {
            type: "paid",
            title: "UFTAA International Travel Consultant",
            platform: "UFTAA",
            badge: "International Standard ($500)",
            link: "https://www.uftaa.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Luxury Travel Experience Designer",
          x: 820,
          y: 280,
          pathD: "M 520 320 C 640 320, 720 280, 820 280",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: [
            "High-End Trip Architecture",
            "Supplier & DMC Relationships",
            "VIP Client Portfolio Management",
          ],
          humanEdge:
            "Personal chemistry and trust-building that defines luxury travel relationships.",
          resources: [],
        },
        {
          id: "l2",
          title: "Head of Luxury & Experiences",
          x: 820,
          y: 360,
          pathD: "M 520 320 C 640 320, 720 360, 820 360",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: [
            "Luxury Brand Partnerships",
            "High-Net-Worth Client Strategy",
            "Experiential Travel Product Development",
          ],
          humanEdge:
            "Creative vision for transformative travel experiences beyond client expectations.",
          resources: [],
        },
      ],
    },
    {
      id: "br_destmktg",
      name: "Destination Marketing Lead",
      color: "#f59e0b",
      glowClass: "glow-amber",
      curvePoints: "M 140 380 C 260 380, 340 480, 520 480",
      midX: 520,
      midY: 480,
      midTitle: "DESTINATION MARKETING LEAD",
      midSkills: [
        "Tourism Marketing: 93%",
        "Digital Destination Strategy: 91%",
        "Travel Content: 88%",
      ],
      foundation: {
        title: "Destination Marketing, Tourism Strategy & Travel Content",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Build destination marketing skills: DMO partnership strategy, travel content production, tourism digital marketing (Google Ads, social travel content), and influencer marketing for destinations.",
        humanEdge:
          "Personal travel experience that creates authentic destination storytelling AI cannot replicate.",
        skills: [
          "DMO Partnership Development",
          "Travel Content Strategy & Production",
          "Tourism Digital Marketing",
        ],
        resources: [
          {
            type: "free",
            title: "UNWTO Tourism Insights",
            platform: "UNWTO",
            badge: "Free Research",
            link: "https://www.unwto.org/",
          },
          {
            type: "paid",
            title: "Digital Tourism Certification",
            platform: "Tourism Tribe",
            badge: "Industry ($400)",
            link: "https://www.tourisminstitute.com/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Destination Marketing Manager",
          x: 820,
          y: 440,
          pathD: "M 520 480 C 640 480, 720 440, 820 440",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: [
            "Tourism Campaign Management",
            "Visitor Sentiment Analytics",
            "Multi-Channel Tourism Marketing",
          ],
          humanEdge: "Local cultural knowledge that shapes authentic destination narratives.",
          resources: [],
        },
        {
          id: "l2",
          title: "Chief Tourism Officer / DMO Director",
          x: 820,
          y: 520,
          pathD: "M 520 480 C 640 480, 720 520, 820 520",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: [
            "National Tourism Strategy",
            "Government Tourism Relations",
            "Destination Brand Governance",
          ],
          humanEdge:
            "Long-term destination stewardship that balances visitor growth with community wellbeing.",
          resources: [],
        },
      ],
    },
    {
      id: "br_susttravel",
      name: "Sustainable Travel Ethics Lead",
      color: "#f72585",
      glowClass: "glow-magenta",
      curvePoints: "M 140 380 C 260 380, 320 620, 480 620",
      midX: 480,
      midY: 620,
      midTitle: "SUSTAINABLE TRAVEL ETHICS LEAD",
      midSkills: ["Sustainable Tourism: 96%", "Carbon Offsetting: 93%", "Regenerative Travel: 91%"],
      foundation: {
        title: "Sustainable Tourism, Carbon Accountability & Regenerative Travel",
        stage: "Stage 01: Foundation",
        level: "Basic Station",
        duration: "Days 1–30",
        description:
          "Develop sustainable travel expertise: tourism carbon footprint measurement, GSTC sustainable tourism certification, regenerative travel design, and over-tourism policy advocacy.",
        humanEdge:
          "Travel industry knowledge of where greenwashing ends and genuine sustainability begins.",
        skills: [
          "Tourism Carbon Footprint Measurement",
          "GSTC Sustainable Tourism Framework",
          "Regenerative Travel Design Principles",
        ],
        resources: [
          {
            type: "free",
            title: "GSTC (Global Sustainable Tourism Council)",
            platform: "GSTC",
            badge: "Free Standards",
            link: "https://www.gstcouncil.org/",
          },
          {
            type: "paid",
            title: "Travelife Sustainability Certification",
            platform: "Travelife",
            badge: "Industry Standard ($300)",
            link: "https://www.travelife.org/",
          },
        ],
      },
      leaves: [
        {
          id: "l1",
          title: "Sustainable Travel Consultant",
          x: 740,
          y: 590,
          pathD: "M 480 620 C 580 620, 640 590, 740 590",
          stage: "Intermediate",
          duration: "Days 31–75",
          skills: [
            "Client Carbon Travel Accounting",
            "Sustainable Supplier Vetting",
            "Impact Tourism Product Design",
          ],
          humanEdge: "Honesty about travel's climate impact that builds long-term client trust.",
          resources: [],
        },
        {
          id: "l2",
          title: "Head of Sustainability (Tourism)",
          x: 740,
          y: 650,
          pathD: "M 480 620 C 580 620, 640 650, 740 650",
          stage: "Leadership",
          duration: "Days 76–120+",
          skills: [
            "Regenerative Tourism Strategy",
            "Industry Sustainability Standards",
            "Policy Advocacy for Responsible Travel",
          ],
          humanEdge:
            "Industry courage to advocate for reduced volume where it exceeds destination carrying capacity.",
          resources: [],
        },
      ],
    },
  ],
} // END ROLE_BRANCHES

// ── Active BRANCHES (populated when role confirmed) ──
let BRANCHES = [] // set by selectRole() via ROLE_BRANCHES lookup

// ════ Role matching from CV upload and typed input — source lines 2024-2161 ════
function handleCVUpload(input) {
  const file = input.files[0]
  if (!file) return
  const display = document.getElementById("cvFileNameDisplay")
  display.textContent = "⏳ " + file.name
  display.classList.remove("hidden")

  const reader = new FileReader()
  reader.onload = function (e) {
    const text = (e.target.result || "").toLowerCase().substring(0, 6000)

    // Score all roles against CV text
    const cvScored = Object.entries(ROLE_DATA)
      .map(([id, r]) => {
        let sc = 0
        for (const kw of r.keywords) {
          if (text.includes(kw)) sc += 3
        }
        if (text.includes(r.name.toLowerCase())) sc += 10
        return { id, ...r, score: sc }
      })
      .sort((a, b) => b.score - a.score)

    const top3cv = cvScored.slice(0, 3)
    display.textContent = "✓ " + file.name

    // Set query label
    document.getElementById("s1-query-label").textContent = file.name + " (CV)"

    // Build match cards from CV results
    const container = document.getElementById("s1-match-cards")
    container.innerHTML = ""

    top3cv.forEach((r) => {
      const gradNum = parseInt((r.gradient || "0").replace("G", ""))
      const gradBadge =
        gradNum >= 4 ? "text-rose-400" : gradNum >= 3 ? "text-amber-400" : "text-yellow-300"
      const card = document.createElement("button")
      card.className =
        "w-full text-left flex items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/60 hover:bg-slate-800/50 hover:border-cyan-700 transition-all group"
      card.innerHTML = `
          <div>
            <div class="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">${r.name}</div>
            <div class="text-[10px] font-mono text-slate-400 mt-0.5">ISCO-${r.isco} · <span class="${gradBadge}">${r.gradient}</span> · μ=${r.mu}</div>
          </div>
          <i data-lucide="chevron-right" class="w-4 h-4 text-slate-600 group-hover:text-cyan-400 shrink-0 transition-colors"></i>`
      card.onclick = () => selectRole(r, true)
      container.appendChild(card)
    })

    // "My role isn't listed" option
    const notListed = document.createElement("button")
    notListed.className =
      "w-full text-left flex items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-800/40 bg-slate-950/30 hover:bg-slate-900/50 hover:border-amber-700 transition-all group mt-1"
    notListed.innerHTML = `
        <div>
          <div class="text-xs font-bold text-slate-400 group-hover:text-amber-300 transition-colors">My role isn't listed yet</div>
          <div class="text-[10px] text-slate-500 mt-0.5">Join the priority waitlist</div>
        </div>
        <i data-lucide="clock" class="w-4 h-4 text-slate-600 group-hover:text-amber-400 shrink-0 transition-colors"></i>`
    notListed.onclick = () =>
      selectRole(
        { id: "__coming_soon__", name: file.name, isco: "—", gradient: "—", mu: "—", score: 0 },
        false,
      )
    container.appendChild(notListed)

    document.getElementById("s1-input").classList.add("hidden")
    document.getElementById("s1-results").classList.remove("hidden")
    document.getElementById("s1-confirmed").classList.add("hidden")
    safeCreateIcons()
  }

  reader.onerror = function () {
    display.textContent = "✗ Could not read file — try typing your job title above"
  }

  // Read as text (works for .txt; PDF/Word get garbled but keywords still match)
  reader.readAsText(file)
}

function showS1Input() {
  document.getElementById("s1-input").classList.remove("hidden")
  document.getElementById("s1-results").classList.add("hidden")
  document.getElementById("s1-confirmed").classList.add("hidden")
  safeCreateIcons()
}

function showS1Results() {
  document.getElementById("s1-input").classList.add("hidden")
  document.getElementById("s1-results").classList.remove("hidden")
  document.getElementById("s1-confirmed").classList.add("hidden")
  safeCreateIcons()
}

function matchRoleFromInput() {
  const query = (document.getElementById("roleInput").value || "").trim().toLowerCase()
  if (!query) {
    document.getElementById("roleInput").focus()
    return
  }
  document.getElementById("s1-query-label").textContent = query

  // Score each role by keyword matches (ROLE_DATA is an object keyed by id)
  const scored = Object.entries(ROLE_DATA)
    .map(([id, r]) => {
      const role = { id, ...r }
      let score = 0
      for (const kw of role.keywords) {
        if (query.includes(kw) || kw.includes(query) || role.name.toLowerCase().includes(query))
          score += 2
        else if (
          kw
            .split(" ")
            .some((w) => query.includes(w) || query.split(" ").some((qw) => w.includes(qw)))
        )
          score += 1
      }
      if (role.name.toLowerCase().includes(query)) score += 5
      return { ...role, score }
    })
    .sort((a, b) => b.score - a.score)

  const top3 = scored.slice(0, 3)
  const container = document.getElementById("s1-match-cards")
  container.innerHTML = ""

  // Always show top 3 covered matches + an "Other / not listed" option
  top3.forEach((r) => {
    const gradNum = parseInt((r.gradient || "0").replace("G", ""))
    const gradBadge =
      gradNum >= 4 ? "text-rose-400" : gradNum >= 3 ? "text-amber-400" : "text-yellow-300"
    const card = document.createElement("button")
    card.className =
      "w-full text-left flex items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/60 hover:bg-slate-800/50 hover:border-cyan-700 transition-all group"
    card.innerHTML = `
        <div>
          <div class="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">${r.name}</div>
          <div class="text-[10px] font-mono text-slate-400 mt-0.5">ISCO-${r.isco} · <span class="${gradBadge}">${r.gradient}</span> · μ=${r.mu}</div>
        </div>
        <i data-lucide="chevron-right" class="w-4 h-4 text-slate-600 group-hover:text-cyan-400 shrink-0 transition-colors"></i>`
    card.onclick = () => selectRole(r, true)
    container.appendChild(card)
  })

  // "My role isn't listed" option
  const notListed = document.createElement("button")
  notListed.className =
    "w-full text-left flex items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-800/40 bg-slate-950/30 hover:bg-slate-900/50 hover:border-amber-700 transition-all group mt-1"
  notListed.innerHTML = `
      <div>
        <div class="text-xs font-bold text-slate-400 group-hover:text-amber-300 transition-colors">My role isn't listed yet</div>
        <div class="text-[10px] text-slate-500 mt-0.5">Join the priority waitlist</div>
      </div>
      <i data-lucide="clock" class="w-4 h-4 text-slate-600 group-hover:text-amber-400 shrink-0 transition-colors"></i>`
  notListed.onclick = () =>
    selectRole(
      {
        id: "__coming_soon__",
        name: document.getElementById("roleInput").value,
        isco: "—",
        gradient: "—",
        mu: "—",
        score: 0,
      },
      false,
    )
  container.appendChild(notListed)

  document.getElementById("s1-input").classList.add("hidden")
  document.getElementById("s1-results").classList.remove("hidden")
  document.getElementById("s1-confirmed").classList.add("hidden")
  safeCreateIcons()
}

// ════ selectRole: loads BRANCHES for the chosen role — source lines 2163-2190 ════
function selectRole(roleData, isCovered) {
  selectedRoleId = isCovered ? roleData.id : "__coming_soon__"
  selectedRoleData = roleData

  // Update confirmed badge
  document.getElementById("s1-confirmed-name").textContent = roleData.name
  document.getElementById("s1-confirmed-isco").textContent = isCovered
    ? `ISCO-${roleData.isco} · G${roleData.gradient}`
    : `Not yet in prototype`

  // Show/hide appropriate blocks
  document.getElementById("s1-gravity-block").classList.toggle("hidden", !isCovered)
  document.getElementById("s1-coming-soon").classList.toggle("hidden", isCovered)
  document.getElementById("s1-continue-wrap").classList.toggle("hidden", !isCovered)
  document.getElementById("s1-coming-soon-msg").classList.add("hidden")

  // Show confirmed layer
  document.getElementById("s1-input").classList.add("hidden")
  document.getElementById("s1-results").classList.add("hidden")
  document.getElementById("s1-confirmed").classList.remove("hidden")
  safeCreateIcons()

  // Pre-set BRANCHES so navigator is ready
  if (isCovered && ROLE_BRANCHES[selectedRoleId]) {
    BRANCHES = ROLE_BRANCHES[selectedRoleId]
    activeBranchId = BRANCHES[0].id
  }
}

// ════ Navigator state reset — source lines 2552-2560 ════
// Reset navigator state
activeBranchId = null
activeLeafId = null
selectedRoleId = "cs_rep"
selectedRoleData = null
emailCaptured = false
BRANCHES = []
// Reset panel1 to input layer
showS1Input()

// ════ switchTab (navigator entry) — source lines 2645-2661 ════
function switchTab(id) {
  document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"))
  document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active-tab"))
  document.getElementById("tab-panel-" + id).classList.add("active")
  document.getElementById("tab-" + id).classList.add("active-tab")
  if (id === "navigator") {
    setTimeout(() => {
      if (!activeBranchId && BRANCHES.length > 0) activeBranchId = BRANCHES[0].id
      renderSvgSplines(BRANCHES)
      renderSvgNodesAndLeaves(BRANCHES)
      initPanZoomGestures()
      safeCreateIcons()
    }, 50)
  }
}

// ── Gauge animation ──

// ════ Navigator SVG rendering, selection and inspection panel — source lines 2676-2923 ════
function renderSvgSplines(branches) {
  const container = document.getElementById("svgSplinesLayer")
  container.innerHTML = ""
  branches.forEach((b) => {
    const isActive = b.id === activeBranchId
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g")

    // Glow path
    const glow = document.createElementNS("http://www.w3.org/2000/svg", "path")
    glow.setAttribute("d", b.curvePoints)
    glow.setAttribute("fill", "none")
    glow.setAttribute("stroke", b.color)
    glow.setAttribute("stroke-width", isActive ? "10" : "5")
    glow.setAttribute("opacity", isActive ? "0.35" : "0.12")
    g.appendChild(glow)

    // Core path
    const core = document.createElementNS("http://www.w3.org/2000/svg", "path")
    core.setAttribute("d", b.curvePoints)
    core.setAttribute("fill", "none")
    core.setAttribute("stroke", b.color)
    core.setAttribute("stroke-width", isActive ? "3" : "1.8")
    core.setAttribute("opacity", isActive ? "0.95" : "0.3")
    core.setAttribute("stroke-linecap", "round")
    g.appendChild(core)

    // Energy pulse (active only)
    if (isActive) {
      const energy = document.createElementNS("http://www.w3.org/2000/svg", "path")
      energy.setAttribute("d", b.curvePoints)
      energy.setAttribute("fill", "none")
      energy.setAttribute("stroke", b.color)
      energy.setAttribute("stroke-width", "3.5")
      energy.setAttribute("opacity", "0.85")
      energy.setAttribute("class", "animate-energy-line")
      g.appendChild(energy)
      const spark = document.createElementNS("http://www.w3.org/2000/svg", "path")
      spark.setAttribute("d", b.curvePoints)
      spark.setAttribute("fill", "none")
      spark.setAttribute("stroke", "#ffffff")
      spark.setAttribute("stroke-width", "1.5")
      spark.setAttribute("opacity", "0.6")
      spark.setAttribute("class", "animate-energy-spark")
      g.appendChild(spark)
    }

    // Leaf paths
    b.leaves.forEach((leaf) => {
      const isLeafActive = isActive && activeLeafId === leaf.id
      const leafGlow = document.createElementNS("http://www.w3.org/2000/svg", "path")
      leafGlow.setAttribute("d", leaf.pathD)
      leafGlow.setAttribute("fill", "none")
      leafGlow.setAttribute("stroke", b.color)
      leafGlow.setAttribute("stroke-width", isLeafActive ? "6" : isActive ? "3.5" : "2")
      leafGlow.setAttribute("opacity", isLeafActive ? "0.6" : isActive ? "0.3" : "0.15")
      g.appendChild(leafGlow)

      const leafCore = document.createElementNS("http://www.w3.org/2000/svg", "path")
      leafCore.setAttribute("d", leaf.pathD)
      leafCore.setAttribute("fill", "none")
      leafCore.setAttribute("stroke", b.color)
      leafCore.setAttribute("stroke-width", isLeafActive ? "2.5" : isActive ? "2" : "1.2")
      leafCore.setAttribute("opacity", isLeafActive ? "1" : isActive ? "0.75" : "0.35")
      leafCore.setAttribute("stroke-linecap", "round")
      g.appendChild(leafCore)

      if (isActive) {
        const leafEnergy = document.createElementNS("http://www.w3.org/2000/svg", "path")
        leafEnergy.setAttribute("d", leaf.pathD)
        leafEnergy.setAttribute("fill", "none")
        leafEnergy.setAttribute("stroke", b.color)
        leafEnergy.setAttribute("stroke-width", "2.5")
        leafEnergy.setAttribute("opacity", "0.8")
        leafEnergy.setAttribute("class", "animate-energy-line")
        g.appendChild(leafEnergy)
        const leafSpark = document.createElementNS("http://www.w3.org/2000/svg", "path")
        leafSpark.setAttribute("d", leaf.pathD)
        leafSpark.setAttribute("fill", "none")
        leafSpark.setAttribute("stroke", "#ffffff")
        leafSpark.setAttribute("stroke-width", "1.2")
        leafSpark.setAttribute("opacity", "0.5")
        leafSpark.setAttribute("class", "animate-energy-spark")
        g.appendChild(leafSpark)
      }
    })
    container.appendChild(g)
  })
}

// ── SVG Renderer: Nodes & Leaves ──
function renderSvgNodesAndLeaves(branches) {
  const container = document.getElementById("svgNodesLayer")
  container.innerHTML = ""

  branches.forEach((b) => {
    const isActive = b.id === activeBranchId
    const midG = document.createElementNS("http://www.w3.org/2000/svg", "g")
    midG.setAttribute("class", "cursor-pointer")
    midG.onclick = (e) => {
      e.stopPropagation()
      activeBranchId = b.id
      activeLeafId = null
      refreshNavigator()
    }

    const x = b.midX,
      y = b.midY
    const isSelected = isActive && !activeLeafId

    if (isSelected) {
      const pulse = document.createElementNS("http://www.w3.org/2000/svg", "circle")
      pulse.setAttribute("cx", x)
      pulse.setAttribute("cy", y)
      pulse.setAttribute("r", "56")
      pulse.setAttribute("fill", b.color)
      pulse.setAttribute("opacity", "0.2")
      pulse.setAttribute("class", "animate-pulse")
      midG.appendChild(pulse)
    }

    const scale = isSelected ? 1.25 : 1.05
    const hex = document.createElementNS("http://www.w3.org/2000/svg", "polygon")
    const pts = [
      `${x},${y - 36 * scale}`,
      `${x + 32 * scale},${y - 18 * scale}`,
      `${x + 32 * scale},${y + 18 * scale}`,
      `${x},${y + 36 * scale}`,
      `${x - 32 * scale},${y + 18 * scale}`,
      `${x - 32 * scale},${y - 18 * scale}`,
    ].join(" ")
    hex.setAttribute("points", pts)
    hex.setAttribute("fill", "#090d16")
    hex.setAttribute("stroke", isSelected ? "#ffffff" : b.color)
    hex.setAttribute("stroke-width", isSelected ? "3" : "1.8")
    hex.setAttribute("style", `filter:drop-shadow(0 0 ${isSelected ? "14px" : "5px"} ${b.color})`)
    midG.appendChild(hex)

    const lbl = document.createElementNS("http://www.w3.org/2000/svg", "text")
    lbl.setAttribute("x", x)
    lbl.setAttribute("y", y + 4)
    lbl.setAttribute("fill", isSelected ? "#ffffff" : b.color)
    lbl.setAttribute("font-size", "11")
    lbl.setAttribute("font-family", "monospace")
    lbl.setAttribute("font-weight", "bold")
    lbl.setAttribute("text-anchor", "middle")
    const WL_NAMES = {
      "#00f2fe": "AUTOMATE",
      "#b000ff": "HYBRID",
      "#f59e0b": "PIVOT",
      "#f72585": "CREATE",
    }
    lbl.textContent = WL_NAMES[b.color] || "EXPLORE"
    midG.appendChild(lbl)

    const hdg = document.createElementNS("http://www.w3.org/2000/svg", "text")
    hdg.setAttribute("x", x)
    hdg.setAttribute("y", y - 48)
    hdg.setAttribute("fill", isSelected ? "#ffffff" : "#94a3b8")
    hdg.setAttribute("font-size", "11")
    hdg.setAttribute("font-family", "Inter,sans-serif")
    hdg.setAttribute("font-weight", "bold")
    hdg.setAttribute("text-anchor", "middle")
    hdg.textContent = b.midTitle
    midG.appendChild(hdg)

    b.midSkills.forEach((sk, si) => {
      const st = document.createElementNS("http://www.w3.org/2000/svg", "text")
      st.setAttribute("x", x)
      st.setAttribute("y", y + 54 + si * 14)
      st.setAttribute("fill", isActive ? "#cbd5e1" : "#64748b")
      st.setAttribute("font-size", "9")
      st.setAttribute("font-family", "monospace")
      st.setAttribute("text-anchor", "middle")
      st.textContent = "• " + sk
      midG.appendChild(st)
    })
    container.appendChild(midG)

    // Leaf nodes
    b.leaves.forEach((leaf) => {
      const isLeafActive = isActive && activeLeafId === leaf.id
      const leafG = document.createElementNS("http://www.w3.org/2000/svg", "g")
      leafG.setAttribute("class", "cursor-pointer")
      leafG.onclick = (e) => {
        e.stopPropagation()
        activeBranchId = b.id
        activeLeafId = leaf.id
        refreshNavigator()
      }

      const lx = leaf.x,
        ly = leaf.y
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
      rect.setAttribute("x", lx)
      rect.setAttribute("y", ly - 16)
      rect.setAttribute("width", "220")
      rect.setAttribute("height", "32")
      rect.setAttribute("rx", "12")
      rect.setAttribute("fill", isLeafActive ? "#0f172a" : "#090d16")
      rect.setAttribute("stroke", isLeafActive ? "#ffffff" : b.color)
      rect.setAttribute("stroke-width", isLeafActive ? "2.5" : "1.2")
      rect.setAttribute(
        "style",
        `filter:drop-shadow(0 0 ${isLeafActive ? "10px" : "4px"} ${b.color})`,
      )
      leafG.appendChild(rect)

      const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle")
      dot.setAttribute("cx", lx + 16)
      dot.setAttribute("cy", ly)
      dot.setAttribute("r", isLeafActive ? "6" : "4.5")
      dot.setAttribute("fill", isLeafActive ? "#ffffff" : b.color)
      leafG.appendChild(dot)

      const ltxt = document.createElementNS("http://www.w3.org/2000/svg", "text")
      ltxt.setAttribute("x", lx + 30)
      ltxt.setAttribute("y", ly + 4)
      ltxt.setAttribute("fill", isLeafActive ? "#ffffff" : "#cbd5e1")
      ltxt.setAttribute("font-size", "10.5")
      ltxt.setAttribute("font-family", "Inter,sans-serif")
      ltxt.setAttribute("font-weight", isLeafActive ? "bold" : "600")
      ltxt.textContent = leaf.title
      leafG.appendChild(ltxt)

      container.appendChild(leafG)
    })
  })
}

function refreshNavigator() {
  renderSvgSplines(BRANCHES)
  renderSvgNodesAndLeaves(BRANCHES)
  updateInspectionPanel()
  safeCreateIcons()
}

function handleOriginClick() {
  activeBranchId = null
  activeLeafId = null
  refreshNavigator()
}

// ── Inspection Panel ──
function updateInspectionPanel() {
  // Show/hide synthesis panel based on active branch
  const synthPanel = document.getElementById("synthActionsPanel")
  const synthOutput = document.getElementById("synthOutputPanel")
  if (synthPanel) synthPanel.classList.toggle("hidden", !activeBranchId)
  if (synthOutput && !activeBranchId) synthOutput.classList.add("hidden")
  if (!activeBranchId) return
  const branch = BRANCHES.find((b) => b.id === activeBranchId)
  if (!branch) return
  let data = branch.foundation
  if (activeLeafId) {
    const leaf = branch.leaves.find((l) => l.id === activeLeafId)
    if (leaf) data = { ...branch.foundation, ...leaf }
  }
  document.getElementById("inspectStageBadge").textContent = data.stage || "Stage 01: Foundation"
  document.getElementById("inspectLevelBadge").textContent = data.level || "Target Role"
  document.getElementById("inspectDuration").textContent = data.duration || "Days 1–30"
  document.getElementById("inspectTitle").textContent = data.title
  document.getElementById("inspectDesc").textContent = data.description
  document.getElementById("inspectHumanEdge").textContent = data.humanEdge || "—"

  const sc = document.getElementById("inspectSkills")
  sc.innerHTML = ""
  ;(data.skills || []).forEach((s) => {
    const sp = document.createElement("span")
    sp.className =
      "text-xs font-mono bg-slate-900 border border-slate-700/80 text-cyan-300 px-2.5 py-1 rounded-lg"
    sp.textContent = s
    sc.appendChild(sp)
  })

  const rc = document.getElementById("inspectResources")
  const resources =
    data.resources && data.resources.length ? data.resources : branch.foundation.resources
  rc.innerHTML = ""
  if (!resources || !resources.length) {
    rc.innerHTML =
      '<div class="p-2.5 rounded-xl border border-slate-800 bg-slate-950/50 text-[11px] text-slate-500">Resources available at Foundation station</div>'
    return
  }
  resources.forEach((res) => {
    const a = document.createElement("a")
    a.href = res.link
    a.target = "_blank"
    a.rel = "noopener noreferrer"
    a.className =
      "group block p-2.5 rounded-xl border border-slate-800 bg-[#060911]/80 hover:bg-slate-800/60 hover:border-slate-700 transition-all"
    a.innerHTML = `<div class="flex items-center justify-between mb-1">
        <span class="text-[10px] font-mono px-2 py-0.5 rounded font-bold ${res.type === "free" ? "bg-emerald-950/90 text-emerald-300 border border-emerald-800" : "bg-purple-950/90 text-purple-300 border border-purple-800"}">${res.badge}</span>
        <span class="text-[10px] text-slate-400 font-mono group-hover:text-cyan-400">${res.platform}</span>
      </div>
      <div class="text-xs font-semibold text-slate-200 group-hover:text-white">${res.title}</div>`
    rc.appendChild(a)
  })
}

// ── Pan/Zoom ──

// ════ Canvas pan/zoom/minimap — source lines 2924-3018 ════
function initPanZoomGestures() {
  const container = document.getElementById("viewportContainer")
  const svg = document.getElementById("multiverseSvg")
  if (!container || !svg) return

  container.onmousedown = (e) => {
    if (e.target.closest("button") || e.target.closest("#minimapStage")) return
    isDragging = true
    dragStartX = e.clientX - panX
    dragStartY = e.clientY - panY
  }
  window.onmousemove = (e) => {
    if (!isDragging) return
    panX = e.clientX - dragStartX
    panY = e.clientY - dragStartY
    applyTransform()
  }
  window.onmouseup = () => {
    isDragging = false
  }

  container.onwheel = (e) => {
    e.preventDefault()
    zoomLevel = Math.min(Math.max(0.3, zoomLevel + (e.deltaY > 0 ? -0.08 : 0.08)), 2.5)
    document.getElementById("zoomLevelDisplay").textContent = Math.round(zoomLevel * 100) + "%"
    applyTransform()
  }

  container.ontouchstart = (e) => {
    if (e.touches.length === 1) {
      isDragging = true
      dragStartX = e.touches[0].clientX - panX
      dragStartY = e.touches[0].clientY - panY
    } else if (e.touches.length === 2) {
      isDragging = true
      dragStartX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - panX
      dragStartY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - panY
      initialPinchDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      )
      initialZoom = zoomLevel
    }
  }
  container.ontouchmove = (e) => {
    if (e.touches.length === 1 && isDragging) {
      e.preventDefault()
      panX = e.touches[0].clientX - dragStartX
      panY = e.touches[0].clientY - dragStartY
      applyTransform()
    } else if (e.touches.length === 2 && initialPinchDistance) {
      e.preventDefault()
      panX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - dragStartX
      panY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - dragStartY
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      )
      zoomLevel = Math.min(Math.max(0.3, initialZoom * (d / initialPinchDistance)), 2.5)
      document.getElementById("zoomLevelDisplay").textContent = Math.round(zoomLevel * 100) + "%"
      applyTransform()
    }
  }
  container.ontouchend = () => {
    isDragging = false
    initialPinchDistance = null
  }

  const mini = document.getElementById("minimapStage")
  if (mini) {
    mini.onclick = (e) => {
      const rect = mini.getBoundingClientRect()
      const fx = (e.clientX - rect.left) / rect.width,
        fy = (e.clientY - rect.top) / rect.height
      const tx = fx * 1300,
        ty = fy * 760
      const vw = container.clientWidth,
        vh = container.clientHeight
      panX = vw / 2 - tx * zoomLevel
      panY = vh / 2 - ty * zoomLevel
      applyTransform()
    }
  }
  applyTransform()
}

function applyTransform() {
  const svg = document.getElementById("multiverseSvg")
  if (svg) svg.style.transform = `translate(${panX}px,${panY}px) scale(${zoomLevel})`
  updateMinimap()
}

function updateMinimap() {
  const container = document.getElementById("viewportContainer")
  const rect = document.getElementById("minimapViewportRect")
  const stage = document.getElementById("minimapStage")
  if (!container || !rect || !stage) return
  const mw = stage.clientWidth,
    mh = stage.clientHeight
  const sx = mw / 1300,
    sy = mh / 760
  const vw = container.clientWidth / zoomLevel,
    vh = container.clientHeight / zoomLevel
  const vx = -panX / zoomLevel,
    vy = -panY / zoomLevel
  rect.style.left = Math.max(0, vx * sx) + "px"
  rect.style.top = Math.max(0, vy * sy) + "px"
  rect.style.width = Math.min(mw, vw * sx) + "px"
  rect.style.height = Math.min(mh, vh * sy) + "px"
}

function zoomCanvas(delta) {
  zoomLevel = Math.min(Math.max(0.3, zoomLevel + delta), 2.5)
  document.getElementById("zoomLevelDisplay").textContent = Math.round(zoomLevel * 100) + "%"
  applyTransform()
}

function resetCanvasTransform() {
  zoomLevel = 0.95
  panX = -20
  panY = -30
  document.getElementById("zoomLevelDisplay").textContent = "95%"
  applyTransform()
}

// ── Synthesis Functions ──
// synthesizeTimeline redirects to unified function for backward compat

// ════ Lumi chat answers explaining the four worldlines — source lines 3266-3282 ════
if (t.match(/score|automation|ilo|exposure|gradient|g1|g2|g3|g4|band/))
  return "Your automation exposure score comes from ILO Working Paper 140 (May 2025), calibrated specifically for JAPAC markets. It's a 0–100 scale. Your gradient band (G1–G4) shows where you sit relative to all 27 roles in the dataset. Higher score means more urgent to adapt — but 'exposure' doesn't mean 'replacement'."
if (t.match(/worldline|automate|hybrid|pivot|create|branch|path|strategy/))
  return "The four worldlines are your adaptation strategies. AUTOMATE — master AI tools in your current domain and become the person who deploys them. HYBRID — blend your existing expertise with AI assistance. PIVOT — shift into an adjacent role where your skills transfer. CREATE — move into roles that generate new value AI can't replicate. The Navigator tab shows all four."
if (t.match(/activity|tracker|checklist|habit|streak|reminder|daily/))
  return "The Activity Tracker is coming in the production release. Once your Flightplan exists, it turns the daily tasks into check-ins and tracks your streak. You can see the locked tab in the tab bar — that's where it'll live. The goal is to make sure the plan doesn't just sit in a folder."
if (t.match(/lumi|who are you|what are you|your name|about you/))
  return "I'm LUMI-01, a Voxian AI companion. In this demo I'm running on scripted responses — the production version will be powered by Gemini with full access to your profile, score, and progress history. I'll be able to answer nuanced career questions and track your journey over time."
if (t.match(/skill|learn|course|resource|study|training|certificate/))
  return "Skills to build depend on your worldline. The Navigator tab has a resource stack per phase — free and paid options. In your Flightplan (coming soon), I'll generate a personalised stack based on your CV keywords and the specific gap between your current position and what the worldline requires."
if (t.match(/cv|resume|upload|document|file/))
  return "You can upload your CV from the onboarding screen — use the 'Upload your CV instead' button. The demo does a keyword match to suggest your top 3 role fits. The production engine will use a Gemini-powered NLP pipeline to extract skills, experience depth, and transferable competencies."
if (t.match(/navigator|tab|curve|meter|methodology|proof/))
  return "The four tabs each tell part of your story. The Meter shows your automation exposure and skill profile. The Curve shows your percentile within the JAPAC occupational landscape. The Navigator shows your four worldline adaptation paths. Methodology & Proof shows the data sources and scoring model behind the numbers."
if (t.match(/hello|hi |hey |good morning|good night|^hi$|^hey$/))
  return "Hi! I'm LUMI-01. Ask me about your automation score, your worldline options, what the Flightplan will include, or what the Activity Tracker is going to do. I'm here to help you navigate."
return "I'm still in beta, so my answers are limited to what I've been briefed on for this prototype. Try asking about your score, your worldline options, the flightplan, the activity tracker, or any of the four tabs — those are my specialties right now."
