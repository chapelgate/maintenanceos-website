import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(path.join(ROOT, "src/lib/help.ts"), "utf8");

test("help exports HelpFrontmatter interface", () => {
  assert.match(src, /export interface HelpFrontmatter/);
});

test("help exports HelpArticle interface", () => {
  assert.match(src, /export interface HelpArticle/);
});

test("help exports getHelpArticleBySlug function", () => {
  assert.match(src, /export function getHelpArticleBySlug/);
});

test("help exports getAllHelpArticles function", () => {
  assert.match(src, /export function getAllHelpArticles/);
});

test("help exports getHelpArticleSlugs function", () => {
  assert.match(src, /export function getHelpArticleSlugs/);
});

test("help exports getHelpCategories function", () => {
  assert.match(src, /export function getHelpCategories/);
});

test("help exports generateHelpMetadata function", () => {
  assert.match(src, /export function generateHelpMetadata/);
});

test("help exports generateHelpIndexMetadata function", () => {
  assert.match(src, /export function generateHelpIndexMetadata/);
});
