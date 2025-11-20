import { HttpResponse, http } from "msw"
import test from "../fixtures/next-fixture"
import { expect } from "@playwright/test"
import { exampleGenerator } from "test/data-generators"
import { buildServiceUrl } from "playwright/utils"
import { env } from "@/lib/env"

test("We can mock requests made to the server from the browser.", async ({
  page,
  serverRequestInterceptor,
  revalidatePath,
}) => {
  const mockExamples = Array.from({ length: 3 }, exampleGenerator)

  serverRequestInterceptor.use(
    http.get(buildServiceUrl(env.EXAMPLE_SERVICE_URL, "/"), () =>
      HttpResponse.json(mockExamples),
    ),
  )

  await page.goto("/examples/csr")

  for (const example of mockExamples) {
    await expect(
      page.getByRole("heading", { name: example.title }),
    ).toBeVisible()

    await expect(page.getByText(example.description)).toBeVisible()
  }
})
