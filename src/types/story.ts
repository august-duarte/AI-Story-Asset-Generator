/** Structured story content stored in `stories.body_json`. */
export type StoryBody = {
  characters: string[];
  scenes: { title: string; content: string }[];
  fullText: string;
};

/** Database row for `stories`. */
export type StoryRow = {
  id: string;
  user_id: string;
  theme: string;
  tone: string | null;
  style: string;
  title: string;
  body_json: StoryBody;
  created_at: Date | string;
};

/** Public story shape for API responses and the client. */
export type StoryDto = {
  id: string;
  userId: string;
  theme: string;
  tone: string | null;
  style: string;
  title: string;
  body: StoryBody;
  createdAt: string;
};
