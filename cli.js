/*global Promise*/
/*prettier-ignore*/
"use strict"

import findUp from "find-up"
import { readJson } from "fs-extra"
import { basename, dirname, isAbsolute, join } from "path"

module.exports = dot => {
  if (dot.cli) {
    return
  }

  dot.any("log", "error", () => process.exit(1))
  dot.any("cli", cli)
}

async function cli(prop, arg, dot) {
  const argv = dot.arg(prop, { alias: { r: ["require"] } })

  await prepareArgv(prop, argv, dot)
  await dynamicRequire(prop, argv, dot)

  const paths = await resolvePathArg(prop, argv, dot)

  await emitEvents.call(
    { argv: argv, paths: paths },
    prop,
    arg,
    dot
  )
}

async function prepareArgv(prop, arg) {
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

async function resolvePathArg(prop, arg, dot) {
  const pattern =
    arg._.length === 1
      ? arg._[0]
      : "{" + arg._.join(",") + "}"

  return arg._.length
    ? await dot.glob(prop, { pattern: pattern })
    : [process.cwd()]
}

function dynamicRequire(prop, arg, dot) {
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

function emitEvents(prop, arg, dot) {
  const { argv, paths } = this
  const { eventId } = argv

  return Promise.all(
    paths.map(path => {
      const args = Object.assign({}, arg, argv, {
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
