CREATE TABLE clan_donation (
    `userId` bigint NOT NULL,
    `clanId` bigint NOT NULL,
    `nickName` varchar(127) NULL,
    `type` int NULL,
    `amount` int NULL,
    `expReward` int NULL,
    `clanGoldReward` int NULL,
    `creationTime` bigint NULL
) ENGINE=InnoDB CHARSET=utf8mb4;