export const QUESTIONS = [
  {
    id: "businessType",
    type: "single",
    prompt: "What type of business do you operate?",
    options: [
      "Retail", "Food & hospitality", "Fashion", "Professional services",
      "Manufacturing", "Beauty & personal care", "Education",
      "Logistics", "Technology", "Other",
    ],
  },
  {
    id: "customerChannels",
    type: "single",
    prompt: "How do most of your customers currently find you?",
    options: [
      "WhatsApp", "Instagram", "Facebook", "TikTok", "Physical location",
      "Referrals", "Website", "Google / Search", "Marketplace", "Other",
    ],
  },
  {
    id: "biggestChallenge",
    type: "single",
    prompt: "What is currently your biggest challenge?",
    options: [
      "Getting new customers", "Managing existing customers", "Managing orders",
      "Tracking payments", "Keeping records", "Marketing",
      "Deliveries / logistics", "Inventory", "Staff / team management",
      "Time-consuming manual work", "Other",
    ],
  },
  {
    id: "timeConsumingTask",
    type: "single",
    prompt: "What part of running your business takes more time than it should?",
    options: [
      "Order taking", "Following up with customers", "Bookkeeping",
      "Restocking / inventory checks", "Delivery coordination",
      "Payment reconciliation", "Marketing content", "Staff scheduling", "Other",
    ],
  },
  {
    id: "orderManagement",
    type: "single",
    prompt: "How do you currently receive and manage customer orders?",
    options: [
      "WhatsApp", "Phone calls", "Instagram DMs", "Physical store", "Website",
      "Spreadsheet", "Notebook / paper", "Multiple methods", "Other",
    ],
  },
  {
    id: "paymentTracking",
    type: "single",
    prompt: "How do you currently track payments, sales, or business records?",
    options: [
      "Notebook / paper", "Spreadsheet", "POS system", "Bank app only",
      "Accounting software", "I don't track this consistently", "Other",
    ],
  },
  {
    id: "technologyUsed",
    type: "single",
    prompt: "What technology do you currently use to run your business?",
    options: [
      "WhatsApp Business", "Instagram / Facebook", "POS system",
      "A website", "Spreadsheets", "Accounting software", "None of the above", "Other",
    ],
  },
  {
    id: "digitalBarriers",
    type: "single",
    prompt: "What is the biggest thing stopping you from using better digital tools?",
    options: [
      "Cost", "Lack of knowledge", "Internet / data", "Electricity",
      "Don't know what tool to use", "Existing tools are complicated",
      "No need yet", "Lack of trust", "Other",
    ],
  },
  {
    id: "desiredImprovement",
    type: "text",
    prompt: "If you could make ONE part of running your business easier with technology, what would you choose?",
    placeholder: "Type your answer…",
  },
  {
    id: "contactPermission",
    type: "yesno",
    prompt: "Would you like to hear about future research, tools, or solutions from IGRIS Technologies?",
    followUp: {
      id: "contact",
      label: "Email or phone / WhatsApp (optional)",
      placeholder: "you@business.com or WhatsApp number",
    },
  },
];
