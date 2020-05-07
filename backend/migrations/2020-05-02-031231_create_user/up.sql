-- Your SQL goes here
CREATE TABLE users (
  id UUID PRIMARY KEY, 
  username VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  password VARCHAR NOT NULL,
  profilepic VARCHAR NOT NULL,
  sitewideban BOOLEAN NOT NULL,
  unique(id, username, email)
);