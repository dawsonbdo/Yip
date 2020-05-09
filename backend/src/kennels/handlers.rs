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
 * CREATE KENNEL: Method that attempts to create a new kennel in database, returns URL? 
 */
pub fn insert(kennel: Kennel, connection: &PgConnection) -> bool {
    // Prints the Kennel information that was received (register)
    println!("Name: {}", kennel.name);
    println!("Tags: {}", kennel.tags[0]);
    println!("Mods: {}", kennel.mods[0]);

    // Inserts kennel into database, returns uuid generated
    match diesel::insert_into(kennels::table)
        .values(&DbKennel::from_kennel(kennel))
        .get_result::<DbKennel>(connection) {
            Ok(_u) => return true,
            Err(_e) => return false,
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
#[derive(Queryable, AsChangeset, Serialize, Deserialize)]
#[table_name = "kennels"]
pub struct Kennel {
    pub name: String,
    pub tags: Vec<String>,
    pub mods: Vec<Uuid>,
}

// Struct represneting the fields of a kennel that is inserted into database
#[derive(Insertable, AsChangeset, Queryable, Serialize, Deserialize)]
#[table_name = "kennels"]
pub struct DbKennel {
    pub id: Uuid,
    pub name: String,
    pub tags: Vec<String>,
    pub mods: Vec<Uuid>,
}

// Converts a Kennel to an DbKennel by calling functions on passed in values
impl DbKennel{

    fn from_kennel(kennel: Kennel) -> DbKennel {
        DbKennel{
            id: Uuid::new_v4(), // generate random uuid for kennel
            name: kennel.name,
            tags: kennel.tags,
            mods: kennel.mods,
        }
    }

}