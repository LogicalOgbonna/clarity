-- CreateTable
CREATE TABLE "chat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "visibility" TEXT NOT NULL DEFAULT 'private',
    "traceId" TEXT,
    "observationId" TEXT,
    CONSTRAINT "chat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chatId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "parts" JSONB NOT NULL,
    "attachments" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "chat" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
