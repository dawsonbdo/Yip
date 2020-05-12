pub mod handlers;

use crate::auth;
use crate::db;

use handlers::{User, DbUser};
use rocket_contrib::json::Json;

use rocket::response::status;

use db::DbConn;


/** 
 * Method that returns a user from database given the username
 * @param username: username of user whos data is retrieved
 *
 * @return returns JSON of the review or error status
 */
#[post("/get_user", data="<username>")]
fn get_user(username: String, connection: DbConn) -> Result<Json<DbUser>, status::NotFound<String>> {

	// Gets uuid from username
	let uuid = handlers::get_uuid_from_username(&username, &connection);

	// Get User from database
	let user = handlers::get_user_from_uuid(uuid, &connection);

	// Pattern match to see if user found successfully
	match user {
		Ok(r) => Ok(Json(r)),
		Err(e) => Err(status::NotFound(e.to_string())),
	}
	
}

/**
 * Return whether the user is logged in
 * @param token: the jwt used to verify if logged in
 *
 * @return returns a String indicating if logged in or not
 */
#[post("/auth", data="<token>")]
fn auth(token: String) -> String {

	// Check if valid token passed in
	let is_logged_in = auth::validate_token(token);

	// Return whether logged in or not
	if is_logged_in {
		return "true".to_string(); 
	} else {
		return "false".to_string();
	}

}

/**
 * Print out all users
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
 * Handle password reset
 * @param user: the Json representation of a User
 *
 * @return returns true or false indicating if password changed sucessfuly
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
 * Handle login request
 * @param user: the Json representation of a User
 *
 * @return returns a String with authentication token if successfully logged in, otherwise
 * returns status error 401 with optional error
 */
#[post("/login", data="<user>", rank=1)]
fn login(user: Json<User>, connection: DbConn) -> Result<String, status::Unauthorized<String>> { 

	// Attempt to login user by reading database
	let successful_login = handlers::get(user.into_inner(), &connection);

	// Prints whether login was successful (indicated by non nill uuid)
	println!("Login {}", successful_login);
	
	// Return authentication token if successful login
	if !successful_login.is_nil() {
		match auth::create_token(successful_login) {
			Ok(t) => Ok(t), 
			Err(e) => Err(status::Unauthorized(Some(e.to_string()))), 
		}
	} else { // Return failure if unsucessful
		Err(status::Unauthorized(None))
	}
}

/**
 * Handle register request
 * @param user: the Json representation of a User
 *
 * @return returns a String with auth token if successful registration, otherwise an error
 * status along with a String indicating the if user/email field was taken
 */
#[post("/register", data="<user>", rank=1)]
fn register(user: Json<User>, connection: DbConn) -> Result<String, status::Conflict<String>> { 

	// Attempt to insert user into database 
	let successful_registration = handlers::insert(user.into_inner(), &connection);
	
	// Check if successful insertion into database
	match successful_registration {

		// Successfully registered, create token using id and return it
		Ok(id) => match auth::create_token(id) {
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
    rocket.mount("/", routes![login, register, recover_password, list_users, auth, get_user])  
}