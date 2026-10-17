import { expect, test, vi } from "vite-plus/test"
import { buildApp } from "./app.ts"
import { extractCv } from "./cv.ts"
import type { OccupationCatalogue } from "./occupation-catalogue.ts"

const headers = {
  "content-type": "application/octet-stream",
  "user-agent": "Mozilla/5.0",
  origin: "http://localhost:3000",
}

test("CV text uses catalogue matching without persisting file or profile", async () => {
  const search = vi.fn(async () => [])
  const select = vi.fn()
  const app = buildApp({
    catalogue: {
      search,
      select,
      selections: async () => ({ occupations: [], primaryOccupation: "" }),
      close: async () => {},
    } satisfies OccupationCatalogue,
  })
  try {
    const response = await app.inject({
      method: "POST",
      url: "/onboarding/cv?format=txt",
      headers,
      payload: Buffer.from("Software developer\nBuild software and maintain applications."),
    })
    expect(response.statusCode).toBe(200)
    expect(response.headers["cache-control"]).toBe("no-store")
    expect(search).toHaveBeenCalledWith(
      "Software developer Build software and maintain applications.",
      3,
    )
    expect(select).not.toHaveBeenCalled()
  } finally {
    await app.close()
  }
})

test("CV endpoint rejects foreign origins, unsupported formats, corrupt documents, and oversized files", async () => {
  const app = buildApp({
    catalogue: {
      search: async () => [],
      select: async () => {},
      selections: async () => ({ occupations: [], primaryOccupation: "" }),
      close: async () => {},
    },
  })
  try {
    const upload = (format: string, payload: Buffer, origin = headers.origin) =>
      app.inject({
        method: "POST",
        url: `/onboarding/cv?format=${format}`,
        headers: { ...headers, origin },
        payload,
      })
    expect(
      (
        await upload(
          "txt",
          Buffer.from("Software developer work experience"),
          "https://other.example",
        )
      ).statusCode,
    ).toBe(403)
    expect((await upload("doc", Buffer.from("legacy Word"))).statusCode).toBe(400)
    expect((await upload("pdf", Buffer.from("Not a PDF"))).statusCode).toBe(422)
    expect((await upload("docx", Buffer.from("Not a ZIP"))).statusCode).toBe(422)
    expect((await upload("txt", Buffer.alloc(2 * 1024 * 1024 + 1, 65))).statusCode).toBe(413)
  } finally {
    await app.close()
  }
})

test("text extraction rejects invalid UTF-8", async () => {
  await expect(extractCv(Buffer.from([0xff, 0xfe]), "txt")).rejects.toThrow()
})
