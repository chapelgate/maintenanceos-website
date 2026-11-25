import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import { redirectScript, serializeForInlineScript } from "./inline-script.ts";

const payloads = [
  "acme",
  'x";alert(1);//',
  "a</script><script>alert(1)</script>",
  "b</SCRIPT >",
  'c\\"+document.cookie+\\"',
  "d\\",
  "e\u2028f\u2029g",
  "h\u0000i",
];

for (const slug of payloads) {
  const url = `/compare/worksmartos-vs-${slug}/`;
  test(`redirectScript is breakout-safe for ${JSON.stringify(slug)}`, () => {
    const js = redirectScript(url);
    assert.doesNotMatch(js, /<\/script/i, "no </script in emitted script");
    assert.doesNotMatch(js, /[\u2028\u2029]/, "no raw line separators");
    // Evaluating the real emitted body sets exactly the intended URL, nothing else.
    const ctx = { window: { location: { href: "" } }, alert: () => assert.fail("injected code ran") };
    vm.runInNewContext(js, ctx);
    assert.equal(ctx.window.location.href, url);
  });
}

test("serializeForInlineScript escapes < in objects (JSON-LD use)", () => {
  const out = serializeForInlineScript({ name: "</script><x>" });
  assert.doesNotMatch(out, /</);
  assert.deepEqual(JSON.parse(out), { name: "</script><x>" });
});
