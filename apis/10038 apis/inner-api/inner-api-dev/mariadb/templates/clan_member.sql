CREATE TABLE clan_member (
    `userId` bigint NOT NULL,
    `clanId` bigint NOT NULL,
    `role` tinyint NULL,
    `experience` bigint NULL,
    PRIMARY KEY (userId)
) ENGINE=InnoDB CHARSET=utf8mb4;