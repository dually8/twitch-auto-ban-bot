import dayjs from 'dayjs';


/**
 * Ban list from https://twitch-tv-tips.blogspot.com/2020/08/ban-these-channel-bots-as-soon-as.html
 */
export const bannedUserList = [
    '0_supa',
    '01ella',
    '0liviajadeee',
    '0x25e',
    '0x81_xml',
    '1174',
    '2020',
    '2600_6c5e_5b7f_fdcd_venom',
    '2603_6000_ba07_8c751_cc60',
    '420f1tc00l',
    'a1bear',
    'abbottcostello',
    'academyimpossible',
    'Academyimpossible',
    'actually__hannah',
    'adenillect',
    'agilet',
    'alexisthenexis',
    'alexsaurora27',
    'aliceydra',
    'allroadsleadtothefarm',
    'anna_banana_10',
    'applepiechart',
    'artjomv2',
    'ashleighhy',
    'aten',
    'avasemaphore',
    'babasababapog',
    'bilikirs',
    'bingcortana',
    'blgdamjudge',
    'blitchpyke',
    'blkheroeseverywhere',
    'bloodlustr',
    'bristlerich',
    'bucksumlimb',
    'business_daddy',
    'carbob14xyz',
    'carbon14xyz',
    'carbot14xyz',
    'cartierlogic',
    'cashiering',
    'casinothanks',
    'cleaning_the_house',
    'clickonmeplease',
    'clickonmeplease4',
    'commanderroot',
    'commula',
    'communityshowcase',
    'creatorsunite',
    'cristianepre',
    'crunchipchip',
    'd1sc0rdforsmallstreamers',
    'd4rk_5how',
    'd4rk_5ky',
    'davicito14_',
    'ddatapb42',
    'ddatapc42',
    'delteerdatap42',
    'devjimmyboy',
    'disc0rdforsma11streamers',
    'discord_for_streamers',
    'DiscordStreamerCommunity',
    'dmca_administrator',
    'drapsnatt',
    'droopdoggg',
    'dukan_rex',
    'dynaterra',
    'edellyna ',
    'einfachuwe42',
    'elbretweets',
    'elysian',
    'eulersobject',
    'extramoar',
    'exxxbot',
    'ezobay',
    'fearms1',
    'feet',
    'flaskcopy',
    'foursilk',
    'frw33d',
    'ftopayr',
    'galgoya',
    'gametrendanalytics',
    'ghrly',
    'gik_gok',
    'gingerne',
    'gingeryoval',
    'golang_ontop',
    'gowithhim',
    'grifordia',
    'guchkada',
    'guglvyda',
    'gunq3',
    'gunw6',
    'gurxddda',
    'h0sso0312',
    'halfaches',
    'havethis2',
    'heirmanttinan',
    'ho03012ss',
    'holaitzcarmennn',
    'homeplatedibidal',
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
    'host00312',
    'icewizerds',
    'ilovetwitchdrops001',
    'ily_shiba',
    'imsorryjusttesting',
    'inventkin',
    'isaacdeplar',
    'itsthefrits',
    'itzemmaaaaaaa',
    'jd1d',
    'jeanrnestu',
    'jeffecorga',
    'jiffyonyx',
    'kattynah',
    'kishintern',
    'kodiakbrujah',
    'lauradesk',
    'lecturerreflux',
    'lemonjuices12',
    'leviathanapp',
    'linervolatile',
    'liquidpve',
    'ljlcard',
    'llorx_falso',
    'lucrejohn',
    'lurxx',
    'lysbethemed',
    'maddynsun',
    'maddyson_moy_bog',
    'manning_wilkins',
    'mariotiss',
    'metaviews',
    'meverywhere',
    'midsooooooooon',
    'Mslenity',
    'muffinsgield',
    'music_and_arts',
    'natzelly',
    'nelsondock',
    'newolk69',
    'newstreamers_support_chat',
    'nicholsstand',
    'night_php',
    'omegajeppe',
    'outside_gardening',
    'outside_working',
    'patranovisinka',
    'pawlina93',
    'pboj',
    'phpshit',
    'pilookxqvx',
    'pingutio',
    'piopenvcef',
    'pisodadhtf',
    'pitediousamym',
    'piteenyavrt',
    'pitemptmghi',
    'poopminty',
    'potatomalonettv',
    'prankcher',
    'pro_gamer_network',
    'public_enemy821',
    'ra1denz',
    'randtarcedic1973',
    're1yk',
    'relishdrove',
    'rememberlunasec',
    'ribotsize',
    'rivkamichaeli1',
    'rogueg1rl',
    'rubberslayer',
    'ruinexiv',
    'ryothscus',
    'sad_grl',
    'saddestkitty',
    'sawyerlead',
    'servres',
    'shell_upload_php',
    'sillygnome225',
    'SmallStreamersDcCommunity',
    'social_growth_discord',
    'socialstreamergrowth',
    'sonyplaystations',
    'sophiafox21',
    'stewlew89',
    'storecina',
    'stormmunity',
    'stormpostor',
    'streamfahrer',
    'stripfang',
    'tackingalias',
    'talkingrobble',
    'tanonjaeng',
    'tawmtawmz',
    'teresedirty',
    'thecommandergroot',
    'thedevilisob',
    'thelurxxer',
    'thetwitchauthority_e0244',
    'thetwitchauthority',
    'thewritinger',
    'thiccur',
    'threebibl',
    'tresinno',
    'tt3kobbk',
    'ttaproxy',
    'turbopascai',
    'twitchdetails',
    'twitchprimereminder',
    'twitchtwitchtwitchx3',
    'utensilzinc',
    'v_and_k',
    'vaidather',
    'valentinaalcaraz',
    'vicarchurger',
    'Violets_tv',
    'virgoproz',
    'vvmanolia',
    'welovemarbles',
    'xbstuart265',
    'xqcmate',
    'xxdemonkitty',
    'yamickle',
    'zigulisegra',
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
