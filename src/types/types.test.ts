import { describe, expectTypeOf, it } from "vitest";

import type { AssetDto, AssetRow } from "./asset";
import type { StoryBody, StoryDto, StoryRow } from "./story";
import type { PublicUser, UserDto, UserRow } from "./user";

describe("shared types", () => {
  it("UserRow includes password_hash and public shapes do not", () => {
    expectTypeOf<UserRow>().toHaveProperty("password_hash");
    expectTypeOf<PublicUser>().not.toHaveProperty("password_hash");
    expectTypeOf<UserDto>().not.toHaveProperty("password_hash");
    expectTypeOf<UserDto>().not.toHaveProperty("passwordHash");

    type PublicUserExtra = Exclude<keyof UserRow, keyof PublicUser>;
    expectTypeOf<PublicUserExtra>().toEqualTypeOf<"password_hash">();
  });

  it("StoryRow and StoryDto carry body shape and story fields", () => {
    expectTypeOf<StoryRow>().toHaveProperty("body_json");
    expectTypeOf<StoryRow>().toHaveProperty("user_id");
    expectTypeOf<StoryDto>().toHaveProperty("body");
    expectTypeOf<StoryDto>().toHaveProperty("userId");
    expectTypeOf<StoryBody>().toHaveProperty("fullText");
    expectTypeOf<StoryBody>().toHaveProperty("scenes");
    expectTypeOf<StoryBody>().toHaveProperty("characters");
  });

  it("AssetRow and AssetDto include excerpt offsets and blob url", () => {
    expectTypeOf<AssetRow>().toHaveProperty("excerpt_text");
    expectTypeOf<AssetRow>().toHaveProperty("start_offset");
    expectTypeOf<AssetRow>().toHaveProperty("blob_url");
    expectTypeOf<AssetDto>().toHaveProperty("excerptText");
    expectTypeOf<AssetDto>().toHaveProperty("startOffset");
    expectTypeOf<AssetDto>().toHaveProperty("blobUrl");
  });
});
