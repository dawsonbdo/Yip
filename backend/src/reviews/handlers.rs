use diesel;
use diesel::prelude::*;
use uuid::Uuid;
use crate::schema::reviews;

extern crate bcrypt;
use crate::auth;

use chrono::NaiveDateTime;

use super::super::{kennels, users};

/**
 * Method that returns a vector with all reviews in a kennel
 * @param kennel_uuid: uuid of the kennel
 * @param connection: database connection
 *
 * @return returns vector of reviews in kennel
 */
pub fn all_kennel_reviews(kennel_uuid: Uuid, connection: &PgConnection) -> QueryResult<Vec<DisplayReview>> {
    
    // Get vector of all reviews in kennel
    let reviews = reviews::table.filter(reviews::kennel_uuid.eq(kennel_uuid)).load::<DbReview>(&*connection);
    
    // Pattern match to make sure successful, convert to DisplayReviews if so
    match reviews {
        Ok(r) => Ok(r.iter()
                     .map(|review| DbReview::to_review(review, connection))
                     .collect()),
        Err(e) => Err(e),
    }
    
}

/**
 * Method that gets returns all reviews in database
 * @param connection: database connection
 *
 * @return returns vector of all DbReviews
 */
pub fn all(connection: &PgConnection) -> QueryResult<Vec<DbReview>> {
    reviews::table.load::<DbReview>(&*connection)
}

/**
 * Method that gets a Review from the database
 * @param id: uuid of the review
 * @param connection: database connection
 *
 * @return returns DbReview if found, otherwise error
 */
pub fn get(id: Uuid, connection: &PgConnection) -> QueryResult<DisplayReview> {

    // Searches review table for the uuid and gets the review
    let review = reviews::table.find(id).get_result::<DbReview>(connection);

    // Pattern matches the review and converts to DisplayReview if no error
    match review {
        Ok(r) => Ok(DbReview::to_review(&r, connection)),
        Err(e) => Err(e),
    }
}

/**
 * Method that creates a Review by inserting into database
 * @param review: the review that is created
 * @param connection: database connection
 *
 * @return returns DbReview created if succesful, otherwise error
 */
pub fn insert(review: Review, connection: &PgConnection) -> QueryResult<DbReview> {

    // Inserts review into database, returns review created
    diesel::insert_into(reviews::table)
        .values(&DbReview::from_review(review))
        .get_result::<DbReview>(connection)
}

/**
 * Method that edits a Review in database
 * @param id: uuid of the review
 * @param review: review that is used to replace current in database
 * @param connection: database connection
 *
 * @return returns a bool if successfuly edited 
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
 * Method that deletes a Review from database
 * @param id: uuid of the review
 * @param connection: database connection
 *
 * @return returns a result 
 */
pub fn delete(id: Uuid, connection: &PgConnection) -> QueryResult<usize> {
    diesel::delete(reviews::table.find(id))
        .execute(connection)
}

// Fields that represent what the review needs to display on front end
#[derive(Queryable, Serialize, Deserialize, Debug)]
pub struct DisplayReview {
    pub kennel_name: String, //kennel name
    pub title: String,
    pub author: String, //username
    pub timestamp: NaiveDateTime,
    pub text: String,
    pub images: Vec<String>,
    pub rating: i32,
    pub tags: Vec<String>,
    pub is_author: bool,
}

// Struct representing the fields of a review passed in from frontend contains
#[derive(Queryable, Serialize, Deserialize, Debug)]
pub struct Review {
    pub kennel_uuid: String,
    pub title: String,
    pub author: String, //jwt
    pub timestamp: String,
    pub text: String,
    pub images: Option<Vec<String>>,
    pub rating: i32,
    pub tags: Option<Vec<String>>,
}

// Struct representing the fields of a review that is inserted into database
#[derive(Insertable, AsChangeset, Queryable, Serialize, Deserialize)]
#[table_name = "reviews"]
pub struct DbReview {
    pub review_uuid: Uuid,
    pub kennel_uuid: Uuid,
    pub title: String,
    pub author: Uuid, 
    pub timestamp: Option<NaiveDateTime>,
    pub text: String,
    pub rating: i32,
    pub tags: Option<Vec<String>>,
    pub hotness: Option<i32>,
    pub images: Option<Vec<String>>,
}

// Converts a Review to an DbReview by calling functions on passed in values
impl DbReview{

    // Converts Review to DbReview
    fn from_review(review: Review) -> DbReview {
        DbReview{
            review_uuid: Uuid::new_v4(), // generate random uuid for review
            kennel_uuid: Uuid::parse_str(&review.kennel_uuid[1..37]).unwrap(),
            title: (&review.title[1..(review.title.len()-1)]).to_string(),
            author: auth::get_uuid_from_token(&review.author[1..(review.author.len()-1)]),
            timestamp: match NaiveDateTime::parse_from_str(&review.timestamp, "\"%Y-%m-%d %H:%M:%S\"") {
                Ok(t) => Some(t),
                Err(_e) => None,
            },
            text: (&review.text[1..(review.text.len()-1)]).to_string(),
            images: review.images,
            rating: review.rating,
            tags: review.tags,
            hotness: Some(0),
        }
    }

    // Converts DbReview to DisplayReview
    fn to_review(review: &DbReview, connection: &PgConnection) -> DisplayReview {
        let vec : Vec<String> = vec![];
        let vec2 : Vec<String> = vec![];
        
        DisplayReview{
            kennel_name: kennels::handlers::get(review.kennel_uuid, connection).unwrap().kennel_name,
            title: review.title.clone(),
            author: users::handlers::get_user_from_uuid(review.author, connection).unwrap().username,
            timestamp: review.timestamp.unwrap(),
            text: review.text.clone(),
            images: match &review.images {
                Some(t) => t.to_vec(),
                None => vec, // empty vector if no images
            },
            rating: review.rating,
            tags: match &review.tags {
                Some(t) => t.to_vec(),
                None => vec2, // empty vector if no tags
            },
            is_author: false,
        }
    }

}