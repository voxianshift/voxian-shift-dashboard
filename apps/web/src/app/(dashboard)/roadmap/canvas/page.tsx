"use client"

import { Suspense, useEffect, useLayoutEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, X } from "lucide-react"
import {
  ReactFlow,
  BaseEdge,
  type EdgeProps,
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  Position,
  type NodeProps,
  type ReactFlowInstance,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import "@/components/navigator-effects.css"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  generatedPlanSchema,
  navigatorContext,
  navigatorResources,
  courseList,
  type PlanScheduleInput,
  type NavigatorResult,
} from "@voxian/shared"
import { useCareerProfile } from "@/components/career-profile-provider"
import { CommitDirectionDialog } from "@/components/commit-direction-dialog"
import { PlanSheet } from "@/components/plan-sheet"
import {
  loadCommitment,
  timelineSprint,
  type Commitment,
  type GeneratedPlan,
} from "@/lib/commitment"
import { useNavigator } from "@/components/navigator-provider"
import { NavigatorStatus } from "@/components/navigator-status"
import {
  buildCareerNodes,
  careerEdges,
  selectedCardViewport,
  defaultZoom,
  focusedZoom,
  largeScreenFocusedZoom,
  largeScreenQuery,
  largeScreenZoom,
  type RoleNode,
} from "@/lib/career-canvas"

const strategyHelp: Record<string, string> = {
  automate: "Use AI to automate routine work in your field.",
  hybrid: "Combine your human strengths with AI tools.",
  pivot: "Apply your skills to a different career direction.",
  create: "Build new value through AI governance, ethics, or oversight.",
}

function RoleCard({ data, selected }: NodeProps<RoleNode>) {
  const color = data.color
  if (data.kind === "start")
    return (
      <div className="relative h-[240px] w-[220px] text-cyan-700 dark:text-cyan-300">
        <svg viewBox="0 0 220 240" className="size-full overflow-visible" aria-hidden="true">
          <ellipse
            cx="110"
            cy="96"
            rx="90"
            ry="86"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.2"
            strokeDasharray="4 8"
            opacity=".5"
            className="navigator-orbit"
          />
          <ellipse
            cx="110"
            cy="96"
            rx="96"
            ry="92"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="1"
            strokeDasharray="6 12"
            opacity=".4"
            className="navigator-orbit-reverse"
          />
          <polygon
            points="110,28 170,62 170,130 110,164 50,130 50,62"
            fill="var(--card)"
            stroke="#00f2fe"
            strokeWidth="3"
            style={{
              filter:
                "drop-shadow(0 0 12px color-mix(in srgb, #00f2fe var(--navigator-glow), transparent))",
            }}
          />
          <polygon
            points="110,40 160,68 160,124 110,152 60,124 60,68"
            fill="var(--muted)"
            stroke="#38bdf8"
            strokeWidth="1.5"
            opacity=".7"
          />
          <circle cx="110" cy="96" r="23" fill="#0284c7" opacity=".3" />
          <circle cx="110" cy="96" r="11" fill="#00f2fe" className="navigator-pulse" />
        </svg>
        <div className="absolute inset-x-0 top-[190px] text-center">
          <p className="text-[13px] font-bold tracking-widest text-foreground">THE PRESENT</p>
          <p className="mt-1 font-mono text-[11px] uppercase">{data.subtitle}</p>
          <h2 className="mt-2 text-[13px] text-muted-foreground">{data.title}</h2>
        </div>
        <Handle
          type="source"
          position={Position.Right}
          style={{ top: 96, right: 46 }}
          className="!border-0 !bg-transparent !opacity-0"
        />
      </div>
    )
  if (data.kind === "path")
    return (
      <div className="relative h-[260px] w-[260px]" style={{ color }}>
        <h2
          className="absolute inset-x-0 top-0 line-clamp-2 text-center text-[14px] font-semibold leading-tight text-muted-foreground"
          title={data.title}
        >
          {data.title}
        </h2>
        <svg
          viewBox="0 0 260 180"
          className="absolute inset-x-0 top-0 h-[180px] w-full overflow-visible"
          aria-hidden="true"
        >
          {selected && (
            <polygon
              points="130,30 182,60 182,120 130,150 78,120 78,60"
              fill="none"
              stroke={color}
              strokeWidth="18"
              strokeLinejoin="round"
              opacity="var(--navigator-halo)"
            />
          )}
          <polygon
            points="130,30 182,60 182,120 130,150 78,120 78,60"
            fill={
              selected
                ? `color-mix(in srgb, ${color} var(--navigator-focus-fill), var(--card))`
                : "var(--card)"
            }
            stroke={color}
            strokeWidth={selected ? 3 : 2}
            style={{
              filter: `drop-shadow(0 0 ${selected ? 14 : 7}px color-mix(in srgb, ${color} var(--navigator-glow), transparent))`,
            }}
          />
        </svg>
        <div className="absolute inset-x-0 top-[70px] flex justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="nodrag rounded px-2 py-2 font-mono text-[13px] font-bold focus-visible:outline-2 focus-visible:outline-ring"
                style={{
                  color: selected
                    ? "var(--foreground)"
                    : `color-mix(in srgb, var(--foreground) 65%, ${color})`,
                }}
                aria-label={`About ${data.strategyLabel}`}
              >
                {data.strategyLabel?.toUpperCase()}
              </button>
            </TooltipTrigger>
            <TooltipContent>{strategyHelp[data.pathId ?? ""]}</TooltipContent>
          </Tooltip>
        </div>
        <div className="absolute inset-x-0 top-[158px] space-y-1 text-center text-[11px] text-muted-foreground">
          {data.skills?.map((skill) => (
            <p key={skill} className="truncate" title={skill}>
              {skill}
            </p>
          ))}
          {data.alignment && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="nodrag font-medium text-foreground underline decoration-dotted underline-offset-4"
                  aria-label={`${data.alignment.percentage}% CV alignment`}
                >
                  {data.alignment.percentage}% CV alignment
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-72">
                {data.alignment.matched} of {data.alignment.total} required skills evidenced in your
                reviewed CV. Documented overlap, not measured proficiency. AI-assisted phrase
                matching may be imperfect.
                {data.cvMatches?.map((match) => (
                  <p key={match.skill} className="mt-2">
                    <strong>{match.skill}</strong>: {match.evidence} — {match.reason}
                  </p>
                ))}
              </TooltipContent>
            </Tooltip>
          )}
          {data.subtitle && <p>{data.subtitle}</p>}
        </div>
        <Handle
          type="target"
          position={Position.Left}
          style={{ top: 90, left: 78 }}
          className="!border-0 !bg-transparent !opacity-0"
        />
        <Handle
          type="source"
          position={Position.Right}
          style={{ top: 90, right: 78 }}
          className="!border-0 !bg-transparent !opacity-0"
        />
      </div>
    )
  return (
    <div
      className="flex h-16 w-80 items-center gap-3 rounded-[18px] border-2 bg-card px-4 text-card-foreground"
      style={{
        borderColor: color,
        background: selected
          ? `color-mix(in srgb, ${color} var(--navigator-focus-fill), var(--card))`
          : "var(--card)",
        boxShadow: `0 0 ${selected ? 22 : 12}px color-mix(in srgb, ${color} ${selected ? "var(--navigator-glow-strong)" : "var(--navigator-glow-soft)"}, transparent)`,
      }}
    >
      <span className="size-3 shrink-0 rounded-full" style={{ background: color }} />
      <h2 className="line-clamp-2 text-[14px] font-semibold leading-tight" title={data.title}>
        {data.title}
      </h2>
      <Handle
        type="target"
        position={Position.Left}
        className="!border-0 !bg-transparent !opacity-0"
      />
    </div>
  )
}

function ObstacleEdge({ id, data, style, markerEnd }: EdgeProps) {
  const path = typeof data?.path === "string" ? data.path : ""
  const active = data?.active === true
  return (
    <>
      <path
        d={path}
        fill="none"
        stroke={style?.stroke}
        strokeWidth={active ? 10 : 5}
        opacity={active ? "var(--navigator-line-glow)" : "var(--navigator-line-glow-idle)"}
        strokeLinecap="round"
        pointerEvents="none"
        aria-hidden="true"
      />
      <BaseEdge
        id={id}
        path={path}
        style={{ ...style, strokeDasharray: "none", strokeLinecap: "round" }}
        markerEnd={markerEnd}
      />
      {active && (
        <>
          <path
            d={path}
            fill="none"
            stroke={style?.stroke}
            strokeWidth="3.5"
            opacity=".85"
            strokeLinecap="round"
            className="navigator-energy"
            pointerEvents="none"
            aria-hidden="true"
          />
          <path
            d={path}
            fill="none"
            className="stroke-foreground navigator-spark"
            strokeWidth="1.5"
            opacity=".6"
            strokeLinecap="round"
            pointerEvents="none"
            aria-hidden="true"
          />
        </>
      )}
    </>
  )
}
const edgeTypes = { obstacle: ObstacleEdge }
const nodeTypes = { role: RoleCard }
const maxZoom = () => (window.matchMedia(largeScreenQuery).matches ? largeScreenZoom : defaultZoom)
const viewportDuration = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 320
export default function NavigatorCanvasPage() {
  const { setOpen } = useSidebar()
  // Collapse once on entry for canvas space; later toggles are the user's and persist via cookie.
  // setOpen changes identity with `open`, so depending on it would re-collapse after every expand.
  useEffect(() => setOpen(false), []) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Suspense
      fallback={
        <p role="status" className="px-6 py-12">
          Loading your canvas…
        </p>
      }
    >
      <CanvasRoute />
    </Suspense>
  )
}

function CanvasRoute() {
  const params = useSearchParams()
  const requestedPath = params.get("path")
  const requestedRole = params.get("role")
  const { data, status, profileKey } = useNavigator()
  if (status !== "ready" || !data) return <NavigatorStatus />
  const initialPathId = data.paths.find((path) => path.id === requestedPath)?.id ?? null
  return (
    <NavigatorCanvas
      key={`${profileKey}-${requestedPath ?? "all"}-${requestedRole}`}
      data={data}
      initialSelectedId={
        initialPathId &&
        /^(0|[1-9]\d*)$/.test(requestedRole ?? "") &&
        data.paths.find((path) => path.id === initialPathId)?.roles[Number(requestedRole)]
          ? `${initialPathId}-role-${requestedRole}`
          : initialPathId
      }
    />
  )
}

function NavigatorCanvas({
  data,
  initialSelectedId,
}: {
  data: NavigatorResult
  initialSelectedId: string | null
}) {
  const { profile } = useCareerProfile()
  const { profileKey } = useNavigator()
  const params = useSearchParams()
  const [commitOpen, setCommitOpen] = useState(false)
  const [planOpen, setPlanOpen] = useState(false)
  const [commitment, setCommitment] = useState<Commitment | null>(null)
  useEffect(() => {
    let active = true
    void loadCommitment()
      .then((saved) => {
        if (
          !active ||
          (saved?.plan?.plan.occupationCode &&
            saved.plan.plan.occupationCode !== data.occupationCode)
        )
          return
        setCommitment(saved)
        if (saved?.plan && params.get("plan") === "1") setPlanOpen(true)
      })
      .catch(() => {
        if (active) toast.error("Saved plan couldn’t load. Reload to retry.")
      })
    return () => {
      active = false
    }
  }, [data.occupationCode, params])
  const sprint = timelineSprint(profile.timeline) ?? profile.hours === "5+ hours"
  const { resolvedTheme } = useTheme()
  const careerPaths = data.paths
  const careerNodes = buildCareerNodes(careerPaths, data.roleTitle, profile.cvContext)
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId)
  const [focusRequest, setFocusRequest] = useState(0)
  const [flow, setFlow] = useState<ReactFlowInstance<RoleNode> | null>(null)
  const canvasRef = useRef<HTMLDivElement | null>(null)
  const detailsRef = useRef<HTMLElement | null>(null)
  const selectedNode = careerNodes.find((node) => node.id === selectedId)
  const selected = careerPaths.find((path) => path.id === selectedNode?.data.pathId) ?? null
  const selectedRole = selectedNode?.data.title ?? ""
  const strategyIndex = careerPaths.findIndex((path) => path.id === selected?.id)
  const previousStrategy =
    careerPaths[(strategyIndex - 1 + careerPaths.length) % careerPaths.length]!
  const nextStrategy = careerPaths[(strategyIndex + 1) % careerPaths.length]!

  const returnFocus = useRef<HTMLElement | null>(null)
  useLayoutEffect(() => {
    const canvas = canvasRef.current
    const details = detailsRef.current
    const node = buildCareerNodes(data.paths, data.roleTitle).find((item) => item.id === selectedId)
    if (!flow || !canvas || !details || !node) return
    const centerSelection = () => {
      const bounds = canvas.getBoundingClientRect()
      const panel = details.getBoundingClientRect()
      const bottomSheet = window.matchMedia("(max-width: 650px)").matches
      const width = bottomSheet ? bounds.width : Math.max(0, panel.left - bounds.left - 12)
      const height = bottomSheet ? Math.max(0, panel.top - bounds.top - 12) : bounds.height
      void flow.setViewport(
        selectedCardViewport(
          node.position,
          width,
          height,
          window.matchMedia(largeScreenQuery).matches ? largeScreenFocusedZoom : focusedZoom,
          {
            width: node.width!,
            height: node.height!,
          },
        ),
        { duration: viewportDuration() },
      )
    }
    centerSelection()
    const observer = new ResizeObserver(centerSelection)
    observer.observe(canvas)
    observer.observe(details)
    return () => observer.disconnect()
  }, [flow, selectedId, focusRequest, data])
  const targetRole =
    selectedNode?.data.kind === "role" && selected ? selected.roles.indexOf(selectedRole) : null
  async function generatePlan(schedule: PlanScheduleInput): Promise<GeneratedPlan> {
    if (!selected || selected.coverage !== "available")
      throw new Error("Choose an available direction.")
    const courses = courseList(selected, targetRole)
    const response = await fetch("/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(65_000),
      body: JSON.stringify({
        occupationCode: data.occupationCode,
        strategyId: selected.id,
        destinationId: targetRole === null ? null : selected.destinations[targetRole]!.id,
        profile: navigatorContext(profile),
        pace: sprint ? "intensive" : "lean",
        schedule,
        resourceIds: Object.entries(navigatorResources)
          .filter(([, resource]) => courses.some((course) => course.href === resource.href))
          .map(([id]) => id),
      }),
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || "Your plan could not be generated.")
    return generatedPlanSchema.parse(result)
  }
  function selectNode(id: string) {
    if (!document.activeElement?.closest('[aria-labelledby="role-details-title"]')) {
      returnFocus.current = document.activeElement as HTMLElement
    }
    setSelectedId(id)
    setFocusRequest((request) => request + 1)
  }
  function closeDetails() {
    setSelectedId(null)
    void flow?.fitView({
      padding: 0.18,
      minZoom: 0.25,
      maxZoom: defaultZoom,
      duration: viewportDuration(),
    })
    if (returnFocus.current?.isConnected) returnFocus.current.focus({ preventScroll: true })
  }
  return (
    <div className="navigator-canvas flex min-h-[660px] h-full flex-col bg-background text-foreground">
      <h1 className="sr-only">Explore your career multiverse</h1>
      <div
        ref={canvasRef}
        className="relative min-h-[400px] min-w-0 flex-1 overflow-hidden"
        aria-label="Interactive career path canvas"
      >
        <Button
          variant="outline"
          disabled={!commitment?.plan}
          onClick={() => setPlanOpen(true)}
          className="absolute top-3 left-3 z-10 border-border bg-background/90 text-foreground shadow-sm backdrop-blur hover:bg-accent hover:text-accent-foreground"
        >
          <BookOpen /> View full plan
        </Button>
        <ReactFlow<RoleNode>
          nodes={careerNodes.map((node) => ({
            ...node,
            selected: node.id === selectedId,
          }))}
          // Custom glow and spark layers own animation timing, not React Flow's dash animation.
          edges={careerEdges(
            careerPaths,
            careerNodes,
            selectedId ?? data.recommendedPathId ?? careerPaths[0]?.id ?? null,
          ).map((edge) => ({ ...edge, animated: false }))}
          nodesDraggable={false}
          fitView={!initialSelectedId}
          fitViewOptions={{ padding: 0.18, minZoom: 0.25, maxZoom: defaultZoom }}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          colorMode={resolvedTheme === "dark" ? "dark" : "light"}
          style={{ background: "var(--background)" }}
          onInit={(instance) => {
            setFlow(instance)
            if (!initialSelectedId)
              void instance.fitView({ padding: 0.18, minZoom: 0.25, maxZoom: maxZoom() })
          }}
          minZoom={0.25}
          maxZoom={1.6}
          nodesConnectable={false}
          edgesReconnectable={false}
          deleteKeyCode={null}
          onNodeClick={(_, node) => {
            if (node.data.pathId) selectNode(node.id)
          }}
          // Keyboard access to role details: Enter/Space on a focused card acts like a click.
          onKeyDown={(event) => {
            if (event.key !== "Enter" && event.key !== " ") return
            const id = (event.target as HTMLElement).closest<HTMLElement>(".react-flow__node")
              ?.dataset.id
            if (id && careerNodes.find((node) => node.id === id)?.data.pathId) {
              event.preventDefault()
              selectNode(id)
            }
          }}
          className="!bg-background motion-reduce:[&_path]:!animate-none"
          aria-label="Career paths: drag canvas to pan, scroll to zoom, select a role to see details"
        >
          <Background variant={BackgroundVariant.Dots} gap={32} size={0.6} color="var(--border)" />
          <Controls showInteractive={false} position="bottom-left" className="[&_button]:!size-9" />
        </ReactFlow>
        {selected && (
          <aside
            ref={detailsRef}
            aria-labelledby="role-details-title"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.stopPropagation()
                closeDetails()
              }
            }}
            className="absolute inset-y-3 right-3 z-10 flex w-[560px] max-w-[calc(100%-24px)] min-[651px]:max-w-[70%] flex-col overflow-hidden rounded-xl border bg-popover text-foreground shadow-lg max-[650px]:top-auto max-[650px]:h-[90%]"
          >
            <header className="relative shrink-0 border-b px-6 pt-6 pb-5 max-[650px]:px-4 max-[650px]:pt-4 max-[650px]:pb-3">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Close role details"
                className="absolute top-3 right-3"
                onClick={closeDetails}
              >
                <X />
              </Button>
              <p
                className="mb-3 pr-6 text-[12px] tracking-[1.5px]"
                style={{ color: selected.color }}
              >
                {selected.label.toUpperCase()} / YOUR PROFILE
              </p>
              {selected.mappingLevel === "family" && (
                <p className="mb-2 text-xs text-muted-foreground">
                  Family exploration · validate fit
                </p>
              )}
              <h2
                id="role-details-title"
                className="pr-5 text-[25px] font-medium leading-tight max-[650px]:text-[21px]"
              >
                {selectedRole}
              </h2>
              <nav
                aria-label="Switch strategy"
                className="mt-4 flex items-center justify-between gap-2"
              >
                <Button
                  variant="outline"
                  size="sm"
                  aria-label={`Previous strategy: ${previousStrategy.label}`}
                  onClick={() => selectNode(previousStrategy.id)}
                >
                  <ArrowLeft /> Previous
                </Button>
                <span aria-live="polite" className="text-xs text-muted-foreground">
                  {selected.label} · {strategyIndex + 1}/{careerPaths.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label={`Next strategy: ${nextStrategy.label}`}
                  onClick={() => selectNode(nextStrategy.id)}
                >
                  Next <ArrowRight />
                </Button>
              </nav>
            </header>
            <Tabs defaultValue="overview" className="min-h-0 flex-1 gap-0">
              <TabsList
                aria-label="Role details sections"
                className="mx-6 my-3 min-h-10 w-auto shrink-0 max-[650px]:mx-4"
              >
                <TabsTrigger value="overview" className="text-[14px]">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="skills" className="text-[14px]">
                  Skills & project
                </TabsTrigger>
                <TabsTrigger value="learning" className="text-[14px]">
                  Learning
                </TabsTrigger>
              </TabsList>
              <TabsContent
                value="overview"
                className="min-h-0 space-y-5 overflow-y-auto px-6 pb-5 max-[650px]:px-4"
              >
                <p className="text-[15px] leading-relaxed text-muted-foreground">
                  {selected.description}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {selected.coverage === "unsupported"
                    ? "No reviewed destinations available."
                    : "Curated pathways, not verified occupations or job openings."}{" "}
                  {selected.mappingRationale}
                </p>

                <section aria-label="Other roles in this direction">
                  <h3 className="mb-3 text-[15px] font-medium">Curated pathway labels</h3>
                  <div className="flex flex-wrap gap-2">
                    {selected.roles.map((role, index) => (
                      <Button
                        key={role}
                        variant="outline"
                        aria-pressed={selectedId === `${selected.id}-role-${index}`}
                        className="h-auto min-h-9 whitespace-normal text-left text-[13px]"
                        onClick={() => selectNode(`${selected.id}-role-${index}`)}
                      >
                        {role}
                      </Button>
                    ))}
                  </div>
                </section>
                <section className="rounded-lg bg-muted/60 p-4">
                  <h3 className="mb-2 text-[15px] font-medium">Why this fits your profile</h3>
                  <p className="text-[15px] leading-relaxed text-muted-foreground">
                    {selected.why}
                  </p>
                </section>
                {selectedRole !== selected.title && (
                  <p className="text-[14px] text-muted-foreground">
                    An alternative within {selected.title}, not a required step before another role.
                    Experience and entry requirements vary by employer.
                  </p>
                )}
              </TabsContent>
              <TabsContent
                value="skills"
                className="min-h-0 space-y-5 overflow-y-auto px-6 pb-5 max-[650px]:px-4"
              >
                <section>
                  <h2 className="mb-3 text-[17px] font-medium">Skills to build</h2>
                  <div className="flex flex-wrap gap-2">
                    {selected.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md border border-border bg-muted px-3 py-2 text-[14px] text-foreground"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
                <section className="rounded-xl border border-border bg-muted/60 p-5">
                  <p className="text-[12px] tracking-[1px] text-mauve-deep">
                    BUILD PROOF, NOT JUST A CERTIFICATE
                  </p>
                  <h2 className="mt-2 text-[18px]">Your bridge project</h2>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                    {selected.project}
                  </p>
                </section>
                <section className="border-t border-border pt-5">
                  <h2 className="text-[17px] font-medium">Start this week</h2>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                    {selected.firstStep}
                  </p>
                </section>
              </TabsContent>
              <TabsContent
                value="learning"
                className="min-h-0 space-y-5 overflow-y-auto px-6 pb-5 max-[650px]:px-4"
              >
                <section>
                  <h2 className="mb-3 flex items-center gap-2 text-[17px] font-medium">
                    <BookOpen className="size-4" /> Courses, credentials & resources
                  </h2>
                  <div className="space-y-3">
                    {selected.resources.map((resource) => (
                      <a
                        key={resource.href}
                        href={resource.href}
                        target="_blank"
                        rel="noreferrer"
                        className="group block rounded-xl border border-border p-4 transition-colors hover:border-mauve focus-visible:outline-2 focus-visible:outline-ring"
                      >
                        <p className="text-[12px] text-muted-foreground">
                          {resource.provider} · {resource.type}
                        </p>
                        <h3 className="mt-2 flex items-start justify-between gap-3 text-[16px] font-medium">
                          {resource.title}
                          <ArrowUpRight className="mt-1 size-4 shrink-0" />
                        </h3>
                        <p className="mt-2 text-[16px] leading-relaxed text-muted-foreground">
                          {resource.note}
                        </p>
                      </a>
                    ))}
                  </div>
                  <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
                    Official provider links checked October 2026. Availability, fees and eligibility
                    can change. Credentials do not guarantee employment.
                  </p>
                </section>
              </TabsContent>
            </Tabs>
            <footer className="shrink-0 border-t bg-popover px-6 py-4 max-[650px]:px-4">
              {commitment?.plan ? (
                <Button asChild className="h-auto min-h-11 w-full whitespace-normal">
                  <Link href="/progress">
                    Track my progress <ArrowRight />
                  </Link>
                </Button>
              ) : selected.coverage === "available" ? (
                <Button
                  onClick={() => setCommitOpen(true)}
                  className="h-auto min-h-11 w-full whitespace-normal"
                >
                  Build this direction into a plan <ArrowRight />
                </Button>
              ) : (
                <p>No plan available until a destination mapping is reviewed.</p>
              )}
            </footer>
          </aside>
        )}
      </div>
      {selected && commitOpen && (
        <CommitDirectionDialog
          open={commitOpen}
          onOpenChange={setCommitOpen}
          pathId={selected.id}
          direction={selected.title}
          role={targetRole === null ? null : selectedRole}
          sprint={sprint}
          profile={profile}
          generate={generatePlan}
          onSaved={(saved) => {
            setCommitment(saved)
            setPlanOpen(true)
          }}
        />
      )}
      <PlanSheet
        open={planOpen}
        onOpenChange={setPlanOpen}
        commitment={commitment}
        onCommitmentChange={setCommitment}
      />
    </div>
  )
}
