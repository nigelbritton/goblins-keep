const { createProfile, getProfiles } = require("./keeper-database");

const RACE_NAMES = {
    GOBLIN: {
        FIRST: [
            'Fixibit',
            'Fizmaard',
            'Greexigle ',
            'Gizgelex',
            'Karax',
            'Kazqaeek',
            'Kizmamo',
            'Kwyinget',
            'Maeqeek',
            'Qiex',
            'Rezqables',
            'Roxriez',
            'Roxkixaz',
            'Soxgeez',
            'Wizget',
            'Zixteex',
            'Zotmemex',
            'Wieka',
            'Wizezx',
            'Zeexvmaz'
        ],
        LAST: [
            'Botwell',
            'Cogpot',
            'Deadfuse',
            'Farpocket',
            'Fizzgob',
            'Fizznose',
            'Greasyvolt',
            'Groundfuel',
            'Kneeblast',
            'Kneeskimmer',
            'Loosesnap',
            'Mangear',
            'Megabub',
            'Moneyfingers',
            'Moneyshatter',
            'Mudfuse',
            'Pepperblast',
            'Sandvolt',
            'Shadowfuse',
            'Saltbub'
        ]
    }
};

module.exports.generateUser = generateUser = function (uid) {
    return {
        userId: uid,
        updated: new Date().getTime(),
        name: generateRandomName(),
        gold: 0,
        inventory: [],
        tasks: [],
        quests: {
            active: [],
            completed: []
        },
        skills: {
            mining: {
                experience: 0,
                level: 1,
                unlocked: []
            },
            logging: {
                experience: 0,
                level: 1,
                unlocked: []
            },
            hunting: {
                experience: 0,
                level: 1,
                unlocked: []
            }
        }
    };
}

module.exports.generateRandomName = generateRandomName = function () {
    return RACE_NAMES.GOBLIN.FIRST[Math.floor(Math.random() * RACE_NAMES.GOBLIN.FIRST.length) - 1] +
        ' ' +
        RACE_NAMES.GOBLIN.LAST[Math.floor(Math.random() * RACE_NAMES.GOBLIN.LAST.length) - 1];
}

module.exports.createProfile = async function (userId) {
    const userProfile = generateUser(userId);
    const profileDocument = await createProfile(userProfile);

    return userProfile;
};

module.exports.getProfiles = async function (userId) {
    return await getProfiles(userId);
};
