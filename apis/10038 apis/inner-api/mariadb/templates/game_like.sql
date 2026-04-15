CREATE TABLE game_like (
    `userId` bigint NOT NULL,
    `games` json NULL,
    PRIMARY KEY (userId)
) ENGINE=InnoDB CHARSET=utf8mb4;