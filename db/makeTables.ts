import client from "./db.ts";

client.queryArray`CREATE TABLE IF NOT EXISTS users (
    user_id INT GENERATED ALWAYS AS IDENTITY,
    username VARCHAR(24) NOT NULL UNIQUE,
    displayname VARCHAR(36) NOT NULL,
    profile_image_url VARCHAR,
    profile_image_id VARCHAR(24),
    bio VARCHAR,
    grams VARCHAR[],
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id),
    CONSTRAINT picture_id_and_url
        CHECK ((profile_image_url IS NOT NULL AND profile_image_id IS NOT NULL) OR (profile_image_url IS NULL AND profile_image_id IS NULL))
);`;
client.queryArray`CREATE INDEX IF NOT EXISTS username ON users(username);`; 
client.queryArray`CREATE INDEX IF NOT EXISTS username_id ON users(username, user_id);`;
client.queryArray`CREATE INDEX IF NOT EXISTS gins ON users USING GIN (grams);`;

client.queryArray`CREATE TABLE IF NOT EXISTS auths (
    auth_id INT GENERATED ALWAYS AS IDENTITY,
    user_id INT,
    email VARCHAR(36) NOT NULL UNIQUE,
    passwordhash VARCHAR NOT NULL,
    PRIMARY KEY (auth_id),
    CONSTRAINT fk_user_id
        FOREIGN KEY(user_id)
            REFERENCES users(user_id)
            ON DELETE CASCADE
);`;
client.queryArray`CREATE INDEX IF NOT EXISTS associatedUser ON auths(auth_id, user_id);`;

client.queryArray`CREATE TABLE IF NOT EXISTS follows (
    follower_id INT NOT NULL,
    following_id INT NOT NULL,
    PRIMARY KEY (follower_id, following_id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_follower_id
        FOREIGN KEY(follower_id)
            REFERENCES users(user_id)
            ON DELETE CASCADE,
    CONSTRAINT fk_following_id
        FOREIGN KEY(following_id)
            REFERENCES users(user_id)
            ON DELETE CASCADE
);`;
client.queryArray`CREATE INDEX IF NOT EXISTS follows ON follows(follower_id, following_id);`;

client.queryArray`CREATE TABLE IF NOT EXISTS tweets (
    tweet_id BIGINT NOT NULL UNIQUE,
    author_id INT NOT NULL,
    content VARCHAR NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (tweet_id),
    CONSTRAINT fk_author_id
        FOREIGN KEY(author_id)
            REFERENCES users(user_id)
            ON DELETE CASCADE
);`;
client.queryArray`COMMENT ON COLUMN tweets.tweet_id IS 'Generate snowflake id';`;
client.queryArray`CREATE INDEX IF NOT EXISTS author_id ON tweets(author_id);`;

client.queryArray`CREATE TABLE IF NOT EXISTS likes (
    author_id INT NOT NULL,
    tweet_id BIGINT NOT NULL,
    PRIMARY KEY (author_id, tweet_id),
    CONSTRAINT fk_user_id
        FOREIGN KEY(author_id)
            REFERENCES users(user_id)
            ON DELETE CASCADE,
    CONSTRAINT fk_tweet_id
        FOREIGN KEY(tweet_id)
            REFERENCES tweets(tweet_id)
            ON DELETE CASCADE
);`;
client.queryArray`CREATE INDEX IF NOT EXISTS tweet_id ON likes(tweet_id);`;

client.queryArray`CREATE TABLE IF NOT EXISTS comments (
    comment_id BIGINT UNIQUE,
    author_id INT NOT NULL,
    tweet_id BIGINT NOT NULL,
    content VARCHAR NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (comment_id),
    CONSTRAINT fk_user_id
        FOREIGN KEY(author_id)
            REFERENCES users(user_id)
            ON DELETE CASCADE,
    CONSTRAINT fk_tweet_id
        FOREIGN KEY(tweet_id)
            REFERENCES tweets(tweet_id) 
            ON DELETE CASCADE
);`;
client
  .queryArray`COMMENT ON COLUMN comments.comment_id IS 'Generate snowflake id';`;
client.queryArray`CREATE INDEX IF NOT EXISTS tweet_id ON comments(tweet_id);`;
client.queryArray`CREATE INDEX IF NOT EXISTS author_id ON comments(author_id);`;

client.queryArray`CREATE TABLE IF NOT EXISTS comment_likes (
    author_id INT NOT NULL,
    comment_id BIGINT NOT NULL,
    PRIMARY KEY (author_id, comment_id),
    CONSTRAINT fk_user_id
        FOREIGN KEY(author_id)
            REFERENCES users(user_id)
            ON DELETE CASCADE,
    CONSTRAINT fk_comment_id
        FOREIGN KEY(comment_id)
            REFERENCES comments(comment_id)
            ON DELETE CASCADE
);`;
client
  .queryArray`CREATE INDEX IF NOT EXISTS comment_id ON comment_likes(comment_id);`;

client.queryArray`CREATE TABLE IF NOT EXISTS retweets (
    retweet_id BIGINT UNIQUE,
    author_id INT NOT NULL,
    tweet_id BIGINT NOT NULL,
    PRIMARY KEY (retweet_id),
    CONSTRAINT fk_user_id
        FOREIGN KEY(author_id)    
            REFERENCES users(user_id)
            ON DELETE CASCADE,
    CONSTRAINT fk_tweet_id
        FOREIGN KEY(tweet_id)
            REFERENCES tweets(tweet_id)
            ON DELETE CASCADE
);`;
client
  .queryArray`COMMENT ON COLUMN retweets.retweet_id IS 'Generate snowflake id';`;
  client.queryArray`CREATE INDEX IF NOT EXISTS author_id ON retweets(author_id);`;

client.queryArray`CREATE TABLE IF NOT EXISTS mentions (
    mention_id INT GENERATED ALWAYS AS IDENTITY,
    tweet_id BIGINT NOT NULL,
    user_id INT NOT NULL,
    PRIMARY KEY (mention_id),
    CONSTRAINT fk_tweet_id  
        FOREIGN KEY(tweet_id)  
            REFERENCES tweets(tweet_id)
            ON DELETE CASCADE,
    CONSTRAINT fk_user_id
        FOREIGN KEY(user_id)
            REFERENCES users(user_id)
            ON DELETE CASCADE   
);`;
client.queryArray`CREATE INDEX IF NOT EXISTS tweet_id ON mentions(tweet_id);`;
client.queryArray`CREATE INDEX IF NOT EXISTS user_id ON mentions(user_id);`;

client.queryArray`CREATE TABLE IF NOT EXISTS reset_tokens (
    token_id VARCHAR NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) WITH (ttl_expire_after = '6 hours');`;

client.queryArray(`CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR NOT NULL UNIQUE,
    auth_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (session_id),
    CONSTRAINT fk_auth_id
        FOREIGN KEY(auth_id)
            REFERENCES auths(auth_id)
            ON DELETE CASCADE
)`);
