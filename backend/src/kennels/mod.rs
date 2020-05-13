pub mod handlers;

use crate::auth;
use crate::db;

use handlers::{DbKennel, Kennel};
use rocket_contrib::json::Json;

use db::DbConn;
use uuid::Uuid;

use rocket::response::status;

/** 
 * Method that returns a kennel from database given the name
 * @param id: Uuid of review as a string
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
 * Print out all kennels
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

// Struct with kennel id and user jwt for following/unfollowing kennels
#[derive(Queryable, Serialize, Deserialize)]
struct KennelUser {
    kennel_name: String,
    token: String,
}

/** 
 * Method that unfollows a kennel
 * @param kennel: JSON of the kennel
 *
 * @return returns TBD
 */
#[post("/unfollow_kennel", data="<input>", rank=1)]
fn unfollow_kennel(input: Json<KennelUser>, connection: DbConn) -> () {
	
	
}

/** 
 * Method that follows a kennel
 * @param kennel: JSON of the kennel
 *
 * @return returns TBD
 */
#[post("/follow_kennel", data="<input>", rank=1)]
fn follow_kennel(input: Json<KennelUser>, connection: DbConn) -> Result<status::Accepted<String>, status::BadRequest<String>> {
	
	// Converts token into uuid
	let profile_uuid = auth::get_uuid_from_token(&input.token);
	
	// Make sure uuid was found
	if profile_uuid.is_nil() {
		return Err(status::BadRequest(Some("Profile not found".to_string())));
	}

	// Convert kennel name to uuid, check if not found
	let kennel_uuid = handlers::get_kennel_uuid_from_name(input.kennel_name.clone(), &connection);

	if kennel_uuid.is_nil() {

		// Kennel name could not convert to a uuid (not found)
		Err(status::BadRequest(Some("Kennel not foudn".to_string())))
	} else {

		// Attempt to insert the kennel follow to database
		handlers::follow(kennel_uuid, profile_uuid, &connection)
	}
}


/** 
 * Method that creates a kennel
 * @param kennel: JSON of the kennel
 *
 * @return returns TBD
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
    rocket.mount("/", routes![create_kennel, list_kennels, follow_kennel, unfollow_kennel, get_kennel])  
}