module.exports = dot => {
  if (dot.cli) {
    return
  }

  require("./cliArgv")(dot)
  require("./cliEmit")(dot)
  require("./cliPaths")(dot)
  require("./cliRequire")(dot)

  dot.any("log", "error", () => process.exit(1))
  dot.any("cli", cli)
}

async function cli(prop, arg, dot) {
  const argv = await dot.cliArgv(prop, arg)

  await dot.cliRequire(prop, argv)

  const paths = await dot.cliPaths(prop, argv)

  await dot.cliEmit(prop, {
    argv: argv,
    paths: paths,
    userArg: arg,
  })
}
