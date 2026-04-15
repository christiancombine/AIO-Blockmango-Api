CREATE TABLE friend (
	`userId` bigint(20) NOT NULL,
	`friendId` bigint(20) NOT NULL,
    `alias` varchar(127) NULL
) ENGINE=InnoDB CHARSET=utf8mb4;