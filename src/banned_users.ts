import dayjs from 'dayjs';

export const bannedUserList = [
    '0x25e',
    '0x81_xml',
    '2600_6c5e_5b7f_fdcd_venom',
    '2603_6000_ba07_8c751_cc60',
    'clickonmeplease',
    'clickonmeplease4',
    'davicito14_',
    'golang_ontop',
    'guchkada',
    'guglvyda',
    'gunq3',
    'gunw6',
    'gurxddda',
    'h0sso0312',
    'halfaches',
    'ho03012ss',
    'hoss___00312',
    'hoss00312__',
    'hoss00312_',
    'hoss00312_0_0',
    'hoss00312_click_here',
    'hoss00312_erratic',
    'hoss00312_eyes',
    'hoss00312_guess',
    'hoss00312_is_unstoppable',
    'hoss00312_new',
    'hoss00312_wax',
    'hoss00312_you',
    'hosso0312',
    'hosso0312',
    'host00312',
    'host00312',
    'ily_shiba',
    'night_php',
    'phpshit',
    'pilookxqvx',
    'piopenvcef',
    'pisodadhtf',
    'pitediousamym',
    'piteenyavrt',
    'pitemptmghi',
    'rememberlunasec',
    'shell_upload_php',
    'thetwitchauthority_e0244',
    'thetwitchauthority',
    'ttaproxy',
    'twitchtwitchtwitchx3',
    'vvmanolia',
    'xbstuart265',
    'xqcmate',
];

export const hosRegex = /(h.s+.*312)|(h.*3.*2)|(gu.*da)|(pi.*)/gi;

export function shouldBanBasedOnUsername(username: string): boolean {
    const matchesHosRegex = (hosRegex.test(username.toLowerCase()));
    const isInBannedList = bannedUserList.includes(username);

    return matchesHosRegex || isInBannedList;
}

export function shouldBanBasedOnCreationDate(date: string | Date): boolean {
    const creationDate = dayjs(date);
    if (!creationDate.isValid()) {
        return false;
    }
    const weekBeforeToday = dayjs().subtract(7, 'day');
    const createDateIsOlderThanAWeek = weekBeforeToday.isBefore(creationDate);
    return createDateIsOlderThanAWeek;
}
