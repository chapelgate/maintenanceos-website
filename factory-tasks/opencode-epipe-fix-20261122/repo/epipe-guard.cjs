function isEPIPE(err) {
  return !!(err && (err.code === "EPIPE" || err.code === "ERR_STREAM_DESTROYED"))
}
function fatal(err) {
  if (isEPIPE(err)) return
  try { process.stderr.write(String((err && err.stack) || err) + "\n") } catch (_) {}
  process.exit(1)
}
process.on("uncaughtException", fatal)
process.on("unhandledRejection", fatal)
for (const stream of [process.stdout, process.stderr]) {
  if (stream && typeof stream.on === "function") {
    stream.on("error", fatal)
  }
}
