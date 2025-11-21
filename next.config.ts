import type { NextConfig } from "next"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)

const nextConfig: NextConfig = {
  ...(process.env.MOCK_SERVER === "true" && {
    cacheHandler: require.resolve("@mocky-balboa/next-js/cache-handler"),
    cacheMaxMemorySize: 0,
  }),
}

export default nextConfig
