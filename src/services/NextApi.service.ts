import { Example } from "@/types"
import { IClient, fetchWrapper } from "."

const NextApiClient: IClient = {
  fetch: fetchWrapper({
    baseUrl: "/api",
  }),
}

interface INextApiService {
  getExamples(): Promise<Example[]>
}

const NextApiService = (): INextApiService => ({
  async getExamples() {
    const response = await NextApiClient.fetch("/examples", {
      method: "GET",
      cache: "no-cache",
    })

    const examples = await response.json()

    return examples
  },
})

export default NextApiService()
