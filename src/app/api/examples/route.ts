import ExampleService from "@/services/Example.service"

export async function GET() {
  const examples = await ExampleService.getExamples()

  return Response.json(examples)
}
