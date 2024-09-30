import chakraGuidance from '../data/chakraGuidance.json';

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
        guidance: chakraGuidance[chakra].guidance
    }));
};
