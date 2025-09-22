export function containsAny(str: string, substrings: string[]) {
    for (let i in substrings) {
        let substring = substrings[i];
        if (str.indexOf(substring) != -1) {
            return true;
        }
    }
    return false;
}
