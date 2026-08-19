import shadowWorkData from '../data/shadowWorkThemes.json';
import { getZodiacSign } from './astrologyService';
import { getRetrogradeStatus } from '../utils/celestialCalc';
import { calculateKarmicLessonNumbers } from './numerologyService';

const { themes, integrationPrompts, depths } = shadowWorkData;

export const DEFAULT_DEPTH = 1;
export const getDepths = () => depths;
export const getDepth = level => depths.find(d => d.level === level) ?? depths[0];

const themeForPlanet = (planet) => themes.find(t => t.planet === planet) ?? null;
const themeForSign = (signName) => themes.find(t => t.signs.includes(signName)) ?? null;
const themeForKarmicLesson = (numbers) => themes.find(t => numbers.includes(t.karmicLesson)) ?? null;

// Priority: a transit actively touching the user's own Sun sign right now > a
// karmic lesson from their name > their Sun sign's ruler with no active transit
// > random, for visitors who haven't entered a birthdate or name yet.
export function chooseShadowTheme({ birthdate, name } = {}) {
  const sign = birthdate ? getZodiacSign(birthdate) : null;

  if (sign) {
    const { active, shadow } = getRetrogradeStatus(new Date());
    const transiting = active.find(r => r.planet === sign.rulingPlanet || r.planet === sign.traditionalRuler)
      ?? shadow.find(r => r.planet === sign.rulingPlanet || r.planet === sign.traditionalRuler);

    if (transiting) {
      const theme = themeForPlanet(transiting.planet);
      if (theme) {
        const reason = active.includes(transiting)
          ? `${transiting.planet} — your ${sign.name} Sun's ruler — is retrograde right now, so this theme is louder than usual.`
          : `${transiting.planet} — your ${sign.name} Sun's ruler — is still inside its retrograde shadow period.`;
        return { theme, reason };
      }
    }
  }

  const karmicNumbers = name?.trim() ? calculateKarmicLessonNumbers(name) : [];
  if (karmicNumbers.length) {
    const theme = themeForKarmicLesson(karmicNumbers);
    if (theme) {
      return {
        theme,
        reason: `Karmic Lesson ${theme.karmicLesson} keeps circling back in your name's numerology — this theme is tied to that lesson.`,
      };
    }
  }

  if (sign) {
    const theme = themeForSign(sign.name);
    if (theme) {
      return { theme, reason: `Chosen for your ${sign.name} Sun, ruled by ${sign.rulingPlanet}.` };
    }
  }

  const theme = themes[Math.floor(Math.random() * themes.length)];
  return { theme, reason: 'Add your birthdate and name in your profile to connect this to your chart and numerology.' };
}

const sample = list => list[Math.floor(Math.random() * list.length)];

/**
 * Picks a prompt at the requested depth.
 *
 * `excludeId` lets the journal hand back a genuinely different question when
 * someone asks for another one — without it, a three-prompt pool re-serves the
 * same prompt about a third of the time, which reads as the button being broken.
 * It's only dropped if it would leave nothing to choose from.
 */
export function pickPromptFromTheme(theme, depth = DEFAULT_DEPTH, excludeId = null) {
  const atDepth = theme.prompts.filter(p => p.depth === depth);
  const pool = atDepth.length ? atDepth : theme.prompts;
  const withoutCurrent = pool.filter(p => p.id !== excludeId);
  return sample(withoutCurrent.length ? withoutCurrent : pool);
}

// Integration prompts are tiered alongside the questions. After an unflinching
// prompt the closing question has to help metabolise what came up rather than
// simply dig further, so the deep tier is written to land differently.
export function pickIntegrationPrompt(depth = DEFAULT_DEPTH) {
  return sample(integrationPrompts[String(depth)] ?? integrationPrompts['1']);
}

export function getAllThemes() {
  return themes;
}
