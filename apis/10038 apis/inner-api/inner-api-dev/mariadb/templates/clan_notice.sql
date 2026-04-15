CREATE TABLE clan_notice (
    `clanId` bigint NOT NULL,
    `content` varchar(255) NULL,
    PRIMARY KEY (clanId)
) ENGINE=InnoDB CHARSET=utf8mb4;