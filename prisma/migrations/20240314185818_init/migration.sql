/*
  Warnings:

  - Added the required column `password` to the `player` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "player" ADD COLUMN     "password" TEXT NOT NULL;
