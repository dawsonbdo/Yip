pub mod handlers;

use crate::auth;
use crate::db;

use handlers::{DbKennel, Kennel};
use rocket_contrib::json::Json;

use db::DbConn;

use rocket::response::status;

// Struct with kennel id and user jwt for following/unfollowing kennels
#[derive(Queryable, Serialize, Deserialize)]
struct KennelUser {
    kennel_name: String,
    token: String,
}

/** 
 * Helper method that follows or unfollows a kennel given parameter
 * @param kennel: JSON of a KennelUser (name + token)
 * @param follow: bool indicating follow or unfollow
 * @param connetion: database connection
 *
 * @return returns a result with status Accepted or BadRequest
 */
fn follow_unfollow_helper(input: Json<KennelUser>, follow: bool, connection: DbConn) -> Result<status::Accepted<String>, status::BadRequest<String>> {

	// Converts token into uuid
	let profile_uuid = auth::get_uuid_from_token(&input.token);
	
	// Make sure uuid was found
	if profile_uuid.is_nil() {
		return Err(status::BadRequest(Some("Profile not found".to_string())));
	}

	// Convert kennel name to uuid, check if not found
	let kennel_uuid = handlers::get_kennel_uuid_from_name(input.kennel_name.clone(), &connection);

	// Return value
	let result;

	// Makes sure kennel was found
	if kennel_uuid.is_nil() {

		// Kennel name could not convert to a uuid (not found)
		return Err(status::BadRequest(Some("Kennel not foudn".to_string())));
	} else {

		// Attempt to follow or unfollow depending on parameter
		if follow {

			// Follow
			result = handlers::follow(kennel_uuid, profile_uuid, &connection);
		} else {

			// Unfollow
			result = handlers::unfollow(kennel_uuid, profile_uuid, &connection);
		}
	}

	// Update kennel number of followers
	handlers::update_kennel_followers(kennel_uuid, &connection);

	// Return result
	result
}

/** 
 * Method that returns a kennel from database given the name
 * @param name: name of kennel
 * @param connection: database connection
 *
 * @return returns JSON of the review or error status
 */
#[get("/get_followed_kennels/<token>")]
fn get_followed_kennels(token: String, connection: DbConn) -> Result<Json<Vec<DbKennel>>, status::NotFound<String>> {

	// Get the uuid from token
	let uuid = auth::get_uuid_from_token(&token);

	// If not nil, return all of the followed kennels
	if !uuid.is_nil(){
		match handlers::all_user_kennels(uuid, &connection) {
			Ok(k) => Ok(Json(k)),
			Err(_e) => Err(status::NotFound("No kennels".to_string()))
		}
	} else {
		Err(status::NotFound("User not found".to_string()))
	}
	
}

/** 
 * Method that returns a kennel from database given the name
 * @param name: name of kennel
 * @param connection: database connection
 *
 * @return returns JSON of the review or error status
 */
#[get("/get_kennel/<name>")]
fn get_kennel(name: String, connection: DbConn) -> Result<Json<DbKennel>, status::NotFound<String>> {

	// Converts kennel name to uuid
	let kennel_uuid = handlers::get_kennel_uuid_from_name(name, &connection);

	// Check for nil uuid
	if kennel_uuid.is_nil(){

		Err(status::NotFound("".to_string()))
	} else {

		// Pattern match the attempt to get kennel from uuid
		match handlers::get(kennel_uuid, &connection){
			Ok(k) => Ok(Json(k)),
			Err(e) => Err(status::NotFound(e.to_string())),
		}
	}
	
}

/**
 * Method that prints out all the kennels in database
 * @param connection: database connection
 *
 * @return N/A
 */
#[get("/kennels", rank=1)]
fn list_kennels(connection: DbConn) -> () {

	// Makes database call to get all users
	let all_kennels = handlers::all(&connection)
        .map(|kennel| Json(kennel));
        
	// Prints out title/text/rating of each review in database
	for vec in all_kennels {
		for k in vec.iter() {
			println!("Name: {} Tags: {} Id: {}", k.kennel_name, k.tags.as_ref().unwrap()[0], k.kennel_uuid);
		} 
	}

}

/** 
 * Handler method that unfollows a kennel
 * @param kennel: JSON of a KennelUser (name + token)
 * @param connetion: database connection
 *
 * @return returns a result with status Accepted or BadRequest
 */
#[post("/unfollow_kennel", data="<input>", rank=1)]
fn unfollow_kennel(input: Json<KennelUser>, connection: DbConn) -> Result<status::Accepted<String>, status::BadRequest<String>> {
	
	// Call helper with false for unfollow
	follow_unfollow_helper(input, false, connection)
}

/** 
 * Handler method that follows a kennel
 * @param kennel: JSON of a KennelUser (name + token)
 * @param connetion: database connection
 *
 * @return returns a result with status Accepted or BadRequest
 */
#[post("/follow_kennel", data="<input>", rank=1)]
fn follow_kennel(input: Json<KennelUser>, connection: DbConn) -> Result<status::Accepted<String>, status::BadRequest<String>> {
	
	// Call helper with true for follow
	follow_unfollow_helper(input, true, connection)
}


/** 
 * Method that creates a kennel
 * @param kennel: JSON of the kennel
 * @param connection: database connection
 *
 * @return returns a result with status Accepted or Unauthorized
 */
#[post("/create_kennel", data="<kennel>", rank=1)]
fn create_kennel(kennel: Json<Kennel>, connection: DbConn) -> Result<status::Accepted<String>, status::Conflict<String>> {
	
	// Attempt to insert kennel into database 
	let successful_creation = handlers::insert(kennel.into_inner(), &connection);
	
	// Check if successful insertion into database
	match successful_creation {
		Ok(_id) => Ok(status::Accepted(None)),
		Err(e) => Err(status::Conflict(Some(e.to_string()))),
	}
	
}

/**
 * Mount the kennel routes
 */
pub fn mount(rocket: rocket::Rocket) -> rocket::Rocket {
    rocket.mount("/", routes![create_kennel, list_kennels, follow_kennel, unfollow_kennel, get_kennel, get_followed_kennels])  
}