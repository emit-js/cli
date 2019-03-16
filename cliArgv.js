import findUp from "find-up"
import { readJson } from "fs-extra"
import { dirname } from "path"

module.exports = dot => {
  if (dot.cliArgv) {
    return
  }

  dot("logLevel", "cliArgv", { info: "debug" })

  dot.any("cliArgv", cliArgv)
}

async function cliArgv(prop, arg, dot) {
  const argv = dot.argv(prop),
    path = await findUp("dot.json")

  var configDir, json

  if (path) {
    configDir = dirname(path)
    json = await readJson(path)
  }

  const eventId = argv._.shift()
  const config = json && json[eventId] ? json[eventId] : {}

  const configArgs = configToArgs(prop, {
    config,
    configDir,
    eventId,
  })

  return dot.argv(prop, {
    alias: { r: ["require"] },
    args: configArgs.concat(process.argv.slice(2)),
  })
}

function configToArgs(prop, arg) {
  const { config, configDir, eventId } = arg
  const cwd = configDir || process.cwd()

  var args = []

  if (!config.eventId) {
    args = args.concat(["--eventId=" + eventId])
  }

  if (!config.cwd) {
    args = args.concat(["--cwd=" + cwd])
  }

  for (const key in config) {
    if (Array.isArray(config[key])) {
      args = args.concat(
        config[key].map(v => `--${key}=` + v)
      )
    } else {
      args = args.concat([`--${key}=` + config[key]])
    }
  }

  return args
}
