CREATE TABLE `task_assignees` (
  `task_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  PRIMARY KEY (`task_id`, `user_id`),
  INDEX `task_assignees_user_id_idx` (`user_id`),
  CONSTRAINT `task_assignees_task_id_fkey`
    FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `task_assignees_user_id_fkey`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION
);

INSERT INTO `task_assignees` (`task_id`, `user_id`)
SELECT `t`.`id`, `u`.`id`
FROM `tasks` `t`
INNER JOIN `users` `u` ON `u`.`name` = `t`.`developer`
WHERE `t`.`developer` IS NOT NULL
  AND `t`.`developer` <> '';

ALTER TABLE `tasks`
DROP COLUMN `developer`;
