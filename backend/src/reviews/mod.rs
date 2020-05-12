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
	//let vec = vec![];

	let r = Review {
		kennel_uuid: review_obj.get("kennel_uuid").unwrap().to_string(),
		title: review_obj.get("title").unwrap().to_string(),
		author: review_obj.get("author").unwrap().to_string(),
		timestamp: review_obj.get("timestamp").unwrap().to_string(),
		text: review_obj.get("text").unwrap().to_string(),
		images: if paths.iter().len() == 0 {None} else {Some(paths)},
		rating: review_obj.get("rating").unwrap().as_i64().unwrap() as i32,
		tags: None,
	};

	return r;
}

/**
 * Method that returns username corresponding to token, "" if none
 */
fn token_to_username(token: String, connection: &DbConn) -> String {
	// Get username from token passed in
	let profile_uuid = auth::get_uuid_from_token(&token);
	match super::users::handlers::get_user_from_uuid(profile_uuid, connection){
		Ok(u) => u.username,
		Err(_e) => "".to_string(),
	}
}

/** 
 * Method that returns a review from database given the ID
 * @param id: Uuid of review as a string
 *
 * @return returns JSON of the review or error status
 */
#[get("/get_review/<id>/<token>")]
fn get_review(id: String, token: String, connection: DbConn) -> Result<Json<DisplayReview>, status::NotFound<String>> {

	// Converts review id to a uuid
	let review_uuid = Uuid::parse_str(&id).unwrap();

	// Get Review from database
	let review = handlers::get(review_uuid, &connection);

	// Get username from token passed in
	let profile_username = token_to_username(token, &connection);

	// Pattern match to see if review found successfully
	match review {
		Ok(mut r) => {
			r.isAuthor = profile_username.eq(&r.author); // set field of DisplayReview
			Ok(Json(r))
		},
		Err(e) => Err(status::NotFound("".to_string())),
	}

	
}

// Struct with review ID and user jwt for editing/deleting kennels
#[derive(Queryable, Serialize, Deserialize)]
struct ReviewToken {
    review_uuid: String,
    token: String,
}

/** 
 * Method that removes a review from database if token matches author of review
 * @param review: Json with uuid and token
 *
 * @return returns TBD
 */
#[post("/remove_review", data="<review>")]
fn remove_review(review: Json<ReviewToken>, connection: DbConn) -> Result<status::Accepted<String>, status::Unauthorized<String>> {

	// Get tokens username
	let profile_username = token_to_username(review.token.clone(), &connection);

	// Converts string to a uuid
	let uuid = Uuid::parse_str(&review.review_uuid).unwrap();

	// Get Review from database
	let review = handlers::get(uuid, &connection);

	// Pattern match to see if review found successfully
	match review {
		Ok(r) => {
			// If token matches author of review, attempt to delete
			if profile_username.eq(&r.author) { 
				match handlers::delete(uuid, &connection){
					Ok(_u) => Ok(status::Accepted(None)),
					Err(e) => Err(status::Unauthorized(Some(e.to_string()))),
				}
			} else {
				Err(status::Unauthorized(Some("User is not the author".to_string())))
			}
		},
		// Review not found in database
		Err(e) => Err(status::Unauthorized(Some(e.to_string()))),
	}
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
		Ok(r) => Ok(r.review_uuid.hyphenated().to_string()),
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
			println!("Title: {} Text: {} Id: {}", r.title, r.text, r.review_uuid);
			reviewIds = format!("{},{}", reviewIds, &r.review_uuid.hyphenated().to_string());
		} 
	}

	// Return vector with all the ids
	reviewIds
}


/** 
 * Method that returns a review from database given the ID
 * @param id: Uuid of review as a string
 *
 * @return returns JSON of the review or error status
 */
fn review_helper(id: String, connection: &DbConn) -> Result<DisplayReview, status::NotFound<String>> {

	// Converts string to a uuid
	let uuid = Uuid::parse_str(&id).unwrap();

	// Get Review from database
	let review = handlers::get(uuid, connection);

	// Pattern match to see if review found successfully
	match review {
		Ok(r) => Ok(r),
		Err(e) => Err(status::NotFound("".to_string())),
	}
	
}

/**
 * Print out all reviews
 */
fn list_helper(connection: &DbConn) -> String {

	// Makes database call to get all users
	let all_reviews = handlers::all(connection)
        .map(|review| Json(review));
        

    let mut reviewIds = "".to_string();

	// Prints out title/text/id of each review in database
	for vec in all_reviews {
		for r in vec.iter() {
			println!("Title: {} Text: {} Id: {}", r.title, r.text, r.review_uuid);
			reviewIds = format!("{},{}", reviewIds, &r.review_uuid.hyphenated().to_string());
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
fn load_reviews(token: String, connection: DbConn) -> Result<Json<Vec<DisplayReview>>, status::NotFound<String>> {
	
	// Create a vector with all of the reviews to display
	let mut reviews : Vec<DisplayReview> = vec![];

	// Check if user is logged in by checking token passed in
	if auth::validate_token(token) {

		// TODO: Generate user specific reviews based on followed kennels

	} else {

		// Generate generic reviews from database

		// Get all of the IDS
		let r = list_helper(&connection);
		let reviewIds : Vec<&str> = r.split(",").collect();

		// Iterate through review IDs (starting idx = 1) and add all reviews to vector
		for i in 1..(reviewIds.iter().len()) {
			reviews.push(review_helper(reviewIds[i].to_string(), &connection).unwrap());
		}
	}

	// Return a Result depending on if reviews were found
	if ( reviews.iter().len() == 0 ){
		Err(status::NotFound("No Reviews".to_string()))
	} else {
		Ok(Json(reviews))
	}
}

/**
 * Mount the review routes
 */
pub fn mount(rocket: rocket::Rocket) -> rocket::Rocket {
    rocket.mount("/", routes![load_reviews, list_reviews, create_review, edit_review, remove_review, get_review])  
}