"use client"
import { ExampleCards } from "@/components/ExampleCards"
import NextApiService from "@/services/NextApi.service"
import { Example } from "@/types"
import { useEffect, useState } from "react"

export default function Home() {
  const [examples, setExamples] = useState<Example[]>([])
  useEffect(() => {
    NextApiService.getExamples().then((examples) => {
      setExamples(examples)
    })
  }, [])

  return <ExampleCards examples={examples} />
}
