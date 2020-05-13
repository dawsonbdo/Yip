pub mod handlers;

use crate::db;
use crate::auth;

use db::DbConn;
use uuid::Uuid;

use handlers::{Comment, DisplayComment};
use rocket_contrib::json::Json;

use rocket::response::status;

/**
 * Print out all comments of a review
 */
#[get("/get_comments/<review_uuid>", rank=1)]
fn get_comments(review_uuid: String, connection: DbConn) -> Result<Json<Vec<DisplayComment>>, status::NotFound<String>> {

	// Converts string to a uuid
	let uuid = Uuid::parse_str(&review_uuid).unwrap();

	// Makes database call to get all comments with review uuid
	let all_comments = handlers::all_review_comments(uuid, &connection);

	// Prints out title/text/rating of each review in database
	for v in &all_comments {
		for c in v.iter() {
			println!("Author Name: {} Time: {} Text: {}", c.author_name, c.timestamp, c.text);
		} 
	}

	Ok(Json(all_comments.unwrap()))
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
 * Mount the review routes
 */
pub fn mount(rocket: rocket::Rocket) -> rocket::Rocket {
    rocket.mount("/", routes![create_comment, get_comments])  
}