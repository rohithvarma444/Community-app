/*
  Warnings:

  - A unique constraint covering the columns `[user_id,post_id]` on the table `Comment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Comment_user_id_post_id_key" ON "Comment"("user_id", "post_id");
