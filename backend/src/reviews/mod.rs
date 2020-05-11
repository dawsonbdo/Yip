pub mod handlers;
pub mod reviewmultipart;

extern crate chrono;
extern crate json;

use crate::auth;
use crate::db;

use handlers::{Review, DbReview, DisplayReview};
use rocket_contrib::json::{Json, JsonValue};

use db::DbConn;
use uuid::Uuid;

use rocket::response::status;

use std::io::prelude::*;
use std::fs::File;

use reviewmultipart::ReviewMultipart;

use serde_json::{Value, Map};

fn review_creation_helper(review_obj: &Map<String, Value>, paths: Vec<String>) -> Review {
	let r = Review {
		kennelid: review_obj.get("kennelid").unwrap().to_string(),
		title: review_obj.get("title").unwrap().to_string(),
		author: review_obj.get("author").unwrap().to_string(),
		date_posted: review_obj.get("date_posted").unwrap().to_string(),
		review_text: review_obj.get("review_text").unwrap().to_string(),
		images: paths,
		rating: review_obj.get("rating").unwrap().as_i64().unwrap() as i32,
		tags: json!(null),
	};

	return r;
}

/** 
 * Method that returns a review from database given the ID
 * @param id: Uuid of review as a string
 *
 * @return returns JSON of the review or error status
 */
#[get("/get_review/<id>")]
fn get_review(id: String, connection: DbConn) -> Result<Json<DisplayReview>, status::NotFound<String>> {

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
#[post("/create_review", data="<data>")]
fn create_review(data: ReviewMultipart, connection: DbConn) -> Result<String, status::Conflict<String>> { 

	// Create object from stringified version passed in
	let review_value : Value = serde_json::from_str(&data.review).unwrap();
	let review_obj = review_value.as_object().unwrap();

	// Create vector of file paths
	let mut paths = vec![];

	// Iterate through files passed in, store on server in static/reviewpics/<filename>
	for (i, img) in data.images.iter().enumerate() {

		// Create file path using filename, create file with it, write the image
		let file_path = format!("static/reviewpics/{}", &data.names[i]);
		let mut buffer = File::create(file_path.clone()).unwrap();
		buffer.write(&img);

		// Add path to vector
		paths.push(format!("reviewpics/{}", &data.names[i]));
	}

	// Create review object in correct format
	let review = review_creation_helper(review_obj, paths);
	
	// Attempt to insert review into database
	match handlers::insert(review, &connection){
		Ok(r) => Ok(r.id.hyphenated().to_string()),
		Err(e) => Err(status::Conflict(Some(e.to_string()))),
	}

}


/**
 * Print out all reviews
 */
#[get("/reviews", rank=1)]
fn list_reviews(connection: DbConn) -> String {

	// Makes database call to get all users
	let all_reviews = handlers::all(&connection)
        .map(|review| Json(review));
        

    let mut reviewIds = "".to_string();

	// Prints out title/text/id of each review in database
	for vec in all_reviews {
		for r in vec.iter() {
			println!("Title: {} Text: {} Id: {}", r.title, r.review_text, r.id);
			reviewIds = format!("{},{}", reviewIds, &r.id.hyphenated().to_string());
		} 
	}

	// Return vector with all the ids
	reviewIds
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