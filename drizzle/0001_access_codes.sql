CREATE TABLE `access_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(16) NOT NULL,
	`note` varchar(200),
	`redeemed_at` timestamp,
	`redeemed_by_name` varchar(120),
	`redeemed_by_email` varchar(254),
	`submission_id` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `access_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `access_codes_code_unique` UNIQUE(`code`)
);
