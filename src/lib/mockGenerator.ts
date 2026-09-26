import { nanoid } from 'nanoid';
import type { ExcuseRecord, GenerateExcusePayload } from './types';

interface TemplatePool {
  excuses: ((target: string, scenario: string) => string)[];
  signOffs: string[];
}

const templatesByTone: Record<string, TemplatePool> = {
  "Plausible & Professional": {
    excuses: [
      (target, scenario) =>
        `Due to an urgent, unforeseen operational conflict concerning ${scenario}, I am regrettably unable to fulfill my commitments to ${target} at this scheduled hour. I am actively resolving the matter with all due diligence and will provide an updated status report shortly.`,
      (target, scenario) =>
        `An acute logistical complication has arisen regarding ${scenario}. In order to prevent further scheduling discrepancies for ${target}, I must respectfully defer our engagement and handle this matter immediately.`,
      (target, scenario) =>
        `Please accept this formal notification regarding ${scenario}. A time-sensitive contingency requiring my direct executive oversight has presented itself, precluding my participation alongside ${target} today.`
    ],
    signOffs: [
      "With sincere professional regards,",
      "Respectfully submitted,",
      "With apologies for this administrative disruption,"
    ]
  },

  "Overly Dramatic": {
    excuses: [
      (target, scenario) =>
        `The universe has conspired to deliver an emotional calamity regarding ${scenario}, and I am currently weeping onto the cold tiles of my hallway in total, inconsolable grief. I cannot in good conscience inflict the shattered wreckage of my composure upon ${target} today!`,
      (target, scenario) =>
        `Cruel, merciless fate has struck down my morning concerning ${scenario}, tearing my plans to shreds and leaving me gasping for air on my living room rug. I cast myself at the mercy of ${target} as the dark clouds of misfortune consume me!`,
      (target, scenario) =>
        `A disaster of Shakespearean proportions has completely obliterated my ability to deal with ${scenario}. My tears are flowing, my spirit is broken, and I must beg ${target} for forgiveness from the absolute bottom of my despairing heart!`
    ],
    signOffs: [
      "Your broken, breathless, and eternally apologetic servant,",
      "Weeping from the floor in despair,",
      "Yours in tragic ruin,"
    ]
  },

  "Techno-Babble": {
    excuses: [
      (target, scenario) =>
        `A critical race condition triggered a cascading SIGSEGV in my local hypervisor while executing ${scenario}. All telemetry uplinks to ${target} have entered an unrecoverable deadlock pending a full memory dump.`,
      (target, scenario) =>
        `An unexpected cosmic-ray bit-flip in my L3 cache corrupted the pod reconciliation loop for ${scenario}. To prevent unhandled microservice outages affecting ${target}, I have initiated an emergency failover routine.`,
      (target, scenario) =>
        `My primary neural bus suffered an unhandled kernel panic during ${scenario}, causing widespread network fragmentation. Protocol requires an immediate air-gapped isolation cycle before I can safely reconnect with ${target}.`
    ],
    signOffs: [
      "Deploying emergency hotfix to reality, /dev/null",
      "SIGKILL issued to process,",
      "Subroutine terminated [Exit code 0xDEADBEEF],"
    ]
  },

  "Absolute Absurdity": {
    excuses: [
      (target, scenario) =>
        `A coalition of rogue raccoon ambassadors has officially declared my living room international waters while I was preparing for ${scenario}. I am currently stranded on the couch negotiating a maritime ceasefire with their tiny leader using a leftover cinnamon roll, so I cannot reach ${target} today.`,
      (target, scenario) =>
        `While en route for ${scenario}, I became involuntarily trapped in a localized temporal anomaly where forty minutes outside felt like four agonizing weeks indoors. I trust ${target} will respect the cosmic delicacy of my situation.`,
      (target, scenario) =>
        `A silent battalion of aggressive street mimes surrounded my front porch regarding ${scenario} and erected an invisible, soundproof plexiglass dome over my entire property. Reaching ${target} would directly violate inter-dimensional mime treaties.`
    ],
    signOffs: [
      "Regretfully adrift, The Admiral of the Couch,",
      "Held hostage by circumstance,",
      "Negotiating terms under duress,"
    ]
  }
};

/**
 * Simulates AI generation via OpenRouter/fallback with artificial delay for realistic feel
 */
export async function generateMockExcuse(payload: GenerateExcusePayload): Promise<ExcuseRecord> {
  const simulatedDelay = Math.floor(Math.random() * 300) + 400;
  await new Promise((resolve) => setTimeout(resolve, simulatedDelay));

  const target = payload.target?.trim() || "all concerned parties";
  const scenario = payload.scenario?.trim() || "an unannounced obligation";
  const tone = payload.tone?.trim() || "Plausible & Professional";

  const pool = templatesByTone[tone] || templatesByTone["Plausible & Professional"];
  const randomExcuseFn = pool.excuses[Math.floor(Math.random() * pool.excuses.length)];
  const randomSignOff = pool.signOffs[Math.floor(Math.random() * pool.signOffs.length)];

  const excuse = randomExcuseFn(target, scenario);
  const id = nanoid(8);

  const dateIssued = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());

  return {
    id,
    target,
    scenario,
    tone,
    excuse,
    signOff: randomSignOff,
    dateIssued,
    createdAt: new Date().toISOString()
  };
}
