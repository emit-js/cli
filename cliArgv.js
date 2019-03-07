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
  const argv = dot.arg(prop)
  const path = await findUp("dot.json")

  var configDir, json

  if (path) {
    configDir = dirname(path)
    json = await readJson(path)
  }

  const eventId = argv._.shift()

  if (!json || !json[eventId]) {
    return
  }

  const configArgs = configToArgs(prop, {
    config: json[eventId],
    configDir,
    eventId,
  })

  return dot.arg(prop, {
    alias: { r: ["require"] },
    args: configArgs.concat(process.argv.slice(2)),
  })
}

function configToArgs(prop, arg) {
  const { config, configDir, eventId } = arg
  const cwd = configDir || process.cwd()

  var args = ["--cwd=" + cwd, "--eventId=" + eventId]

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
