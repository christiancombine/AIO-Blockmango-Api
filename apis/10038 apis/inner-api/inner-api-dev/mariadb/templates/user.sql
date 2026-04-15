CREATE TABLE user (
	`userId` bigint(20) NOT NULL,
	`nickName` varchar(127) NULL,
	`sex` int NULL,
	`picUrl` varchar(127) NULL,
	`details` varchar(255) NULL,
	`birthday` varchar(16) NULL,
	`isFreeNickname` boolean NULL,
	PRIMARY KEY (userId)
) ENGINE=InnoDB CHARSET=utf8mb4;