/**
 * IGRIS Business Pulse — recommendation engine.
 *
 * Pure logic, no DOM. Takes a completed survey response and returns
 * one relevant next-step recommendation, or null if nothing fits
 * confidently. Kept separate from how it's rendered (thank-you.html)
 * so the mapping is easy to revise without touching markup.
 *
 * Real IGRIS Tech URLs only — no invented pages.
 */

const IGRIS_BASE = "https://igris-tech.vercel.app";

const RECOMMENDATIONS = {
  web: {
    eyebrow: "You mentioned customer acquisition.",
    body: "A stronger digital presence might help. IGRIS Technologies builds modern websites and digital experiences around the actual goals of a business.",
    cta: "Explore Web Development",
    href: `${IGRIS_BASE}/services/web-development`,
  },
  software: {
    eyebrow: "You mentioned order management.",
    body: "Your workflow might be ready for a better system. IGRIS builds custom software designed around how businesses actually operate.",
    cta: "Explore Custom Software",
    href: `${IGRIS_BASE}/services/software-development`,
  },
  automation: {
    eyebrow: "You mentioned repetitive manual work.",
    body: "Some processes shouldn't need your attention every day. IGRIS builds automation systems that reduce repetitive operational work.",
    cta: "Explore Automation",
    href: `${IGRIS_BASE}/services/automation`,
  },
  ai: {
    eyebrow: "You mentioned wanting smarter tools.",
    body: "AI should solve a real problem — not just look impressive. IGRIS builds practical AI solutions around real workflows.",
    cta: "Explore AI Solutions",
    href: `${IGRIS_BASE}/services/ai-solutions`,
  },
  systems: {
    eyebrow: "Your answers point to a broader operational problem.",
    body: "You may need a system, not another tool. IGRIS Technologies builds custom digital systems around the way a business actually works.",
    cta: "Start a Conversation",
    href: `${IGRIS_BASE}/contact`,
  },
};

// Maps a biggestChallenge / timeConsumingTask answer to a service category.
const CHALLENGE_TO_CATEGORY = {
  "Getting new customers": "web",
  "Marketing": "web",
  "Managing existing customers": "web",
  "Managing orders": "software",
  "Tracking payments": "software",
  "Keeping records": "software",
  "Inventory": "software",
  "Deliveries / logistics": "automation",
  "Time-consuming manual work": "automation",
  "Staff / team management": "automation",
  "Order taking": "software",
  "Following up with customers": "web",
  "Bookkeeping": "software",
  "Restocking / inventory checks": "software",
  "Delivery coordination": "automation",
  "Payment reconciliation": "software",
  "Marketing content": "web",
  "Staff scheduling": "automation",
};

function _mentionsAI(text) {
  if (!text) return false;
  return /\bai\b|artificial intelligence|smart(er)? tool|chatbot/i.test(text);
}

/**
 * Returns { eyebrow, body, cta, href } for the given response, or null.
 */
function getRecommendation(answers) {
  if (!answers) return null;

  // Explicit AI interest in their own words takes priority.
  if (_mentionsAI(answers.desiredImprovement)) {
    return RECOMMENDATIONS.ai;
  }

  const challengeCategory = CHALLENGE_TO_CATEGORY[answers.biggestChallenge];
  const timeCategory = CHALLENGE_TO_CATEGORY[answers.timeConsumingTask];

  // Two different real operational problems -> broader "systems" framing.
  if (challengeCategory && timeCategory && challengeCategory !== timeCategory) {
    return RECOMMENDATIONS.systems;
  }

  const category = challengeCategory || timeCategory;
  if (category && RECOMMENDATIONS[category]) {
    return RECOMMENDATIONS[category];
  }

  return null;
}
