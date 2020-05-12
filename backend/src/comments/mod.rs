pub mod handlers;

use crate::db;
use crate::auth;

use db::DbConn;
use uuid::Uuid;

use handlers::Comment;
use rocket_contrib::json::Json;

use rocket::response::status;

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
    rocket.mount("/", routes![create_comment])  
}