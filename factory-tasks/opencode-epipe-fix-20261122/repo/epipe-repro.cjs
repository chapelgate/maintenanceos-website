const target = process.argv[2] || "plain"
const code = Object.assign(new Error("EPIPE: broken pipe, write"), { code: "EPIPE", syscall: "write" })
if (target === "plain") {
  process.stdout.destroy(code)
} else {
  const { PassThrough } = require("stream")
  const ws = new PassThrough()
  ws.write("x")
  ws.destroy(code)
}
setTimeout(() => process.exit(0), 50)
