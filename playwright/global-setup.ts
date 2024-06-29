import { applicationFactory } from "./applicationFactory"

const globalSetup = async (): Promise<void> => {
  const baseApplication = await applicationFactory().create({
    outputDir: "playwright/builds/base",
  })

  if (baseApplication.isCurrentBuildOutdated) {
    await baseApplication.build()
  } else {
    console.log("No changes detected. Skipping `npm run build`")
  }
}

export default globalSetup
