import assert from "node:assert/strict";
import test from "node:test";
import { selectPreferredBrowserVoice } from "./browser-voice.ts";

test("prefers an exact en-GB modern voice over the default legacy voice", () => {
  const voices = [
    {
      name: "Legacy British",
      lang: "en-GB",
      default: true,
      localService: true,
    },
    {
      name: "Microsoft Sonia Online (Natural)",
      lang: "en-GB",
      default: false,
      localService: false,
    },
    {
      name: "Natural US",
      lang: "en-US",
      default: false,
      localService: false,
    },
  ];

  const selected = selectPreferredBrowserVoice(voices, "en-GB");
  assert.equal(selected?.name, "Microsoft Sonia Online (Natural)");
});

test("keeps locale match ahead of a modern voice from another language", () => {
  const voices = [
    {
      name: "Plain British",
      lang: "en_GB",
      default: false,
      localService: true,
    },
    {
      name: "Premium French Neural",
      lang: "fr-FR",
      default: true,
      localService: false,
    },
  ];

  const selected = selectPreferredBrowserVoice(voices, "en-GB");
  assert.equal(selected?.name, "Plain British");
});

test("falls back to the requested base language when exact locale is unavailable", () => {
  const voices = [
    {
      name: "English Natural",
      lang: "en-US",
      default: false,
      localService: false,
    },
    {
      name: "French Natural",
      lang: "fr-FR",
      default: true,
      localService: false,
    },
  ];

  const selected = selectPreferredBrowserVoice(voices, "en-GB");
  assert.equal(selected?.name, "English Natural");
});

test("returns null when no requested-language voice is available", () => {
  const selected = selectPreferredBrowserVoice(
    [
      {
        name: "French Natural",
        lang: "fr-FR",
        default: true,
        localService: false,
      },
    ],
    "en-GB",
  );
  assert.equal(selected, null);
});
