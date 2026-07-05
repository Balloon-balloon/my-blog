-- Drop old constraints that conflict with new schema
ALTER TABLE "Favorite" DROP CONSTRAINT IF EXISTS "Favorite_userId_postId_key";
ALTER TABLE "Like" DROP CONSTRAINT IF EXISTS "Like_userId_postId_key";
