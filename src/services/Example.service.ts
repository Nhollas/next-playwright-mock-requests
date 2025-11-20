import { Example } from "@/types"

import { IClient, fetchWrapper } from "."
import { env } from "@/lib/env"

interface IExampleClient extends IClient {}

const ExampleClient: IExampleClient = {
  fetch: fetchWrapper({
    baseUrl: env.EXAMPLE_SERVICE_URL,
  }),
}

interface IExampleService {
  getExamples(): Promise<Example[]>
}

const ExampleService = (): IExampleService => ({
  async getExamples() {
    const response = await ExampleClient.fetch("/", {
      method: "GET",
    })

    const examples = await response.json()

    return examples as Example[]
  },
})

export default ExampleService()
