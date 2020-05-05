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
 * Handle register request
 * @param user: the Json representation of a User
 *
 * @return returns a String with authentication token if successfully
 * registered or a fail message
 */
#[post("/register", data="<user>", rank=1)]
fn register(user: Json<User>, connection: DbConn) -> String {
	
	// Attempt to insert user into database 
	let successful_registration = handlers::insert(user.into_inner(), &connection);
	
    // Return authentication token if successful
    if successful_registration {

    	return auth::create_token();

    } else { // Return failure if unsuccessful registration

    	return "loginfail".to_string();

    }

}

/** 
 * Handle login request
 * @param user: the Json representation of a User
 *
 * @return returns a String with authentication token if successfully
 * registered or a fail message
 */
#[post("/login", data="<user>", rank=1)]
fn login(user: Json<User>, connection: DbConn) -> String {

	// Attempt to login user by reading database
	let successful_login = handlers::get(user.into_inner(), &connection);

	// Prints whether login was successful
	println!("Login {}", successful_login);

	// Return authentication token if successful login
	if successful_login {

    	return auth::create_token();

	} else { // Return failure if unsucessful
	
		return "loginfail".to_string();

	}

}

/**
 * Mount the user routes
 */
pub fn mount(rocket: rocket::Rocket) -> rocket::Rocket {
    rocket
        .mount("/", routes![login, register, list_users, auth_test])  
}