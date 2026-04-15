CREATE TABLE game (
    `gameId` varchar(16) NOT NULL,
    `gameName` varchar(63) NULL,
    `iconUrl` varchar(127) NULL,
    `isRecommended` boolean NULL,
    `gameTypes` json NULL,
    `likeCount` bigint NULL,
    `shopEnabled` tinyint NULL,
    `rankEnabled` tinyint NULL,
    `partyEnabled` tinyint NULL,
    `authorId` bigint NULL,
    `creationTime` bigint NULL,
    PRIMARY KEY (gameId)
) ENGINE=InnoDB CHARSET=utf8mb4;