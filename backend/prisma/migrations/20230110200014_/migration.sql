-- CreateEnum
CREATE TYPE "Status" AS ENUM ('Live', 'Scheduled', 'Ended');

-- CreateEnum
CREATE TYPE "Position" AS ENUM ('Goalie', 'Center', 'LeftWinger', 'RightWinger', 'LeftDefenseman', 'RightDefenseman');

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'Scheduled',
    "dateTimeStarted" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "dateTimeEnded" TIMESTAMP(3),

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "playerName" TEXT NOT NULL,
    "playerAge" INTEGER NOT NULL,
    "playerNumber" INTEGER NOT NULL,
    "playerPosition" "Position" NOT NULL,
    "playerId" TEXT NOT NULL,
    "assists" INTEGER NOT NULL,
    "goals" INTEGER NOT NULL,
    "hits" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "penalityInMinutes" INTEGER NOT NULL,
    "team" TEXT NOT NULL,
    "opponent" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
