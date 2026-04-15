CREATE TABLE game_update (
    `gameId` varchar(16) NOT NULL,
    `version` int NULL,
    `content` varchar(2047) NULL,
    PRIMARY KEY (gameId)
) ENGINE=InnoDB CHARSET=utf8mb4;