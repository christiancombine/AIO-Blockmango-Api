CREATE TABLE clan (
    `clanId` bigint NOT NULL,
    `name` varchar(63) NULL,
    `picUrl` varchar(127) NULL,
    `tags` json NULL,
    `details` varchar(255) NULL,
    `experience` bigint NULL,
    `level` tinyint NULL,
    `memberCount` tinyint NULL,
    `freeVerify` tinyint NULL,
    `language` varchar(16) NULL,
    `creationTime` bigint NULL,
    PRIMARY KEY (clanId)
) ENGINE=InnoDB CHARSET=utf8mb4;