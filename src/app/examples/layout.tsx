import { ExamplesGrid } from "@/components/ExamplesGrid"

export default function ExamplesLayou({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <ExamplesGrid>{children}</ExamplesGrid>
}
