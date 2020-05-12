use diesel;
use diesel::prelude::*;
use uuid::Uuid;
use crate::schema::reviews;

extern crate bcrypt;
use crate::auth;

use chrono::NaiveDateTime;

/**
 * Method that returns a vector with all of the reviews
 */
pub fn all(connection: &PgConnection) -> QueryResult<Vec<DbReview>> {
    reviews::table.load::<DbReview>(&*connection)
}

/**
 * LOAD REVIEW: Method that returns a Review given the uuid
 */
pub fn get(id: Uuid, connection: &PgConnection) -> QueryResult<DisplayReview> {

    // Searches review table for the uuid and gets the review
    Ok(DbReview::to_review(reviews::table.find(id).get_result::<DbReview>(connection).unwrap(), connection))
}

/**
 * CREATE REVIEW: Method that attempts to create a new review in database, returns URL? 
 */
pub fn insert(review: Review, connection: &PgConnection) -> QueryResult<DbReview> {

    // Inserts review into database, returns review created
    diesel::insert_into(reviews::table)
        .values(&DbReview::from_review(review))
        .get_result::<DbReview>(connection)
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

// Fields that represent what the review needs to display on front end
#[derive(Queryable, Serialize, Deserialize, Debug)]
pub struct DisplayReview {
    pub kennel_uuid: String, //kennel name
    pub title: String,
    pub author: String, //username
    pub timestamp: NaiveDateTime,
    pub text: String,
    pub images: Vec<String>,
    pub rating: i32,
    pub tags: Vec<String>,
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

// Struct represneting the fields of a review that is inserted into database
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

    fn from_review(review: Review) -> DbReview {

        DbReview{
            review_uuid: Uuid::new_v4(), // generate random uuid for review
            kennel_uuid: Uuid::parse_str(&review.kennel_uuid[1..37]).unwrap(),
            title: (&review.title[1..(review.title.len()-1)]).to_string(),
            author: auth::get_uuid_from_token(&review.author[1..(review.author.len()-1)]),
            timestamp: match NaiveDateTime::parse_from_str(&review.timestamp, "\"%Y-%m-%d %H:%M:%S\"") {
                Ok(t) => Some(t),
                Err(e) => None,
            },
            text: (&review.text[1..(review.text.len()-1)]).to_string(),
            images: review.images,
            rating: review.rating,
            tags: review.tags,
            hotness: Some(0),
        }
    }

    fn to_review(review: DbReview, connection: &PgConnection) -> DisplayReview {
        let vec : Vec<String> = vec![];
        let vec2 : Vec<String> = vec![];
        DisplayReview{
            kennel_uuid: review.kennel_uuid.to_string(), //TODO Get name of kennel
            title: review.title,
            author: super::super::users::handlers::get_user_from_uuid(review.author, connection).unwrap().username,
            timestamp: review.timestamp.unwrap(),
            text: review.text,
            images: match review.images {
                Some(t) => t,
                None => vec,
            },
            rating: review.rating,
            tags: match review.tags {
                Some(t) => t,
                None => vec2,
            },
        }
    }

}