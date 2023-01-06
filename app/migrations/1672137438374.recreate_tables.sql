CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(21) PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NULL,
    email TEXT NULL UNIQUE,
    joined_at BIGINT NOT NULL
);
CREATE INDEX users_email on users(email);
CREATE INDEX users_username on users(username);
CREATE TABLE IF NOT EXISTS items (
    id VARCHAR(21) PRIMARY KEY,
    kind TEXT NOT NULL,
    pos_x INTEGER NULL,
    pos_y INTEGER NULL,
    amount BIGINT NOT NULL,
    bank BOOLEAN NOT NULL,
    player VARCHAR(21) NULL,
    FOREIGN KEY (player) REFERENCES players(id)
);
CREATE INDEX items_player on items(player);
CREATE INDEX items_pos on items(pos_x, pos_y);
CREATE TABLE IF NOT EXISTS players (
    id VARCHAR(21) PRIMARY KEY,
    user VARCHAR(21) NOT NULL,
    pos_x INTEGER NOT NULL,
    pos_y INTEGER NOT NULL,
    current_health INTEGER NOT NULL,
    xp BIGINT NOT NULL,
    -- combat skills
    health INTEGER NOT NULL,
    attack INTEGER NOT NULL,
    intelligence INTEGER NOT NULL,
    defense INTEGER NOT NULL,
    -- trade skills
    hunting INTEGER NOT NULL,
    trading INTEGER NOT NULL,
    cooking INTEGER NOT NULL,
    farming INTEGER NOT NULL,
    fishing INTEGER NOT NULL,
    -- slots
    left_hand VARCHAR(21) NULL,
    head VARCHAR(21) NULL,
    neck VARCHAR(21) NULL,
    right_hand VARCHAR(21) NULL,
    torso VARCHAR(21) NULL,
    legs VARCHAR(21) NULL,
    feet VARCHAR(21) NULL,
    -- avatar
    avatar_head INTEGER NOT NULL,
    avatar_eyes INTEGER NOT NULL,
    avatar_hair INTEGER NOT NULL,
    FOREIGN KEY (user) REFERENCES users(id),
    FOREIGN KEY (left_hand) REFERENCES items(id),
    FOREIGN KEY (head) REFERENCES items(id),
    FOREIGN KEY (right_hand) REFERENCES items(id),
    FOREIGN KEY (torso) REFERENCES items(id),
    FOREIGN KEY (legs) REFERENCES items(id),
    FOREIGN KEY (feet) REFERENCES items(id)
);
CREATE INDEX players_user on players(user);
CREATE INDEX players_pos on players(pos_x, pos_y);
CREATE INDEX players_left_hand on items(id);
CREATE INDEX players_head on items(id);
CREATE INDEX players_right_hand on items(id);
CREATE INDEX players_torso on items(id);
CREATE INDEX players_legs on items(id);
CREATE INDEX players_feet on items(id);
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(21) PRIMARY KEY,
    content TEXT NOT NULL,
    created_at BIGINT NOT NULL,
    important BOOLEAN NOT NULL,
    sender VARCHAR(21) NOT NULL,
    recipient VARCHAR(21) NULL,
    FOREIGN KEY (sender) REFERENCES players(id),
    FOREIGN KEY (recipient) REFERENCES players(id)
);
CREATE INDEX messages_sender on messages(sender);
CREATE INDEX messages_recipient on messages(recipient);
CREATE TABLE IF NOT EXISTS npcs (
    id VARCHAR(21) PRIMARY KEY,
    kind TEXT NOT NULL,
    pos_x INTEGER NOT NULL,
    pos_y INTEGER NOT NULL,
    current_health INTEGER NOT NULL,
    -- combat skills
    health INTEGER NOT NULL,
    attack INTEGER NOT NULL,
    intelligence INTEGER NOT NULL,
    defense INTEGER NOT NULL
);
CREATE INDEX npcs_pos on npcs(pos_x, pos_y);