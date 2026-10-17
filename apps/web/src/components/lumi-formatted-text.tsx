"use client"

import { useState, type ReactNode } from "react"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Check, Copy, ExternalLink } from "lucide-react"

function extractText(node: ReactNode): string {
  if (typeof node === "string") return node
  if (typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(extractText).join("")
  return ""
}

function CodeBlock({ className, children }: { className?: string; children: ReactNode }) {
  const [copied, setCopied] = useState(false)
  const language = className ? className.replace(/^language-/, "") : "text"
  const rawCode = extractText(children).replace(/\n$/, "")

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="my-2.5 overflow-hidden rounded-lg border border-border/70 bg-zinc-950 text-zinc-100 shadow-xs">
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/90 px-3 py-1.5 text-[11px] text-zinc-400">
        <span className="font-mono uppercase tracking-wider text-[10px] text-cyan-400">
          {language}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="size-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="size-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto p-3 font-mono text-[12px] leading-relaxed">
        <pre className="m-0 bg-transparent p-0">
          <code>{children}</code>
        </pre>
      </div>
    </div>
  )
}

export function LumiFormattedText({ text }: { text: string }) {
  return (
    <div className="space-y-1.5 text-[13px] leading-relaxed text-foreground">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p({ children }) {
            return <p className="my-1.5 leading-relaxed first:mt-0 last:mb-0">{children}</p>
          },
          h1({ children }) {
            return (
              <h1 className="mt-3 mb-1.5 border-b border-border/50 pb-1 text-[15px] font-bold tracking-tight text-foreground">
                {children}
              </h1>
            )
          },
          h2({ children }) {
            return (
              <h2 className="mt-2.5 mb-1 text-[14px] font-semibold tracking-tight text-foreground">
                {children}
              </h2>
            )
          },
          h3({ children }) {
            return (
              <h3 className="mt-2 mb-1 text-[13.5px] font-semibold text-cyan-700 dark:text-cyan-300">
                {children}
              </h3>
            )
          },
          h4({ children }) {
            return (
              <h4 className="mt-1.5 mb-0.5 text-[13px] font-medium text-foreground">{children}</h4>
            )
          },
          ul({ children }) {
            return (
              <ul className="my-1.5 space-y-1 pl-4 list-disc marker:text-cyan-500 text-[13px]">
                {children}
              </ul>
            )
          },
          ol({ children }) {
            return (
              <ol className="my-1.5 space-y-1 pl-4 list-decimal marker:text-cyan-500 text-[13px]">
                {children}
              </ol>
            )
          },
          li({ children }) {
            return <li className="leading-relaxed">{children}</li>
          },
          blockquote({ children }) {
            return (
              <blockquote className="my-2 rounded-r-md border-l-2 border-cyan-500/70 bg-muted/30 py-1 pl-3 text-[12.5px] italic text-muted-foreground">
                {children}
              </blockquote>
            )
          },
          strong({ children }) {
            return <strong className="font-semibold text-foreground">{children}</strong>
          },
          em({ children }) {
            return <em className="italic text-foreground/90">{children}</em>
          },
          hr() {
            return <hr className="my-2.5 border-border/60" />
          },
          a({ href, children }) {
            if (!href) return <span>{children}</span>
            const isInternal = href.startsWith("/") || href.startsWith("#")
            if (isInternal) {
              return (
                <Link
                  href={href}
                  className="font-medium text-cyan-600 underline decoration-cyan-500/40 underline-offset-2 hover:decoration-cyan-500 dark:text-cyan-400"
                >
                  {children}
                </Link>
              )
            }
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 font-medium text-cyan-600 underline decoration-cyan-500/40 underline-offset-2 hover:decoration-cyan-500 dark:text-cyan-400"
              >
                <span>{children}</span>
                <ExternalLink className="size-3 opacity-70" />
              </a>
            )
          },
          table({ children }) {
            return (
              <div className="my-2.5 w-full overflow-x-auto rounded-lg border border-border/70">
                <table className="w-full text-left text-[12px]">{children}</table>
              </div>
            )
          },
          thead({ children }) {
            return (
              <thead className="border-b border-border/70 bg-muted/60 font-semibold text-foreground">
                {children}
              </thead>
            )
          },
          th({ children }) {
            return <th className="px-2.5 py-1.5 font-medium">{children}</th>
          },
          td({ children }) {
            return <td className="border-t border-border/40 px-2.5 py-1.5">{children}</td>
          },
          pre({ children }) {
            return <>{children}</>
          },
          code(props) {
            const { className, children } = props
            const textContent = extractText(children)
            const isMultiline = textContent.includes("\n")
            if (isMultiline || className) {
              return <CodeBlock className={className}>{children}</CodeBlock>
            }
            return (
              <code className="rounded border border-border/50 bg-muted/70 px-1.2 py-0.5 font-mono text-[11.5px] font-medium text-cyan-700 dark:text-cyan-300">
                {children}
              </code>
            )
          },
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  )
}
