pub mod handlers;
pub mod reviewmultipart;

extern crate chrono;
extern crate json;
extern crate priority_queue;


use crate::auth;
use crate::db;
use crate::search;

use handlers::{Review, DisplayReview, DbReview};
use rocket_contrib::json::Json;

use db::DbConn;
use uuid::Uuid;

use rocket::response::status;

use std::io::prelude::*;
use std::fs::File;

use reviewmultipart::ReviewMultipart;

use serde_json::{Value, Map};

use super::users;

use std::collections::HashMap;

// Struct with review ID and user token for editing/deleting reviews
#[derive(Queryable, Serialize, Deserialize)]
struct ReviewToken {
    review_uuid: String,
    token: String,
}

/**
 * Helper method that updates is_author, is_liked, is_disliked given username, uuid, and reviews vector
 * @param profile_username: the username
 * @param uuid: the profiles uuid
 * @param reviews: the reviews that are being updated
 * @param connection: database connection
 *
 * @return returns vector of DisplayReviews with updated fields
 */
fn updateDisplayReviewFields(profile_username: &str, uuid: Uuid, reviews: Vec<DisplayReview>, connection: &DbConn) -> Vec<DisplayReview> {

	// Gets all user's like relationships
	let likes = handlers::get_user_likes(uuid, connection).unwrap();

	// Gets all user's dislike relationships
	let dislikes = handlers::get_user_dislikes(uuid, connection).unwrap();

	// Get all user's bookmark relationships
	let bookmarks = handlers::get_user_bookmarks(uuid, connection).unwrap();

	// Create hash map for the review likes and dislikes by user
	let mut review_likes_dislikes = HashMap::new();

	// Iterate through likes and dislikes
	for l in likes.iter() {
		review_likes_dislikes.insert(l.review, 1);
	}

	for d in dislikes.iter() {
		review_likes_dislikes.insert(d.review, -1);
	}

	// Create hash map for the bookmarked reviews
	let mut review_bookmarks = HashMap::new();

	// Iterate through bookmarks
	for b in bookmarks.iter() {
		review_bookmarks.insert(b.review, 1);
	}

	let mut reviews_updated : Vec<DisplayReview> = vec![];

	// Set isAuthor, isLiked, isDisliked fields
	for mut r in reviews {
		let ld_val = review_likes_dislikes.get(&r.review_uuid);
		let b_val = review_bookmarks.get(&r.review_uuid);

		r.is_author = profile_username.eq(&r.author); // set field of DisplayReview
		r.is_liked = match ld_val{
			Some(v) => *v == 1,
			None => false,
		};
		r.is_disliked = match ld_val{
			Some(v) => *v == -1,
			None => false,
		};
		r.is_bookmarked = match b_val{
			Some(v) => *v == 1,
			None => false,
		};

		/*match handlers::get_relationship_bookmark(r.review_uuid, uuid, connection){
				Ok(u) => u != 0,
				Err(_e) => false,
			};
		*/

		reviews_updated.push(r);
	}

	reviews_updated
}

/** 
 * Method that returns a Review from database given the ID
 * @param id: Uuid of review as a string
 * @param connection: database connection
 *
 * @return returns JSON of the review or error status
 */
fn get_review_helper(id: String, connection: &DbConn) -> Result<DisplayReview, status::NotFound<String>> {

	// Converts string to a uuid
	let uuid = Uuid::parse_str(&id).unwrap();

	// Get Review from database
	let review = handlers::get(uuid, connection);

	// Pattern match to see if review found successfully
	match review {
		Ok(r) => Ok(r),
		Err(e) => Err(status::NotFound(e.to_string())),
	}
}

/** 
 * Helper method that prints out all reviews
 * @param connection: database connection
 *
 * @return returns a vector with the review ids
 */
fn list_reviews_helper(connection: &DbConn) -> Json<Vec<String>> {

	// Makes database call to get all users
	let all_reviews = handlers::all(&connection)
        .map(|review| Json(review));
        
    // Creates vector to store review ids
    let mut review_ids = vec![];

	// Prints out title/text/id of each review in database
	for vec in all_reviews {
		for r in vec.iter() {
			println!("Title: {} Text: {} Id: {}", r.title, r.text, r.review_uuid);
			review_ids.push(r.review_uuid.hyphenated().to_string());
		} 
	}

	// Return vector with all the ids
	return Json(review_ids);
}

/**
 * Helper method that takes a review map and file paths and creates
 * a Review object from it
 * @param review_obj: map of field names and values received
 * @param paths: list of file paths to pictures
 *
 * @return returns a Review object
 */
fn review_creation_helper(review_obj: &Map<String, Value>, paths: Vec<String>) -> Review {

	// TODO: Figure out tags once implemented in frontend
	Review {
		kennel_uuid: review_obj.get("kennel_uuid").unwrap().to_string(),
		title: review_obj.get("title").unwrap().to_string(),
		author: review_obj.get("author").unwrap().to_string(),
		timestamp: review_obj.get("timestamp").unwrap().to_string(),
		text: review_obj.get("text").unwrap().to_string(),
		images: if paths.iter().len() == 0 {None} else {Some(paths)},
		rating: review_obj.get("rating").unwrap().as_i64().unwrap() as i32,
		tags: None,
	}
}

/** 
 * Helper method that likes or dislikes a review given parameter
 * @param input: JSON of a ReviewToken (review + token)
 * @param like: bool indicating like or dislike
 * @param connection: database connection
 *
 * @return returns a result with status Accepted or BadRequest
 */
fn like_dislike_helper(input: Json<ReviewToken>, like: bool, connection: DbConn) -> Result<status::Accepted<String>, status::BadRequest<String>> {

	// Converts token into uuid
	let profile_uuid = auth::get_uuid_from_token(&input.token);

	// Makes sure uuid was found 
	if profile_uuid.is_nil(){
		return Err(status::BadRequest(Some("Uuid not found".to_string())));
	}

    // Converts review uuid string into uuid
    let review_uuid = Uuid::parse_str(&input.review_uuid);

    let result;

    // Makes sure valid review
    match review_uuid {
    	Ok(uuid) => if like {result = handlers::like(uuid, profile_uuid, &connection);}
    			 else {result = handlers::dislike(uuid, profile_uuid, &connection);},
    	// Not a valid comment uuid string
    	Err(e) => return Err(status::BadRequest(Some("Review not foudn".to_string()))),
    }
    
    
    // TODO: Update net rating differently so liking/disliking is faster

    // Update review net rating
    if let Err(e) = handlers::update_review_rating(review_uuid.unwrap(), &connection) {
        dbg!(e);
    }
    
    // Return result
    result
}

/** 
 * Helper method that likes or dislikes a review given parameter
 * @param input: JSON of a ReviewToken (review + token)
 * @param bookmark: bool indicating bookmark or unbookmark
 * @param connection: database connection
 *
 * @return returns a result with status Accepted or BadRequest
 */
fn bookmark_helper(input: Json<ReviewToken>, bookmark: bool, connection: DbConn) -> Result<bool, String> {

	// Get profile uuid from token
	let profile_uuid = auth::get_uuid_from_token(&input.token);

	// Make sure not nil
	if profile_uuid.is_nil(){
		return Err("profile does not exist".to_string());
	}

	// Get review id from json
	let review_uuid = Uuid::parse_str(&input.review_uuid);

	match review_uuid {
		Ok(r) => {

			if bookmark {

				// Attempt to bookmark the review
			    match handlers::bookmark(r, profile_uuid, &connection){
			        Ok(u) => if u == 0 {Err("already bookmarked".to_string())} else {Ok(true)},
			        Err(e) => Err(e.to_string()),
			    }
			} else {

				// Attempt to unbookmark the review
			    match handlers::unbookmark(r, profile_uuid, &connection){
			        Ok(u) => if u == 0 {Err("already bookmarked".to_string())} else {Ok(true)},
			        Err(e) => Err(e.to_string()),
			    }
			}
			
		},
		Err(e) => Err(e.to_string()),
	}
	
}

/** 
 * Handler method that unbookmarks a review
 * @param kennel: JSON of a ReviewToken (review + token)
 * @param connection: database connection
 *
 * @return returns a result with status Accepted or BadRequest
 */
#[post("/unbookmark_review", data="<input>", rank=1)]
fn unbookmark_review(input: Json<ReviewToken>, connection: DbConn) -> Result<status::Accepted<String>, status::BadRequest<String>> {
    
	// Call helper with false to indicate unbookmarking
	match bookmark_helper(input, false, connection){
		Ok(_b) => Ok(status::Accepted(None)),
		Err(e) => Err(status::BadRequest(Some(e.to_string()))),
	}
}

/** 
 * Handler method that bookmarks a review
 * @param kennel: JSON of a ReviewToken (review + token)
 * @param connection: database connection
 *
 * @return returns a result with status Accepted or BadRequest
 */
#[post("/bookmark_review", data="<input>", rank=1)]
fn bookmark_review(input: Json<ReviewToken>, connection: DbConn) -> Result<status::Accepted<String>, status::BadRequest<String>> {
    
    // Call helper with true to indicate bookmarking
	match bookmark_helper(input, true, connection){
		Ok(_b) => Ok(status::Accepted(None)),
		Err(e) => Err(status::BadRequest(Some(e.to_string()))),
	}
}

/** 
 * Handler method that searches all reviews in db given a query
 * @param query: query string that is searched for
 * @param connection: database connection
 *
 * @return returns a result with list of reviews found
 */
#[get("/search_reviews/<query>", rank=1)]
fn search_reviews(query: String, connection: DbConn) -> Result<Json<Vec<DisplayReview>>, status::NotFound<String>> {

    match search::search_reviews(query, &connection){
    	Ok(r) => if r.iter().len() == 0 {Err(status::NotFound("No reviews found".to_string()))} else {Ok(Json(r))},
    	Err(e) => Err(status::NotFound(e.to_string())),
    }
}

/** 
 * Handler method that dislikes a review
 * @param kennel: JSON of a ReviewToken (review + token)
 * @param connection: database connection
 *
 * @return returns a result with status Accepted or BadRequest
 */
#[post("/dislike_review", data="<input>", rank=1)]
fn dislike_review(input: Json<ReviewToken>, connection: DbConn) -> Result<status::Accepted<String>, status::BadRequest<String>> {
    
    // Call helper with false for dislike
    like_dislike_helper(input, false, connection)
}

/** 
 * Handler method that likes a review
 * @param kennel: JSON of a ReviewToken (review + token)
 * @param connection: database connection
 *
 * @return returns a result with status Accepted or BadRequest
 */
#[post("/like_review", data="<input>", rank=1)]
fn like_review(input: Json<ReviewToken>, connection: DbConn) -> Result<status::Accepted<String>, status::BadRequest<String>> {
    
    // Call helper with true for like
    like_dislike_helper(input, true, connection)
}

/** 
 * Method that returns vector of kennel reviews
 * @param kennel_name: the name of the kennel that is queried
 * @param token: the token of user logged in
 * @param connection: database connection
 *
 * @return returns JSON of the review or error status
 */
#[get("/get_kennel_reviews/<kennel_name>/<token>")]
fn get_kennel_reviews(kennel_name: String, token: String, connection: DbConn) -> Result<Json<Vec<DisplayReview>>, status::NotFound<String>> {

	// Converts kennel name to kennel id
	let kennel_uuid = super::kennels::handlers::get_kennel_uuid_from_name(kennel_name, &connection);

	// Check for nil id (meaning kennel name does not exist)
	if kennel_uuid.is_nil() {
		return Err(status::NotFound("Kennel not found".to_string()));
	}

	// Makes database call to get all reviews with kennel uuid
	let all_reviews = handlers::all_kennel_reviews(kennel_uuid, &connection);

	// Get tokens uuid
	let uuid = auth::get_uuid_from_token(&token);

	// Get tokens username
	let profile_username = auth::get_user_from_token(&token);

	// Return reviews after setting is_author, is_liked, is_disliked
	match all_reviews{
		Ok(revs) => {
			let mut pq = priority_queue::PriorityQueue::new();
			
			// Sort reviews by hotness using pq (greatest NaiveDateTime value)
			for r in revs {
			    //let timestamp = r.timestamp;
			    let hotness = r.hotness;
			    pq.push(r, hotness);
			}  

			// Create a vector with all of the reviews to as ordered
			let mut reviewsOrdered : Vec<DisplayReview> = vec![];

			// Order by newness for now 
			for (review, _) in pq.into_sorted_iter() {

				reviewsOrdered.push(review);
			}

			Ok(Json(updateDisplayReviewFields(&profile_username, uuid, reviewsOrdered, &connection)))
		},
		Err(e) => Err(status::NotFound(e.to_string())),
	}



	/*
	// Prints out title/text/rating of each review in database
	for v in &all_reviews {
		for r in v.iter() {
			println!("Author Name: {} Title: {} Time: {}", r.author, r.title, r.timestamp.to_string());
		} 
	}
	*/

	
}

/** 
 * Method that returns a list of Reviews that a user posted
 * @param username: username of user
 * @param connection: database connection
 *
 * @return returns JSON of the review or error status
 */
#[get("/get_user_reviews/<username>/<token>")]
fn get_user_reviews(username: String, token: String, connection: DbConn) -> Result<Json<Vec<DisplayReview>>, status::NotFound<String>> {

	// Get uuid from username passed in
	let uuid = users::handlers::get_uuid_from_username(&username, &connection);

	// Check for nil id (meaning kennel name does not exist)
	if uuid.is_nil() {
		return Err(status::NotFound("Kennel not found".to_string()));
	}

	// Makes database call to get all reviews with kennel uuid
	let all_reviews = handlers::all_user_reviews(uuid, &connection);

	/*
	// Prints out title/text/rating of each review in database
	for v in &all_reviews {
		for r in v.iter() {
			println!("Author Name: {} Title: {} Time: {}", r.author, r.title, r.timestamp.to_string());
		} 
	}
	*/

	// Get tokens uuid
	let token_uuid = auth::get_uuid_from_token(&token);

	// Get tokens username
	let profile_username = auth::get_user_from_token(&token);

	let mut pq = priority_queue::PriorityQueue::new();

	// Sort reviews by newness using pq (greatest NaiveDateTime value)
	for r in all_reviews.unwrap() {
	    //let timestamp = r.timestamp;
	    let hotness = r.hotness;
	    pq.push(r, hotness);
	}  

	// Create a vector with all of the reviews to as ordered
	let mut reviewsOrdered : Vec<DisplayReview> = vec![];

	// Order by newness for now 
	for (review, _) in pq.into_sorted_iter() {

		reviewsOrdered.push(review);
	}

	// Updates display review fields using token passed in
	Ok(Json(updateDisplayReviewFields(&profile_username, token_uuid, reviewsOrdered, &connection)))
}

/** 
 * Method that returns a Review from database given the ID
 * @param id: Uuid of review as a string
 * @param token: jwt
 * @param connection: database connection
 *
 * @return returns JSON of the review or error status
 */
#[get("/get_review/<id>/<token>")]
fn get_review(id: String, token: String, connection: DbConn) -> Result<Json<DisplayReview>, status::NotFound<String>> {

	// Get uuid from token passed in
	let profile_uuid = auth::get_uuid_from_token(&token);

	// Parse review uuid
	let review_uuid = Uuid::parse_str(&id).unwrap();

	// Get username from token
	let profile_username = auth::get_user_from_token(&token);

	// Pattern match to see if review found successfully, update fields and return
	match get_review_helper(id, &connection) {
		Ok(mut r) => {
			//println!("AUTHOR: {} PROFILE: {}", &r.author, &profile_username);
			
			r.is_author = profile_username.eq(&r.author); // set field of DisplayReview
			r.is_liked = match handlers::get_relationship_like(review_uuid, profile_uuid, &connection){
				Ok(u) => u != 0,
				Err(_e) => false,
			};
			r.is_disliked = match handlers::get_relationship_dislike(review_uuid, profile_uuid, &connection){
				Ok(u) => u != 0,
				Err(_e) => false,
			};
			r.is_bookmarked = match handlers::get_relationship_bookmark(review_uuid, profile_uuid, &connection){
				Ok(u) => u != 0,
				Err(_e) => false,
			};
			
			Ok(Json(r))
		},
		Err(e) => Err(e),
	}
}

/** 
 * Method that removes a review from database if token matches author of review
 * @param review: Json with uuid and token
 * @param connection: database connection
 * 
 * @return returns accepted status if removed, other unauthorized
 */
#[post("/remove_review", data="<review>")]
fn remove_review(review: Json<ReviewToken>, connection: DbConn) -> Result<status::Accepted<String>, status::Unauthorized<String>> {

	// Get tokens username
	let profile_username = auth::get_user_from_token(&review.token);

	// Get tokens uuid
	let profile_uuid = auth::get_uuid_from_token(&review.token);

	// Converts string to a uuid
	let uuid = Uuid::parse_str(&review.review_uuid).unwrap();

	// Get Review from database
	let review = handlers::get(uuid, &connection);

	// Pattern match to see if review found successfully
	match review {
		Ok(r) => {
			// Get mod id of kennel of review
			let mod_uuid = super::kennels::handlers::
						   get_kennel_mod_uuid_from_name(r.kennel_name, &connection);

			//println!("Mod Uuid: {}", mod_uuid);
			//println!("Token Uuid: {}", uuid);

			// If token matches author of review, or moderator of kennel, attempt to delete
			if profile_username.eq(&r.author) || profile_uuid.eq(&mod_uuid) { 
				match handlers::delete(uuid, &connection){
					Ok(_u) => Ok(status::Accepted(None)),
					Err(e) => Err(status::Unauthorized(Some(e.to_string()))),
				}
			} else {
				Err(status::Unauthorized(Some("User is not the author or mod".to_string())))
			}
		},
		// Review not found in database
		Err(e) => Err(status::Unauthorized(Some(e.to_string()))),
	}
}

/** 
 * TODO: Not finished, look into handlers::DbReview::from_review()
 * @param review: Json with Review
 * @param connection: database connection
 *
 * @return returns TBD
 */
#[post("/edit_review", data="<review>")]
fn edit_review(review: Json<ReviewToken>, connection: DbConn) -> Result<status::Accepted<String>, status::Unauthorized<String>> {
	
	// Get tokens username
	let profile_username = auth::get_user_from_token(&review.token);

	// Converts string to a uuid
	let uuid = Uuid::parse_str(&review.review_uuid).unwrap();

	// Get Review from database
	let review = handlers::get(uuid, &connection);

	// Pattern match to see if review found successfully
	match review {
		Ok(r) => {
			// If token matches author of review, TODO: attempt to update
			if profile_username.eq(&r.author) { 
				// TODO: Attempt to update
				Ok(status::Accepted(None))
			} else {
				Err(status::Unauthorized(Some("User is not the author".to_string())))
			}
		},
		// Review not found in database
		Err(e) => Err(status::Unauthorized(Some(e.to_string()))),
	}
}

/** 
 * Method that creates a review
 * @param data: multipart data with the review contents/files uploaded
 * @param connection: database connection
 *
 * @return returns review uuid if successfuly created, otherwise conflict status
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
		
		// Catch error
		match buffer.write(&img){
			Ok(w) => w,
			Err(e) => return Err(status::Conflict(Some(e.to_string()))),
		};

		// Add path to vector
		paths.push(format!("reviewpics/{}", &data.names[i]));
	}

	// Create review object in correct format
	let review = review_creation_helper(review_obj, paths);
	
	// Check that user is not banned from kennel
	let user_uuid = auth::get_uuid_from_token(&review.author[1..(review.author.len()-1)]);
	let kennel_id = match Uuid::parse_str(&review.kennel_uuid[1..37]) {
		Ok(id) => id,
		Err(e) => return Err(status::Conflict(Some(e.to_string()))),
	};

	match super::kennels::handlers::get_relationship_ban(kennel_id, user_uuid, &connection){
		Ok(rel) => if rel == 1 {return Err(status::Conflict(Some("User is banned from kennel".to_string())));} else {()},
		Err(e) => return Err(status::Conflict(Some(e.to_string()))),
	}

	// Attempt to insert review into database
	match handlers::insert(review, &connection){
		Ok(r) => Ok(r.review_uuid.hyphenated().to_string()),
		Err(e) => Err(status::Conflict(Some(e.to_string()))),
	}

}


/** 
 * Method that prints out all reviews
 * @param connection: database connection
 *
 * @return returns a vector with the review ids
 */
#[get("/reviews", rank=1)]
fn list_reviews(connection: DbConn) -> Json<Vec<String>> {

	// Calls helper function to get a list of all reviews
	list_reviews_helper(&connection)
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

	let mut pq = priority_queue::PriorityQueue::new();

	// Check if user is logged in by checking token passed in
	if auth::validate_token(token.clone()) {

		// TODO: Generate user specific reviews based on followed kennels

		// Pattern match to make sure successful, convert to DisplayReviews if so
	    match handlers::all(&connection) {
	        Ok(r) => reviews = (r.iter()
	                     .map(|review| handlers::to_review(review))
	                     .collect()),
	        Err(e) => (),
	    };

	    // Sort reviews by hotness using pq 
	    for r in reviews {
	    	//let timestamp = r.timestamp;
		    let hotness = r.hotness;
		    pq.push(r, hotness);
	    }  


	} else {

		// TODO: Generate generic most recent popular reviews 

		match handlers::all(&connection) {
	        Ok(r) => reviews = (r.iter()
	                     .map(|review| handlers::to_review(review))
	                     .collect()),
	        Err(e) => (),
	    };

	    // Sort reviews by newness using pq 
	    for r in reviews {
	    	//let timestamp = r.timestamp;
	    	let hotness = r.hotness;
	    	pq.push(r, hotness);
	    }  

	}

	// Create a vector with all of the reviews to as ordered
	let mut reviewsOrdered : Vec<DisplayReview> = vec![];

	// Order by newness for now 
	for (review, _) in pq.into_sorted_iter() {

		reviewsOrdered.push(review);
	}

	// Return a Result depending on if reviews were found
	if reviewsOrdered.iter().len() == 0 {
		Err(status::NotFound("No Reviews".to_string()))
	} else {

		// Get tokens uuid
		let uuid = auth::get_uuid_from_token(&token);

		// Look for the username of the uuid in database
		let profile_username = match super::users::handlers::get_user_from_uuid(uuid, &connection){
			Ok(u) => u.username,
			Err(_e) => "".to_string(),
		};
		
		// Set is_author, is_liked, is_disliked fields
		Ok(Json(updateDisplayReviewFields(&profile_username, uuid, reviewsOrdered, &connection)))
	}
}

/**
 * Mount the review routes
 */
pub fn mount(rocket: rocket::Rocket) -> rocket::Rocket {
    rocket.mount("/", routes![load_reviews, list_reviews, create_review, edit_review, remove_review, get_review, get_kennel_reviews, like_review, dislike_review, bookmark_review, unbookmark_review, get_user_reviews, search_reviews])  
}
