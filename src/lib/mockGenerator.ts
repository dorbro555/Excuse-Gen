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
        `Due to an urgent, unforeseen conflict concerning ${scenario}, I am regrettably unable to fulfill my obligations to ${target} at this scheduled hour. I am actively resolving the matter with all due diligence and will provide an updated status report shortly.`,
      (target, scenario) =>
        `An acute logistical complication has arisen regarding ${scenario}. In order to prevent further scheduling discrepancies for ${target}, I must respectfully defer our engagement and handle this matter immediately.`,
      (target, scenario) =>
        `Please accept this formal notification regarding ${scenario}. A time-sensitive contingency requiring my direct oversight has presented itself, precluding my participation alongside ${target} today.`
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
        `A catastrophe of unspeakable gravity has struck my morning regarding ${scenario}: the fabric of my composure has surrendered entirely to entropy, rendering my presence before ${target} a tragic and legal impossibility.`,
      (target, scenario) =>
        `Fate, in her cruelest and most theatrical design, has decreed that ${scenario} shall demand my complete and utter surrender. I cast myself at the mercy of ${target} as the storm of misfortune gathers.`,
      (target, scenario) =>
        `A profound melancholia and tempestuous chaos has enveloped my affairs concerning ${scenario}. My apothecary and my soul demand total seclusion, lest ${target} be burdened by my ill-starred presence.`
    ],
    signOffs: [
      "With profound and tragic remorse,",
      "From the depths of involuntary despair,",
      "Yours in irrevocable sorrow,"
    ]
  },

  "Techno-Babble": {
    excuses: [
      (target, scenario) =>
        `A critical desynchronization event occurred in my primary localized neural bus during execution of ${scenario}. To prevent total firmware corruption and cascading memory leaks affecting ${target}, all outbound routing is temporarily quarantined.`,
      (target, scenario) =>
        `An undocumented kernel panic during ${scenario} triggered an unhandled exception in my terrestrial navigation stack. System telemetry indicates an immediate hard reset is required before reconnecting with ${target}.`,
      (target, scenario) =>
        `My quantum key exchange regarding ${scenario} failed handshake protocols due to elevated atmospheric packet loss. Safety protocols require immediate isolation until handshake verification with ${target} can resume.`
    ],
    signOffs: [
      "Signal Terminated [Error 0xDEADBEEF],",
      "Awaiting Core Re-initialization,",
      "Subroutine paused pending memory dump,"
    ]
  },

  "Absolute Absurdity": {
    excuses: [
      (target, scenario) =>
        `A council of municipal swans has established an unauthorized maritime sovereignty across my driveway during ${scenario}, and regional bylaws strictly forbid me from negotiating terms with waterfowl before dusk. I trust ${target} will understand the diplomatic delicacy.`,
      (target, scenario) =>
        `While preparing for ${scenario}, I became involuntarily entangled in an unlicensed localized time dilation pocket. From my perspective, four days have passed while ${target} was waiting forty minutes.`,
      (target, scenario) =>
        `A troupe of aggressive street mimes has encircled my vehicle regarding ${scenario} and constructed an impenetrable, invisible glass fortress around my perimeter. I cannot disappoint ${target} without breaching mime protocol.`
    ],
    signOffs: [
      "Held hostage by circumstance,",
      "Transmitted via carrier pigeon,",
      "Under solemn oath of strange happenings,"
    ]
  }
};

/**
 * Simulates AI generation via OpenRouter with artificial delay for realistic feel
 */
export async function generateMockExcuse(payload: GenerateExcusePayload): Promise<ExcuseRecord> {
  // Simulate AI delay between 500ms and 800ms
  const simulatedDelay = Math.floor(Math.random() * 300) + 500;
  await new Promise((resolve) => setTimeout(resolve, simulatedDelay));

  const target = payload.target?.trim() || "all concerned parties";
  const scenario = payload.scenario?.trim() || "an unannounced obligation";
  const tone = payload.tone?.trim() || "Plausible & Professional";

  const pool = templatesByTone[tone] || templatesByTone["Plausible & Professional"];
  const randomExcuseFn = pool.excuses[Math.floor(Math.random() * pool.excuses.length)];
  const randomSignOff = pool.signOffs[Math.floor(Math.random() * pool.signOffs.length)];

  const excuse = randomExcuseFn(target, scenario);
  const id = nanoid(8); // 8-character unique clean id

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
