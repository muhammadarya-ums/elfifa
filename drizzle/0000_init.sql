CREATE TABLE `admins` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`last_login_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admins_email_unique` ON `admins` (`email`);--> statement-breakpoint
CREATE TABLE `packages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`tagline` text DEFAULT '' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`duration_days` integer NOT NULL,
	`departure_date` text,
	`airline` text DEFAULT '' NOT NULL,
	`price_idr` integer NOT NULL,
	`original_price_idr` integer,
	`quota` integer DEFAULT 45 NOT NULL,
	`hotel_makkah` text DEFAULT '' NOT NULL,
	`hotel_makkah_stars` integer DEFAULT 3 NOT NULL,
	`hotel_makkah_nights` integer DEFAULT 0 NOT NULL,
	`hotel_makkah_note` text DEFAULT '' NOT NULL,
	`hotel_madinah` text DEFAULT '' NOT NULL,
	`hotel_madinah_stars` integer DEFAULT 3 NOT NULL,
	`hotel_madinah_nights` integer DEFAULT 0 NOT NULL,
	`hotel_madinah_note` text DEFAULT '' NOT NULL,
	`includes` text DEFAULT '' NOT NULL,
	`bonuses` text DEFAULT '' NOT NULL,
	`is_featured` integer DEFAULT false NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `packages_slug_idx` ON `packages` (`slug`);--> statement-breakpoint
CREATE TABLE `payments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`registration_id` integer NOT NULL,
	`amount_idr` integer NOT NULL,
	`paid_on` text NOT NULL,
	`method` text DEFAULT 'transfer' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`registration_id`) REFERENCES `registrations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `payments_registration_idx` ON `payments` (`registration_id`);--> statement-breakpoint
CREATE TABLE `registrations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`program` text NOT NULL,
	`package_id` integer,
	`full_name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`city` text DEFAULT '' NOT NULL,
	`pax` integer DEFAULT 1 NOT NULL,
	`has_passport` integer DEFAULT false NOT NULL,
	`message` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'baru' NOT NULL,
	`total_price_idr` integer DEFAULT 0 NOT NULL,
	`admin_notes` text DEFAULT '' NOT NULL,
	`source` text DEFAULT 'website' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `registrations_code_idx` ON `registrations` (`code`);--> statement-breakpoint
CREATE INDEX `registrations_status_idx` ON `registrations` (`status`);--> statement-breakpoint
CREATE INDEX `registrations_created_idx` ON `registrations` (`created_at`);--> statement-breakpoint
CREATE TABLE `schedules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`start_time` text DEFAULT '08:00' NOT NULL,
	`end_time` text DEFAULT '11:30' NOT NULL,
	`topic` text NOT NULL,
	`location` text NOT NULL,
	`is_published` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `schedules_date_idx` ON `schedules` (`date`);--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
