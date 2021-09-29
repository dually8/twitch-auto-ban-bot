export const blockedTerms = [
    'bigfollows.com',
    'bigfollows . com',
    'wanna become famous?',
    'wanna become famous',
];

export function shouldBanBasedOnTerm(message: string): boolean {
    const isInBannedList = blockedTerms.some(x => message.toLowerCase().includes(x));
    return isInBannedList;
}