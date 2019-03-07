import { basename } from "path"

module.exports = dot => {
  if (dot.cliEmit) {
    return
  }

  dot("logLevel", "cliEmit", { info: "debug" })

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

      return dot(
        eventId,
        args.prop || prop.concat([name]),
        args
      )
    })
  )
}