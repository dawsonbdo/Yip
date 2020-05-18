pub mod handlers;

use crate::auth;
use crate::db;
use crate::search;

use handlers::{DbKennel, Kennel, DisplayKennel};
use rocket_contrib::json::Json;

use db::DbConn;
use uuid::Uuid;

use rocket::response::status;

use super::{users};

// Struct with kennel id and user jwt for editing a kennel
#[derive(Queryable, Serialize, Deserialize)]
struct KennelUpdate {
    kennel_uuid: String,
    tags: Vec<String>,
    kennel_name: String,
    muted_words: Vec<String>,
    rules: String,
    bans: Vec<String>,
    token: String,
}

// Struct with kennel id and user jwt for banning users
#[derive(Queryable, Serialize, Deserialize)]
struct KennelBan {
    kennel_name: String,
    bans: Vec<String>,
    token: String,
}

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
	if let Err(e) = handlers::update_kennel_followers(kennel_uuid, &connection) {
		dbg!(e);
	}

	// Return result
	result
}


/** 
 * Handler method that bans users from a kennel
 * @param kennel: JSON of a KennelBanUser (kennel name, users, token)
 * @param connection: database connection
 *
 * @return returns a result with status Accepted or BadRequest
 */
fn kennel_ban_users(input: Json<KennelBan>, connection: &DbConn) -> Result<status::Accepted<String>, status::Unauthorized<String>> {
	
	// Verify token is moderator of kennel

	// Get token uuid
	let uuid = auth::get_uuid_from_token(&input.token);

	// Get kennel from name
	let kennel = match handlers::get_kennel_from_name(input.kennel_name.clone(), connection) {
		Ok(k) => (k),
		Err(e) => return Err(status::Unauthorized(Some(e.to_string()))),
	};

	// Get mod uuid and uuid of kennel
	let mod_uuid = kennel.mod_uuid;
	let kennel_uuid = kennel.kennel_uuid;

	// If not mod, return error
	if !uuid.eq(&mod_uuid){
		Err(status::Unauthorized(Some("Only moderator can ban from kennel".to_string())))
	} else {

		// Create vector of uuids
		let mut user_vector : Vec<Uuid> = vec![];

		// Fill vector of user uuids using usernames
		for user in &input.bans {

			// Get username uuid
			let u = super::users::handlers::get_uuid_from_username(user, connection);
			
			// If found, push to list
			if !u.is_nil(){
				user_vector.push(u);
			}

		}

		// Ban all users from kennel
		handlers::ban_users(kennel_uuid, user_vector, connection)
	}

}

/** 
 * Handler method that searches all kennels in db given a query
 * @param query: query string that is searched for
 * @param connection: database connection
 *
 * @return returns a result with vector of kennels or BadRequest
 */
#[get("/search_kennels/<query>", rank=1)]
fn search_kennels(query: String, connection: DbConn) -> Result<Json<Vec<DisplayKennel>>, status::NotFound<String>> {

    match search::search_kennels(query, &connection){
    	Ok(k) => if k.iter().len() == 0 {Err(status::NotFound("No reviews found".to_string()))} else {Ok(Json(k))},
    	Err(e) => Err(status::NotFound(e.to_string())),
    }
}



/** 
 * Method that returns a kennel from database given the name
 * @param name: name of kennel
 * @param connection: database connection
 *
 * @return returns JSON of the review or error status
 */
#[get("/get_followed_kennels_username/<username>")]
fn get_followed_kennels_username(username: String, connection: DbConn) -> Result<Json<Vec<DbKennel>>, status::NotFound<String>> {

	// Get uuid from user
	let uuid = users::handlers::get_uuid_from_username(&username, &connection);

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
 * Method that returns a kennel from database given the name and token
 * @param name: name of kennel
 * @param token: user token
 * @param connection: database connection
 *
 * @return returns JSON of the kennel or error status
 */
#[get("/get_kennel/<name>/<token>")]
fn get_kennel(name: String, token: String, connection: DbConn) -> Result<Json<DisplayKennel>, status::NotFound<String>> {

	// Converts kennel name to uuid
	let kennel_uuid = handlers::get_kennel_uuid_from_name(name, &connection);

	// Check for nil uuid
	if kennel_uuid.is_nil(){

		Err(status::NotFound("".to_string()))
	} else {

		// Pattern match the attempt to get kennel from uuid
		match handlers::get(kennel_uuid, &connection){
			Ok(k) => Ok(Json(handlers::to_display_kennel(&k, token, &connection))),
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
 * Method that updates a kennel
 * @param kennel: JSON of the kennel
 * @param connection: database connection
 *
 * @return returns a result with status Accepted or Unauthorized
 */
#[post("/edit_kennel", data="<kennel>", rank=1)]
fn edit_kennel(kennel: Json<KennelUpdate>, connection: DbConn) -> Result<status::Accepted<String>, status::Conflict<String>> {
	
	// Print kenne lstuf
	println!("Kennel Name: {}", kennel.kennel_name);

	// Make sure valid user id 
	let moderator = auth::get_uuid_from_token(&kennel.token);

	if moderator.is_nil(){
		return Err(status::Conflict(Some("Invalid user".to_string())))
	}

	// Create Kennel object to insert
	let k = Kennel{
		kennel_uuid: kennel.kennel_uuid.clone(),
    	tags: kennel.tags.clone(),
    	kennel_name: kennel.kennel_name.clone(),
    	muted_words: kennel.muted_words.clone(),
    	rules: kennel.rules.clone(),
    	token: kennel.token.clone(),
	};

	// Attempt to update kennel in database
	let successful_edit = handlers::update(moderator, k, &connection);
	
	// Attempt to ban users
	let ban = KennelBan{
		kennel_name: kennel.kennel_name.clone(),
    	bans: kennel.bans.clone(),
    	token: kennel.token.clone(),
	};

	match kennel_ban_users(Json(ban), &connection){
		Ok(_u) => println!("SUCCESSFUL BAN"),
		Err(_e) => println!("FAILED BAN"),
	};

	// Check if successful insertion into database
	match successful_edit {
		Ok(u) => if u == 0 {Err(status::Conflict(Some("Not moderator".to_string())))} else {Ok(status::Accepted(None))},
		Err(e) => Err(status::Conflict(Some(e.to_string()))),
	}
	
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
	
	// Make sure valid user id 
	let moderator = auth::get_uuid_from_token(&kennel.token);

	if moderator.is_nil(){
		return Err(status::Conflict(Some("Invalid user".to_string())))
	}

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
    rocket.mount("/", routes![create_kennel, edit_kennel, list_kennels, follow_kennel, unfollow_kennel, get_kennel, get_followed_kennels, get_followed_kennels_username, search_kennels])  
}