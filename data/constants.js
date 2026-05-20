export const tiers = {
    1: "I",
    2: "II",
    3: "III",
    4: "IV",
    5: "V",
    6: "VI",
};

export const ranks = {
    1: "ens",
    2: "lt",
    3: "ltcmdr",
    4: "cmdr",
};

export const professions = {
    1: "univ",
    2: "eng",
    3: "sci",
    4: "tac",
};

export const specializations = {
    2: "int",
    3: "pilot",
    5: "cmd",
    6: "temporaloperative",
    8: "miracle",
};

export const rankTexts = {
    1: "Ensign",
    2: "Lieutenant",
    3: "Lt. Commander",
    4: "Commander",
};

export const professionText = {
    1: "Universal",
    2: "Engineering",
    3: "Science",
    4: "Tactical",
};

export const specializationText = {
    2: "Intelligence Officer",
    3: "Pilot",
    5: "Command Officer",
    6: "Temporal Operative",
    8: "Miracle Worker",
};

export function parseSeatName(boff) {
    let seatName = ""
    seatName = rankTexts[boff.rank] + " " + professionText[boff.profession]
    if (boff.specialization) {
        seatName += "/" + specializationText[boff.specialization]
    }
    return seatName
}

export function getIconName(boff) {
    let iconName = "Boff_" + ranks[boff.rank] + "_" + professions[boff.profession]
    if (boff.specialization) {
        iconName += "_" + specializations[boff.specialization]
    }
    iconName += ".png"
    return iconName
}