export const bannedUserList = [
    'host00312',
    'hosso0312',
    'hoss00312_',
    'hoss00312_you',
    'hoss00312_0_0',
    'hoss00312_click_here',
    'hoss___00312',
    'hoss00312_eyes',
    'hoss00312_new',
    'hosso0312',
    'host00312',
    'hoss00312__',
    'h0sso0312',
    'hoss00312_is_unstoppable',
    '2603_6000_ba07_8c751_cc60',
    'rememberlunasec',
    '2600_6c5e_5b7f_fdcd_venom',
    '0x81_xml',
    'clickonmeplease',
    'thetwitchauthority',
    'night_php',
    'shell_upload_php',
    'clickonmeplease4',
    'ttaproxy',
    'phpshit',
    'xqcmate',
    '0x25e',
    'thetwitchauthority_e0244',
    'vvmanolia',
    'twitchtwitchtwitchx3',
    'ily_shiba',
    'golang_ontop',
    'xbstuart265',
    'hoss00312_erratic',
    'hoss00312_guess',
    'hoss00312_wax',
    'halfaches',
    'ho03012ss',
];

export const hosRegex = /(h.s+.*312)|(h.*3.*2)/gi;

export function shouldBanBasedOnUsername(username: string) {
    const matchesHosRegex = (hosRegex.test(username.toLowerCase()));
    const isInBannedList = bannedUserList.includes(username);

    return matchesHosRegex || isInBannedList;
}