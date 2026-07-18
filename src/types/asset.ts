/** Database row for `assets`. */
export type AssetRow = {
  id: string;
  story_id: string;
  excerpt_text: string;
  start_offset: number;
  end_offset: number;
  prompt_used: string;
  blob_url: string;
  created_at: Date | string;
};

/** Public asset shape for API responses and the client. */
export type AssetDto = {
  id: string;
  storyId: string;
  excerptText: string;
  startOffset: number;
  endOffset: number;
  promptUsed: string;
  blobUrl: string;
  createdAt: string;
};
