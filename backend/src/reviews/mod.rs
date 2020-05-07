pub mod handlers;

extern crate chrono;

use crate::auth;
use crate::db;

use handlers::Review;
use rocket_contrib::json::Json;

use db::DbConn;

/**
 * Print out all reviews
 */
#[get("/reviews", rank=1)]
fn list_reviews(connection: DbConn) -> () {

	// Makes database call to get all users
	let all_reviews = handlers::all(&connection)
        .map(|review| Json(review));
        
	// Prints out user/email/pw of each user in database
	for vec in all_reviews {
		for r in vec.iter() {
			println!("Title: {} Text: {} Rating: {}", r.title, r.review_text, r.rating);
		} 
	}

}

/** 
 * Method that loads all of the reviews, given a jwt
 * @param token: the jwt of user, "0" if not logged in
 *
 * @return returns true or false indicating if password changed sucessfuly
 */
#[post("/load_reviews", data="<token>", rank=1)]
fn load_reviews(token: String, connection: DbConn) -> () {
	
	// Check if user is logged in by checking token passed in
	if auth::validate_token(token) {

		// Generate user specific reviews based on followed kennels

	} else {

		// Generate generic reviews

	}
}

/**
 * Mount the review routes
 */
pub fn mount(rocket: rocket::Rocket) -> rocket::Rocket {
    rocket.mount("/", routes![load_reviews, list_reviews])  
}