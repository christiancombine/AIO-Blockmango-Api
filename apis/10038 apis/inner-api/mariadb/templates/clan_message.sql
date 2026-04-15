CREATE TABLE clan_message (
    `messageId` bigint AUTO_INCREMENT NOT NULL,
    `userId` bigint NOT NULL,
    `clanId` bigint NOT NULL,
    `authorityId` bigint NULL,
    `message` varchar(63) NULL,
    `picUrl` varchar(127) NULL,
    `nickName` varchar(127) NULL,
    `type` tinyint NULL,
    `status` tinyint NULL,
    `creationTime` bigint NULL,
    PRIMARY KEY (messageId)
) ENGINE=InnoDB CHARSET=utf8mb4;