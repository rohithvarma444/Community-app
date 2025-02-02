/*
  Warnings:

  - A unique constraint covering the columns `[poll_id,option_text]` on the table `PollOption` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[token]` on the table `Session` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `browser` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `device` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `os` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "browser" TEXT NOT NULL,
ADD COLUMN     "device" TEXT NOT NULL,
ADD COLUMN     "os" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PollOption_poll_id_option_text_key" ON "PollOption"("poll_id", "option_text");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");
