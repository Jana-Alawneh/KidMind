ALTER TABLE users
ADD COLUMN region VARCHAR(100) NULL
AFTER phone;

ALTER TABLE child_users
ADD COLUMN link_type ENUM('parent', 'therapist') NULL
AFTER user_id;

UPDATE child_users cu
INNER JOIN users u
ON u.id = cu.user_id
SET cu.link_type = u.role
WHERE u.role IN ('parent', 'therapist');

ALTER TABLE child_users
MODIFY COLUMN link_type
ENUM('parent', 'therapist') NOT NULL;

ALTER TABLE child_users
ADD CONSTRAINT unique_child_link_type
UNIQUE (child_id, link_type);