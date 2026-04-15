CREATE TABLE game_party_config (
    `gameId` varchar(16) NOT NULL,
    `maxPlayers` int NULL,
    `teamNumber` int NULL,
    `teamPlayers` int NULL,
    `vipPlayers` int NULL,
    `commonPlayers` int NULL,
    PRIMARY KEY (gameId)
) ENGINE=InnoDB CHARSET=utf8mb4;