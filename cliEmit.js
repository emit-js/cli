import { basename } from "path"

module.exports = dot => {
  if (dot.cliEmit) {
    return
  }

  dot("logLevel", "cliEmit", { info: "debug" })
  dot("logLevel", "cliEmitOutput", { info: "debug" })

  dot.any("cliEmit", cliEmit)
}

function cliEmit(prop, arg, dot) {
  const { argv, paths, userArg } = arg
  const { eventId } = argv

  return Promise.all(
    paths.map(path => {
      const args = Object.assign({}, userArg, argv, {
          cli: true,
          cwd: path,
          path: path,
          paths: paths,
        }),
        name = basename(path).replace(/\./g, "-")

      const p = args.prop || prop.concat([name])

      const out = dot(eventId, p, args)

      if (out.then) {
        out.then(out => logOutput(p, out, dot))
      } else {
        logOutput(p, out, dot)
      }

      return out
    })
  )
}

function logOutput(prop, arg, dot) {
  if (arg) {
    dot("cliEmitOutput", prop, {
      message: arg ? arg.message || arg : "",
    })
  }
}
