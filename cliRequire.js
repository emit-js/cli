import { isAbsolute, join } from "path"

module.exports = dot => {
  if (dot.cliRequire) {
    return
  }

  dot("logLevel", "cliRequire", { info: "debug" })

  dot.any("cliRequire", cliRequire)
}

function cliRequire(prop, arg, dot) {
  if (arg.require) {
    const off = dot.any(
      "dependencies",
      addDependencies.bind(arg)
    )

    addRequires(prop, arg, dot)
    off()
  }
}

function addDependencies(prop, arg, dot) {
  const { cwd } = this

  arg.forEach(req => {
    const paths = {
      p1: join(cwd, req),
      p2: req,
    }

    tryRequire(prop, paths, dot)(dot)
  })
}

function tryRequire(prop, arg, dot) {
  const { p1, p2 } = arg
  var lib

  try {
    lib = require(p1)
  } catch (e) {
    try {
      lib = require(p2)
    } catch (e) {
      dot("log", "error", {
        arg: "Could not load dependency: " + p2,
      })
    }
  }

  return lib
}

function addRequires(prop, arg, dot) {
  arg.require = Array.isArray(arg.require)
    ? arg.require
    : [arg.require]

  return arg.require.map(req => {
    const abs = isAbsolute(req)
      ? req
      : join(arg.cwd, req, "package.json")

    const paths = {
      p1: abs,
      p2: req,
    }

    tryRequire(prop, paths, dot)(dot)
  })
}
