import chakraGuidance from '../data/chakraGuidance.json';

export const CHAKRA_ORDER = ['root', 'sacral', 'solarPlexus', 'heart', 'throat', 'thirdEye', 'crown'];

export const getChakra = key => (chakraGuidance[key] ? { key, ...chakraGuidance[key] } : null);

export const getAllChakras = () => CHAKRA_ORDER.map(getChakra);

// Classical yogic element-chakra correspondence: the four lower chakras each
// govern one element. Throat, Third Eye, and Crown sit beyond the elements
// (sound, light, and thought), so they aren't mapped to a zodiac element here.
const ELEMENT_CHAKRA = {
  Fire:  'solarPlexus',
  Earth: 'root',
  Air:   'heart',
  Water: 'sacral',
};

export const getChakraByElement = element => getChakra(ELEMENT_CHAKRA[element]);

// Numbers 1-7 mirror the seven chakras in ascending order (root through
// crown); 8 and 9 sit beyond that ladder, so they loop back to the chakras
// that match their own established meaning elsewhere in this app — 8's
// "material mastery" to root (security/survival), 9's "unconditional
// compassion" to crown (unity/transcendence). Master numbers resolve through
// their reduced digit, which is where their energy actually sits in the body.
const NUMBER_CHAKRA = {
  1: 'root', 2: 'sacral', 3: 'solarPlexus', 4: 'heart',
  5: 'throat', 6: 'thirdEye', 7: 'crown', 8: 'root', 9: 'crown',
  11: 'sacral', 22: 'heart', 33: 'solarPlexus',
};

export const getChakraForNumber = number => getChakra(NUMBER_CHAKRA[number]);

/**
 * Reads a whole numerology profile as a chakra map.
 *
 * This replaces an older `getChakraRecommendation` that bucketed Life Path as
 * "1-3 root, 4-6 sacral, else crown" — a second, contradictory mapping living
 * in this same file, which disagreed with `getChakraForNumber` for almost
 * every number (a Life Path 5 was called sacral here and throat there). There
 * is now one mapping, and everything routes through it.
 *
 * Karmic lessons point at chakras with nothing feeding them; the core numbers
 * point at the ones being actively driven. A chakra can be both, and that's
 * worth saying rather than hiding.
 */
export const buildChakraProfile = (profile) => {
  if (!profile) return null;

  const emphasis = new Map();
  const note = (number, source) => {
    const chakra = getChakraForNumber(number);
    if (!chakra) return;
    const entry = emphasis.get(chakra.key) || { ...chakra, drivers: [], lessons: [] };
    entry.drivers.push({ source, number });
    emphasis.set(chakra.key, entry);
  };

  if (profile.lifePath) note(profile.lifePath.number, 'Life Path');
  if (profile.expression) note(profile.expression.number, 'Expression');
  if (profile.soulUrge) note(profile.soulUrge.number, 'Soul Urge');
  if (profile.personality) note(profile.personality.number, 'Personality');
  profile.hiddenPassion?.forEach(n => note(n, 'Hidden Passion'));

  profile.karmicLessons?.forEach(n => {
    const chakra = getChakraForNumber(n);
    if (!chakra) return;
    const entry = emphasis.get(chakra.key) || { ...chakra, drivers: [], lessons: [] };
    entry.lessons.push(n);
    emphasis.set(chakra.key, entry);
  });

  // Keep the body's own order rather than sorting by weight — a chakra map
  // only reads correctly root-upward.
  const chakras = CHAKRA_ORDER
    .filter(key => emphasis.has(key))
    .map(key => emphasis.get(key));

  const untouched = CHAKRA_ORDER.filter(key => !emphasis.has(key)).map(getChakra);

  return { chakras, untouched };
};
