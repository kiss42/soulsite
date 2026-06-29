import chakraGuidance from '../data/chakraGuidance.json';

// Classical yogic element-chakra correspondence: the four lower chakras each
// govern one element. Throat, Third Eye, and Crown sit beyond the elements
// (sound, light, and thought), so they aren't mapped to a zodiac element here.
const ELEMENT_CHAKRA = {
  Fire:  'solarPlexus',
  Earth: 'root',
  Air:   'heart',
  Water: 'sacral',
};

export const getChakraByElement = (element) => {
  const key = ELEMENT_CHAKRA[element];
  if (!key) return null;
  return { key, ...chakraGuidance[key] };
};

export const getChakraRecommendation = (numerologyResults) => {
    const { LifePath } = numerologyResults; // Only destructure LifePath as it's the only used variable

    let recommendations = [];

    // Mapping logic based on LifePath number
    if (LifePath.number <= 3) {
        recommendations.push('root');
    } else if (LifePath.number <= 6) {
        recommendations.push('sacral');
    } else {
        recommendations.push('crown');
    }

    // Convert chakra names to their guidance from chakraGuidance.json
    return recommendations.map(chakra => ({
        name: chakraGuidance[chakra].name,
        bodyPart: chakraGuidance[chakra].bodyPart,
        guidance: chakraGuidance[chakra].guidance
    }));
};
