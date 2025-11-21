import { ExampleCards } from "@/components/ExampleCards"
import ExampleService from "@/services/Example.service"

export default async function Home() {
  "use cache"
  const examples = await ExampleService.getExamples()

  return <ExampleCards examples={examples} />
}
