use diesel;
use diesel::prelude::*;
use uuid::Uuid;

// Database tables queried
use crate::schema::comments;
use crate::schema::comment_like_relationships;
use crate::schema::comment_dislike_relationships;

use chrono::NaiveDateTime;

use crate::auth;

use rocket::response::status;

/**
 * Helper method that returns rows in comment dislike table that correspond to profile uuid
 * @param profile_uuid: the profile uuid
 * @param connection: database connection
 *
 * @return returns a result containing vector of rows
 */
pub fn get_user_dislikes(profile_uuid: Uuid, connection: &PgConnection) -> QueryResult<Vec<DbDislikeComment>>{
    
    // Filters comment like relationship table
    comment_dislike_relationships::table
             .filter(comment_dislike_relationships::disliker.eq(profile_uuid))
             .load::<DbDislikeComment>(connection)
}

/**
 * Helper method that returns rows in comment like table that correspond to profile uuid
 * @param profile_uuid: the profile uuid
 * @param connection: database connection
 *
 * @return returns a result containing vector of rows
 */
pub fn get_user_likes(profile_uuid: Uuid, connection: &PgConnection) -> QueryResult<Vec<DbLikeComment>>{
    
    // Filters comment like relationship table
    comment_like_relationships::table
             .filter(comment_like_relationships::liker.eq(profile_uuid))
             .load::<DbLikeComment>(connection)
}

/**
 * Helper method that converts a Comment to DbComment
 * @param comment: the Comment
 * @param connection: database connection
 *
 * @return returns a DbComment
 */
fn from_comment(comment: Comment, connection: &PgConnection) -> DbComment {
    let author_uuid = auth::get_uuid_from_token(&comment.author_token);

    DbComment{
        comment_uuid: Uuid::new_v4(),
        review_uuid: comment.review_uuid,
        author_uuid: author_uuid,
        timestamp: NaiveDateTime::parse_from_str(&comment.timestamp, "%Y-%m-%d %H:%M:%S").unwrap(),
        text: comment.text.clone(),
        rating: 0, //TODO
        author_name: super::super::users::handlers::get_user_from_uuid(author_uuid, connection).unwrap().username,
    }
}

/**
 * Helper method that converts a DbComment to Display
 * @param comment: the DbComment
 *
 * @return returns a Display
 */
fn to_comment(comment: &DbComment) -> DisplayComment {
    DisplayComment{
        comment_uuid: comment.comment_uuid,
        author_name: comment.author_name.clone(),
        timestamp: comment.timestamp.to_string(),
        text: comment.text.clone(),
        is_author: false, // mod.rs handles this
        rating: comment.rating, // TODO: Have this be up to date in db
        is_liked: false, // handled in mod.rs
        is_disliked: false, // handled in mod.rs
    }
}

/**
 * Method that returns rating of a comment
 * @param comment_uuid: uuid of comment
 * @param connection: database connection
 *
 * @return returns rating of comment, 0 if does not exist
 */
pub fn calculate_rating(comment_uuid: Uuid, connection: &PgConnection) -> i32 {

    // Gets rows that match the comment uuid in like table
    let likes = comment_like_relationships::table
             .filter(comment_like_relationships::comment.eq(comment_uuid))
             .execute(connection);

    // Gets rows that match the comment uuid in dislike table
    let dislikes = comment_dislike_relationships::table
             .filter(comment_dislike_relationships::comment.eq(comment_uuid))
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
 * Method that updates the rating of a comment in DB
 * @param comment_uuid: uuid of comment
 * @param connection: database connection
 *
 * @return result indicating if successfully updated
 */
pub fn update_comment_rating(comment_uuid: Uuid, connection: &PgConnection) -> QueryResult<usize>{

    // Get new rating
    let new_count = calculate_rating(comment_uuid, connection);

    println!("Comment Id: {} New Count: {}", comment_uuid, new_count);

    // Update comment rating
    diesel::update(comments::table.find(comment_uuid))
                        .set(comments::columns::rating.eq(new_count))
                        .execute(connection)
}

/**
 * Helper method that returns row in comment dislike table based on params
 * @param comment_uuid: the comment uuid
 * @param profile_uuid: the profile uuid
 * @param connection: database connection
 *
 * @return returns a result containing usize (1 if found)
 */
fn get_relationship_dislike(comment_uuid: Uuid, profile_uuid: Uuid, connection: &PgConnection) -> QueryResult<usize>{
    
    // Filters comment like relationship table
    comment_dislike_relationships::table
             .filter(comment_dislike_relationships::comment.eq(comment_uuid))
             .filter(comment_dislike_relationships::disliker.eq(profile_uuid))
             .execute(connection)
}

/**
 * Helper method that returns row in comment like table based on params
 * @param comment_uuid: the comment uuid
 * @param profile_uuid: the profile uuid
 * @param connection: database connection
 *
 * @return returns a result containing usize (1 if found)
 */
fn get_relationship_like(comment_uuid: Uuid, profile_uuid: Uuid, connection: &PgConnection) -> QueryResult<usize>{
    
    // Filters comment like relationship table
    comment_like_relationships::table
             .filter(comment_like_relationships::comment.eq(comment_uuid))
             .filter(comment_like_relationships::liker.eq(profile_uuid))
             .execute(connection)
}

/**
 * Helper method that attempts to delete from like or dislike comment relationship table
 * @param comment_uuid: the comment uuid
 * @param profile_uuid: the profile uuid
 * @param like: indicates if like table or dislike table
 * @param connection: database connection
 *
 * @return returns a result based on if deleted sucessfully
 */
fn delete_like_dislike(comment_uuid: Uuid, profile_uuid: Uuid, like: bool, connection: &PgConnection) -> QueryResult<usize>{
    
    // Check if deleting from like or dislike table
    if like {

        // Attempt to delete from like table
        diesel::delete(comment_like_relationships::table
             .filter(comment_like_relationships::comment.eq(comment_uuid))
             .filter(comment_like_relationships::liker.eq(profile_uuid)))
        .execute(connection)
    } else {

        // Attempt to delete from dislike table
        diesel::delete(comment_dislike_relationships::table
             .filter(comment_dislike_relationships::comment.eq(comment_uuid))
             .filter(comment_dislike_relationships::disliker.eq(profile_uuid)))
        .execute(connection)
    }

}

/**
 * Method that attempts to dislike a comment
 * @param comment_uuid: uuid of comment
 * @param profile_uuid: uuid of user
 * @param connection: database connection
 *
 * @retun returns result of either Accepted or BadRequest status
 */
pub fn dislike(comment_uuid: Uuid, profile_uuid: Uuid, connection: &PgConnection) -> Result<status::Accepted<String>, status::BadRequest<String>> {
    
    // Prints the uuids received
    println!("Comment uuid: {}", comment_uuid);
    println!("Profile uuid: {}", profile_uuid);

    // Attempt to delete from like table
    delete_like_dislike(comment_uuid, profile_uuid, true, connection);

    // Creates object to be inserted to the dislike comment table
    let dislike_comment = DislikeComment {
        disliker: profile_uuid,
        comment: comment_uuid,
    };

    // Inserts like comment into database, returns result indicating success/error
    match diesel::insert_into(comment_dislike_relationships::table)
        .values(dislike_comment)
        .execute(connection) {
            Ok(u) => if u == 0 {Err(status::BadRequest(Some("Already disliking comment".to_string())))} else {Ok(status::Accepted(None))},
            Err(e) => Err(status::BadRequest(Some(e.to_string()))),
    }
}

/**
 * Method that attempts to like a comment
 * @param comment_uuid: uuid of comment
 * @param profile_uuid: uuid of user
 * @param connection: database connection
 *
 * @retun returns result of either Accepted or BadRequest status
 */
pub fn like(comment_uuid: Uuid, profile_uuid: Uuid, connection: &PgConnection) -> Result<status::Accepted<String>, status::BadRequest<String>> {
    
    // Prints the uuids received
    println!("Comment uuid: {}", comment_uuid);
    println!("Profile uuid: {}", profile_uuid);
    
    // Attempt to delete from dislike table
    delete_like_dislike(comment_uuid, profile_uuid, false, connection);

    // Creates object to be inserted to the like comment table
    let like_comment = LikeComment {
        liker: profile_uuid,
        comment: comment_uuid,
    };

    // Inserts like comment into database, returns result indicating success/error
    match diesel::insert_into(comment_like_relationships::table)
        .values(like_comment)
        .execute(connection) {
            Ok(u) => if u == 0 {Err(status::BadRequest(Some("Already liking comment".to_string())))} else {Ok(status::Accepted(None))},
            Err(e) => Err(status::BadRequest(Some(e.to_string()))),
        }
}

/**
 * Method that returns a vector with all of the comments for a particular review
 * @param review_uuid: the uuid of review
 * @param connection: database connection
 *
 * @return returns a vector of DisplayComments
 */
pub fn all_review_comments(review_uuid: Uuid, connection: &PgConnection) -> QueryResult<Vec<DisplayComment>> {
    Ok(comments::table.filter(comments::review_uuid.eq(review_uuid)).load::<DbComment>(&*connection)
    .unwrap()
    .iter()
    .map(|comment| to_comment(comment))
    .collect())
}

/**
 * Method that returns a vector with all of the comments
 * @param connection: database connection
 *
 * @return returns a vector of DbComments
 */
pub fn all(connection: &PgConnection) -> QueryResult<Vec<DbComment>> {
    comments::table.load::<DbComment>(&*connection)
}

/**
 * Method that returns a DbComment given the uuid
 * @param id: uuid of comment
 * @param connection: database connection
 *
 * @return returns a vector of DbComments
 */
pub fn get(id: Uuid, connection: &PgConnection) -> QueryResult<DbComment> {

    // Searches comment table for the uuid and gets the comment
    comments::table.find(id).get_result::<DbComment>(connection)
}

/**
 * Method that attempts to create a new comment in database
 * @param comment: the Comment object
 * @param connection: database connection
 *
 * @return returns the DisplayComment of comment created
 */
pub fn insert(comment: Comment, connection: &PgConnection) -> Result<DisplayComment, String> {
    // Prints the Comment information that was received (register)
    println!("Comment Text: {}", comment.text);
    println!("Review ID: {}", comment.review_uuid);

    // Inserts comment into database, returns uuid generated
    match diesel::insert_into(comments::table)
        .values(from_comment(comment, connection))
        .get_result::<DbComment>(connection) {
            Ok(c) => Ok(to_comment(&c)),
            Err(e) => Err(e.to_string()),
        }
}

/**
 * TODO: Untested/maybe dont even need this feature
 * EDIT Comment: Method that updates a comment in database
 */
pub fn update(id: Uuid, comment: Comment, connection: &PgConnection) -> bool {
    match diesel::update(comments::table.find(id))
        .set(from_comment(comment, connection))
        .get_result::<DbComment>(connection) {
            Ok(_c) => return true,
            Err(_e) => return false,
        }
}

/**
 * Method that removes a comment in database
 * @param id: uuid of comment
 * @param connection: database connection
 *
 * @return returns usize (1 if deleted successfully)
 */
pub fn delete(id: Uuid, connection: &PgConnection) -> QueryResult<usize> {
    diesel::delete(comments::table.find(id))
        .execute(connection)
}

// Struct representing the fields of comment like table
#[table_name = "comment_like_relationships"]
#[derive(Insertable, AsChangeset, Queryable, Serialize, Deserialize)]
pub struct LikeComment {
    pub liker: Uuid,
    pub comment: Uuid,
}

// Struct representing the fields of comment dislike table
#[table_name = "comment_dislike_relationships"]
#[derive(Insertable, AsChangeset, Queryable, Serialize, Deserialize)]
pub struct DislikeComment {
    pub disliker: Uuid,
    pub comment: Uuid,
}

// Struct representing the fields of comment like table that is returned by DB
#[table_name = "comment_like_relationships"]
#[derive(Insertable, AsChangeset, Queryable, Serialize, Deserialize)]
pub struct DbLikeComment {
    pub pkey: i64,
    pub liker: Uuid,
    pub comment: Uuid,
}

// Struct representing the fields of comment dilike table that is returned by DB
#[table_name = "comment_dislike_relationships"]
#[derive(Insertable, AsChangeset, Queryable, Serialize, Deserialize)]
pub struct DbDislikeComment {
    pub pkey: i64,
    pub disliker: Uuid,
    pub comment: Uuid,
}

// Struct representing the fields of a comment passed in from frontend contains
#[derive(Queryable, Serialize, Deserialize, std::hash::Hash, std::cmp::Eq, std::cmp::PartialEq)]
pub struct DisplayComment {
    pub comment_uuid: Uuid,
    pub author_name: String,
    pub timestamp: String,
    pub text: String,
    pub is_author: bool,
    pub rating: i32,
    pub is_liked: bool,
    pub is_disliked: bool,
}

// Struct representing the fields of a comment passed in from frontend contains
#[derive(Queryable, Serialize, Deserialize)]
pub struct Comment {
    pub review_uuid: Uuid,
    pub author_token: String,
    pub timestamp: String,
    pub text: String,
}

// Struct represneting the fields of a comment that is inserted into database
#[derive(Insertable, AsChangeset, Queryable, Serialize, Deserialize)]
#[table_name = "comments"]
pub struct DbComment {
	pub comment_uuid: Uuid,
    pub review_uuid: Uuid,
    pub author_uuid: Uuid,
    pub timestamp: NaiveDateTime,
    pub text: String,
    pub author_name: String,
    pub rating: i32,
}