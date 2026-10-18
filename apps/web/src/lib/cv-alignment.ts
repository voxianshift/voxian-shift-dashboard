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

const stopwords = new Set(
  "and the for with from into your that this using based work role team data tools".split(" "),
)
const words = (values: string[]) =>
  new Set(
    values
      .flatMap((value) => normalize(value).split(" "))
      .filter((word) => word.length > 3 && !stopwords.has(word)),
  )

// ponytail: word-overlap heuristic between CV and each role's title/skills; swap for an AI ranking if fit feels off.
export function bestCvRole(paths: CareerPath[], cv?: CvContext | null): string | null {
  const evidence = cvEvidence(cv)
  if (!evidence.length) return null
  const cvWords = words([...evidence, ...cv!.jobTitles])
  let best = { id: null as string | null, score: 0 }
  for (const path of paths) {
    if (path.coverage !== "available") continue
    const pathBonus =
      (cvAlignment(path.requiredSkills ?? [], cv, path.cvMatches)?.percentage ?? 0) / 100
    for (const [index, role] of path.destinations.entries()) {
      const hits = (values: string[]) => [...words(values)].filter((word) => cvWords.has(word))
      const titleHits = hits([role.title])
      // Title overlap counts double: a CV job title matching the role name is the strongest signal.
      const score =
        titleHits.length * 2 +
        hits(role.skills ?? []).filter((word) => !titleHits.includes(word)).length
      // Path alignment only breaks ties; a role needs at least one overlapping word to win.
      if (score && score + pathBonus > best.score)
        best = { id: `${path.id}-role-${index}`, score: score + pathBonus }
    }
  }
  return best.id
}
