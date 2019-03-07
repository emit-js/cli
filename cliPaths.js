module.exports = dot => {
  if (dot.cliPaths) {
    return
  }

  dot("logLevel", "cliPaths", { info: "debug" })

  dot.any("cliPaths", cliPaths)
}

async function cliPaths(prop, arg, dot) {
  const pattern =
    arg._.length > 2
      ? "{" + arg._.slice(1).join(",") + "}"
      : arg._[1]

  return arg._.length > 1
    ? await dot.glob(prop, { pattern: pattern })
    : [process.cwd()]
}