use diesel;
use diesel::prelude::*;
use uuid::Uuid;
use crate::schema::messages;

use chrono::NaiveDateTime;

use crate::auth;

/**
 * Method that returns a vector with all of the messages
 */
pub fn all(connection: &PgConnection) -> QueryResult<Vec<DbMessage>> {
    messages::table.load::<DbMessage>(&*connection)
}

/**
 * LOAD MESSAGE: Method that returns a DbMessage given the uuid
 */
pub fn get(id: Uuid, connection: &PgConnection) -> QueryResult<DbMessage> {

    // Searches message table for the uuid and gets the message
    messages::table.find(id).get_result::<DbMessage>(connection)
}

/**
 * CREATE MESSAGE: Method that attempts to create a new message in database, returns URL? 
 */
pub fn insert(message: Message, connection: &PgConnection) -> Result<Uuid, String> {
    // Prints the Message information that was received (register)
    println!("Text: {}", message.text);
    println!("Recipient: {}", message.recipient);

    // Inserts message into database, returns uuid generated
    match diesel::insert_into(messages::table)
        .values(&DbMessage::from_message(message, connection))
        .get_result::<DbMessage>(connection) {
            Ok(m) => Ok(m.message_uuid),
            Err(e) => Err(e.to_string()),
        }
}

/**
 * EDIT Message: Method that updates a message in database
 */
pub fn update(id: Uuid, message: Message, connection: &PgConnection) -> bool {
    match diesel::update(messages::table.find(id))
        .set(&DbMessage::from_message(message, connection))
        .get_result::<DbMessage>(connection) {
            Ok(_u) => return true,
            Err(_e) => return false,
        }
}

/**
 * DELETE Message: Method that removes a message in database
 */
pub fn delete(id: Uuid, connection: &PgConnection) -> QueryResult<usize> {
    diesel::delete(messages::table.find(id))
        .execute(connection)
}


// Struct representing the fields of a message passed in from frontend contains
#[derive(Queryable, Serialize, Deserialize)]
pub struct Message {
    pub sender: String, //token
    pub recipient: String, //recipient username
    pub text: String,
    pub timestamp: String,
}

// Struct represneting the fields of a message that is inserted into database
#[derive(Insertable, AsChangeset, Queryable, Serialize, Deserialize)]
#[table_name = "messages"]
pub struct DbMessage {
    pub message_uuid: Uuid,
    pub sender: Uuid, 
    pub recipient: Uuid, 
    pub text: String,
    pub timestamp: Option<NaiveDateTime>,
}

// Converts a Message to an DbMessage by calling functions on passed in values
impl DbMessage{

    fn from_message(message: Message, connection: &PgConnection) -> DbMessage {
        DbMessage{
            message_uuid: Uuid::new_v4(),
            sender: auth::get_uuid_from_token(&message.sender), 
            recipient: super::super::users::handlers::get_uuid_from_username(&message.recipient, connection),
            text: message.text,
            timestamp: match NaiveDateTime::parse_from_str(&message.timestamp, "%Y-%m-%d %H:%M:%S") {
                Ok(t) => Some(t),
                Err(e) => None,
            },
        }
    }

}