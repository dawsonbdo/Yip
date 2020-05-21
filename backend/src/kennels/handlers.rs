use diesel;
use diesel::prelude::*;
use uuid::Uuid;
use crate::schema::kennels;
use crate::schema::kennel_follow_relationships;
use crate::schema::kennel_bans;
use crate::auth;
use rocket::response::status;


/**
 * Converts a Kennel to an DbKennel by calling functions on passed in values
 * @param kennel: the Kennel object
 * @param connection: the database connection
 *
 * @return returns DbKennel object
 */
fn from_kennel(kennel: Kennel, connection: &PgConnection) -> DbKennel {
    let uuid = get_kennel_uuid_from_name(kennel.kennel_name.clone(), connection);
    let mod_id = get_kennel_mod_uuid_from_name(kennel.kennel_name.clone(), connection);

    DbKennel{
        kennel_uuid: if uuid.is_nil() {Uuid::new_v4()} else {uuid}, // generate random uuid for kennel
        kennel_name: kennel.kennel_name,
        tags: if kennel.muted_words.iter().len() == 0 {None} else {Some(kennel.tags)},
        follower_count: get_follower_count(uuid, connection),
        muted_words: if kennel.muted_words.iter().len() == 0 {None} else {Some(kennel.muted_words)},
        rules: if kennel.rules.eq("") {None} else {Some(kennel.rules.clone())},
        mod_uuid: if mod_id.is_nil() {auth::get_uuid_from_token(&kennel.token)} else {mod_id},
    }
}

/**
 * Method that returns the row corresponding to profile/kennel uuid if exists
 * @param kennel_uuid: the kennel uuid
 * @param profile_uuid: the profile uuid
 * @param connection: database connection
 *
 * @return returns a result containing number of rows affected (1 if relationship exists)
 */
pub fn get_relationship_ban(kennel_uuid: Uuid, profile_uuid: Uuid, connection: &PgConnection) -> QueryResult<usize>{
    
    // Filters kennel follow relationship table
    kennel_bans::table
             .filter(kennel_bans::kennel.eq(kennel_uuid))
             .filter(kennel_bans::banned_reviewer.eq(profile_uuid))
             .execute(connection)
}

/**
 * Method that attempts to ban users from a kennel
 * @param kennel_uuid: uuid of kennel
 * @param users: vector of uuids of users
 * @param connection: database connection
 *
 * @retun returns result of either Accepted or BadRequest status
 */
pub fn ban_users(kennel_uuid: Uuid, users: Vec<Uuid>, connection: &PgConnection) -> Result<status::Accepted<String>, status::Unauthorized<String>> {

    let mut bans : Vec<KennelBan> = vec![];

    // Create vector of KennelBans to insert
    for user_uuid in users{
        bans.push(
            KennelBan{
                banned_reviewer: user_uuid,
                kennel: kennel_uuid,
            }
        );
    }



    // Inserts bans into database, returns uuid generated
    match diesel::insert_into(kennel_bans::table)
        .values(&bans)
        .execute(connection) {
            Ok(u) => if u == 0 {Err(status::Unauthorized(Some("All users already banned".to_string())))} else {Ok(status::Accepted(None))},
            Err(e) => Err(status::Unauthorized(Some(e.to_string()))),
    }
}

/**
 * Helper method that converts DbKennel to DisplayKennel
 * @param kennel: the DbKennel
 * @param token: user token
 * @param connection: database connection
 *
 * @return returns a DisplayKennel
 */
pub fn to_display_kennel(kennel: &DbKennel, token: String, connection: &PgConnection) -> DisplayKennel {

    // Converts token into uuid
    let profile_uuid = auth::get_uuid_from_token(&token);

    // Temp
    let empty_vec : Vec<String> = vec![];
    let empty_vec2 : Vec<String> = vec![];

    // Return display kennel created
    DisplayKennel {
        kennel_uuid: kennel.kennel_uuid,
        tags: match &kennel.tags{
            Some(t) => Some(t.to_vec()),
            None => Some(empty_vec),
        },
        kennel_name: kennel.kennel_name.clone(),
        follower_count: kennel.follower_count,
        is_following: match get_relationship(kennel.kennel_uuid, profile_uuid, connection){
                        Ok(u) => u != 0,
                        Err(_e) => false,
                      },
        is_moderator: kennel.mod_uuid.eq(&profile_uuid), 
        is_banned: match super::super::kennels::handlers::get_relationship_ban(kennel.kennel_uuid, profile_uuid, &connection){
                        Ok(rel) => rel == 1,
                        Err(e) => false,
                    }, 
        muted_words: match &kennel.muted_words{
            Some(w) => Some(w.to_vec()),
            None => Some(empty_vec2),
        },
        rules: match &kennel.rules{
            Some(r) => r.to_string(),
            None => "".to_string(),
        },
    }

}

/**
 * Method that returns the row corresponding to profile/kennel uuid if exists
 * @param kennel_uuid: the kennel uuid
 * @param profile_uuid: the profile uuid
 * @param connection: database connection
 *
 * @return returns a result containing number of rows affected (1 if relationship exists)
 */
pub fn get_relationship(kennel_uuid: Uuid, profile_uuid: Uuid, connection: &PgConnection) -> QueryResult<usize>{
    
    // Filters kennel follow relationship table
    kennel_follow_relationships::table
             .filter(kennel_follow_relationships::kennel.eq(kennel_uuid))
             .filter(kennel_follow_relationships::follower.eq(profile_uuid))
             .execute(connection)
}

/**
 * Method that gets returns all kennels that user is following
 * @param id: uuid of user
 * @param connection: database connection
 *
 * @return returns vector of all DbKennels
 */
pub fn all_user_kennels(id: Uuid, connection: &PgConnection) -> QueryResult<Vec<DbKennel>> {

    // Loads all rows in kennel table
    let follow_kennels = kennel_follow_relationships::table
            .filter(kennel_follow_relationships::follower.eq(id))
            .load::<DbFollowKennel>(&*connection);

    // Take the kennel ids and convert to DbKennels
    let mut kennels = vec![];

    // Make sure no error with loading the kennels
    match follow_kennels {
        Ok(k) => {
            for f in k.iter(){
                kennels.push(get(f.kennel, connection).unwrap());
            }
        },
        Err(e) => return Err(e),
    }

    Ok(kennels)
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
 * Method that returns DbKennel given the name
 * @param kennel_name: name of kennel
 * @param connection: database connection
 *
 * @return returns Kennel of kennel name if found, otherwise err
 */
pub fn get_kennel_from_name(kennel_name: String, connection: &PgConnection) -> QueryResult<DbKennel>  {

    // Searches kennel table for the name and gets the kennel
    kennels::table.filter(kennels::kennel_name.eq(kennel_name)).get_result::<DbKennel>(&*connection)
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
    match kennels::table.filter(kennels::kennel_name.eq(kennel_name)).get_result::<DbKennel>(&*connection) {
        Ok(k) => k.kennel_uuid,
        Err(_e) => Uuid::nil()
    }

}

/**
 * Method that returns uuid of a mod of a kennel given the name
 * @param kennel_name: name of kennel
 * @param connection: database connection
 *
 * @return returns uuid of kennel if found, otherwise nil uuid
 */
pub fn get_kennel_mod_uuid_from_name(kennel_name: String, connection: &PgConnection) -> Uuid {

    // Searches kennel table for the uuid and gets the kennel
    match kennels::table.filter(kennels::kennel_name.eq(kennel_name)).get_result::<DbKennel>(&*connection) {
        Ok(k) => k.mod_uuid,
        Err(_e) => Uuid::nil()
    }

}

/**
 * Method that updates the number of followers of a kennel in DB
 * @param kennel_uuid: uuid of kennel
 * @param connection: database connection
 *
 * @return N/A
 */
pub fn update_kennel_followers(kennel_uuid: Uuid, connection: &PgConnection) -> QueryResult<usize>{

    // Get kennel from uuid
    let _kennel = get(kennel_uuid, connection)?;

    // Get new follower count
    let new_count = get_follower_count(kennel_uuid, connection);

    println!("Kennel Id: {} New Count: {}", kennel_uuid, new_count);

    // Make sure it was found
    diesel::update(kennels::table.find(kennel_uuid))
                        .set(kennels::columns::follower_count.eq(new_count))
                        .execute(connection)
}

/**
 * Method that returns number of followers of a kennel
 * @param kennel_uuid: uuid of kennel
 * @param connection: database connection
 *
 * @return returns number of followers of kennel, 0 if does not exist
 */
pub fn get_follower_count(kennel_uuid: Uuid, connection: &PgConnection) -> i32 {

    // Gets rows that match the kennel uuid
    let row = kennel_follow_relationships::table
             .filter(kennel_follow_relationships::kennel.eq(kennel_uuid))
             .execute(connection);

    // Return the number of rows found with the kennel uuid
    match row {
        Ok(r) => r as i32,
        Err(_e) => 0,
    }
}

/**
 * Method that attempts to unfollow a kennel
 * @param kennel_uuid: uuid of kennel
 * @param profile_uuid: uuid of user
 * @param connection: database connection
 *
 * @retun returns result of either Accepted or BadRequest status
 */
pub fn unfollow(kennel_uuid: Uuid, profile_uuid: Uuid, connection: &PgConnection) -> Result<status::Accepted<String>, status::BadRequest<String>> {
    
    // Prints the uuids received
    println!("Kennel uuid: {}", kennel_uuid);
    println!("Profile uuid: {}", profile_uuid);
    
    // Deletes kennel follow relationship from table
    match diesel::delete(kennel_follow_relationships::table
                  .filter(kennel_follow_relationships::kennel.eq(kennel_uuid))
                  .filter(kennel_follow_relationships::follower.eq(profile_uuid)))
                  .execute(connection){
        Ok(u) => if u == 0 {Err(status::BadRequest(Some("Not following already".to_string())))} else {Ok(status::Accepted(None))},
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
    
    // Creates object to be inserted to the follow kennel table
    let follow_kennel = FollowKennel {
        follower: profile_uuid,
        kennel: kennel_uuid,
    };

    // Inserts kennel into database, returns uuid generated
    match diesel::insert_into(kennel_follow_relationships::table)
        .values(follow_kennel)
        .execute(connection) {
            Ok(u) => if u == 0 {Err(status::BadRequest(Some("Following already".to_string())))} else {Ok(status::Accepted(None))},
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

    for i in 0..kennel.tags.iter().len(){
        println!("Tag ({}): {}", i, kennel.tags[i]);
    }
    //println!("Mods: {}", kennel.mods[0]);

    // Inserts kennel into database, returns uuid generated
    match diesel::insert_into(kennels::table)
        .values(from_kennel(kennel, connection))
        .get_result::<DbKennel>(connection) {
            Ok(u) => Ok(u.kennel_uuid),
            Err(e) => Err(e.to_string()),
        }
}

/**
 * Method that attempts to edit a  kennel in database
 * @param kennel: the updated Kennel object
 * @param connection: database connection
 *
 * @retun returns query result with size
 */
pub fn update(mod_id: Uuid, kennel: Kennel, connection: &PgConnection) -> QueryResult<usize> {
    // Check that token is moderator of kennel and update
    diesel::update(kennels::table
                  .filter(kennels::kennel_name.eq(kennel.kennel_name.clone()))
                  .filter(kennels::mod_uuid.eq(mod_id)))
        .set(from_kennel(kennel, connection))
        .execute(connection)
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

// Struct representing the fields of kennel ban table
#[derive(Insertable, AsChangeset, Queryable, Serialize, Deserialize)]
#[table_name = "kennel_bans"]
pub struct KennelBan {
    pub banned_reviewer: Uuid,
    pub kennel: Uuid,
}

// Struct representing the fields of kennel ban returned by DB
#[derive(Insertable, AsChangeset, Queryable, Serialize, Deserialize)]
#[table_name = "kennel_bans"]
pub struct DbKennelBan {
    pub pkey: i64,
    pub banned_reviewer: Uuid,
    pub kennel: Uuid,
}

// Struct representing the fields of kennel follow table
#[derive(Insertable, AsChangeset, Queryable, Serialize, Deserialize)]
#[table_name = "kennel_follow_relationships"]
pub struct FollowKennel {
    pub follower: Uuid,
    pub kennel: Uuid,
}

// Struct representing the fields of kennel follow table that is returned by DB
#[derive(Insertable, AsChangeset, Queryable, Serialize, Deserialize)]
#[table_name = "kennel_follow_relationships"]
pub struct DbFollowKennel {
    pub pkey: i64,
    pub follower: Uuid,
    pub kennel: Uuid,
}


// Struct representing the fields of a kennel passed in from frontend contains
#[derive(Queryable, Serialize, Deserialize)]
pub struct Kennel {
    pub kennel_uuid: String,
    pub tags: Vec<String>,
    pub kennel_name: String,
    pub muted_words: Vec<String>,
    pub rules: String,
    pub token: String,
}

// Struct represneting the fields of a kennel that is inserted into database
#[derive(Insertable, AsChangeset, Queryable, Serialize, Deserialize)]
#[table_name = "kennels"]
pub struct DbKennel {
    pub kennel_uuid: Uuid,
    pub tags: Option<Vec<String>>,
    pub kennel_name: String,
    pub follower_count: i32,
    pub muted_words: Option<Vec<String>>,
    pub rules: Option<String>,
    pub mod_uuid: Uuid,
}

// Struct represneting the fields of a kennel that is returned to frontend
#[derive(Queryable, Serialize, Deserialize)]
pub struct DisplayKennel {
    pub kennel_uuid: Uuid,
    pub tags: Option<Vec<String>>,
    pub kennel_name: String,
    pub follower_count: i32,
    pub is_following: bool,
    pub is_moderator: bool,
    pub is_banned: bool,
    pub muted_words: Option<Vec<String>>,
    pub rules: String,
}