import client from "./db.ts";

client.queryArray`CREATE TABLE IF NOT EXISTS users (
    user_id INT GENERATED ALWAYS AS IDENTITY,
    username VARCHAR(24) NOT NULL,
    displayname VARCHAR(36) NOT NULL,
    passwordhash VARCHAR NOT NULL,
    profile_url VARCHAR
);`;
