pub mod handlers;

use crate::auth;
use crate::db;

use handlers::Kennel;
use rocket_contrib::json::Json;

use db::DbConn;
use uuid::Uuid;

use rocket::response::status;

// Struct with kennel id and user jwt for following/unfollowing kennels
#[derive(Queryable, Serialize, Deserialize)]
struct KennelUser {
    kennelid: String,
    token: String,
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

/** 
 * Method that creates a kennel
 * @param kennel: JSON of the kennel
 *
 * @return returns TBD
 */
#[post("/unfollow_kennel", data="<input>", rank=1)]
fn unfollow_kennel(input: Json<KennelUser>, connection: DbConn) -> () {
	
	
}

/** 
 * Method that creates a kennel
 * @param kennel: JSON of the kennel
 *
 * @return returns TBD
 */
#[post("/follow_kennel", data="<input>", rank=1)]
fn follow_kennel(input: Json<KennelUser>, connection: DbConn) -> () {
	
	
}


/** 
 * Method that creates a kennel
 * @param kennel: JSON of the kennel
 *
 * @return returns TBD
 */
#[post("/create_kennel", data="<kennel>", rank=1)]
fn create_kennel(kennel: Json<Kennel>, connection: DbConn) -> () {
	
	
}

/**
 * Mount the review routes
 */
pub fn mount(rocket: rocket::Rocket) -> rocket::Rocket {
    rocket.mount("/", routes![create_kennel, list_kennels, follow_kennel, unfollow_kennel])  
}