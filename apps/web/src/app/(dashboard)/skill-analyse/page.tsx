"use client"

import { Suspense, useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react"
import { baselineIdForOccupation } from "@voxian/shared"
import { useCareerProfile } from "@/components/career-profile-provider"
import { ProfileSheet } from "@/components/profile-sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { occupationModels, taskWeights } from "@/lib/occupations"
import { SKILLS as INITIAL_SKILLS } from "@/lib/mock"

export default function SkillAnalysePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-[16px] text-muted-foreground" role="status">
          Loading skill analysis…
        </div>
      }
    >
      <SkillAnalyseContent />
    </Suspense>
  )
}

function SkillAnalyseContent() {
  const { profile, confirmed, ready } = useCareerProfile()
  const [editingProfile, setEditingProfile] = useState(false)
  const [taskFocus, setTaskFocus] = useState<"routine" | "mixed" | "escalations">("routine")
  const [taskFilter, setTaskFilter] = useState<"all" | "moat" | "automated">("all")
  const [skills, setSkills] = useState(INITIAL_SKILLS)

  const roleId = confirmed
    ? baselineIdForOccupation(profile.primaryOccupation) || "customer-support"
    : "customer-support"

  const role = occupationModels.find((model) => model.id === roleId) || occupationModels[0]!

  const weights = useMemo(() => taskWeights(role, taskFocus), [role, taskFocus])

  const taskStats = useMemo(() => {
    return role.tasks.map((task, idx) => {
      const weight = weights[idx] ?? task.weight
      const contribution = weight * task.exposure * 100
      return {
        ...task,
        calculatedWeight: weight,
        contribution,
      }
    })
  }, [role.tasks, weights])

  const totalCalculatedExposure = useMemo(() => {
    return taskStats.reduce((acc, t) => acc + t.contribution, 0)
  }, [taskStats])

  const filteredTasks = useMemo(() => {
    if (taskFilter === "moat") return taskStats.filter((t) => t.moat)
    if (taskFilter === "automated") return taskStats.filter((t) => !t.moat)
    return taskStats
  }, [taskStats, taskFilter])

  const handleSkillLevelChange = (skillName: string, delta: number) => {
    setSkills((prev) =>
      prev.map((s) => {
        if (s.name === skillName) {
          const nextVal = Math.min(100, Math.max(0, s.level + delta))
          return { ...s, level: nextVal }
        }
        return s
      }),
    )
  }

  const handleResetSkills = () => {
    setSkills(INITIAL_SKILLS)
  }

  if (!ready) {
    return (
      <div className="p-8 text-[16px] text-muted-foreground" role="status">
        Loading profile details…
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="eyebrow">DIAGNOSTIC & AUDIT</span>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Skill & Task Analysis
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Auditing baseline for <span className="font-medium text-foreground">{role.title}</span>{" "}
            (<span className="font-mono text-xs">{role.code}</span>)
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={() => setEditingProfile(true)}>
            Switch Role
          </Button>
          <Button asChild size="sm">
            <Link href="/roadmap">
              View Roadmap <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Exposure Metrics & Focus Controller */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardDescription className="eyebrow">OVERALL AI EXPOSURE</CardDescription>
            <CardTitle className="flex items-baseline gap-2 font-mono text-4xl font-normal">
              {totalCalculatedExposure.toFixed(1)}
              <span className="text-sm font-sans text-muted-foreground">/ 100</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={totalCalculatedExposure} className="h-2" />
            <p className="mt-2.5 text-xs text-muted-foreground">
              Calculated via <span className="font-mono">100 × Σ(weight × exposure)</span> for{" "}
              {role.tasks.length} core occupational tasks.
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-medium">Task Weight Focus</CardTitle>
                <CardDescription className="text-xs">
                  Simulate how shifting time allocation alters your exposure score
                </CardDescription>
              </div>
              <SlidersHorizontal className="size-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={taskFocus === "routine" ? "default" : "outline"}
                size="sm"
                onClick={() => setTaskFocus("routine")}
              >
                Routine Heavy
              </Button>
              <Button
                variant={taskFocus === "mixed" ? "default" : "outline"}
                size="sm"
                onClick={() => setTaskFocus("mixed")}
              >
                Balanced Mix
              </Button>
              <Button
                variant={taskFocus === "escalations" ? "default" : "outline"}
                size="sm"
                onClick={() => setTaskFocus("escalations")}
              >
                Complex Escalations
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {taskFocus === "routine" &&
                "Standard entry-level distribution with high volume of repeatable queries."}
              {taskFocus === "mixed" &&
                "Equally blended allocation between tier-1 triage and specialized problem-solving."}
              {taskFocus === "escalations" &&
                "Focus on critical edge-cases, empathetic interventions, and system-level diagnostics."}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Task Audit Table */}
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg">Occupational Task Audit</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Granular breakdown of occupational activities, weights, and automated potential
            </CardDescription>
          </div>
          <Tabs
            value={taskFilter}
            onValueChange={(val) => setTaskFilter(val as "all" | "moat" | "automated")}
          >
            <TabsList className="h-8">
              <TabsTrigger value="all" className="text-xs">
                All ({taskStats.length})
              </TabsTrigger>
              <TabsTrigger value="moat" className="text-xs">
                Human Moat ({taskStats.filter((t) => t.moat).length})
              </TabsTrigger>
              <TabsTrigger value="automated" className="text-xs">
                Automated ({taskStats.filter((t) => !t.moat).length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b text-xs text-muted-foreground">
              <tr>
                <th className="py-2.5 font-medium">Task Description</th>
                <th className="py-2.5 font-medium">Weight</th>
                <th className="py-2.5 font-medium">AI Exposure</th>
                <th className="py-2.5 font-medium">Contribution</th>
                <th className="py-2.5 text-right font-medium">Classification</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((t) => (
                <tr key={t.name} className="border-b last:border-0 hover:bg-muted/40">
                  <td className="py-3.5 pr-4 font-normal text-foreground">{t.name}</td>
                  <td className="py-3.5 font-mono text-xs">{t.calculatedWeight.toFixed(2)}</td>
                  <td className="py-3.5 font-mono text-xs">{t.exposure.toFixed(2)}</td>
                  <td className="py-3.5 font-mono text-xs text-foreground">
                    +{t.contribution.toFixed(1)}
                  </td>
                  <td className="py-3.5 text-right">
                    <Badge variant={t.moat ? "secondary" : "outline"} className="text-xs">
                      {t.moat ? (
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="size-3 text-emerald-600 dark:text-emerald-400" />
                          Human Moat
                        </span>
                      ) : (
                        "High Automation"
                      )}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Skill Gaps Interactive Assessment */}
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg">Self-Assessed Skill Gaps</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Evaluate your current capabilities. Aim for 70+ in high-moat areas to prepare for
              target roles.
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={handleResetSkills} className="text-xs">
            <RotateCcw className="mr-1.5 size-3" /> Reset Scores
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {skills.map((skill) => {
              const isTargetReady = skill.level >= 70
              const isCriticalGap = skill.level < 40

              return (
                <div key={skill.name} className="space-y-2 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-sm font-medium">{skill.name}</span>
                      <div className="flex items-center gap-2">
                        {isTargetReady && (
                          <Badge variant="secondary" className="gap-1 text-[11px]">
                            <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
                            Target Ready
                          </Badge>
                        )}
                        {isCriticalGap && (
                          <Badge
                            variant="outline"
                            className="text-[11px] text-amber-600 dark:text-amber-400"
                          >
                            Critical Gap
                          </Badge>
                        )}
                        {!isTargetReady && !isCriticalGap && (
                          <Badge variant="outline" className="text-[11px] text-muted-foreground">
                            In Progress
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="icon-xs"
                        onClick={() => handleSkillLevelChange(skill.name, -5)}
                        aria-label={`Decrease ${skill.name} score`}
                      >
                        <Minus className="size-3" />
                      </Button>
                      <span className="w-10 text-center font-mono text-sm font-medium">
                        {skill.level}
                      </span>
                      <Button
                        variant="outline"
                        size="icon-xs"
                        onClick={() => handleSkillLevelChange(skill.name, 5)}
                        aria-label={`Increase ${skill.name} score`}
                      >
                        <Plus className="size-3" />
                      </Button>
                    </div>
                  </div>
                  <Progress value={skill.level} className="h-1.5" />
                </div>
              )
            })}
          </div>

          <div className="flex flex-col items-start justify-between gap-3 rounded-md bg-muted/50 p-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2.5">
              <Sparkles className="size-4 text-primary" />
              <p className="text-xs text-muted-foreground">
                Strengthen skills under 70 by following your personalized learning milestones.
              </p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/resources" className="gap-1.5">
                Explore Learning Resources <ArrowUpRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <ProfileSheet open={editingProfile} onOpenChange={setEditingProfile} />
    </div>
  )
}
