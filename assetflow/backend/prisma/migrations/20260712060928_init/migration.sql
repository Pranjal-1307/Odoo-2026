-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `employee_code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE') NOT NULL DEFAULT 'EMPLOYEE',
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `department_id` VARCHAR(191) NULL,
    `avatar_url` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_employee_code_key`(`employee_code`),
    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `departments` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `parent_id` VARCHAR(191) NULL,
    `head_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `departments_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `warranty_period` INTEGER NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `custom_fields` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `categories_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `assets` (
    `id` VARCHAR(191) NOT NULL,
    `asset_tag` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `serial_number` VARCHAR(191) NULL,
    `category_id` VARCHAR(191) NOT NULL,
    `department_id` VARCHAR(191) NULL,
    `status` ENUM('AVAILABLE', 'ALLOCATED', 'RESERVED', 'UNDER_MAINTENANCE', 'LOST', 'RETIRED', 'DISPOSED') NOT NULL DEFAULT 'AVAILABLE',
    `condition` ENUM('NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED') NOT NULL DEFAULT 'NEW',
    `location` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `acquisition_date` DATETIME(3) NULL,
    `acquisition_cost` DECIMAL(12, 2) NULL,
    `bookable` BOOLEAN NOT NULL DEFAULT false,
    `photo_url` VARCHAR(191) NULL,
    `document_urls` JSON NULL,
    `qr_code` VARCHAR(191) NULL,
    `created_by_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `assets_asset_tag_key`(`asset_tag`),
    UNIQUE INDEX `assets_serial_number_key`(`serial_number`),
    INDEX `assets_status_idx`(`status`),
    INDEX `assets_category_id_idx`(`category_id`),
    INDEX `assets_department_id_idx`(`department_id`),
    INDEX `assets_asset_tag_idx`(`asset_tag`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `asset_allocations` (
    `id` VARCHAR(191) NOT NULL,
    `asset_id` VARCHAR(191) NOT NULL,
    `allocated_to_id` VARCHAR(191) NOT NULL,
    `allocated_by_id` VARCHAR(191) NOT NULL,
    `allocation_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expected_return` DATETIME(3) NULL,
    `returned_date` DATETIME(3) NULL,
    `return_condition` ENUM('NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED') NULL,
    `return_notes` TEXT NULL,
    `status` ENUM('ACTIVE', 'RETURNED', 'TRANSFERRED') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `asset_allocations_asset_id_status_idx`(`asset_id`, `status`),
    INDEX `asset_allocations_allocated_to_id_idx`(`allocated_to_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transfer_requests` (
    `id` VARCHAR(191) NOT NULL,
    `asset_id` VARCHAR(191) NOT NULL,
    `from_user_id` VARCHAR(191) NOT NULL,
    `to_user_id` VARCHAR(191) NOT NULL,
    `reason` TEXT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `requested_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `approved_by_id` VARCHAR(191) NULL,
    `resolved_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `transfer_requests_asset_id_idx`(`asset_id`),
    INDEX `transfer_requests_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bookings` (
    `id` VARCHAR(191) NOT NULL,
    `asset_id` VARCHAR(191) NOT NULL,
    `booked_by_id` VARCHAR(191) NOT NULL,
    `start_time` DATETIME(3) NOT NULL,
    `end_time` DATETIME(3) NOT NULL,
    `purpose` TEXT NULL,
    `status` ENUM('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'UPCOMING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `bookings_asset_id_start_time_end_time_idx`(`asset_id`, `start_time`, `end_time`),
    INDEX `bookings_booked_by_id_idx`(`booked_by_id`),
    INDEX `bookings_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `maintenance_requests` (
    `id` VARCHAR(191) NOT NULL,
    `asset_id` VARCHAR(191) NOT NULL,
    `raised_by_id` VARCHAR(191) NOT NULL,
    `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    `issue` TEXT NOT NULL,
    `photo_url` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED') NOT NULL DEFAULT 'PENDING',
    `approved_by_id` VARCHAR(191) NULL,
    `technician_id` VARCHAR(191) NULL,
    `resolution_notes` TEXT NULL,
    `resolved_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `maintenance_requests_asset_id_idx`(`asset_id`),
    INDEX `maintenance_requests_status_idx`(`status`),
    INDEX `maintenance_requests_priority_idx`(`priority`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_cycles` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `department_id` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NOT NULL,
    `status` ENUM('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CLOSED') NOT NULL DEFAULT 'PLANNED',
    `created_by_id` VARCHAR(191) NOT NULL,
    `closed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `audit_cycles_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_items` (
    `id` VARCHAR(191) NOT NULL,
    `audit_cycle_id` VARCHAR(191) NOT NULL,
    `asset_id` VARCHAR(191) NOT NULL,
    `auditor_id` VARCHAR(191) NOT NULL,
    `verification` ENUM('PENDING', 'VERIFIED', 'MISSING', 'DAMAGED') NOT NULL DEFAULT 'PENDING',
    `remarks` TEXT NULL,
    `verified_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `audit_items_audit_cycle_id_idx`(`audit_cycle_id`),
    INDEX `audit_items_asset_id_idx`(`asset_id`),
    UNIQUE INDEX `audit_items_audit_cycle_id_asset_id_key`(`audit_cycle_id`, `asset_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `ref_id` VARCHAR(191) NULL,
    `ref_type` VARCHAR(191) NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notifications_user_id_is_read_idx`(`user_id`, `is_read`),
    INDEX `notifications_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `activity_logs` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `entity` VARCHAR(191) NOT NULL,
    `entity_id` VARCHAR(191) NOT NULL,
    `details` JSON NULL,
    `ip_address` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `activity_logs_user_id_idx`(`user_id`),
    INDEX `activity_logs_entity_entity_id_idx`(`entity`, `entity_id`),
    INDEX `activity_logs_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `departments` ADD CONSTRAINT `departments_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `departments` ADD CONSTRAINT `departments_head_id_fkey` FOREIGN KEY (`head_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assets` ADD CONSTRAINT `assets_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assets` ADD CONSTRAINT `assets_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assets` ADD CONSTRAINT `assets_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asset_allocations` ADD CONSTRAINT `asset_allocations_asset_id_fkey` FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asset_allocations` ADD CONSTRAINT `asset_allocations_allocated_to_id_fkey` FOREIGN KEY (`allocated_to_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asset_allocations` ADD CONSTRAINT `asset_allocations_allocated_by_id_fkey` FOREIGN KEY (`allocated_by_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transfer_requests` ADD CONSTRAINT `transfer_requests_asset_id_fkey` FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transfer_requests` ADD CONSTRAINT `transfer_requests_from_user_id_fkey` FOREIGN KEY (`from_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transfer_requests` ADD CONSTRAINT `transfer_requests_to_user_id_fkey` FOREIGN KEY (`to_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transfer_requests` ADD CONSTRAINT `transfer_requests_approved_by_id_fkey` FOREIGN KEY (`approved_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_asset_id_fkey` FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_booked_by_id_fkey` FOREIGN KEY (`booked_by_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `maintenance_requests` ADD CONSTRAINT `maintenance_requests_asset_id_fkey` FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `maintenance_requests` ADD CONSTRAINT `maintenance_requests_raised_by_id_fkey` FOREIGN KEY (`raised_by_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `maintenance_requests` ADD CONSTRAINT `maintenance_requests_approved_by_id_fkey` FOREIGN KEY (`approved_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `maintenance_requests` ADD CONSTRAINT `maintenance_requests_technician_id_fkey` FOREIGN KEY (`technician_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_cycles` ADD CONSTRAINT `audit_cycles_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_cycles` ADD CONSTRAINT `audit_cycles_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_items` ADD CONSTRAINT `audit_items_audit_cycle_id_fkey` FOREIGN KEY (`audit_cycle_id`) REFERENCES `audit_cycles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_items` ADD CONSTRAINT `audit_items_asset_id_fkey` FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_items` ADD CONSTRAINT `audit_items_auditor_id_fkey` FOREIGN KEY (`auditor_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `activity_logs` ADD CONSTRAINT `activity_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
