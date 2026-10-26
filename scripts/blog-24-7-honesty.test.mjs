import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const blogDir = path.join(ROOT, "src/content/blog");
const posts = fs
  .readdirSync(blogDir)
  .filter((name) => name.endsWith(".mdx"))
  .map((name) => ({
    name,
    text: fs.readFileSync(path.join(blogDir, name), "utf8"),
  }));

test("blog posts do not claim live 24/7 availability", () => {
  for (const post of posts) {
    assert.doesNotMatch(
      post.text,
      /\*\*Availability\*\*:\s*24\s*\/\s*7/i,
      `${post.name} claims Availability: 24/7`,
    );
    assert.doesNotMatch(
      post.text,
      /##\s*Live Demo Number/i,
      `${post.name} uses Live Demo Number heading`,
    );
    assert.doesNotMatch(
      post.text,
      /answers 24\s*\/\s*7/i,
      `${post.name} claims answers 24/7`,
    );
  }
});

test("ai-voice blog keeps preview-not-live language", () => {
  const post = posts.find((p) => p.name === "ai-voice-demo-browser-only-what-it-means.mdx");
  assert.ok(post);
  assert.match(post.text, /Preview Demo Number/);
  assert.match(post.text, /not a public 24\s*\/\s*7 answering service/i);
  assert.match(post.text, /not a live always-on phone/i);
  assert.doesNotMatch(post.text, /The live number is gated/i);
});
