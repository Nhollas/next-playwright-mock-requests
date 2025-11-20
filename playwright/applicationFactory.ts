import fs from "fs-extra"
import path from "path"
import { spawn } from "child_process"

const rootPath = path.join(__dirname, "../")

const sourcePathsToCopy: string[] = [
  "package.json",
  "next.config.mjs",
  "public",
  ".env.local",
  "src",
  "tsconfig.json",
  "tailwind.config.ts",
  "postcss.config.mjs",
]

const filesToIgnore: string[] = ["next-env.d.ts"]

const shouldIgnoreFile = (filePath: string): boolean => {
  return filesToIgnore.some((ignoredFile) => filePath.endsWith(ignoredFile))
}

/**
 * Recursively gets all file paths from the provided directories.
 * @param filePaths - Array of file or directory paths.
 * @returns Array of all file paths.
 */
export const getAllFilePaths = async (
  filePaths: string[],
): Promise<string[]> => {
  const allFiles = new Set<string>()

  const processFile = async (file: string) => {
    const stats = await fs.stat(file)

    if (stats.isDirectory()) {
      const subFiles = await fs.readdir(file)
      const subPaths = subFiles.map((subFile) => path.join(file, subFile))
      const subFilePaths = await getAllFilePaths(subPaths)
      subFilePaths.forEach((subFilePath) => allFiles.add(subFilePath))
    } else {
      allFiles.add(file)
    }
  }

  await Promise.all(filePaths.map(processFile))

  return Array.from(allFiles)
}

/**
 * Synchronizes a file from source to destination.
 * @param source - Source file path.
 * @param destination - Destination file path.
 * @returns An object indicating whether the file had to be deleted, created, or updated.
 */
export const syncFile = async (
  source: string,
  destination: string,
  targetDirectory: string,
): Promise<{ hasFileChanged: boolean }> => {
  try {
    const [srcExists, destExists] = await Promise.all([
      fs.pathExists(source),
      fs.pathExists(destination),
    ])

    // Calculate the relative path for logging
    const relativeDestPath = path.relative(targetDirectory, destination)

    if (!srcExists && destExists) {
      // Source file or directory was deleted
      console.log(
        `Removing \`${relativeDestPath}\` as it no longer exists in the source.`,
      )
      await fs.remove(destination)
      return { hasFileChanged: true }
    }

    if (srcExists && !destExists) {
      // Destination file or directory does not exist
      await fs.copy(source, destination)
      console.log(`Creating \`${relativeDestPath}\` as it does not exist.`)
      return { hasFileChanged: true }
    }

    if (srcExists && destExists) {
      const [srcContent, destContent] = await Promise.all([
        fs.readFile(source, "utf-8"),
        fs.readFile(destination, "utf-8"),
      ])

      if (srcContent !== destContent) {
        // File contents differ, update the destination
        await fs.copy(source, destination)
        console.log(`Updating \`${relativeDestPath}\` as it has changed.`)

        // Log the differences
        const srcLines = srcContent.split("\n")
        const destLines = destContent.split("\n")
        const maxLines = Math.max(srcLines.length, destLines.length)

        console.log("  Differences:")
        for (let i = 0; i < maxLines; i++) {
          if (srcLines[i] !== destLines[i]) {
            console.log(`    Line ${i + 1}:`)
            if (destLines[i] !== undefined) {
              console.log(`      - ${destLines[i]}`)
            }
            if (srcLines[i] !== undefined) {
              console.log(`      + ${srcLines[i]}`)
            }
          }
        }
        console.log("")

        return { hasFileChanged: true }
      }
    }

    return { hasFileChanged: false }
  } catch (error) {
    console.error(`Error syncing file from ${source} to ${destination}:`, error)
    throw error
  }
}

/**
 * Factory function to create an application instance.
 * @returns Application instance.
 */
export const applicationFactory = () => {
  let _targetDirectory: string

  const builder = {
    build: async () => {
      console.log()
      console.log("Running `npm run build` ...")

      const startTime = Date.now()
      const buildProcess = spawn("npm", ["run", "build"], {
        cwd: _targetDirectory,
        stdio: "inherit", // This will inherit stdio from the parent, streaming output in real-time
        shell: true, // For Windows compatibility
      })

      // Wait for the build process to complete
      await new Promise((resolve, reject) => {
        buildProcess.on("close", (code) => {
          if (code === 0) {
            console.log(`Build completed in ${Date.now() - startTime}ms.`)
            resolve(code)
          } else {
            reject(new Error(`Build failed with code ${code}`))
          }
        })
      })

      const srcDir = path.join(_targetDirectory, ".next")
      const destDir = path.join(rootPath, ".next")

      await fs.move(srcDir, destDir, { overwrite: true })
    },
  }

  const self = {
    create: async ({ outputDir }: { outputDir: string }) => {
      _targetDirectory = path.join(rootPath, outputDir)
      await fs.ensureDir(_targetDirectory)

      const [srcFilePaths, destFilePaths] = await Promise.all([
        getAllFilePaths(sourcePathsToCopy),
        getAllFilePaths([_targetDirectory]),
      ])

      // Filter out ignored files
      const filteredSrcFilePaths = srcFilePaths.filter((file) => !shouldIgnoreFile(file))
      const filteredDestFilePaths = destFilePaths.filter((file) => !shouldIgnoreFile(file))

      const haveAnyFilesChanged = await Promise.all(
        filteredSrcFilePaths.map(async (file) => {
          const srcPath = path.join(rootPath, file)
          const destPath = path.join(_targetDirectory, file)

          return await syncFile(srcPath, destPath, _targetDirectory)
        }),
      ).then((results) => results.some((r) => r.hasFileChanged))

      const filesToRemove = filteredDestFilePaths.filter(
        (file) =>
          !filteredSrcFilePaths.includes(file.replace(_targetDirectory + "/", "")),
      )

      await Promise.all(
        filesToRemove.map(async (file) => {
          await fs.remove(file)

          const relativePath = path.relative(_targetDirectory, file)
          console.log(
            `Removed ${relativePath} from destination as it no longer exists in source.`,
          )
        }),
      )

      const currentBuildExists = await fs.pathExists(
        path.join(rootPath, ".next"),
      )
      const isCurrentBuildOutdated =
        haveAnyFilesChanged || filesToRemove.length > 0 || !currentBuildExists

      return { ...builder, isCurrentBuildOutdated }
    },
  }

  return self
}
