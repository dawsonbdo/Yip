-- Your SQL goes here
CREATE TABLE kennels (
  id UUID PRIMARY KEY, 
  name VARCHAR NOT NULL,
  tags TEXT[] NOT NULL,
  mods UUID[] NOT NULL,
  unique(name)
);