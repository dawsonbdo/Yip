pub mod handlers;

use crate::db;
use crate::auth;
extern crate priority_queue;
use handlers::{Message, DisplayMessage, UserTimestamp};
use rocket_contrib::json::Json;

use db::DbConn;

use rocket::response::status;

/** 
 * Method that returns list of all past usernames that sender has message/received msgs from
 * @param sender: token of sender
 * @param connection: database connection
 *
 * @return returns TBD
 */
#[get("/get_past_recipients/<sender>")]
fn get_past_recipients(sender: String, connection: DbConn) -> Result<Json<Vec<UserTimestamp>>, status::Conflict<String>> {
	
	println!("Sender: {}", sender);

	// Get uuid of sender
	let sender_uuid = auth::get_uuid_from_token(&sender);

	// Make sure uuids not nil
	if sender_uuid.is_nil() {
		return Err(status::Conflict(Some("Invalid sender".to_string())));
	}

	// Get all messages where sender matches sender or recipient 
	match handlers::all_user_messages(sender_uuid, &connection){
		Ok(v) => Ok(Json(v)),
		Err(e) => Err(status::Conflict(Some(e.to_string()))),
	}
}

/** 
 * Method that returns all messages between a user and 
 * @param sender: token of sender
 * @param recipient: name of recipient
 * @param connection: database connection
 *
 * @return returns TBD
 */
#[get("/load_messages/<sender>/<recipient>")]
fn load_messages(sender: String, recipient: String, connection: DbConn) -> Result<Json<Vec<DisplayMessage>>, status::Conflict<String>> {
	
	println!("Sender: {} Recipient: {}", sender, recipient);

	// Get uuid of sender
	let sender_uuid = auth::get_uuid_from_token(&sender);

	// Get uuid of recipient
	let recipient_uuid = super::users::handlers::get_uuid_from_username(&recipient, &connection);

	// Make sure neither uuids are nil
	if sender_uuid.is_nil() || recipient_uuid.is_nil() {
		return Err(status::Conflict(Some("Invalid sender or recipient".to_string())));
	}

	// Get all messages
	match handlers::all_messages(sender_uuid, recipient_uuid, &connection) {
		Ok(msgs) => {
			// Sort by timestamp
			let mut pq = priority_queue::PriorityQueue::new();
			
			// Sort reviews by hotness using pq (greatest NaiveDateTime value)
			for m in msgs {
			    //let timestamp = r.timestamp;
			    let timestamp = m.timestamp;
			    pq.push(m, timestamp);
			}  

			// Create a vector with all of the reviews to as ordered
			let mut messages_ordered : Vec<DisplayMessage> = vec![];

			// Order by newness for now 
			for (msg, _) in pq.into_sorted_iter() {

				messages_ordered.push(msg);
			}

			Ok(Json(messages_ordered))
		},
		Err(e) => Err(status::Conflict(Some(e.to_string()))),
	}	
}

/** 
 * Method that creates a message
 * @param kennel: JSON of the message
 *
 * @return returns TBD
 */
#[post("/create_message", data="<message>", rank=1)]
fn create_message(message: Json<Message>, connection: DbConn) -> Result<status::Accepted<String>, status::Conflict<String>> {
	
	// Attempt to insert message into database 
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
    rocket.mount("/", routes![create_message, load_messages, get_past_recipients])  
}