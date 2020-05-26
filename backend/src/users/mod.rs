pub mod handlers;

use crate::auth;
use crate::db;

use handlers::{User, DisplayUser, DisplayFollowUser};
use rocket_contrib::json::Json;
use rocket::response::status;

use db::DbConn;

// Struct with user name and token for blocking users
#[derive(Queryable, Serialize, Deserialize)]
struct TokenUser {
    token: String,
    username: String,
}

/** 
 * Helper method that blocks or unblocks a user given parameter
 * @param input: JSON of a TokenUser (name + token)
 * @param block: bool indicating follow or unfollow
 * @param connection: database connection
 *
 * @return returns a result with status Accepted or BadRequest
 */
fn block_unblock_helper(input: Json<TokenUser>, block: bool, connection: DbConn) -> Result<bool, String> {

	// Get token uuid (blocker)
	let blocker = auth::get_uuid_from_token(&input.token);

	// Get blockee uuid
	let blockee = handlers::get_uuid_from_username(&input.username, &connection);

	// Check if either are nil (not found)
	if blocker.is_nil() || blockee.is_nil() {
		return Err("Blocker or blockee not found".to_string());
	}

	let result;

	if block {
		// Attempt to insert block relation into database 
	 	result = handlers::insert_block(blocker, blockee, &connection);
	} else {
		// Attempt to remove block relation from database 
	 	result = handlers::remove_block(blocker, blockee, &connection);
	}
	
	// Check if successful insertion into database
	match result {
		Ok(u) => if u == 0 {Err("already blocked or unblocked".to_string())} else {Ok(true)},
		Err(e) => Err(e.to_string()),
	}
}

/** 
 * Helper method that follows or unfollows a user given parameter
 * @param input: JSON of a TokenUser (name + token)
 * @param follow: bool indicating follow or unfollow
 * @param connection: database connection
 *
 * @return returns a result with status Accepted or BadRequest
 */
fn follow_unfollow_helper(input: Json<TokenUser>, follow: bool, connection: DbConn) -> Result<status::Accepted<String>, status::Conflict<String>> {

	// Get token uuid (follower)
	let follower = auth::get_uuid_from_token(&input.token);

	// Get followee uuid
	let followee = handlers::get_uuid_from_username(&input.username, &connection);

	// Check if either are nil (not found)
	if follower.is_nil() || followee.is_nil() {
		return Err(status::Conflict(Some("Follower or followee not found".to_string())));
	}

	let result;

	// Follow or unfollow depending on param
	if follow {

		// Attempt to insert follow relation into database 
		result = handlers::follow(follower, followee, &connection);
	} else {

		// Attempt to delete follow relation from database 
		result = handlers::unfollow(follower, followee, &connection);
	}

	
	// Check if successful insertion into database
	match result {
		Ok(_id) => Ok(status::Accepted(None)),
		Err(e) => Err(e),
	}
}

/** 
 * Method that unfollows a user
 * @param kennel: JSON of the report
 *
 * @return returns returns status indicating if unfollowed
 */
#[post("/unfollow_user", data="<follow>", rank=1)]
fn unfollow_user(follow: Json<TokenUser>, connection: DbConn) -> Result<status::Accepted<String>, status::Conflict<String>> {
	
	// Call helper with false param indicating unfollow
	follow_unfollow_helper(follow, false, connection)
}

/** 
 * Method that follows a user
 * @param kennel: JSON of the report
 *
 * @return returns status indicating if followed
 */
#[post("/follow_user", data="<follow>", rank=1)]
fn follow_user(follow: Json<TokenUser>, connection: DbConn) -> Result<status::Accepted<String>, status::Conflict<String>> {
	
	// Call helper with true param indicating follow
	follow_unfollow_helper(follow, true, connection)
}

/** 
 * Method that unblocks a user
 * @param kennel: JSON of the report
 *
 * @return returns returns status indicating if unblocked
 */
#[post("/unblock_user", data="<block>", rank=1)]
fn unblock_user(block: Json<TokenUser>, connection: DbConn) -> Result<status::Accepted<String>, status::Conflict<String>> {
	
	// Call helper with false for unblock 
	match block_unblock_helper(block, false, connection){
		Ok(_b) => Ok(status::Accepted(None)),
		Err(e) => Err(status::Conflict(Some(e.to_string()))),
	}
	
}

/** 
 * Method that blocks a user
 * @param kennel: JSON of the report
 *
 * @return returns returns status indicating if blocked
 */
#[post("/block_user", data="<block>", rank=1)]
fn block_user(block: Json<TokenUser>, connection: DbConn) -> Result<status::Accepted<String>, status::Conflict<String>> {
	
	// Call helper with true for block 
	match block_unblock_helper(block, true, connection) {
		Ok(_b) => Ok(status::Accepted(None)),
		Err(e) => Err(status::Conflict(Some(e.to_string()))),
	}
}

/**
 * Helper method that returns name of a followee
 */
fn get_name(user: &DisplayFollowUser) -> String {
	user.followee.clone()
}

/** 
 * Method that returns all the names of users a username follows
 * @param username: name of user
 * @param connection: database connection
 *
 * @return returns vector of the users
 */
pub fn get_followed_users_names(username: &str, connection: &DbConn) -> Result<Vec<String>, String> {

	// Get uuid from user
	let uuid = handlers::get_uuid_from_username(&username, connection);

	// If not nil, return all of the followed users
	if !uuid.is_nil(){
		match handlers::all_user_followees(uuid, connection) {
			Ok(k) => Ok(k.iter().map(|followee| get_name(followee)).collect()),
			Err(_e) => Err("No followed users".to_string())
		}
	} else {
		Err("User not found".to_string())
	}
	
}

/** 
 * Method that returns all the users a username follows
 * @param username: name of user
 * @param connection: database connection
 *
 * @return returns vector of the users
 */
#[get("/get_followed_users/<username>")]
fn get_followed_users(username: String, connection: DbConn) -> Result<Json<Vec<DisplayFollowUser>>, status::NotFound<String>> {

	// Get uuid from user
	let uuid = handlers::get_uuid_from_username(&username, &connection);

	// If not nil, return all of the followed users
	if !uuid.is_nil(){
		match handlers::all_user_followees(uuid, &connection) {
			Ok(k) => Ok(Json(k)),
			Err(_e) => Err(status::NotFound("No followed users".to_string()))
		}
	} else {
		Err(status::NotFound("User not found".to_string()))
	}
	
}

/** 
 * Method that returns a user from database given the username
 * @param username: username of user whos data is retrieved
 * @param token: the user token on frontend
 * @param connection: database connection
 *
 * @return returns JSON of the user or error status
 */
#[get("/get_user/<username>/<token>")]
fn get_user(username: String, token: String, connection: DbConn) -> Result<Json<DisplayUser>, status::NotFound<String>> {

	// Gets uuid from username
	let uuid = handlers::get_uuid_from_username(&username, &connection);

	// Get User from database
	let user = handlers::get_user_from_uuid(uuid, &connection);

	// Pattern match to see if user found successfully
	match user {
		Ok(r) => Ok(Json(handlers::to_display_user(r, token, &connection))),
		Err(e) => Err(status::NotFound(e.to_string())),
	}
	
}

/**
 * Method that returns the username corresponding to token
 * @param token: the jwt used to verify if logged in
 *
 * @return returns a String indicating if logged in or not
 */
#[get("/get_username/<token>")]
fn get_username(token: String) -> String {

	// Gets the username from token, "" if none
	auth::get_user_from_token(&token)

}

/**
 * Method that returns whether the user is logged in
 * @param token: the jwt used to verify if logged in
 *
 * @return returns a String indicating if logged in or not
 */
#[post("/auth/<token>")]
fn auth(token: String) -> String {

	// Check if valid token passed in
	let is_logged_in = auth::validate_token(token.clone());

	// Return whether logged in or not
	if is_logged_in {
		return "true".to_string(); 
	} else {
		return "false".to_string();
	}

}

/**
 * Method that prints out all the users in database
 * @param connection: database connection
 *
 * @return N/A
 */
#[get("/get_all_users", rank=1)]
fn get_all_users(connection: DbConn) -> Result<Json<Vec<String>>, status::NotFound<String>> {

	// Makes database call to get all user names
	let all_users = handlers::all_names(&connection);
	
	match all_users{
		Ok(u) => Ok(Json(u)),
		Err(e) => Err(status::NotFound(e.to_string())),
	}

}

/**
 * Method that prints out all the users in database
 * @param connection: database connection
 *
 * @return N/A
 */
#[get("/users", rank=1)]
fn list_users(connection: DbConn) -> () {

	// Makes database call to get all users
	let all_users = handlers::all(&connection)
        .map(|user| Json(user));
        
	
	// Prints out user/email/pw of each user in database
	for vec in all_users {
		for u in vec.iter() {
			println!("User: {} Email: {} Password: {}", u.username, u.email, u.password);
		} 
	}

}

/** 
 * Method for handling password reset
 * @param user: the Json representation of a User
 * @param connection: database connection
 *
 * @return returns a result with Accepted or Unauthorized status
 */
#[post("/recover_password", data="<user>", rank=1)]
fn recover_password(user: Json<User>, connection: DbConn) -> Result<status::Accepted<String>, status::Unauthorized<String>> {

	// Get uuid of username/email if they are linked to same account
	let id = handlers::username_email_linked(&user.username, &user.email, &connection);

	// Check that valid id was found
	if !id.is_nil() {

		// Attempt to change password
		let successful_change = handlers::update(id, &user.password, &connection);

		// Prints whether login was successful (indicated by non nill uuid)
		println!("Password reset {}", successful_change);

		// Returns true if successfully changed
		if successful_change {
    		return Ok(status::Accepted(None));
		}
	}

	// Prints whether login was successful (indicated by non nill uuid)
	println!("Password reset failed");

	// Return false if unsucessful
	Err(status::Unauthorized(None))
}

/** 
 * Method to handle login request
 * @param user: the Json representation of a User
 * @param connection: database connection
 *
 * @return returns a String with authentication token if successfully logged in, otherwise
 * returns status error 401 with optional error
 */
#[post("/login", data="<user>", rank=1)]
fn login(user: Json<User>, connection: DbConn) -> Result<String, status::Unauthorized<String>> { 

	// Save username passed in
	let username = user.username.clone();

	// Attempt to login user by reading database
	let successful_login = handlers::get(user.into_inner(), &connection);

	// Prints whether login was successful (indicated by non nill uuid)
	println!("Login {}", successful_login);
	
	// Return authentication token if successful login
	if !successful_login.is_nil() {
		match auth::create_token(successful_login, &username) {
			Ok(t) => Ok(t), 
			Err(e) => Err(status::Unauthorized(Some(e.to_string()))), 
		}
	} else { // Return failure if unsucessful
		Err(status::Unauthorized(None))
	}
}

/**
 * Method to handle register request
 * @param user: the Json representation of a User
 * @param connection: database connection
 *
 * @return returns a String with auth token if successful registration, otherwise an error
 * status along with a String indicating the if user/email field was taken
 */
#[post("/register", data="<user>", rank=1)]
fn register(user: Json<User>, connection: DbConn) -> Result<String, status::Conflict<String>> { 

	// Save username passed in
	let username = user.username.clone();

	// Attempt to insert user into database 
	let successful_registration = handlers::insert(user.into_inner(), &connection);
	
	// Check if successful insertion into database
	match successful_registration {

		// Successfully registered, create token using id and return it
		Ok(id) => match auth::create_token(id, &username) {
					Ok(t) => Ok(t), 
					Err(e) => Err(status::Conflict(Some(e.to_string()))), 
				 },
		// Unsuccessful registration, return the error
		Err(e) => {
			println!("{}", e.to_string());
			Err(status::Conflict(Some(e.to_string())))
		}
	}

}

/**
 * Mount the user routes
 */
pub fn mount(rocket: rocket::Rocket) -> rocket::Rocket {
    rocket.mount("/", routes![login, register, recover_password, get_all_users, list_users, auth, get_user, get_followed_users, block_user, unblock_user, follow_user, unfollow_user, get_username])  
}