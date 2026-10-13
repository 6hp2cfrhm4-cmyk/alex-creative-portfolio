import { hairReferences } from "./data.ts";
import type { HairReference, StyleFinderAnswers } from "./types";

export function recommendStyles(answers: StyleFinderAnswers): HairReference[] {
  return hairReferences
    .filter((reference) => reference.inFinder)
    .map((reference) => {
      const score = (reference.length === answers.length ? 3 : 0)
        + (reference.effort === answers.effort ? 2 : 0)
        + (reference.character === answers.character ? 2 : 0);
      return { reference, score };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, 2)
    .map(({ reference }) => reference);
}

export function explainStyleMatch(reference: HairReference, answers: StyleFinderAnswers): string {
  const reasons: string[] = [];
  if (reference.length === answers.length) reasons.push("подходит выбранная длина");
  if (reference.effort === answers.effort) reasons.push("совпадает время на укладку");
  if (reference.character === answers.character) reasons.push("подходит нужный характер формы");
  return reasons.length > 0
    ? reference.title + ": " + reasons.join(", ") + "."
    : reference.title + " — близкий вариант, который можно обсудить с барбером.";
}
