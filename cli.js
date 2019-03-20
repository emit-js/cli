import findUp from "find-up"
import { readJson } from "fs-extra"

module.exports = dot => {
  if (dot.cli) {
    return
  }

  dot.any("log", "error", () => process.exit(1))
  dot.any("cli", cli)
}

async function cli(prop, arg, dot) {
  const argv = await dot.argv(prop)

  const eventId = argv._.shift()

  if (!eventId) {
    dot("log", "error", "no eventId specified")
  }

  argv.eventId = eventId

  const configPath = await findUp("dot.json")

  if (configPath) {
    const json = await readJson(configPath)
    Object.assign(argv, json[eventId])
  }

  const pattern = `${process.cwd()}/**/${eventId}.js`

  const paths = await dot.glob({
    ignore: "**/node_modules/**",
    pattern,
  })

  const path =
    paths.find(path => path.indexOf("/dist/") > -1) ||
    paths[0]

  if (!path) {
    dot("log", "error", `no match for pattern ${pattern}`)
  }

  require(path)(dot)

  dot(eventId, argv._, argv)
}
