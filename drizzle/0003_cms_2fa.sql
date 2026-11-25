CREATE TABLE `content_blocks` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_by` text DEFAULT '' NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `content_revisions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`actor` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `content_rev_key_idx` ON `content_revisions` (`key`,`created_at`);--> statement-breakpoint
CREATE TABLE `media` (
	`id` text PRIMARY KEY NOT NULL,
	`file_name` text NOT NULL,
	`mime` text NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	`bytes` integer NOT NULL,
	`data` blob NOT NULL,
	`alt` text DEFAULT '' NOT NULL,
	`uploaded_by` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `media_created_idx` ON `media` (`created_at`);--> statement-breakpoint
ALTER TABLE `admins` ADD `totp_secret` text;--> statement-breakpoint
ALTER TABLE `admins` ADD `totp_last_step` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `admins` ADD `recovery_codes` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `packages` ADD `image_url` text DEFAULT '' NOT NULL;