import findUp from "find-up"
import { readJson } from "fs-extra"
import { dirname, join } from "path"

module.exports = dot => {
  if (dot.cliArgv) {
    return
  }

  dot("logLevel", "cliArgv", { info: "debug" })

  dot.any("cliArgv", cliArgv)
}

async function cliArgv(prop, arg) {
  const path = await findUp("dot.json")

  var configDir, json

  if (path) {
    configDir = dirname(path)
    json = await readJson(path)
  }

  arg.eventId = arg._.shift()
  arg.cwd = configDir || process.cwd()

  if (!json || !json[arg.eventId]) {
    return
  }

  const config = json[arg.eventId]

  for (const key in config) {
    if (key === "require") {
      arg.require = config.require
        .map(path => join(configDir, path))
        .concat(arg.require || [])
    } else {
      arg[key] = config[key]
    }
  }
}
