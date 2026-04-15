CREATE TABLE friend_request (
    `requestId` bigint AUTO_INCREMENT NOT NULL,
    `userId` bigint NOT NULL,
    `friendId` bigint NOT NULL,
    `message` varchar(63)  NULL,
    `picUrl` varchar(127) NULL,
    `nickName` varchar(127) NULL,
    `sex` tinyint NULL,
    `country` varchar(16) NULL,
    `language` varchar(16) NULl, 
    `status` tinyint NULL,
    `creationTime` bigint NULL,
    PRIMARY KEY (requestId)
) ENGINE=InnoDB CHARSET=utf8mb4;