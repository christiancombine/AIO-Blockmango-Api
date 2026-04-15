CREATE TABLE wealth_record (
	`userId` bigint NOT NULL,
	`created` bigint NULL,
	`currency` int NULL,
	`inoutType` int NULL,
	`orderId` varchar(127) NULL,
	`qty` int NULL,
	`status` int NULL,
	`transactionType` int NULL
) ENGINE=InnoDB CHARSET=utf8mb4;