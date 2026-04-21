CREATE DATABASE IF NOT EXISTS codexpoetica DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE codexpoetica;

CREATE TABLE IF NOT EXISTS `visitor_profiles` (
  `visitor_id`    VARCHAR(36)   NOT NULL,
  `visitor_token` VARCHAR(64)   DEFAULT NULL,
  `first_seen_at` DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `last_seen_at`  DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `status`        TINYINT       NOT NULL DEFAULT 1,
  PRIMARY KEY (`visitor_id`),
  KEY `idx_visitor_last_seen` (`last_seen_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `mapping_profiles` (
  `id`           VARCHAR(32)  NOT NULL,
  `name`         VARCHAR(64)  NOT NULL,
  `poem_style`   VARCHAR(32)  DEFAULT NULL,
  `music_style`  VARCHAR(32)  DEFAULT NULL,
  `visual_theme` VARCHAR(32)  DEFAULT NULL,
  `rule_config`  JSON         DEFAULT NULL,
  `is_builtin`   TINYINT      NOT NULL DEFAULT 1,
  `status`       TINYINT      NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `works` (
  `id`                  VARCHAR(32)   NOT NULL,
  `visitor_id`          VARCHAR(36)   NOT NULL,
  `title`               VARCHAR(128)  DEFAULT NULL,
  `language`            VARCHAR(16)   DEFAULT NULL,
  `source_code`         MEDIUMTEXT    DEFAULT NULL,
  `mapping_profile_id`  VARCHAR(32)   DEFAULT NULL,
  `ast_summary`         JSON          DEFAULT NULL,
  `poem_result`         JSON          DEFAULT NULL,
  `audio_config`        JSON          DEFAULT NULL,
  `visual_config`       JSON          DEFAULT NULL,
  `status`              VARCHAR(16)   NOT NULL DEFAULT 'draft',
  `visibility`          VARCHAR(16)   NOT NULL DEFAULT 'private',
  `is_deleted`          TINYINT       NOT NULL DEFAULT 0,
  `created_at`          DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`          DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_works_visitor` (`visitor_id`),
  KEY `idx_works_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `work_publications` (
  `id`                          VARCHAR(32)   NOT NULL,
  `work_id`                     VARCHAR(32)   NOT NULL,
  `share_code`                  VARCHAR(24)   NOT NULL,
  `title_snapshot`              VARCHAR(128)  DEFAULT NULL,
  `language_snapshot`           VARCHAR(16)   DEFAULT NULL,
  `source_code_snapshot`        MEDIUMTEXT    DEFAULT NULL,
  `ast_summary_snapshot`        JSON          DEFAULT NULL,
  `poem_result_snapshot`        JSON          DEFAULT NULL,
  `audio_config_snapshot`       JSON          DEFAULT NULL,
  `visual_config_snapshot`      JSON          DEFAULT NULL,
  `mapping_profile_id_snapshot` VARCHAR(32)   DEFAULT NULL,
  `allow_code_view`             TINYINT       NOT NULL DEFAULT 1,
  `allow_download`              TINYINT       NOT NULL DEFAULT 1,
  `published_at`                DATETIME(3)   DEFAULT NULL,
  `expired_at`                  DATETIME(3)   DEFAULT NULL,
  `status`                      TINYINT       NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_share_code` (`share_code`),
  KEY `idx_pub_work_id` (`work_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `export_records` (
  `id`          VARCHAR(32)   NOT NULL,
  `work_id`     VARCHAR(32)   NOT NULL,
  `visitor_id`  VARCHAR(36)   DEFAULT NULL,
  `export_type` VARCHAR(16)   DEFAULT NULL,
  `file_name`   VARCHAR(128)  DEFAULT NULL,
  `created_at`  DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_export_work` (`work_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 默认映射配置
INSERT IGNORE INTO `mapping_profiles` (`id`, `name`, `poem_style`, `music_style`, `visual_theme`, `rule_config`, `is_builtin`, `status`)
VALUES
  ('default', '默认映射', 'free_verse', 'ambient', 'forest_ink',
   '{"depthToPitch":true,"functionToBranch":true,"variableToLeaf":true}', 1, 1),
  ('haiku', '俳句风格', 'haiku', 'minimal', 'ink_wash',
   '{"depthToPitch":true,"functionToBranch":false,"variableToLeaf":true}', 1, 1),
  ('epic', '史诗风格', 'epic', 'orchestral', 'neon_circuit',
   '{"depthToPitch":true,"functionToBranch":true,"variableToLeaf":false}', 1, 1);
