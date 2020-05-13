pub mod handlers;

use crate::db;

use handlers::Message;
use rocket_contrib::json::Json;

use db::DbConn;

use rocket::response::status;


/** 
 * Method that creates a message
 * @param kennel: JSON of the message
 *
 * @return returns TBD
 */
#[post("/create_message", data="<message>", rank=1)]
fn create_message(message: Json<Message>, connection: DbConn) -> Result<status::Accepted<String>, status::Conflict<String>> {
	
	// Attempt to insert report into database 
	let successful_message = handlers::insert(message.into_inner(), &connection);
	
	// Check if successful insertion into database
	match successful_message {
		Ok(_id) => Ok(status::Accepted(None)),
		Err(e) => Err(status::Conflict(Some(e.to_string()))),
	}
	
}

/**
 * Mount the message routes
 */
pub fn mount(rocket: rocket::Rocket) -> rocket::Rocket {
    rocket.mount("/", routes![create_message])  
}