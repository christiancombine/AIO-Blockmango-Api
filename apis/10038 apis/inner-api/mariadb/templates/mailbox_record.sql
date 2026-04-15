CREATE TABLE mailbox_record (
	`userId` bigint NOT NULL,
	`data` JSON null,
	PRIMARY KEY (userId)
) ENGINE=InnoDB CHARSET=utf8mb4;