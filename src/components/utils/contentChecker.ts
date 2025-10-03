import { offensiveWords, personPronouns } from "./data";

export interface ContentCheckResult {
  isInappropriate: boolean;
  targets: string[];
  words: string[];
}

export function checkInappropriate(content: string): ContentCheckResult {
  const lower = content.toLowerCase();
  const wordsFound = offensiveWords.filter((word) => lower.includes(word));

  const targets: string[] = [];

  const possibleNames = content.match(/\b[A-Z][a-z]+\b/g) || [];
  targets.push(...possibleNames);

  personPronouns.forEach((pronoun) => {
    if (lower.includes(pronoun)) targets.push(pronoun);
  });

  return {
    isInappropriate: wordsFound.length > 0 && targets.length > 0,
    words: wordsFound,
    targets: [...new Set(targets)],
  };
}
