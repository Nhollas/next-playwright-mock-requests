import { ExampleCards } from "@/components/ExampleCards"
import ExampleService from "@/services/Example.service"

export default async function ExamplesList() {
  const examples = await ExampleService.getExamples()
  return <ExampleCards examples={examples} />
}
