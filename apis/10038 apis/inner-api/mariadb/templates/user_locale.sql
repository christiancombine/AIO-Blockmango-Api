CREATE TABLE user_locale (
    `userId` bigint NOT NULL,
    `language` varchar(16) NULL,
    `country` varchar(16) NULL,
    PRIMARY KEY (userId)
) ENGINE=InnoDB CHARSET=utf8mb4;