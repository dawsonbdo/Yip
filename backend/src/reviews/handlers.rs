use diesel;
use diesel::prelude::*;
use uuid::Uuid;

use crate::schema::reviews;
use crate::schema::review_like_relationships;
use crate::schema::review_dislike_relationships;
use crate::schema::bookmarks;

// Used for deleting reviews
use crate::schema::reports;
use crate::schema::comments;
use crate::schema::comment_like_relationships;
use crate::schema::comment_dislike_relationships;

extern crate bcrypt;
use crate::auth;

use chrono::{NaiveDate, NaiveDateTime};

use rocket::response::status;

use super::super::{kennels, users};
use super::super::comments::handlers::DbComment;

/**
 * Method that converts a Review to InsertReview
 * @param review: the Review object
 *
 * @return returns a InsertReview
 */
fn from_review(review: Review, connection: &PgConnection) -> InsertReview {
    let kennel_id = Uuid::parse_str(&review.kennel_uuid[1..37]).unwrap();
    let author_id = auth::get_uuid_from_token(&review.author[1..(review.author.len()-1)]);

    InsertReview{
        review_uuid: Uuid::new_v4(), // generate random uuid for review if not already existent
        kennel_uuid: kennel_id,
        title: (&review.title[1..(review.title.len()-1)]).to_string(),
        author: author_id,
        text: (&review.text[1..(review.text.len()-1)]).to_string(),
        images: review.images,
        tags: review.tags,
        hotness: Some(0.0),
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
        is_bookmarked: false,
        is_reported: false,
        is_moderator: false,
        review_uuid: review.review_uuid,
        hotness: review.hotness.unwrap() as i64,
    }
}

/**
 * Method that attempts to unbookmark a review
 * @param review_uuid: uuid of review
 * @param profile_uuid: uuid of user
 * @param connection: database connection
 *
 * @retun returns result of either Accepted or BadRequest status
 */
pub fn unbookmark(review_uuid: Uuid, profile_uuid: Uuid, connection: &PgConnection) -> QueryResult<usize> {
    
    // Prints the uuids received
    println!("Review uuid: {}", review_uuid);
    println!("Profile uuid: {}", profile_uuid);

    // Attempts to remove bookmark
    diesel::delete(bookmarks::table
            .filter(bookmarks::review.eq(review_uuid))
            .filter(bookmarks::user.eq(profile_uuid)))
            .execute(connection)
}

/**
 * Method that attempts to bookmark a review
 * @param review_uuid: uuid of review
 * @param profile_uuid: uuid of user
 * @param connection: database connection
 *
 * @retun returns result of either Accepted or BadRequest status
 */
pub fn bookmark(review_uuid: Uuid, profile_uuid: Uuid, connection: &PgConnection) -> QueryResult<usize> {
    
    // Prints the uuids received
    println!("Review uuid: {}", review_uuid);
    println!("Profile uuid: {}", profile_uuid);
    
    // Check that review exists
    match reviews::table.find(review_uuid).execute(connection){
        Ok(u) => if u == 0 {return Err(diesel::result::Error::NotFound)} else {()},
        Err(e) => return Err(e),
    }

    // Creates BookmarkReview to insert
    let bookmark = BookmarkReview {
        user: profile_uuid,
        review: review_uuid,
    };

    // Inserts bookmark review into database, returns result indicating success/error
    diesel::insert_into(bookmarks::table)
        .values(bookmark)
        .execute(connection) 
}

/**
 * Helper method that returns rows in bookmark table that correspond to profile uuid
 * @param profile_uuid: the profile uuid
 * @param connection: database connection
 *
 * @return returns a result containing vector of rows
 */
pub fn get_user_bookmarks(profile_uuid: Uuid, connection: &PgConnection) -> QueryResult<Vec<DbBookmarkReview>>{
    
    // Filters review dislike relationship table
    bookmarks::table
             .filter(bookmarks::user.eq(profile_uuid))
             .load::<DbBookmarkReview>(connection)
}

/**
 * Helper method that returns rows in review dislike table that correspond to profile uuid
 * @param profile_uuid: the profile uuid
 * @param connection: database connection
 *
 * @return returns a result containing vector of rows
 */
pub fn get_user_dislikes(profile_uuid: Uuid, connection: &PgConnection) -> QueryResult<Vec<DbDislikeReview>>{
    
    // Filters review dislike relationship table
    review_dislike_relationships::table
             .filter(review_dislike_relationships::disliker.eq(profile_uuid))
             .load::<DbDislikeReview>(connection)
}

/**
 * Helper method that returns rows in review like table that correspond to profile uuid
 * @param profile_uuid: the profile uuid
 * @param connection: database connection
 *
 * @return returns a result containing vector of rows
 */
pub fn get_user_likes(profile_uuid: Uuid, connection: &PgConnection) -> QueryResult<Vec<DbLikeReview>>{
    
    // Filters review like relationship table
    review_like_relationships::table
             .filter(review_like_relationships::liker.eq(profile_uuid))
             .load::<DbLikeReview>(connection)
}

/**
 * Helper method that returns row in bookmark table based on params
 * @param review_uuid: the review uuid
 * @param profile_uuid: the profile uuid
 * @param connection: database connection
 *
 * @return returns a result containing size if found, otherwise error
 */
pub fn get_relationship_bookmark(review_uuid: Uuid, profile_uuid: Uuid, connection: &PgConnection) -> QueryResult<usize>{
    
    // Filters review like relationship table
    bookmarks::table
             .filter(bookmarks::review.eq(review_uuid))
             .filter(bookmarks::user.eq(profile_uuid))
             .execute(connection)
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
        Ok(r) => rating += r as i32,
        Err(_e) => rating += 0,
    }

    // Get number of dislikes
    match dislikes {
        Ok(r) => rating -= r as i32,
        Err(_e) => rating -= 0,
    }

    // Return rating
    rating as i32
}


/**
 * Method that returns rating of a review
 * @param review_uuid: uuid of review
 * @param rating: rating of review
 * @param connection: database connection
 *
 * @return returns hotness of review, 0 if does not exist
 */
pub fn calculate_hotness(review_uuid: Uuid, rating: i32, connection: &PgConnection) -> f64 {

    // Get the review
    let review = get(review_uuid, connection);
    
    // Get the time in seconds from when review was posted to 1/1/20
    let seconds = review.unwrap().timestamp.signed_duration_since(NaiveDate::from_ymd(2020,1,1).and_hms(1,1,1)).num_seconds();

    // Set y value
    let y = if rating > 0 {1} else if rating == 0 {0} else {-1};

    // Set z value
    let z = (if rating.abs() > 1 {rating.abs()} else {1}) as f64;

    let hotness = z.log10() + ( (y * seconds) / 45000 ) as f64;

    hotness
}

/**
 * Method that updates the rating of a review in DB
 * @param review_uuid: uuid of review
 * @param connection: database connection
 *
 * @return result indicating if successfully updated
 */
pub fn update_review_rating(review_uuid: Uuid, connection: &PgConnection) -> QueryResult<()>{

    // Get new rating
    let new_count = calculate_rating(review_uuid, connection);

    // Get new hotness
    let hotness = calculate_hotness(review_uuid, new_count, connection);

    println!("Review Id: {} New Count: {} New Hotness: {}", review_uuid, new_count, hotness);

    // Update hotness
    diesel::update(reviews::table.find(review_uuid))
                        .set(reviews::columns::hotness.eq(hotness))
                        .execute(connection)?;

    // Update review rating
    diesel::update(reviews::table.find(review_uuid))
                        .set(reviews::columns::rating.eq(new_count))
                        .execute(connection)?;
    Ok(())
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
    
    // Check if user already disliked kennel (delete dislike if already disliked)
    match get_relationship_dislike(review_uuid, profile_uuid, connection) {
        Ok(r) => if r != 0 {
            // Attempt to delete from dislike table
            match delete_like_dislike(review_uuid, profile_uuid, false, connection){
                Ok(_u) => return Ok(status::Accepted(None)),
                Err(e) => return Err(status::BadRequest(Some(e.to_string()))),
            }
        },
        Err(_e) => (),
    };

    // Attempt to delete from like table
    if let Err(_e) = delete_like_dislike(review_uuid, profile_uuid, false, connection){ 
        //TODO update to distinguish expected and unexpected failures
    }

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
pub fn like(review_uuid: Uuid, profile_uuid: Uuid, connection: &PgConnection) -> Result<status::Accepted<String>, status::BadRequest<String>> { //TODO this is not a handler and shouldn't return an HTTP status.
    
    // Prints the uuids received
    println!("Review uuid: {}", review_uuid);
    println!("Profile uuid: {}", profile_uuid);
    
    // Check if user already liked kennel 
    match get_relationship_like(review_uuid, profile_uuid, connection) {
        Ok(r) => if r != 0 {
            // Attempt to delete from like table
            match delete_like_dislike(review_uuid, profile_uuid, true, connection){
                Ok(_u) => return Ok(status::Accepted(None)),
                Err(e) => return Err(status::BadRequest(Some(e.to_string()))),
            }
        },
        Err(_e) => (),
    };

    // Attempt to delete from dislike table
    if let Err(_e) = delete_like_dislike(review_uuid, profile_uuid, false, connection){ 
        //TODO update to distinguish expected and unexpected failures
    }

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
pub fn update(id: Uuid, review: Review, connection: &PgConnection) -> QueryResult<DbReview> {
    let kennel_id = Uuid::parse_str(&review.kennel_uuid[1..37]).unwrap();
    let author_id = auth::get_uuid_from_token(&review.author[1..(review.author.len()-1)]);

    let updated_rev = InsertReview{
        review_uuid: id, // generate random uuid for review if not already existent
        kennel_uuid: kennel_id,
        title: (&review.title[1..(review.title.len()-1)]).to_string(),
        author: author_id,
        text: (&review.text[1..(review.text.len()-1)]).to_string(),
        images: review.images,
        tags: review.tags,
        hotness: Some(0.0),
        kennel_name: kennels::handlers::get(kennel_id, connection).unwrap().kennel_name,
        author_name: users::handlers::get_user_from_uuid(author_id, connection).unwrap().username,
        rating: review.rating,
    };

     diesel::update(reviews::table.find(id))
        .set(&updated_rev)
        .get_result::<DbReview>(connection)
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

    // Delete all reports
    diesel::delete(reports::table
             .filter(reports::review_id.eq(id)))
             .execute(connection)?;

    // Delete all bookmarks
    diesel::delete(bookmarks::table
             .filter(bookmarks::review.eq(id)))
             .execute(connection)?;

    // Get all comments
    let comments = comments::table.filter(comments::review_uuid.eq(id)).load::<DbComment>(&*connection)?;

    // Delete all comments like dislikes
    for c in comments.iter(){
        // Delete likes
        diesel::delete(comment_like_relationships::table
                  .filter(comment_like_relationships::comment.eq(c.comment_uuid)))
        .execute(connection)?;

        // Delete dislikes
        diesel::delete(comment_dislike_relationships::table
                  .filter(comment_dislike_relationships::comment.eq(c.comment_uuid)))
        .execute(connection)?;
    }
    
    // Delete all comments
    diesel::delete(comments::table.filter(comments::review_uuid.eq(id)))
        .execute(connection)?;

    // Delete all review likes dislikes
    diesel::delete(review_like_relationships::table
                  .filter(review_like_relationships::review.eq(id)))
        .execute(connection)?;

    diesel::delete(review_dislike_relationships::table
                  .filter(review_dislike_relationships::review.eq(id)))
        .execute(connection)?;

    // Delete review
    diesel::delete(reviews::table.find(id))
        .execute(connection)
}

// Struct representing the fields of boomark table
#[table_name = "bookmarks"]
#[derive(Insertable, AsChangeset, Queryable, Serialize, Deserialize)]
pub struct BookmarkReview {
    pub user: Uuid,
    pub review: Uuid,
}

// Struct representing the fields of boomark table in DB
#[table_name = "bookmarks"]
#[derive(Insertable, AsChangeset, Queryable, Serialize, Deserialize)]
pub struct DbBookmarkReview {
    pub pkey: i64,
    pub user: Uuid,
    pub review: Uuid,
    pub timestamp: NaiveDateTime,
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
#[derive(Queryable, Serialize, Deserialize, Debug, std::hash::Hash, std::cmp::PartialEq, std::cmp::Eq)]
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
    pub is_bookmarked: bool,
    pub is_reported: bool,
    pub is_moderator: bool,
    pub review_uuid: Uuid,
    pub hotness: i64,
}

// Struct representing the fields of a review passed in from frontend contains
#[derive(Queryable, Serialize, Deserialize, Debug)]
pub struct Review {
    pub kennel_uuid: String,
    pub title: String,
    pub author: String, //jwt
    pub text: String,
    pub images: Option<Vec<String>>,
    pub rating: i32,
    pub tags: Option<Vec<String>>,
}

// Struct representing the fields of a review that is inserted into database
#[derive(Insertable, AsChangeset, Queryable, Serialize, Deserialize)]
#[changeset_options(treat_none_as_null="true")]
#[table_name = "reviews"]
pub struct InsertReview {
    pub review_uuid: Uuid,
    pub kennel_uuid: Uuid,
    pub title: String,
    pub author: Uuid, 
    pub text: String,
    pub tags: Option<Vec<String>>,
    pub hotness: Option<f64>,
    pub images: Option<Vec<String>>,
    pub kennel_name: String,
    pub author_name: String,
    pub rating: i32,
}

// Struct representing the fields of a review that is retrived from database
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
    pub hotness: Option<f64>,
    pub images: Option<Vec<String>>,
    pub kennel_name: String,
    pub author_name: String,
    pub rating: i32,
}

