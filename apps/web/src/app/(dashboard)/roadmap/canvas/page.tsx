"use client"

import { Suspense, useEffect, useLayoutEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, GitBranch, MapPin, X } from "lucide-react"
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  Position,
  type NodeProps,
  type ReactFlowInstance,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
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
import { Roadmap } from "@/components/navigator-plan-view"
import {
  loadCommitment,
  timelineSprint,
  type Commitment,
  type GeneratedPlan,
} from "@/lib/commitment"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { useNavigator } from "@/components/navigator-provider"
import { NavigatorStatus } from "@/components/navigator-status"
import {
  buildCareerNodes,
  rolePageSize,
  careerEdges,
  selectedCardViewport,
  defaultZoom,
  largeScreenQuery,
  largeScreenZoom,
  type RoleNode,
} from "@/lib/career-canvas"

function RoleCard({ data, selected }: NodeProps<RoleNode>) {
  return (
    <div
      className="relative flex h-[152px] w-[260px] flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-shadow"
      style={{
        borderColor: selected ? data.color : "var(--border)",
        boxShadow: selected ? `0 0 0 1px ${data.color}, 0 8px 24px #0001` : undefined,
      }}
    >
      {data.kind !== "start" && (
        <Handle
          type="target"
          position={Position.Left}
          className="!border-background !bg-muted-foreground"
        />
      )}
      <div className="min-h-0 flex-1 px-4 py-4">
        <p className="mb-3 flex items-center gap-2 text-[12px] tracking-[1px] text-muted-foreground">
          {data.kind === "start" ? (
            <MapPin className="size-4" />
          ) : (
            <GitBranch className="size-4" style={{ color: data.color }} />
          )}
          {data.kind === "start"
            ? "STARTING POINT"
            : data.kind === "path"
              ? data.strategyLabel?.toUpperCase()
              : data.kind === "more"
                ? "MORE OPTIONS"
                : "ROLE TO EXPLORE"}
        </p>
        <h2 className="line-clamp-2 text-[22px] font-medium leading-tight">{data.title}</h2>
        {data.subtitle && (
          <p className="mt-2 line-clamp-1 text-[14px] leading-relaxed text-muted-foreground">
            {data.subtitle}
          </p>
        )}
      </div>
      {data.kind === "more" && (
        <div
          className="flex shrink-0 items-center justify-between border-t px-4 py-3 text-[13px]"
          style={{ color: data.color }}
        >
          <span>Reveal next options</span>
          <ArrowUpRight className="size-4" />
        </div>
      )}
      {data.kind !== "more" && (
        <Handle
          type="source"
          position={Position.Right}
          className="!border-background !bg-muted-foreground"
        />
      )}
    </div>
  )
}

const nodeTypes = { role: RoleCard }
const maxZoom = () => (window.matchMedia(largeScreenQuery).matches ? largeScreenZoom : defaultZoom)
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
  const initialPathId = data.paths.find((path) => path.id === requestedPath)?.id ?? "automate"
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
    const saved = loadCommitment()
    if (saved?.plan?.plan.occupationCode && saved.plan.plan.occupationCode !== data.occupationCode)
      return
    setCommitment(saved)
    if (saved?.plan && params.get("plan") === "1") setPlanOpen(true)
  }, [data.occupationCode, params])
  const sprint = timelineSprint(profile.timeline) ?? profile.hours === "5+ hours"
  const careerPaths = data.paths
  const [roleLimits, setRoleLimits] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      careerPaths.map((path) => {
        const index = initialSelectedId?.startsWith(`${path.id}-role-`)
          ? Number(initialSelectedId.split("-role-")[1])
          : -1
        return [
          path.id,
          Math.max(rolePageSize, Math.ceil((index + 1) / rolePageSize) * rolePageSize),
        ]
      }),
    ),
  )
  const careerNodes = buildCareerNodes(careerPaths, data.roleTitle, roleLimits)
  const { resolvedTheme } = useTheme()
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
  const revealFocus = useRef<string | null>(null)
  useEffect(() => {
    if (!revealFocus.current) return
    const id = revealFocus.current
    revealFocus.current = null
    const frame = requestAnimationFrame(() => {
      const card = canvasRef.current?.querySelector<HTMLElement>(
        `.react-flow__node[data-id="${id}"]`,
      )
      card?.focus()
      returnFocus.current = card ?? null
    })
    return () => cancelAnimationFrame(frame)
  }, [roleLimits])
  useLayoutEffect(() => {
    const canvas = canvasRef.current
    const details = detailsRef.current
    const node = buildCareerNodes(data.paths, data.roleTitle, roleLimits).find(
      (item) => item.id === selectedId,
    )
    if (!flow || !canvas || !details || !node) return
    const centerSelection = () => {
      const bounds = canvas.getBoundingClientRect()
      const panel = details.getBoundingClientRect()
      const bottomSheet = window.matchMedia("(max-width: 650px)").matches
      const width = bottomSheet ? bounds.width : Math.max(0, panel.left - bounds.left - 12)
      const height = bottomSheet ? Math.max(0, panel.top - bounds.top - 12) : bounds.height
      void flow.setViewport(selectedCardViewport(node.position, width, height, maxZoom()))
    }
    centerSelection()
    const observer = new ResizeObserver(centerSelection)
    observer.observe(canvas)
    observer.observe(details)
    return () => observer.disconnect()
  }, [flow, selectedId, focusRequest, data, roleLimits])
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
    const node = careerNodes.find((item) => item.id === id)
    if (node?.data.kind === "more" && node.data.pathId) {
      const pathId = node.data.pathId
      const count = roleLimits[pathId] ?? rolePageSize
      revealFocus.current = `${pathId}-role-${count}`
      setRoleLimits((current) => ({ ...current, [pathId]: count + rolePageSize }))
      setSelectedId(`${pathId}-role-${count}`)
      setFocusRequest((request) => request + 1)
      return
    }
    if (!document.activeElement?.closest('[aria-labelledby="role-details-title"]')) {
      returnFocus.current = document.activeElement as HTMLElement
    }
    setSelectedId(id)
    setFocusRequest((request) => request + 1)
  }
  function closeDetails() {
    setSelectedId(null)
    if (returnFocus.current?.isConnected) returnFocus.current.focus()
  }
  return (
    <div className="flex min-h-[660px] h-full flex-col bg-background text-foreground">
      <h1 className="sr-only">Map your next move</h1>
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
          edges={careerEdges(careerPaths, careerNodes, selectedId)}
          nodesDraggable={false}
          nodeTypes={nodeTypes}
          colorMode={resolvedTheme === "dark" ? "dark" : "light"}
          onInit={(instance) => {
            setFlow(instance)
            if (!initialSelectedId)
              void instance.fitView({ padding: 0.18, minZoom: 0.55, maxZoom: maxZoom() })
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
          <Background variant={BackgroundVariant.Dots} gap={24} size={1.6} color="var(--input)" />
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
              {selected.coverage === "available" ? (
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
      <Sheet open={planOpen} onOpenChange={setPlanOpen}>
        <SheetContent side="bottom" className="data-[side=bottom]:h-[92dvh] gap-0 rounded-t-xl">
          <SheetHeader className="shrink-0 border-b pr-14">
            <SheetTitle>Your full plan</SheetTitle>
            <SheetDescription>
              Review your phases, daily tasks, milestones and learning resources.
            </SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {commitment?.plan && (
              <Roadmap
                data={data}
                requestedPath={commitment.pathId}
                requestedRole={
                  commitment.role === null
                    ? null
                    : String(
                        data.paths
                          .find((path) => path.id === commitment.pathId)
                          ?.roles.indexOf(commitment.role),
                      )
                }
                profileKey={profileKey}
                savedCommitment={commitment}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
