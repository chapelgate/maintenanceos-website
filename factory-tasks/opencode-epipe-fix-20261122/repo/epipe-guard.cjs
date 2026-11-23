function swallowEPIPE(err) {
  return !!(err && (err.code === "EPIPE" || err.code === "ERR_STREAM_DESTROYED"))
}
function guard(stream) {
  if (!stream || typeof stream.on !== "function") return
  stream.on("error", function (err) {
    if (swallowEPIPE(err)) return
    throw err
  })
}
guard(process.stdout)
guard(process.stderr)
const EventEmitter = require("events").EventEmitter
const originalEmit = EventEmitter.prototype.emit
EventEmitter.prototype.emit = function (type) {
  if (type === "error" && arguments.length > 1 && swallowEPIPE(arguments[1])) return true
  return originalEmit.apply(this, arguments)
}
