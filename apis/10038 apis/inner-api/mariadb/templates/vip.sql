CREATE TABLE vip (
    `userId` bigint NOT NULL,
    `vip` tinyint NULL,
	`expireDate` bigint NULL,
    PRIMARY KEY (userId)
) ENGINE=InnoDB CHARSET=utf8mb4;