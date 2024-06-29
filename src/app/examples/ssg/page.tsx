import { ExampleCards } from "@/components/ExampleCards"
import ExampleService from "@/services/Example.service"

export const dynamic = "force-static"

export default async function Home() {
  const examples = await ExampleService.getExamples()

  return <ExampleCards examples={examples} />
}
