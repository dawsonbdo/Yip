pub mod handlers;

use crate::db;

use handlers::{InputReport, DisplayReport, ReviewReport, CommentReport};
use rocket_contrib::json::Json;

use super::reviews::handlers::DisplayReview;

use db::DbConn;

use rocket::response::status;
use crate::auth;
extern crate priority_queue;

use std::collections::HashMap;
use uuid::Uuid;


/**
 * Helper method that updates is_author, is_liked, is_disliked given username, uuid, and comments vector
 * @param profile_username: the username
 * @param uuid: the profiles uuid
 * @param comments: the comment reports that are being updated
 * @param connection: database connection
 *
 * @return returns vector of DisplayComments with updated fields
 */
fn updateDisplayCommentFields(profile_username: &str, uuid: Uuid, comments: Vec<CommentReport>, connection: &DbConn) -> Vec<CommentReport> {

	// Gets all user's like relationships
	let likes = super::reviews::handlers::get_user_likes(uuid, connection).unwrap();

	// Gets all user's dislike relationships
	let dislikes = super::reviews::handlers::get_user_dislikes(uuid, connection).unwrap();

	// Create hash map for the review likes and dislikes by user
	let mut comment_likes_dislikes = HashMap::new();

	// Iterate through likes and dislikes
	for l in likes.iter() {
		comment_likes_dislikes.insert(l.liker, 1);
	}

	for d in dislikes.iter() {
		comment_likes_dislikes.insert(d.disliker, -1);
	}


	let mut comments_updated : Vec<CommentReport> = vec![];

	// Set isAuthor, isLiked, isDisliked fields
	for mut c in comments {
		let val = comment_likes_dislikes.get(&c.comment_uuid);

		c.is_author = profile_username.eq(&c.author_name); // set field of DisplayComment
		c.is_liked = match val{
			Some(v) => *v == 1,
			None => false,
		};
		c.is_disliked = match val{
			Some(v) => *v == -1,
			None => false,
		};

		comments_updated.push(c);
	}

	comments_updated
}

/**
 * Helper method that updates is_author, is_liked, is_disliked given username, uuid, and reviews vector
 * @param profile_username: the username
 * @param uuid: the profiles uuid
 * @param reviews: the reports that are being updated
 * @param connection: database connection
 *
 * @return returns vector of DisplayReviews with updated fields
 */
fn updateDisplayReportFields(profile_username: &str, uuid: Uuid, reviews: Vec<ReviewReport>, connection: &DbConn) -> Vec<ReviewReport> {

	// Gets all user's like relationships
	let likes = super::reviews::handlers::get_user_likes(uuid, connection).unwrap();

	// Gets all user's dislike relationships
	let dislikes = super::reviews::handlers::get_user_dislikes(uuid, connection).unwrap();

	// Get all user's bookmark relationships
	let bookmarks = super::reviews::handlers::get_user_bookmarks(uuid, connection).unwrap();

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

	let mut reviews_updated : Vec<ReviewReport> = vec![];

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

		reviews_updated.push(r);
	}

	reviews_updated
}

/**
 * Method that prints out all the reports in database
 * @param connection: database connection
 *
 * @return N/A
 */
#[get("/reports", rank=1)]
fn list_reports(connection: DbConn) -> () {

	// Makes database call to get all users
	let all_reports = handlers::all(&connection)
        .map(|report| Json(report));
        
	// Prints out title/text/rating of each review in database
	for vec in all_reports {
		for r in vec.iter() {
			println!("Kennel: {} Is Comment: {} Reason: {}", r.kennel, r.is_comment, r.reason);
		} 
	}

}


/** 
 * Method that returns vector of comment reports
 * @param kennel_name: the name of the kennel that is queried
 * @param token: the user logged in
 * @param connection: database connection
 *
 * @return returns JSON of the review or error status
 */
#[get("/get_kennel_reports_comments/<kennel_name>/<token>")]
fn get_kennel_reports_comments(kennel_name: String, token: String, connection: DbConn) -> Result<Json<Vec<CommentReport>>, status::NotFound<String>> {

	// TODO: Check token is mod of kennel?

	// Converts kennel name to kennel id
	let kennel_uuid = super::kennels::handlers::get_kennel_uuid_from_name(kennel_name, &connection);

	// Check for nil id (meaning kennel name does not exist)
	if kennel_uuid.is_nil() {
		return Err(status::NotFound("Kennel not found".to_string()));
	}

	// Makes database call to get all reviews with kennel uuid
	let all_reports = handlers::all_kennel_reports(kennel_uuid, &connection);

	// Create pq of reported comments based on timestamp 
	let mut pq = priority_queue::PriorityQueue::new();
				
	// Goes through all reports, filters comments into pq
	for v in &all_reports {
		for r in v.iter() {
			// Check if report is a comment
			if !r.is_comment {
				continue;
			}

			// Get comment of report and make sure valid comment
			let comment = match super::comments::handlers::get(r.comment_id.unwrap(), &connection){
				Ok(t) => t,
				Err(e) => continue,
			};

			// Create a CommentReport
			let comment_report = CommentReport{
				comment_uuid: comment.comment_uuid,
			    author_name: comment.author_name.clone(),
			    timestamp: comment.timestamp,
			    text: comment.text.clone(),
			    is_author: false,
			    rating: comment.rating,
			    is_liked: false,
			    is_disliked: false,
			    reason: r.reason.clone(),
			};

			// Push review to pq by timestamp
			let timestamp = r.timestamp;
			pq.push(comment_report, timestamp);

			//println!("Kennel: {} Is Comment: {} Reason: {}", r.kennel_name, r.is_comment, r.reason);
		} 
	}
	
	// Create a vector with all of the reviews to as ordered
	let mut commentsOrdered : Vec<CommentReport> = vec![];

	// Order by newness for now 
	for (comment, _) in pq.into_sorted_iter() {
		commentsOrdered.push(comment);
	}

	let profile_username = auth::get_user_from_token(&token);
	let uuid = auth::get_uuid_from_token(&token);

	let updatedFieldsComments = updateDisplayCommentFields(&profile_username, uuid, commentsOrdered, &connection);

	Ok(Json(updatedFieldsComments))
}


/** 
 * Method that returns vector of review reports
 * @param kennel_name: the name of the kennel that is queried
 * @param token: the user logged in
 * @param connection: database connection
 *
 * @return returns JSON of the review or error status
 */
#[get("/get_kennel_reports_reviews/<kennel_name>/<token>")]
fn get_kennel_reports_reviews(kennel_name: String, token: String, connection: DbConn) -> Result<Json<Vec<ReviewReport>>, status::NotFound<String>> {

	// TODO: Check token is mod of kennel?

	// Converts kennel name to kennel id
	let kennel_uuid = super::kennels::handlers::get_kennel_uuid_from_name(kennel_name, &connection);

	// Check for nil id (meaning kennel name does not exist)
	if kennel_uuid.is_nil() {
		return Err(status::NotFound("Kennel not found".to_string()));
	}

	// Makes database call to get all reviews with kennel uuid
	let all_reports = handlers::all_kennel_reports(kennel_uuid, &connection);

	// Create pq of reported reviews based on timestamp 
	let mut pq = priority_queue::PriorityQueue::new();
				
	// Goes through all reports, filters reviews into pq
	for v in &all_reports {
		for r in v.iter() {
			// Check if report is a review
			if r.is_comment {
				continue;
			}

			// Get review of report and make sure valid review
			let review = match super::reviews::handlers::get(r.review_id.unwrap(), &connection){
				Ok(t) => t,
				Err(e) => continue,
			};

			// Create a ReviewReport
			let review_report = ReviewReport {
				kennel_name: review.kennel_name.clone(), 
				title: review.title.clone(),
			    author: review.author.clone(), 
			    timestamp: review.timestamp,
			    text: review.text.clone(),
			    images: review.images.clone(),
			    rating: review.rating,
				tags: review.tags.clone(),
				is_author: review.is_author,
				is_liked: review.is_liked,
				is_disliked: review.is_disliked,
				is_bookmarked: review.is_bookmarked,
				review_uuid: review.review_uuid,
				hotness: review.hotness,
				reason: r.reason.clone(),
			};

			// Push review to pq by timestamp
			let timestamp = r.timestamp;
			pq.push(review_report, timestamp);

			//println!("Kennel: {} Is Comment: {} Reason: {}", r.kennel_name, r.is_comment, r.reason);
		} 
	}
	
	// Create a vector with all of the reviews to as ordered
	let mut reviewsOrdered : Vec<ReviewReport> = vec![];

	// Order by newness for now 
	for (review, _) in pq.into_sorted_iter() {
		reviewsOrdered.push(review);
	}

	let profile_username = auth::get_user_from_token(&token);
	let uuid = auth::get_uuid_from_token(&token);

	let updatedFieldsReviews = updateDisplayReportFields(&profile_username, uuid, reviewsOrdered, &connection);

	Ok(Json(updatedFieldsReviews))
}

/** 
 * Method that creates a report
 * @param kennel: JSON of the report
 *
 * @return returns TBD
 */
#[post("/create_report", data="<report>", rank=1)]
fn create_report(report: Json<InputReport>, connection: DbConn) -> Result<status::Accepted<String>, status::Conflict<String>> {
	
	// Check that valid user reporting
	if auth::get_uuid_from_token(&report.reporter_token).is_nil(){
		return Err(status::Conflict(Some("Invalid user trying to report".to_string())));
	}

	// Attempt to insert report into database 
	let successful_report = handlers::insert(report.into_inner(), &connection);
	
	// Check if successful insertion into database
	match successful_report {
		Ok(_id) => Ok(status::Accepted(None)),
		Err(e) => Err(status::Conflict(Some(e.to_string()))),
	}
	
}

/**
 * Mount the report routes
 */
pub fn mount(rocket: rocket::Rocket) -> rocket::Rocket {
    rocket.mount("/", routes![create_report, get_kennel_reports_reviews, get_kennel_reports_comments, list_reports])  
}