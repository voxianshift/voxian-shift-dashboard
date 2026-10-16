// Illustrative prototype estimates, not O*NET exposure ratings.
export const demoBaselines = {
  "customer-support": {
    code: "43-4051.00",
    tasks: [
      { name: "Standard FAQ & billing inquiries", exposure: 0.95, weight: 0.45, moat: false },
      { name: "Ticket categorisation & CRM routing", exposure: 0.85, weight: 0.3, moat: false },
      { name: "Dispute de-escalation & churn retention", exposure: 0.2, weight: 0.15, moat: true },
      { name: "Cross-team engineering diplomacy", exposure: 0.35, weight: 0.1, moat: true },
    ],
    escalationWeights: [0.15, 0.15, 0.45, 0.25],
  },
  "administrative-assistant": {
    code: "43-6011.00",
    tasks: [
      { name: "Calendar, travel & meeting coordination", exposure: 0.9, weight: 0.4, moat: false },
      { name: "Drafting correspondence & meeting notes", exposure: 0.85, weight: 0.3, moat: false },
      { name: "Confidential stakeholder communication", exposure: 0.2, weight: 0.2, moat: true },
      {
        name: "Executive priorities & sensitive decisions",
        exposure: 0.27,
        weight: 0.1,
        moat: true,
      },
    ],
    escalationWeights: [0.15, 0.15, 0.4, 0.3],
  },
} as const
