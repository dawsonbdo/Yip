-- Your SQL goes here
CREATE TABLE comments (
  id UUID PRIMARY KEY, 
  reviewid UUID NOT NULL,
  authorid UUID NOT NULL,
  date_posted DATE NOT NULL,
  comment_text VARCHAR NOT NULL
);