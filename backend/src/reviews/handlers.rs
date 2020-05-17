use diesel;
use diesel::prelude::*;
use uuid::Uuid;

use crate::schema::reviews;
use crate::schema::review_like_relationships;
use crate::schema::review_dislike_relationships;

extern crate bcrypt;
use crate::auth;

use chrono::NaiveDateTime;

use rocket::response::status;

use super::super::{kennels, users};

/**
 * Method that converts a Review to DbReview
 * @param review: the Review object
 *
 * @return returns a DbReview
 */
fn from_review(review: Review, connection: &PgConnection) -> DbReview {
    let kennel_id = Uuid::parse_str(&review.kennel_uuid[1..37]).unwrap();
    let author_id = auth::get_uuid_from_token(&review.author[1..(review.author.len()-1)]);

    DbReview{
        review_uuid: Uuid::new_v4(), // generate random uuid for review
        kennel_uuid: kennel_id,
        title: (&review.title[1..(review.title.len()-1)]).to_string(),
        author: author_id,
        timestamp: match NaiveDateTime::parse_from_str(&review.timestamp, "\"%Y-%m-%d %H:%M:%S\"") {
            Ok(t) => t,
            Err(_e) => NaiveDateTime::from_timestamp(0, 42_000_000),
        },
        text: (&review.text[1..(review.text.len()-1)]).to_string(),
        images: review.images,
        tags: review.tags,
        hotness: Some(0),
        kennel_name: kennels::handlers::get(kennel_id, connection).unwrap().kennel_name,
        author_name: users::handlers::get_user_from_uuid(author_id, connection).unwrap().username,
        rating: review.rating,
    }
}

/**
 * Method that converts a DbReview to DisplayReview
 * @param review: the DbReview object
 *
 * @return returns a DisplayReview
 */
pub fn to_review(review: &DbReview) -> DisplayReview {
    let vec : Vec<String> = vec![];
    let vec2 : Vec<String> = vec![];
        
    DisplayReview{
        kennel_name: review.kennel_name.clone(),
        title: review.title.clone(),
        author: review.author_name.clone(),
        timestamp: review.timestamp,
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
        is_liked: false,
        is_disliked: false,
        review_uuid: review.review_uuid,
    }
}

/**
 * Helper method that returns row in review dislike table based on params
 * @param review_uuid: the review uuid
 * @param profile_uuid: the profile uuid
 * @param connection: database connection
 *
 * @return returns a result containing DbDislikeReview if found, otherwise error
 */
pub fn get_relationship_dislike(review_uuid: Uuid, profile_uuid: Uuid, connection: &PgConnection) -> QueryResult<usize>{
    
    // Filters review like relationship table
    review_dislike_relationships::table
             .filter(review_dislike_relationships::review.eq(review_uuid))
             .filter(review_dislike_relationships::disliker.eq(profile_uuid))
             .execute(connection)
}

/**
 * Helper method that returns row in review like table based on params
 * @param review_uuid: the review uuid
 * @param profile_uuid: the profile uuid
 * @param connection: database connection
 *
 * @return returns a result containing size if found, otherwise error
 */
pub fn get_relationship_like(review_uuid: Uuid, profile_uuid: Uuid, connection: &PgConnection) -> QueryResult<usize>{
    
    // Filters review like relationship table
    review_like_relationships::table
             .filter(review_like_relationships::review.eq(review_uuid))
             .filter(review_like_relationships::liker.eq(profile_uuid))
             .execute(connection)
}

/**
 * Helper method that attempts to delete from like or dislike review relationship table
 * @param review_uuid: the review uuid
 * @param profile_uuid: the profile uuid
 * @param like: indicates if like table or dislike table
 * @param connection: database connection
 *
 * @return returns a result based on if deleted sucessfully
 */
fn delete_like_dislike(review_uuid: Uuid, profile_uuid: Uuid, like: bool, connection: &PgConnection) -> QueryResult<usize>{
    
    // Check if deleting from like or dislike table
    if like {

        // Attempt to delete from like table
        diesel::delete(review_like_relationships::table
             .filter(review_like_relationships::review.eq(review_uuid))
             .filter(review_like_relationships::liker.eq(profile_uuid)))
        .execute(connection)
    } else {

        // Attempt to delete from dislike table
        diesel::delete(review_dislike_relationships::table
             .filter(review_dislike_relationships::review.eq(review_uuid))
             .filter(review_dislike_relationships::disliker.eq(profile_uuid)))
        .execute(connection)
    }

}

/**
 * Method that returns rating of a review
 * @param review_uuid: uuid of review
 * @param connection: database connection
 *
 * @return returns rating of review, 0 if does not exist
 */
pub fn calculate_rating(review_uuid: Uuid, connection: &PgConnection) -> i32 {

    // Gets rows that match the review uuid in like table
    let likes = review_like_relationships::table
             .filter(review_like_relationships::review.eq(review_uuid))
             .execute(connection);

    // Gets rows that match the review uuid in dislike table
    let dislikes = review_dislike_relationships::table
             .filter(review_dislike_relationships::review.eq(review_uuid))
             .execute(connection);

    let mut rating : i32 = 0;

    // Get number of likes
    match likes {
        Ok(r) => rating += (r as i32),
        Err(_e) => rating += 0,
    }

    // Get number of dislikes
    match dislikes {
        Ok(r) => rating -= (r as i32),
        Err(_e) => rating -= 0,
    }

    // Return rating
    rating as i32
}

/**
 * Method that updates the rating of a review in DB
 * @param review_uuid: uuid of review
 * @param connection: database connection
 *
 * @return result indicating if successfully updated
 */
pub fn update_review_rating(review_uuid: Uuid, connection: &PgConnection) -> QueryResult<usize>{

    // Get new rating
    let new_count = calculate_rating(review_uuid, connection);

    println!("Review Id: {} New Count: {}", review_uuid, new_count);

    // Update review rating
    diesel::update(reviews::table.find(review_uuid))
                        .set(reviews::columns::rating.eq(new_count))
                        .execute(connection)
}


/**
 * Method that attempts to dislike a review
 * @param review_uuid: uuid of review
 * @param profile_uuid: uuid of user
 * @param connection: database connection
 *
 * @retun returns result of either Accepted or BadRequest status
 */
pub fn dislike(review_uuid: Uuid, profile_uuid: Uuid, connection: &PgConnection) -> Result<status::Accepted<String>, status::BadRequest<String>> {
    
    // Prints the uuids received
    println!("Review uuid: {}", review_uuid);
    println!("Profile uuid: {}", profile_uuid);
    
    // Check if user already disliked kennel 
    match get_relationship_dislike(review_uuid, profile_uuid, connection) {
        Ok(r) => if r != 0 {return Err(status::BadRequest(Some("Already disliking".to_string())))},
        Err(_e) => (),
    };

    // Attempt to delete from like table
    delete_like_dislike(review_uuid, profile_uuid, true, connection);

    // Creates object to be inserted to the like review table
    let dislike_review = DislikeReview {
        disliker: profile_uuid,
        review: review_uuid,
    };

    // Inserts dislike review into database, returns result indicating success/error
    match diesel::insert_into(review_dislike_relationships::table)
        .values(dislike_review)
        .execute(connection) {
            Ok(_u) => Ok(status::Accepted(None)),
            Err(e) => Err(status::BadRequest(Some(e.to_string()))),
        }
}

/**
 * Method that attempts to like a review
 * @param review_uuid: uuid of review
 * @param profile_uuid: uuid of user
 * @param connection: database connection
 *
 * @retun returns result of either Accepted or BadRequest status
 */
pub fn like(review_uuid: Uuid, profile_uuid: Uuid, connection: &PgConnection) -> Result<status::Accepted<String>, status::BadRequest<String>> {
    
    // Prints the uuids received
    println!("Review uuid: {}", review_uuid);
    println!("Profile uuid: {}", profile_uuid);
    
    // Check if user already liked kennel 
    match get_relationship_like(review_uuid, profile_uuid, connection) {
        Ok(r) => if r != 0 {return Err(status::BadRequest(Some("Already liking".to_string())))},
        Err(_e) => (),
    };

    // Attempt to delete from dislike table
    delete_like_dislike(review_uuid, profile_uuid, false, connection);

    // Creates object to be inserted to the like review table
    let like_review = LikeReview {
        liker: profile_uuid,
        review: review_uuid,
    };

    // Inserts like review into database, returns result indicating success/error
    match diesel::insert_into(review_like_relationships::table)
        .values(like_review)
        .execute(connection) {
            Ok(_u) => Ok(status::Accepted(None)),
            Err(e) => Err(status::BadRequest(Some(e.to_string()))),
        }
}

/**
 * Method that returns a vector with all reviews in a kennel
 * @param kennel_uuid: uuid of the kennel
 * @param connection: database connection
 *
 * @return returns vector of DisplayReviews in kennel
 */
pub fn all_kennel_reviews(kennel_uuid: Uuid, connection: &PgConnection) -> QueryResult<Vec<DisplayReview>> {
    
    // Get vector of all reviews in kennel
    let reviews = reviews::table.filter(reviews::kennel_uuid.eq(kennel_uuid)).load::<DbReview>(&*connection);
    
    // Pattern match to make sure successful, convert to DisplayReviews if so
    match reviews {
        Ok(r) => Ok(r.iter()
                     .map(|review| to_review(review))
                     .collect()),
        Err(e) => Err(e),
    }
}

/**
 * Method that returns a vector with all reviews posted by a user
 * @param user_uuid: uuid of the user
 * @param connection: database connection
 *
 * @return returns vector of DisplayReviews by user
 */
pub fn all_user_reviews(user_uuid: Uuid, connection: &PgConnection) -> QueryResult<Vec<DisplayReview>> {
    
    // Get vector of all reviews by user
    let reviews = reviews::table.filter(reviews::author.eq(user_uuid)).load::<DbReview>(&*connection);
    
    // Pattern match to make sure successful, convert to DisplayReviews if so
    match reviews {
        Ok(r) => Ok(r.iter()
                     .map(|review| to_review(review))
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
        Ok(r) => Ok(to_review(&r)),
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
        .values(&from_review(review, connection))
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
        .set(&from_review(review, connection))
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
    // TODO: Delete all the comments, and relationships ie likes/dislikes

    diesel::delete(reviews::table.find(id))
        .execute(connection)
}

// Struct representing the fields of review like table
#[table_name = "review_like_relationships"]
#[derive(Insertable, AsChangeset, Queryable, Serialize, Deserialize)]
pub struct LikeReview {
    pub liker: Uuid,
    pub review: Uuid,
}

// Struct representing the fields of review dislike table
#[table_name = "review_dislike_relationships"]
#[derive(Insertable, AsChangeset, Queryable, Serialize, Deserialize)]
pub struct DislikeReview {
    pub disliker: Uuid,
    pub review: Uuid,
}

// Struct representing the fields of review like table that is returned by DB
#[table_name = "review_like_relationships"]
#[derive(Insertable, AsChangeset, Queryable, Serialize, Deserialize)]
pub struct DbLikeReview {
    pub pkey: i64,
    pub liker: Uuid,
    pub review: Uuid,
}

// Struct representing the fields of review dilike table that is returned by DB
#[table_name = "review_dislike_relationships"]
#[derive(Insertable, AsChangeset, Queryable, Serialize, Deserialize)]
pub struct DbDislikeReview {
    pub pkey: i64,
    pub disliker: Uuid,
    pub review: Uuid,
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
    pub is_liked: bool,
    pub is_disliked: bool,
    pub review_uuid: Uuid,
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
    pub timestamp: NaiveDateTime,
    pub text: String,
    pub tags: Option<Vec<String>>,
    pub hotness: Option<i32>,
    pub images: Option<Vec<String>>,
    pub kennel_name: String,
    pub author_name: String,
    pub rating: i32,
}