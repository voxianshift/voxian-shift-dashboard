import { expect, test } from "vite-plus/test"
import { libraryMatch, libraryRoleFor, matchRoles, roleLibrary } from "./role-library.ts"

test("role library holds the prototype's 27 roles with ILO ISCO codes", () => {
  expect(roleLibrary).toHaveLength(27)
  expect(libraryRoleFor("41-3091.00")).toMatchObject({ id: "sales_rep", isco: "3322/2434" })
})

test("job titles match library roles the way the prototype does", () => {
  expect(matchRoles("Bookkeeper")[0]!.id).toBe("bookkeeper")
  expect(matchRoles("talent acquisition")[0]!.id).toBe("hr_recruiter")
  expect(matchRoles("account executive")[0]!.id).toBe("sales_rep")
  expect(matchRoles("")).toEqual([])
})

test("only roles with an O*NET link become selectable matches", () => {
  const sales = libraryMatch(libraryRoleFor("41-3091.00")!)!
  expect(sales).toMatchObject({
    code: "41-3091.00",
    title: "Sales Representative / Account Executive",
  })
  expect(libraryMatch(roleLibrary.find((role) => role.id === "content_mod")!)).toBeNull()
})
