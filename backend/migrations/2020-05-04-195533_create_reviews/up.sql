-- Your SQL goes here
CREATE TABLE reviews (
  id UUID PRIMARY KEY, 
  kennelid UUID NOT NULL,
  title VARCHAR NOT NULL,
  author UUID NOT NULL,
  date_posted DATE NOT NULL,
  review_text VARCHAR NOT NULL,
  images TEXT[] NOT NULL,
  rating INT NOT NULL,
  tags JSON NOT NULL
);