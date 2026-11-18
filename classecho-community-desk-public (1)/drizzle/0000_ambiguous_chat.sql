CREATE TABLE `records` (
	`owner` text NOT NULL,
	`id` text NOT NULL,
	`payload` text NOT NULL,
	`rev` integer NOT NULL,
	`mutation` text NOT NULL,
	`updated` text NOT NULL,
	PRIMARY KEY(`owner`, `id`)
);
