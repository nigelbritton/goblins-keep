const settings = {
    exploreLevelRequirementOffset: 5,
    questLevelRequirementOffset: 2,
    actionQueueLimit: 5,
    expLimit: [
        0, 300, 600, 1100, 1700, 2300, 4200, 6000, 7350, 9930,
        11800, 15600, 19600, 23700, 26400, 30500, 35400, 40500, 45700, 51000,
        56000, 63900, 71400, 79100, 87100, 95200, 109800, 124800, 140200, 155900,
        162500, 175900, 189600, 203500, 217900, 232320, 249900, 267800, 286200, 304900
    ],
    maxExperienceLevel: 20
};

module.exports.getActionQueueLimit = function () {
    return settings.actionQueueLimit;
};

module.exports.getExperienceLevelGrowth = function (currentLevel, currentExperience) {
    // console.log('getExperienceLevelGrowth', currentLevel);
    // console.log('getExperienceLevelGrowth', settings.expLimit[currentLevel]);
    if (currentExperience >= settings.expLimit[currentLevel]) {
        return {
            experience: currentExperience - settings.expLimit[currentLevel],
            level: currentLevel + 1
        };
    }
    return false;
};

module.exports.getMaxExperienceLevel = function () {
    return settings.maxExperienceLevel;
};

module.exports.getExploreLevelRequirementOffset = function () {
    return settings.exploreLevelRequirementOffset;
};

module.exports.getQuestLevelRequirementOffset = function () {
    return settings.questLevelRequirementOffset;
};
