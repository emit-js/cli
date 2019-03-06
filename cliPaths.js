module.exports = dot => {
  if (dot.cliPaths) {
    return
  }

  dot.any("cliPaths", cliPaths)
}

async function cliPaths(prop, arg, dot) {
  const pattern =
    arg._.length === 1
      ? arg._[0]
      : "{" + arg._.join(",") + "}"

  return arg._.length
    ? await dot.glob(prop, { pattern: pattern })
    : [process.cwd()]
}
