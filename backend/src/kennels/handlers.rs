use diesel;
use diesel::prelude::*;
use uuid::Uuid;
use crate::schema::kennels;
use crate::schema::kennel_follow_relationships;

use rocket::response::status;


/**
 * Method that returns a vector with all of the kennels
 */
pub fn all(connection: &PgConnection) -> QueryResult<Vec<DbKennel>> {
    kennels::table.load::<DbKennel>(&*connection)
}

/**
 * LOAD KENNEL: Method that returns a DbKennel given the uuid
 */
pub fn get(id: Uuid, connection: &PgConnection) -> QueryResult<DbKennel> {

    // Searches kennel table for the uuid and gets the kennel
    kennels::table.find(id).get_result::<DbKennel>(connection)
}

/**
 * Return uuid of a kennel given the name
 */
pub fn get_kennel_uuid_from_name(kennel_name: String, connection: &PgConnection) -> Uuid {

    // Searches kennel table for the uuid and gets the kennel
    match kennels::table.filter(kennels::kennel_name.eq(kennel_name)).load::<DbKennel>(&*connection) {
        Ok(k) => k[0].kennel_uuid,
        Err(_e) => Uuid::nil()
    }

}

/**
 * Returns number of followers in kennel
 */
pub fn get_follower_count(kennel_uuid: Uuid, connection: &PgConnection) -> i32{

    // Gets rows that match the kennel uuid
    let row = kennel_follow_relationships::table
             .filter(kennel_follow_relationships::kennel.eq(kennel_uuid))
             .load::<DbFollowKennel>(&*connection);

    // Return the number of rows found with the kennel uuid
    match row {
        Ok(r) => r.iter().len(),
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
    let row = kennel_follow_relationships::table
             .filter(kennel_follow_relationships::kennel.eq(kennel_uuid))
             .filter(kennel_follow_relationships::follower.eq(profile_uuid))
             .load::<DbFollowKennel>(&*connection);

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
 * Follow Kennel: Method that attempts to follow a kennel
 */
pub fn follow(kennel_uuid: Uuid, profile_uuid: Uuid, connection: &PgConnection) -> Result<status::Accepted<String>, status::BadRequest<String>> {
    // Prints the uuids received
    println!("Kennel uuid: {}", kennel_uuid);
    println!("Profile uuid: {}", profile_uuid);
    
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
 * CREATE KENNEL: Method that attempts to create a new kennel in database, returns URL? 
 */
pub fn insert(kennel: Kennel, connection: &PgConnection) -> Result<Uuid, String> {
    // Prints the Kennel information that was received (register)
    println!("Name: {}", kennel.kennel_name);
    println!("Tags: {}", kennel.tags[0]);
    //println!("Mods: {}", kennel.mods[0]);

    // Inserts kennel into database, returns uuid generated
    match diesel::insert_into(kennels::table)
        .values(&DbKennel::from_kennel(kennel))
        .get_result::<DbKennel>(connection) {
            Ok(u) => Ok(u.kennel_uuid),
            Err(e) => Err(e.to_string()),
        }
}

/**
 * EDIT Kennel: Method that updates a kennel in database
 */
pub fn update(id: Uuid, kennel: Kennel, connection: &PgConnection) -> bool {
    match diesel::update(kennels::table.find(id))
        .set(&DbKennel::from_kennel(kennel))
        .get_result::<DbKennel>(connection) {
            Ok(_u) => return true,
            Err(_e) => return false,
        }
}

/**
 * DELETE KENNEL: Method that removes a kennel in database
 */
pub fn delete(id: Uuid, connection: &PgConnection) -> QueryResult<usize> {
    diesel::delete(kennels::table.find(id))
        .execute(connection)
}

// Struct represneting the fields of kennel follow table
#[derive(Insertable, AsChangeset, Queryable, Serialize, Deserialize)]
#[table_name = "kennel_follow_relationships"]
pub struct FollowKennel {
    pub follower: Uuid,
    pub kennel: Uuid,
}

// Struct represneting the fields of kennel follow table that is returned by DB
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
}

// Converts a Kennel to an DbKennel by calling functions on passed in values
impl DbKennel{

    fn from_kennel(kennel: Kennel) -> DbKennel {
        DbKennel{
            kennel_uuid: Uuid::new_v4(), // generate random uuid for kennel
            kennel_name: kennel.kennel_name,
            tags: Some(kennel.tags),
        }
    }

}