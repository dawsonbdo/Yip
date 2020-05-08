pub mod handlers;

use crate::auth;
use crate::db;

use handlers::User;
use rocket_contrib::json::Json;

use db::DbConn;

/*
fn user_created(user: User) -> status::Created<Json<User>> {
    status::Created(
        format!("{host}:{port}/users/{username}", host = "localhost", port = 8000, username = user.username).to_string(),
        Some(Json(user)))
}
*/

/*
fn error_status(error: Error) -> Status {
    match error {
        Error::NotFound => Status::NotFound,
        _ => Status::InternalServerError
    }
}
*/


// Struct with token and password for reseting
#[derive(Queryable, Serialize, Deserialize)]
struct TokenPassword {
    token: String,
    password: String,
}

/**
 * Return whether the user is logged in
 * @param token: the jwt used to verify if logged in
 *
 * @return returns a String indicating if logged in or not
 */
#[post("/auth", data="<token>")]
fn auth_test(token: String) -> String {

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
fn recover_password(user: Json<User>, connection: DbConn) -> String { //has to return a String for frontend reasons

	// Get uuid of username/email if they are linked to same account
	let id = handlers::username_email_linked(&user.username, &user.email, &connection);

	// Check that valid id was found
	if id != uuid::Uuid::nil() {

		// Attempt to change password
		let successful_change = handlers::update(id, &user.password, &connection);

		// Prints whether login was successful (indicated by non nill uuid)
		println!("Password reset {}", successful_change);

		// Returns true if successfully changed
		if successful_change {
    		return "true".to_string();
		}
	}

	// Prints whether login was successful (indicated by non nill uuid)
	println!("Password reset failed");


	// Return false if unsucessful
	return "false".to_string();
}

/** 
 * Handle login request
 * @param user: the Json representation of a User
 *
 * @return returns a Result::Ok with authentication token if successfully
 * registered
 */
#[post("/login", data="<user>", rank=1)]
fn login(user: Json<User>, connection: DbConn) -> String { //TODO: more sophisticated Error types

	// Result<String, Option<jsonwebtoken::errors::Error>>

	// Attempt to login user by reading database
	let successful_login = handlers::get(user.into_inner(), &connection);

	// Prints whether login was successful (indicated by non nill uuid)
	println!("Login {}", successful_login);
	
	// Return authentication token if successful login
	if successful_login != uuid::Uuid::nil() {
		match auth::create_token(successful_login) {
			Result::Ok(str) => str, // Result::Ok(str),
			Result::Err(err) => "loginfail".to_string(), //Result::Err(Option::Some(err))
		}
	} else { // Return failure if unsucessful
		"loginfail".to_string()
		//Result::Err(Option::None)
	}
}

/**
 * Handle register request
 * @param user: the Json representation of a User
 *
 * @return returns a Result::Ok with authentication token if successfully
 * registered
 */
#[post("/register", data="<user>", rank=1)]
fn register(user: Json<User>, connection: DbConn) -> String { //TODO return meaningful information on error
	
	// Result<String, Option<jsonwebtoken::errors::Error>>

	// Attempt to insert user into database 
	let successful_registration = handlers::insert(user.into_inner(), &connection);
	
    // Return authentication token if successful
    if successful_registration != uuid::Uuid::nil() {
		match  auth::create_token(successful_registration) {
			Result::Ok(str) => str, //Result::Ok(str),
			Result::Err(err) => "loginfail".to_string(), //Result::Err(Option::Some(err)) // TODO return an Option or Result
		}

    } else { // Return failure if unsuccessful registration

    	"loginfail".to_string()
		//Result::Err(Option::None)
    }

}

/**
 * Mount the user routes
 */
pub fn mount(rocket: rocket::Rocket) -> rocket::Rocket {
    rocket.mount("/", routes![login, register, recover_password, list_users, auth_test])  
}