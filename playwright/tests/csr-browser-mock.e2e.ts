import test from "../fixtures/next-fixture"
import { expect } from "@playwright/test"
import { exampleGenerator } from "test/data-generators"
import { buildLocalUrl } from "playwright/utils"

test("We can mock browser requests.", async ({
  page,
  interceptBrowserRequest,
  port,
}) => {
  const mockExamples = Array.from({ length: 3 }, exampleGenerator)

  await interceptBrowserRequest(buildLocalUrl(port, "/api/examples"), {
    json: mockExamples,
  })

  await page.goto("/examples/csr")

  for (const example of mockExamples) {
    await expect(
      page.getByRole("heading", { name: example.title }),
    ).toBeVisible()

    await expect(page.getByText(example.description)).toBeVisible()
  }
})
