CREATE TABLE account (
	`userId` bigint NOT NULL,
	`email` varchar(255) NULL,
	`password` varchar(127) NULL,
	`creationTime` bigint(20) NOT NULL,
	`accessToken` varchar(255) NULL,
	`loginTime` bigint(20) null,
	PRIMARY KEY (userId)
) ENGINE=InnoDB CHARSET=utf8mb4;