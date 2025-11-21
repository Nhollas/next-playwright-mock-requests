import { ExampleCards } from "@/components/ExampleCards"
import ExampleService from "@/services/Example.service"

export const dynamic = "force-dynamic"

export default async function ExamplesList() {
  const examples = await ExampleService.getExamples()
  return <ExampleCards examples={examples} />
}
