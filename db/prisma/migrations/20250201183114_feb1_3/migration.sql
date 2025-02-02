/*
  Warnings:

  - A unique constraint covering the columns `[user_id,poll_id,option_id]` on the table `PollVote` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PollVote_user_id_poll_id_option_id_key" ON "PollVote"("user_id", "poll_id", "option_id");
