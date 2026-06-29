import shadowWorkData from '../data/shadowWorkThemes.json';
import { getZodiacSign } from './astrologyService';
import { getRetrogradeStatus } from '../utils/celestialCalc';
import calculateKarmicLessonNumbers from './calculateKarmicLessonNumbers';

const { themes, integrationPrompts } = shadowWorkData;

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

export function pickPromptFromTheme(theme) {
  return theme.prompts[Math.floor(Math.random() * theme.prompts.length)];
}

export function pickIntegrationPrompt() {
  return integrationPrompts[Math.floor(Math.random() * integrationPrompts.length)];
}

export function getAllThemes() {
  return themes;
}
