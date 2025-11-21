import { expect } from "@playwright/test"
import test from "@mocky-balboa/playwright/test"
import { exampleGenerator } from "test/data-generators"
import {} from "@mocky-balboa/next-js"

test("We can mock browser requests.", async ({ page, mocky }) => {
  mocky
  const mockExamples = Array.from({ length: 3 }, exampleGenerator)

  mocky.route("**/api/examples", (route) =>
    route.fulfill({
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mockExamples),
    }),
  )

  await page.goto("http://localhost:3000/examples/csr")

  for (const example of mockExamples) {
    await expect(
      page.getByRole("heading", { name: example.title }),
    ).toBeVisible()

    await expect(page.getByText(example.description)).toBeVisible()
  }
})
