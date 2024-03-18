/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `player` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "player_name_key" ON "player"("name");
