import client from "./db.ts";

client.queryArray`CREATE TABLE IF NOT EXISTS users (
    user_id INT GENERATED ALWAYS AS IDENTITY,
    username VARCHAR(24) NOT NULL,
    displayname VARCHAR(36) NOT NULL,
    profile_image_url VARCHAR,
    PRIMARY KEY (user_id)
);`;

client.queryArray`CREATE TABLE IF NOT EXISTS auths (
    auth_id INT GENERATED ALWAYS AS IDENTITY,
    user_id INT NOT NULL,
    email VARCHAR(36) NOT NULL,
    passwordhash VARCHAR NOT NULL,
    PRIMARY KEY (auth_id),
    CONSTRAINT fk_user_id
        FOREIGN KEY(user_id)
            REFERENCES users(user_id)
            ON DELETE CASCADE
)`;

client.queryArray`CREATE TABLE IF NOT EXISTS follows (
    follow_id INT GENERATED ALWAYS AS IDENTITY,
    follower_id INT NOT NULL,
    AUTHOR_id INT NOT NULL,
    PRIMARY KEY (follow_id),
    CONSTRAINT fk_follower_id
        FOREIGN KEY(follower_id)
            REFERENCES users(user_id)
            ON DELETE CASCADE,
    CONSTRAINT fk_author_id
        FOREIGN KEY(author_id)
            REFERENCES users(user_id)
            ON DELETE CASCADE
);`;

client.queryArray`CREATE TABLE IF NOT EXISTS tweets (
    tweet_id BIGINT NOT NULL,
    author_id INT NOT NULL,
    content VARCHAR NOT NULL,
    created_at TIMESTAMP NOT NULL,
    PRIMARY KEY (tweet_id),
    CONSTRAINT fk_author_id
        FOREIGN KEY(author_id)
            REFERENCES users(user_id)
            ON DELETE CASCADE
);`;

client.queryArray`CREATE TABLE IF NOT EXISTS likes (
    like_id INT GENERATED ALWAYS AS IDENTITY,
    author_id INT NOT NULL,
    tweet_id BIGINT NOT NULL,
    PRIMARY KEY (like_id),
    CONSTRAINT fk_user_id
        FOREIGN KEY(author_id)
            REFERENCES users(user_id)
            ON DELETE CASCADE,
    CONSTRAINT fk_tweet_id
        FOREIGN KEY(tweet_id)
            REFERENCES tweets(tweet_id)
            ON DELETE CASCADE
);`;