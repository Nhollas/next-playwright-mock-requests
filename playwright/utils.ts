import { Page } from "@playwright/test"

export const buildLocalUrl = (port: string, path: string = "") =>
  `http://localhost:${port}${path}`

export const buildServiceUrl = (serviceUrl: string, path: string = "") =>
  `${serviceUrl}${path}`

type TestUtilsArgs = {
  page: Page
}

export const createTestUtils = (params: TestUtilsArgs) => {
  const { page } = params
  const pageObjects = {}

  return {
    po: pageObjects,
    page,
  }
}
