import findUp from "find-up"
import { readJson } from "fs-extra"
import { dirname, join } from "path"

module.exports = emit => {
  if (emit.cli) {
    return
  }

  emit.any("log", "error", () => process.exit(1))
  emit.any("cli", cli)
}

async function cli(arg, prop, emit) {
  const argv = await emit.argv(prop)

  if (argv.log) {
    emit("logLevel", argv.log)
  }

  var eventId = argv._.shift()

  if (!eventId) {
    emit("log", "error", prop, "no eventId specified")
  }

  argv.eventId = eventId

  const configPath = await findUp("emit.json")

  if (configPath) {
    const json = await readJson(configPath)
    Object.assign(argv, json[eventId])
  }

  const root = configPath
    ? dirname(configPath)
    : process.cwd()

  eventId = argv.eventId

  const pattern = `${root}/**/${eventId}.js`

  const paths = await emit.glob({
    ignore: "**/node_modules/**",
    pattern,
  })

  var path =
    paths.find(path => path.indexOf("/dist/") > -1) ||
    paths[0]

  if (!path) {
    path = require.resolve(eventId)
  }

  if (!path) {
    emit(
      "log",
      "error",
      prop,
      `could not find ${eventId} at ${pattern} or from global packages`
    )
  }

  const pkgPath = await findUp("package.json", {
    cwd: path,
  })

  const pkgDir = dirname(pkgPath)

  const off = emit.any(
    "dependencies",
    addDependencies.bind({ pkgDir })
  )

  require(path)(emit)

  off()

  emit(eventId, argv.props, argv)
}

function addDependencies(arg, prop, emit) {
  const { pkgDir } = this

  arg.forEach(dep => {
    const relPath = join(pkgDir, "../../", dep)
    var lib

    try {
      lib = require(relPath)
    } catch (e) {
      try {
        lib = require(dep)
      } catch (e) {
        null
      }
    }

    if (lib) {
      lib(emit)
    } else {
      emit(
        "log",
        "error",
        `could not find ${dep} from ${relPath} or from global packages`
      )
    }
  })
}
