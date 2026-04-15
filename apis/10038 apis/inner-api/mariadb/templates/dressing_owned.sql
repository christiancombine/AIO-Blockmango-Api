CREATE TABLE dressing_owned (
	`userId` bigint NOT NULL,
	`data` json NULL,
    PRIMARY KEY (userId)
) ENGINE=InnoDB CHARSET=utf8mb4;