pub mod handlers;

use crate::db;
use crate::auth;

use db::DbConn;
use uuid::Uuid;

use handlers::{Comment, DisplayComment};
use rocket_contrib::json::Json;

use rocket::response::status;

// Struct with comment id and user jwt for liking/dislking comments
#[derive(Queryable, Serialize, Deserialize)]
struct CommentUser {
    comment_uuid: String,
    token: String,
}

/**
 * Helper method that returns the username corresponding to a token, "" if none
 * @param token: the token
 * @param connection: database connection
 *
 * @return returns a String corresponding to username of token, "" if none
 */
fn token_to_username(token: String, connection: &DbConn) -> String {

	// Get uuid from token passed in
	let profile_uuid = auth::get_uuid_from_token(&token);

	// Look for the username of the uuid in database
	match super::users::handlers::get_user_from_uuid(profile_uuid, connection){
		Ok(u) => u.username,
		Err(_e) => "".to_string(),
	}
}

/** 
 * Helper method that follows or unfollows a kennel given parameter
 * @param kennel: JSON of a CommentUser (comment + token)
 * @param like: bool indicating like or dislike
 * @param connetion: database connection
 *
 * @return returns a result with status Accepted or BadRequest
 */
fn like_dislike_helper(input: Json<CommentUser>, like: bool, connection: DbConn) -> Result<status::Accepted<String>, status::BadRequest<String>> {

	// Converts token into uuid
	let profile_uuid = auth::get_uuid_from_token(&input.token);

	// Makes sure uuid was found 
	if profile_uuid.is_nil(){
		return Err(status::BadRequest(Some("Uuid not found".to_string())));
	}

    // Converts comment uuid string into uuid
    let comment_uuid = Uuid::parse_str(&input.comment_uuid);

    let result;

    // Makes sure valid comment
    match comment_uuid {
    	Ok(uuid) => if like {result = handlers::like(uuid, profile_uuid, &connection);}
    			 else {result = handlers::dislike(uuid, profile_uuid, &connection);},
    	// Not a valid comment uuid string
    	Err(e) => return Err(status::BadRequest(Some("Comment not foudn".to_string()))),
    }
    

    // TODO: Update comment net likes
    /*
    if let Err(e) = handlers::update_kennel_followers(kennel_uuid, &connection) {
        dbg!(e);
    }
    */

    // Return result
    result
}

/** 
 * Handler method that unfollows a kennel
 * @param kennel: JSON of a CommentUser (comment + token)
 * @param connetion: database connection
 *
 * @return returns a result with status Accepted or BadRequest
 */
#[post("/dislike_comment", data="<input>", rank=1)]
fn dislike_comment(input: Json<CommentUser>, connection: DbConn) -> Result<status::Accepted<String>, status::BadRequest<String>> {
    
    // Call helper with false for unfollow
    like_dislike_helper(input, false, connection)
}

/** 
 * Handler method that follows a kennel
 * @param kennel: JSON of a CommentUser (comment + token)
 * @param connetion: database connection
 *
 * @return returns a result with status Accepted or BadRequest
 */
#[post("/like_comment", data="<input>", rank=1)]
fn like_comment(input: Json<CommentUser>, connection: DbConn) -> Result<status::Accepted<String>, status::BadRequest<String>> {
    
    // Call helper with true for follow
    like_dislike_helper(input, true, connection)
}

/**
 * Print out all comments of a review
 */
#[get("/get_comments/<review_uuid>/<token>", rank=1)]
fn get_comments(review_uuid: String, token: String, connection: DbConn) -> Result<Json<Vec<DisplayComment>>, status::NotFound<String>> {

	// Converts string to a uuid
	let uuid = Uuid::parse_str(&review_uuid).unwrap();

	// Get username from token passed in
	let profile_username = token_to_username(token.clone(), &connection);

	// Makes database call to get all comments with review uuid
	let all_comments = handlers::all_review_comments(uuid, &connection);

	let mut disp_comments : Vec<DisplayComment> = vec![];

	// Prints out title/text/rating of each review in database
	if let Ok(comments) = all_comments {

		for mut c in comments {

			c.is_author = c.author_name.eq(&profile_username);
			println!("Author Name: {} Time: {} Text: {}", c.author_name, c.timestamp, c.text);
			disp_comments.push(c);
			
		}

	}

	Ok(Json(disp_comments))
}

/** 
 * Method that creates a comment
 * @param comment: JSON of the comment
 *
 * @return returns TBD
 */
#[post("/create_comment", data="<comment>", rank=1)]
fn create_comment(comment: Json<Comment>, connection: DbConn) -> Result<status::Accepted<String>, status::Conflict<String>> {
	println!("Timestamp: {}", &comment.timestamp);

	// Check for valid token
	if !auth::validate_token(comment.author_token.clone()) {
		return Err(status::Conflict(Some("Invalid User".to_string())));
	}

	// Attempt to insert kennel into database 
	let successful_creation = handlers::insert(comment.into_inner(), &connection);
	
	// Check if successful insertion into database
	match successful_creation {
		Ok(_id) => Ok(status::Accepted(None)),
		Err(e) => Err(status::Conflict(Some(e.to_string()))),
	}
	
}

/**
 * Mount the comment routes
 */
pub fn mount(rocket: rocket::Rocket) -> rocket::Rocket {
    rocket.mount("/", routes![create_comment, get_comments, like_comment, dislike_comment])  
}