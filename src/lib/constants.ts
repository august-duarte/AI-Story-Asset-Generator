export const DAILY_STORY_LIMIT = 2;
export const DAILY_IMAGE_LIMIT = 3;

export const ART_STYLES = [
  {
    value: "WATERCOLOR",
    label: "Watercolor",
    prompt: "soft watercolor illustration, gentle washes, paper texture",
  },
  {
    value: "COMIC",
    label: "Comic",
    prompt: "bold comic book art, clean ink lines, flat vibrant colors",
  },
  {
    value: "CINEMATIC",
    label: "Cinematic",
    prompt: "cinematic still, dramatic lighting, photorealistic mood",
  },
  {
    value: "PENCIL",
    label: "Pencil sketch",
    prompt: "detailed pencil sketch, graphite shading, hand-drawn look",
  },
] as const;

export type ArtStyle = (typeof ART_STYLES)[number]["value"];

export const STYLE_PROMPT: Record<ArtStyle, string> = Object.fromEntries(
  ART_STYLES.map((style) => [style.value, style.prompt]),
) as Record<ArtStyle, string>;

export const TONES = [
  "Whimsical",
  "Dark",
  "Adventurous",
  "Funny",
] as const;

export type Tone = (typeof TONES)[number];
