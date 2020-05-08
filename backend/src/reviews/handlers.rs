use diesel;
use diesel::prelude::*;
use uuid::Uuid;
use crate::schema::reviews;

extern crate bcrypt;

/**
 * Method that returns a vector with all of the reviews
 */
pub fn all(connection: &PgConnection) -> QueryResult<Vec<DbReview>> {
    reviews::table.load::<DbReview>(&*connection)
}

/**
 * LOAD REVIEW: Method that returns a Review given the uuid
 */
pub fn get(id: Uuid, connection: &PgConnection) -> QueryResult<DbReview> {

    // Searches review table for the uuid and gets the review
    reviews::table.find(id).get_result::<DbReview>(connection)
}

/**
 * CREATE REVIEW: Method that attempts to create a new review in database, returns URL? 
 */
pub fn insert(review: Review, connection: &PgConnection) -> bool {
    // Prints the Review information that was received (register)
    println!("Title: {}", review.title);
    println!("Text: {}", review.review_text);
    println!("Rating: {}", review.rating);

    // Inserts review into database, returns uuid generated
    match diesel::insert_into(reviews::table)
        .values(&DbReview::from_review(review))
        .get_result::<DbReview>(connection) {
            Ok(_u) => return true,
            Err(_e) => return false,
        }
}

/**
 * EDIT REVIEW: Method that updates a review in database
 */
pub fn update(id: Uuid, review: Review, connection: &PgConnection) -> bool {
    match diesel::update(reviews::table.find(id))
        .set(&DbReview::from_review(review))
        .get_result::<DbReview>(connection) {
            Ok(_u) => return true,
            Err(_e) => return false,
        }
}

/**
 * DELETE REVIEW: Method that removes a review in database
 */
pub fn delete(id: Uuid, connection: &PgConnection) -> QueryResult<usize> {
    diesel::delete(reviews::table.find(id))
        .execute(connection)
}

// Struct representing the fields of a review passed in from frontend contains
#[derive(Queryable, AsChangeset, Serialize, Deserialize)]
#[table_name = "reviews"]
pub struct Review {
    pub kennelid: Uuid,
    pub title: String,
    pub author: Uuid,
    pub date_posted: chrono::NaiveDate,
    pub review_text: String,
    pub images: serde_json::Value,
    pub rating: i32,
    pub tags: serde_json::Value,
}

// Struct represneting the fields of a review that is inserted into database
#[derive(Insertable, AsChangeset, Queryable, Serialize, Deserialize)]
#[table_name = "reviews"]
pub struct DbReview {
    pub id: Uuid,
    pub kennelid: Uuid,
    pub title: String,
    pub author: Uuid,
    pub date_posted: chrono::NaiveDate,
    pub review_text: String,
    pub images: serde_json::Value,
    pub rating: i32,
    pub tags: serde_json::Value,
}

// Converts a Review to an DbReview by calling functions on passed in values
impl DbReview{

    fn from_review(review: Review) -> DbReview {
        DbReview{
            id: Uuid::new_v4(), // generate random uuid for review
            kennelid: review.kennelid,
            title: review.title,
            author: review.author,
            date_posted: review.date_posted,
            review_text: review.review_text,
            images: review.images,
            rating: review.rating,
            tags: review.tags,
        }
    }

}