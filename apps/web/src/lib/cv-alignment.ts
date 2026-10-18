import { cvEvidence, type CvContext, type CareerPath } from "@voxian/shared"

const aliases: Record<string, string[]> = {
  javascript: ["js"],
  typescript: ["ts"],
  postgresql: ["postgres"],
  "continuous integration": ["ci"],
  "continuous delivery": ["cd"],
  "machine learning": ["ml"],
  "artificial intelligence": ["ai"],
  "quality assurance": ["qa"],
}
const normalize = (value: string) =>
  value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}+#]+/gu, " ")
    .trim()

export function cvAlignment(
  requirements: string[],
  cv?: CvContext | null,
  semantic?: CareerPath["cvMatches"],
) {
  const skills = [...new Set(requirements.map(normalize).filter(Boolean))]
  if (!cv?.reviewed || cv.confidence < 0.6 || !skills.length) return null
  const source = cvEvidence(cv)
  const explicitSkills = cv.skills.map(normalize)
  const matched = skills.filter((skill) => {
    const group = Object.entries(aliases).find(([name, synonyms]) =>
      [name, ...synonyms].includes(skill),
    )
    const phrases = group ? [group[0], ...group[1]] : [skill]
    if (semantic !== undefined)
      return semantic.some(
        (match) => normalize(match.skill) === skill && source.includes(match.evidence),
      )
    // Without an AI assessment, only explicit skill labels qualify; prose may contain negation or goals.
    return phrases.some((phrase) => explicitSkills.includes(phrase))
  })
  return matched.length
    ? {
        percentage: Math.round((matched.length / skills.length) * 100),
        matched: matched.length,
        total: skills.length,
      }
    : null
}
