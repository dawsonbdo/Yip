use diesel;
use diesel::prelude::*;
use uuid::Uuid;
use crate::schema::kennels;

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