import { z } from "zod"

export const env = z
  .object({
    EXAMPLE_SERVICE_URL: z.string().url(),
  })
  .parse(process.env)
