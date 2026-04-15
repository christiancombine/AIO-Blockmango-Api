CREATE TABLE account_binding (
    `userId` bigint NOT NULL,
    `connectId` varchar(64) NULL,
    PRIMARY KEY (userId)
) ENGINE=InnoDB CHARSET=utf8mb4;