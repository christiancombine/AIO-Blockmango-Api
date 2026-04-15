CREATE TABLE game_detail (
    `gameId` varchar(16) NOT NULL,
    `bannerUrl` varchar(127) NULL,
    `gameDetail` varchar(2047) NULL,
    `featuredPlay` json NULL,
    PRIMARY KEY (gameId)
) ENGINE=InnoDB CHARSET=utf8mb4;