pub mod handlers;

extern crate priority_queue;

use crate::db;
use crate::auth;

use db::DbConn;
use uuid::Uuid;

use handlers::{InputComment, DisplayComment};
use rocket_contrib::json::Json;

use rocket::response::status;

use std::collections::HashMap;

// Struct with comment id and user jwt for liking/dislking comments
#[derive(Queryable, Serialize, Deserialize)]
struct CommentUser {
    comment_uuid: String,
    token: String,
}


/**
 * Helper method that updates is_author, is_liked, is_disliked given username, uuid, and comments vector
 * @param profile_username: the username
 * @param uuid: the profiles uuid
 * @param comments: the comments that are being updated
 * @param connection: database connection
 *
 * @return returns vector of DisplayComments with updated fields
 */
fn update_display_comment_fields(profile_username: &str, uuid: Uuid, comments: Vec<DisplayComment>, connection: &DbConn) -> Vec<DisplayComment> {

	// Gets all user's like relationships
	let likes = handlers::get_user_likes(uuid, connection).unwrap();

	// Gets all user's dislike relationships
	let dislikes = handlers::get_user_dislikes(uuid, connection).unwrap();

	// Get all comment reports
	let reports = super::reports::handlers::all_user_comment_reports(profile_username, connection).unwrap();

	// Create hash map for the review likes and dislikes by user
	let mut comment_likes_dislikes = HashMap::new();

	// Iterate through likes and dislikes
	for l in likes.iter() {
		comment_likes_dislikes.insert(l.liker, 1);
	}

	for d in dislikes.iter() {
		comment_likes_dislikes.insert(d.disliker, -1);
	}

	// Create hash map for the reported reviews
	let mut comment_reports = HashMap::new();

	// Iterate through reported reviews
	for r in reports.iter() {
		comment_reports.insert(r.comment_id.unwrap(), 1);
	}


	let mut comments_updated : Vec<DisplayComment> = vec![];

	// Set isAuthor, isLiked, isDisliked fields
	for mut c in comments {
		let val = comment_likes_dislikes.get(&c.comment_uuid);
		let r_val = comment_reports.get(&c.comment_uuid);

		c.is_author = profile_username.eq(&c.author_name); // set field of DisplayComment
		c.is_liked = match val{
			Some(v) => *v == 1,
			None => false,
		};
		c.is_disliked = match val{
			Some(v) => *v == -1,
			None => false,
		};
		c.is_reported = match r_val{
			Some(v) => *v == 1,
			None => false,
		};

		comments_updated.push(c);
	}

	comments_updated
}

/** 
 * Helper method that likes or dislikes a comment given parameter
 * @param input: JSON of a CommentUser (comment + token)
 * @param like: bool indicating like or dislike
 * @param connection: database connection
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
    	Err(_e) => return Err(status::BadRequest(Some("Comment not found".to_string()))),
    }
    
    
    // TODO: Update net rating differently so liking/disliking is faster

    // Update comment net rating
    if let Err(e) = handlers::update_comment_rating(comment_uuid.unwrap(), &connection) {
        dbg!(e);
    }

    // Return result
    result
}

/** 
 * Handler method that unlikes a comment
 * @param input: JSON of a CommentUser (comment + token)
 * @param connection: database connection
 *
 * @return returns a result with status Accepted or BadRequest
 */
#[post("/dislike_comment", data="<input>", rank=1)]
fn dislike_comment(input: Json<CommentUser>, connection: DbConn) -> Result<status::Accepted<String>, status::BadRequest<String>> {
    
    // Call helper with false for unfollow
    like_dislike_helper(input, false, connection)
}

/** 
 * Handler method that likes a comment
 * @param input: JSON of a CommentUser (comment + token)
 * @param connection: database connection
 *
 * @return returns a result with status Accepted or BadRequest
 */
#[post("/like_comment", data="<input>", rank=1)]
fn like_comment(input: Json<CommentUser>, connection: DbConn) -> Result<status::Accepted<String>, status::BadRequest<String>> {
    
    // Call helper with true for follow
    like_dislike_helper(input, true, connection)
}

/** 
 * Method that removes a comment from database if token matches author of comment
 * @param review: Json with uuid and token
 * @param connection: database connection
 * 
 * @return returns accepted status if removed, other unauthorized
 */
#[post("/remove_comment/<kennel_name>", data="<input>")]
fn remove_comment(input: Json<CommentUser>, kennel_name: String, connection: DbConn) -> Result<status::Accepted<String>, status::Unauthorized<String>> {

	// Get tokens username
	let profile_username = auth::get_user_from_token(&input.token);

	// Get tokens uuid
	let profile_uuid = auth::get_uuid_from_token(&input.token);

	// Converts string to a uuid
	let uuid = Uuid::parse_str(&input.comment_uuid).unwrap();

	// Get comment from database
	let comment = handlers::get(uuid, &connection);

	// Pattern match to see if comment found successfully
	match comment {
		Ok(c) => {
			// Get kennel name
			//let rev = super::reviews::handlers::get(c.review_uuid, &connection).unwrap();

			// Get mod id of kennel of comment
			let mod_uuid = super::kennels::handlers::
						   get_kennel_mod_uuid_from_name(kennel_name, &connection);

			//println!("Mod Uuid: {}", mod_uuid);
			//println!("Token Uuid: {}", uuid);

			// If token matches author of review, or moderator of kennel, attempt to delete
			if profile_username.eq(&c.author_name) || profile_uuid.eq(&mod_uuid) { 
				match handlers::delete(uuid, &connection){
					Ok(_u) => Ok(status::Accepted(None)),
					Err(e) => Err(status::Unauthorized(Some(e.to_string()))),
				}
			} else {
				Err(status::Unauthorized(Some("User is not the author of comment or mod".to_string())))
			}
		},
		// Review not found in database
		Err(e) => Err(status::Unauthorized(Some(e.to_string()))),
	}
}


/**
 * Print out all comments of a review
 */
#[get("/get_comments/<review_uuid>/<token>", rank=1)]
fn get_comments(review_uuid: String, token: String, connection: DbConn) -> Result<Json<Vec<DisplayComment>>, status::NotFound<String>> {

	// Converts string to a uuid
	let uuid = Uuid::parse_str(&review_uuid).unwrap();

	// Get username from token passed in
	let profile_username = auth::get_user_from_token(&token);

	// Makes database call to get all comments with review uuid
	let all_comments = handlers::all_review_comments(uuid, &connection);

	//return Ok(Json(all_comments.unwrap()));

	let mut pq = priority_queue::PriorityQueue::new();
			
	// Sort reviews by newness using pq (greatest NaiveDateTime value)
	match all_comments {
		Ok(comments) =>{
			for c in comments {
				let timestamp = c.timestamp.clone();
				pq.push(c, timestamp);
			}  

			// Create a vector with all of the reviews to as ordered
			let mut comments_ordered : Vec<DisplayComment> = vec![];

			// Order by newness for now 
			for (comment, _) in pq.into_sorted_iter() {

				comments_ordered.push(comment);
			}

			Ok(Json(update_display_comment_fields(&profile_username, uuid, comments_ordered, &connection)))
		},
		Err(e) => Err(status::NotFound(e.to_string())),
	}

}

/**
 * Method that returns a single comment given it ID
 */
#[get("/get_comment/<comment_uuid>/<token>", rank=1)]
fn get_comment(comment_uuid: String, token: String, connection: DbConn) -> Result<Json<DisplayComment>, status::NotFound<String>> {

	// Get name from token
	let profile_name = auth::get_user_from_token(&token);
	let uuid = auth::get_uuid_from_token(&token);

	// Attempt to parse comment uuid
	let comment_uuid = match Uuid::parse_str(&comment_uuid){
		Ok(c) => c,
		Err(e) => return Err(status::NotFound(e.to_string())), 
	};

	// Attempts to get the comment
	match handlers::get(comment_uuid, &connection){
		Ok(c) => {
			// Update is_author field
			let mut vec : Vec<DisplayComment> = vec![];
			vec.push(c);

			Ok(Json(update_display_comment_fields(&profile_name, uuid, vec.clone(), &connection).pop().unwrap()))
		},
		Err(e) => Err(status::NotFound(e.to_string())),
	}

}

/** 
 * Method that creates a comment
 * @param comment: JSON of the comment
 *
 * @return returns TBD
 */
#[post("/create_comment/<name>", data="<comment>", rank=1)]
fn create_comment(comment: Json<InputComment>, name: String, connection: DbConn) -> Result<Json<DisplayComment>, status::Conflict<String>> {
	//println!("Timestamp: {}", &comment.timestamp);

	// Check for valid token
	if !auth::validate_token(comment.author_token.clone()) {
		return Err(status::Conflict(Some("Invalid User".to_string())));
	}

	

	// Get the muted words
	let muted_words = match super::kennels::handlers::get_kennel_from_name(name.clone(), &connection){
		Ok(k) => {
			// Check that user is not banned from kennel
			let user_uuid = auth::get_uuid_from_token(&comment.author_token);
			let kennel_id = super::kennels::handlers::get_kennel_uuid_from_name(name, &connection);

			//println!("USER: {} KENNEL: {}", user_uuid, kennel_id);

			match super::kennels::handlers::get_relationship_ban(kennel_id, user_uuid, &connection){
				Ok(rel) => if rel == 1 {return Err(status::Conflict(Some("User is banned from kennel".to_string())));} else {()},
				Err(e) => return Err(status::Conflict(Some(e.to_string()))),
			};

			match k.muted_words {
				Some(words) => words,
				None => vec![],
			}
		},
		Err(e) => return Err(status::Conflict(Some(e.to_string()))),
	};

	// Check that no muted words in review text
	for word in muted_words {
		if comment.text.contains(&word) {
			return Err(status::Conflict(Some("Review using muted word".to_string())));
		}
	}

	// Attempt to insert kennel into database 
	let successful_creation = handlers::insert(comment.into_inner(), &connection);
	
	// Check if successful insertion into database
	match successful_creation {
		Ok(c) => Ok(Json(c)),
		Err(e) => Err(status::Conflict(Some(e.to_string()))),
	}
	
}

/**
 * Mount the comment routes
 */
pub fn mount(rocket: rocket::Rocket) -> rocket::Rocket {
    rocket.mount("/", routes![create_comment, remove_comment, get_comment, get_comments, like_comment, dislike_comment])  
}