use diesel;
use diesel::prelude::*;
use uuid::Uuid;
use crate::schema::comments;

use chrono::NaiveDateTime;

use crate::auth;

/**
 * Method that returns a vector with all of the comments
 */
pub fn all(connection: &PgConnection) -> QueryResult<Vec<DbComment>> {
    comments::table.load::<DbComment>(&*connection)
}

/**
 * LOAD Comment: Method that returns a DbComment given the uuid
 */
pub fn get(id: Uuid, connection: &PgConnection) -> QueryResult<DbComment> {

    // Searches comment table for the uuid and gets the comment
    comments::table.find(id).get_result::<DbComment>(connection)
}

/**
 * CREATE Comment: Method that attempts to create a new comment in database, returns URL? 
 */
pub fn insert(comment: Comment, connection: &PgConnection) -> Result<Uuid, String> {
    // Prints the Comment information that was received (register)
    println!("Comment Text: {}", comment.text);
    println!("Review ID: {}", comment.review_uuid);

    // Inserts comment into database, returns uuid generated
    match diesel::insert_into(comments::table)
        .values(&DbComment::from_comment(comment))
        .get_result::<DbComment>(connection) {
            Ok(c) => Ok(c.comment_uuid),
            Err(e) => Err(e.to_string()),
        }
}

/**
 * EDIT Comment: Method that updates a comment in database
 */
pub fn update(id: Uuid, comment: Comment, connection: &PgConnection) -> bool {
    match diesel::update(comments::table.find(id))
        .set(&DbComment::from_comment(comment))
        .get_result::<DbComment>(connection) {
            Ok(_c) => return true,
            Err(_e) => return false,
        }
}

/**
 * DELETE Comment: Method that removes a comment in database
 */
pub fn delete(id: Uuid, connection: &PgConnection) -> QueryResult<usize> {
    diesel::delete(comments::table.find(id))
        .execute(connection)
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
}

// Converts a Comment to an DbComment by calling functions on passed in values
impl DbComment{

    fn from_comment(comment: Comment) -> DbComment {
        DbComment{
        	comment_uuid: Uuid::new_v4(),
            review_uuid: comment.review_uuid,
		    author_uuid: auth::get_uuid_from_token(&comment.author_token),
		    timestamp: NaiveDateTime::parse_from_str(&comment.timestamp, "%Y-%m-%d %H:%M:%S").unwrap(),
		    text: comment.text,
        }
    }

}
