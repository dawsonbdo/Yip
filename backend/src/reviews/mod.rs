pub mod handlers;

extern crate chrono;

use crate::auth;
use crate::db;

use handlers::{Review, DbReview};
use rocket_contrib::json::Json;

use db::DbConn;
use uuid::Uuid;

use rocket::response::status;


/** 
 * Method that returns a review from database given the ID
 * @param id: Uuid of review as a string
 *
 * @return returns JSON of the review or error status
 */
#[post("/get_review/<id>")]
fn get_review(id: String, connection: DbConn) -> Result<Json<DbReview>, status::NotFound<String>> {

	// Converts string to a uuid
	let uuid = Uuid::parse_str(&id).unwrap();

	// Get Review from database
	let review = handlers::get(uuid, &connection);

	// Pattern match to see if review found successfully
	match review {
		Ok(r) => Ok(Json(r)),
		Err(e) => Err(status::NotFound("".to_string())),
	}
	
}

/** 
 * Method that removes a review from database
 * @param review: Json format of review
 *
 * @return returns TBD
 */
#[post("/remove_review", data="<review>")]
fn remove_review(review: Json<Review>, connection: DbConn) -> () {
	
	
}

/** 
 * Method that updates a review
 * @param review: Json format of review
 *
 * @return returns TBD
 */
#[post("/edit_review", data="<review>")]
fn edit_review(review: Json<Review>, connection: DbConn) -> () {
	
	
}

/** 
 * Method that creates a review
 * @param review: Json format of review
 *
 * @return returns TBD
 */
#[post("/create_review", data="<review>")]
fn create_review(review: Json<Review>, connection: DbConn) -> () {
	
	
}

/**
 * Print out all reviews
 */
#[get("/reviews", rank=1)]
fn list_reviews(connection: DbConn) -> () {

	// Makes database call to get all users
	let all_reviews = handlers::all(&connection)
        .map(|review| Json(review));
        
	// Prints out title/text/rating of each review in database
	for vec in all_reviews {
		for r in vec.iter() {
			println!("Title: {} Text: {} Rating: {}", r.title, r.review_text, r.rating);
		} 
	}

}

/** 
 * Method that loads all of the reviews on home page, given a jwt
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
    rocket.mount("/", routes![load_reviews, list_reviews, create_review, edit_review, remove_review, get_review])  
}