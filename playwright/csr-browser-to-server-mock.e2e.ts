import test from "@mocky-balboa/playwright/test"
import { expect } from "@playwright/test"
import { exampleGenerator } from "test/data-generators"
import { env } from "@/lib/env"

test("We can mock requests made to the server from the browser.", async ({
  page,
  mocky,
}) => {
  const mockExamples = Array.from({ length: 3 }, exampleGenerator)

  mocky.route(env.EXAMPLE_SERVICE_URL, (route) =>
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
