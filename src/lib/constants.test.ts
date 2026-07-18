import { describe, expect, it } from "vitest";

import {
  ART_STYLES,
  DAILY_IMAGE_LIMIT,
  DAILY_STORY_LIMIT,
  STYLE_PROMPT,
  TONES,
} from "./constants";

describe("constants", () => {
  it("exposes the locked daily quotas", () => {
    expect(DAILY_STORY_LIMIT).toBe(2);
    expect(DAILY_IMAGE_LIMIT).toBe(3);
  });

  it("lists story art style presets with prompt text", () => {
    expect(ART_STYLES.map((style) => style.value)).toEqual([
      "WATERCOLOR",
      "COMIC",
      "CINEMATIC",
      "PENCIL",
    ]);

    for (const style of ART_STYLES) {
      expect(style.prompt.length).toBeGreaterThan(0);
      expect(STYLE_PROMPT[style.value]).toBe(style.prompt);
    }
  });

  it("lists optional tone presets", () => {
    expect([...TONES]).toEqual([
      "Whimsical",
      "Dark",
      "Adventurous",
      "Funny",
    ]);
  });
});
