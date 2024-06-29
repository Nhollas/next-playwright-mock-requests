import { Example } from "../types"

import { ExampleCard } from "./ExampleCard"

export const ExampleCards = ({ examples }: { examples: Example[] }) => {
  return examples.map((example) => (
    <ExampleCard key={example.id} example={example} />
  ))
}
