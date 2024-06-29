import { HttpResponse, http } from "msw"
import test from "../fixtures/next-fixture"
import { expect } from "@playwright/test"
import { exampleGenerator } from "test/data-generators"
import { env } from "@/lib/env"
import { buildServiceUrl } from "playwright/utils"

test("We can mock server requests that happen before page load.", async ({
  page,
  serverRequestInterceptor,
}) => {
  const mockExamples = Array.from({ length: 3 }, exampleGenerator)

  serverRequestInterceptor.use(
    http.get(buildServiceUrl(env.EXAMPLE_SERVICE_URL, "/examples"), () =>
      HttpResponse.json(mockExamples),
    ),
  )

  await page.goto("/examples/ssr")

  for (const example of mockExamples) {
    await expect(
      page.getByRole("heading", { name: example.title }),
    ).toBeVisible()

    await expect(page.getByText(example.description)).toBeVisible()
  }
})
