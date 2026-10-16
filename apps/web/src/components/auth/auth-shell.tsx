import type { ReactNode } from "react"

// Centered auth column, same shape as seratus-webapp's auth pages
export function AuthShell({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <p className="text-sm font-semibold tracking-tight text-primary">Voxian Shift</p>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-base text-muted-foreground">{description}</p>
        </div>
        {children}
      </div>
    </main>
  )
}

export function OrDivider() {
  return (
    <div className="flex items-center gap-3">
      <hr className="flex-1 border-border" />
      <span className="text-base text-muted-foreground">or</span>
      <hr className="flex-1 border-border" />
    </div>
  )
}
