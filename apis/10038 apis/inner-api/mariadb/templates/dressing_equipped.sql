CREATE TABLE dressing_equipped (
	`userId` bigint NOT NULL,
	`data` json NULL,
    PRIMARY KEY (userId)
) ENGINE=InnoDB CHARSET=utf8mb4;