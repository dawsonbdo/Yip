use diesel;
use diesel::prelude::*;
use uuid::Uuid;
use crate::schema::kennels;
use crate::schema::kennel_follow_relationships;

use rocket::response::status;

/**
 * Helper method that returns the row corresponding to profile/kennel uuid if exists
 * @param kennel_uuid: the kennel uuid
 * @param profile_uuid: the profile uuid
 * @param connection: database connection
 *
 * @return returns a result containing DbFollowKennel if found, otherwise error
 */
fn get_relationship(kennel_uuid: Uuid, profile_uuid: Uuid, connection: &PgConnection) -> QueryResult<DbFollowKennel>{
    
    // Filters kennel follow relationship table
    kennel_follow_relationships::table
             .filter(kennel_follow_relationships::kennel.eq(kennel_uuid))
             .filter(kennel_follow_relationships::follower.eq(profile_uuid))
             .load::<DbFollowKennel>(&*connection)
}

/**
 * Method that gets returns all kennels in database
 * @param connection: database connection
 *
 * @return returns vector of all DbReviews
 */
pub fn all(connection: &PgConnection) -> QueryResult<Vec<DbKennel>> {

    // Loads all rows in kennel table
    kennels::table.load::<DbKennel>(&*connection)
}

/**
 * Method that gets a Kennel from the database
 * @param id: uuid of the kennel
 * @param connection: database connection
 *
 * @return returns DbKennel if found, otherwise error
 */
pub fn get(id: Uuid, connection: &PgConnection) -> QueryResult<DbKennel> {

    // Searches kennel table for the uuid and gets the kennel
    kennels::table.find(id).get_result::<DbKennel>(connection)
}

/**
 * Method that returns uuid of a kennel given the name
 * @param kennel_name: name of kennel
 * @param connection: database connection
 *
 * @return returns uuid of kennel if found, otherwise nil uuid
 */
pub fn get_kennel_uuid_from_name(kennel_name: String, connection: &PgConnection) -> Uuid {

    // Searches kennel table for the uuid and gets the kennel
    match kennels::table.filter(kennels::kennel_name.eq(kennel_name)).load::<DbKennel>(&*connection) {
        Ok(k) => k[0].kennel_uuid,
        Err(_e) => Uuid::nil()
    }

}

/**
 * Method that returns number of followers of a kennel
 * @param kennel_uuid: uuid of kennel
 * @param connection: database connection
 *
 * @return returns number of followers of kennel, 0 if does not exist
 */
pub fn get_follower_count(kennel_uuid: Uuid, connection: &PgConnection) -> i32{

    // Gets rows that match the kennel uuid
    let row = kennel_follow_relationships::table
             .filter(kennel_follow_relationships::kennel.eq(kennel_uuid))
             .load::<DbFollowKennel>(&*connection);

    // Return the number of rows found with the kennel uuid
    match row {
        Ok(r) => r.iter().len() as i32,
        Err(_e) => 0,
    }
}

/**
 * Unfollow Kennel: Method that attempts to unfollow a kennel
 */
pub fn unfollow(kennel_uuid: Uuid, profile_uuid: Uuid, connection: &PgConnection) -> Result<status::Accepted<String>, status::BadRequest<String>> {
    
    // Prints the uuids received
    println!("Kennel uuid: {}", kennel_uuid);
    println!("Profile uuid: {}", profile_uuid);
    
    // Gets DbKennelFollow of row to be deleted
    let row = get_relationship(kennel_uuid, profile_uuid, connection);

    // Check if row was foudn, and delete if so
    match row {
        Ok(r) => // Deletes kennel follow relationship from table
                match diesel::delete(&r[0])
                        .execute(connection){
                            Ok(_u) => Ok(status::Accepted(None)),
                            Err(e) => Err(status::BadRequest(Some(e.to_string()))),
                },
        Err(e) => Err(status::BadRequest(Some(e.to_string()))),
    }

}

/**
 * Method that attempts to follow a kennel
 * @param kennel_uuid: uuid of kennel
 * @param profile_uuid: uuid of user
 * @param connection: database connection
 *
 * @retun returns result of either Accepted or BadRequest status
 */
pub fn follow(kennel_uuid: Uuid, profile_uuid: Uuid, connection: &PgConnection) -> Result<status::Accepted<String>, status::BadRequest<String>> {
    
    // Prints the uuids received
    println!("Kennel uuid: {}", kennel_uuid);
    println!("Profile uuid: {}", profile_uuid);
    
    // Check if user already following kennel
    match get_relationship(kennel_uuid, profile_uuid, connection) {
        Ok(r) => if r.iter().len() > 0 {
                    return Err(status::BadRequest(Some("Already following".to_string())));
                 },
        Err(e) => return Err(status::BadRequest(Some(e.to_string()))),
    }

    // Creates object to be inserted to the follow kennel table
    let follow_kennel = FollowKennel {
        follower: profile_uuid,
        kennel: kennel_uuid,
    };

    // Inserts kennel into database, returns uuid generated
    match diesel::insert_into(kennel_follow_relationships::table)
        .values(follow_kennel)
        .get_result::<DbFollowKennel>(connection) {
            Ok(_u) => Ok(status::Accepted(None)),
            Err(e) => Err(status::BadRequest(Some(e.to_string()))),
        }
}

/**
 * Method that attempts to insert a new kennel into database
 * @param kennel: the Kennel object inserted
 * @param connection: database connection
 *
 * @retun returns result of either the uuid of the kennel or string with error msg
 */
pub fn insert(kennel: Kennel, connection: &PgConnection) -> Result<Uuid, String> {
    
    // Prints the Kennel information that was received 
    println!("Name: {}", kennel.kennel_name);
    println!("Tags: {}", kennel.tags[0]);
    //println!("Mods: {}", kennel.mods[0]);

    // Inserts kennel into database, returns uuid generated
    match diesel::insert_into(kennels::table)
        .values(&DbKennel::from_kennel(kennel, connection))
        .get_result::<DbKennel>(connection) {
            Ok(u) => Ok(u.kennel_uuid),
            Err(e) => Err(e.to_string()),
        }
}

/**
 * Method that attempts to edit a  kennel in database
 * @param id: the uuid of kennel
 * @param kennel: the updated Kennel object
 * @param connection: database connection
 *
 * @retun returns bool indicating if successfuly edited by updating database
 */
pub fn update(id: Uuid, kennel: Kennel, connection: &PgConnection) -> bool {
    match diesel::update(kennels::table.find(id))
        .set(&DbKennel::from_kennel(kennel, connection))
        .get_result::<DbKennel>(connection) {
            Ok(_u) => return true,
            Err(_e) => return false,
        }
}

/**
 * Method that attempts to insert a new kennel into database
 * @param kennel: the Kennel object inserted
 * @param connection: database connection
 *
 * @retun returns result of either the uuid of the kennel or string with error msg
 */
pub fn delete(id: Uuid, connection: &PgConnection) -> QueryResult<usize> {
    diesel::delete(kennels::table.find(id))
        .execute(connection)
}

// Struct representing the fields of kennel follow table
#[derive(Insertable, AsChangeset, Queryable, Serialize, Deserialize)]
#[table_name = "kennel_follow_relationships"]
pub struct FollowKennel {
    pub follower: Uuid,
    pub kennel: Uuid,
}

// Struct representing the fields of kennel follow table that is returned by DB
#[derive(Insertable, Identifiable, AsChangeset, Queryable, Serialize, Deserialize)]
#[table_name = "kennel_follow_relationships"]
pub struct DbFollowKennel {
    pub follower: Uuid,
    pub kennel: Uuid,
    pub id: i32,
}


// Struct representing the fields of a kennel passed in from frontend contains
#[derive(Queryable, Serialize, Deserialize)]
pub struct Kennel {
    pub kennel_uuid: String,
    pub tags: Vec<String>,
    pub kennel_name: String,
}

// Struct represneting the fields of a kennel that is inserted into database
#[derive(Insertable, AsChangeset, Queryable, Serialize, Deserialize)]
#[table_name = "kennels"]
pub struct DbKennel {
    pub kennel_uuid: Uuid,
    pub tags: Option<Vec<String>>,
    pub kennel_name: String,
    pub follower_count: Option<i32>,
}

// Converts a Kennel to an DbKennel by calling functions on passed in values
impl DbKennel{

    fn from_kennel(kennel: Kennel, connection: &PgConnection) -> DbKennel {
        let uuid = get_kennel_uuid_from_name(kennel.kennel_name.clone(), connection);

        DbKennel{
            kennel_uuid: if uuid.is_nil() {Uuid::new_v4()} else {uuid}, // generate random uuid for kennel
            kennel_name: kennel.kennel_name,
            tags: Some(kennel.tags),
            follower_count: Some(get_follower_count(uuid, connection)),
        }
    }

}