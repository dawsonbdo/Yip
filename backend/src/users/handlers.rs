use diesel;
use diesel::prelude::*;
use crate::schema::users;
use crate::schema::block_relationships;
use crate::schema::reviewer_follow_relationships;
use uuid::Uuid;
extern crate bcrypt;

use rocket::response::status;

/**
 * Helper method that returns the row corresponding to follow/followee uuid if exists
 * @param blocker: the blockee uuid
 * @param blockee: the blockee uuid
 * @param connection: database connection
 *
 * @return returns a result containing vector of DbBlockUser if found, otherwise error
 */
fn get_follow_relationship(follower: Uuid, followee: Uuid, connection: &PgConnection) -> QueryResult<Vec<DbFollowUser>>{
    
    // Filters block relationship table
    reviewer_follow_relationships::table
             .filter(reviewer_follow_relationships::follower.eq(follower))
             .filter(reviewer_follow_relationships::followee.eq(followee))
             .load::<DbFollowUser>(&*connection)
}

/**
 * Helper method that returns the row corresponding to blocker/blockee uuid if exists
 * @param blocker: the blockee uuid
 * @param blockee: the blockee uuid
 * @param connection: database connection
 *
 * @return returns a result containing vector of DbBlockUser if found, otherwise error
 */
fn get_block_relationship(blocker: Uuid, blockee: Uuid, connection: &PgConnection) -> QueryResult<Vec<DbBlockUser>>{
    
    // Filters block relationship table
    block_relationships::table
             .filter(block_relationships::blocker.eq(blocker))
             .filter(block_relationships::blockee.eq(blockee))
             .load::<DbBlockUser>(&*connection)
}

/**
 * Method that returns a vector with all of the users in database
 * @param connection: database connection
 *
 * @return returns a vector of DbUsers
 */
pub fn all(connection: &PgConnection) -> QueryResult<Vec<DbUser>> {
    users::table.load::<DbUser>(&*connection)
}

/**
 * Method for logging in by checking if User details are in database
 * @param user: the User object that is being verified
 *
 * @return returns Uuid of User, nil if unsuccsesful login
 */
pub fn get(user: User, connection: &PgConnection) -> Uuid {

    // Prints the User information that was sent (login)
    println!("Login: {}", user.email);
    println!("Password: {}", user.password);

    // Searches columns for user with username and email and gets User if found
    let username_search = users::table.filter(users::username.eq(user.username)).load::<DbUser>(&*connection).expect("Error");
    let email_search = users::table.filter(users::email.eq(user.email)).load::<DbUser>(&*connection).expect("Error");

    // Checks if User with username was found
    if username_search.iter().len() > 0 {

        // Check if the password matches the password of the User in database
        if bcrypt::verify(&user.password, &username_search[0].password).expect("Error") {

            // Returns UUID
            return username_search[0].profile_uuid;
        }


    } else if email_search.iter().len() > 0 { // Checks if User with email was found

        // Check if the password matches the password of the User in database
        if bcrypt::verify(&user.password, &email_search[0].password).expect("Error") {

            // Returns UUID
            return email_search[0].profile_uuid;
        }

    }

    // Password incorrect or email incorrect, return nil UUID
    Uuid::nil()
}


/**
 * Method for checking if username and email are linked to same account
 * @param username: the username
 * @param email: the email
 * @param connection: database connection
 *
 * @return returns Uuid of User, nil if username/email not linked
 */
pub fn username_email_linked(username: &str, email: &str, connection: &PgConnection) -> Uuid {

    // Looks for username in database, if found and username/email belong to same uuid, returns uuid
    match users::table.filter(users::username.eq(username)).load::<DbUser>(&*connection){
        Ok(u) => if u.iter().len() != 0 && u[0].username.eq(username) && u[0].email.eq(email) { u[0].profile_uuid } else { Uuid::nil() },
        Err(_e) => Uuid::nil(),
    }

}

/**
 * Method that returns uuid of a user given their username
 * @param username: the username
 * @param connection: database connection
 *
 * @return returns Uuid of User, nil if username does not exist in database
 */
pub fn get_uuid_from_username(username: &str, connection: &PgConnection) -> Uuid {
    match users::table.filter(users::username.eq(username)).load::<DbUser>(&*connection){
        Ok(u) => u[0].profile_uuid,
        Err(_e) => Uuid::nil(),
    }
}

/**
 * Method that returns username of a user given their uuid
 * @param id: the uuid
 * @param connection: database connection
 *
 * @return returns DbUser if found, otherwise error string
 */
pub fn get_user_from_uuid(id: Uuid, connection: &PgConnection) -> Result<DbUser, String> {
    match users::table.find(id).get_result::<DbUser>(connection){
        Ok(u) => Ok(u),
        Err(e) => Err(e.to_string()),
    }
}

/**
 * Method for unfollowing another user
 * @param follower: the object that is being created potentially
 * @param followee: the user that is being followed
 * @param connection: database connection
 *
 * @return returns Uuid of User if created, otherwise String indicating
 * which unique fields are taken (email/username)
 */
pub fn unfollow(follower: Uuid, followee: Uuid, connection: &PgConnection) -> Result<status::Accepted<String>, status::Conflict<String>> {
    // Prints the information that was received
    println!("Follower: {}", follower);
    println!("Followee: {}", followee);

    // Creates object to be inserted to the follow kennel table
    let follow_user = FollowUser {
        follower: follower,
        followee: followee,
    };

    // Deletes kennel from database, returns uuid generated
    

    match diesel::delete(reviewer_follow_relationships::table
             .filter(reviewer_follow_relationships::follower.eq(follower))
             .filter(reviewer_follow_relationships::followee.eq(followee)))
             .execute(connection) {
            Ok(_u) => Ok(status::Accepted(None)),
            Err(e) => Err(status::Conflict(Some(e.to_string()))),
        }
    
}

/**
 * Method for following another user
 * @param follower: the object that is being created potentially
 * @param followee: the user that is being followed
 * @param connection: database connection
 *
 * @return returns Uuid of User if created, otherwise String indicating
 * which unique fields are taken (email/username)
 */
pub fn follow(follower: Uuid, followee: Uuid, connection: &PgConnection) -> Result<status::Accepted<String>, status::Conflict<String>> {
    // Prints the information that was received
    println!("Follower: {}", follower);
    println!("Followee: {}", followee);

    // Check if blocker already blocking blockee
    match get_follow_relationship(follower, followee, connection) {
        Ok(r) => if r.iter().len() > 0 {
                    return Err(status::Conflict(Some("Already following".to_string())));
                 },
        Err(e) => return Err(status::Conflict(Some(e.to_string()))),
    }

    // Creates object to be inserted to the follow kennel table
    let follow_user = FollowUser {
        follower: follower,
        followee: followee,
    };

    // Inserts kennel into database, returns uuid generated
    match diesel::insert_into(reviewer_follow_relationships::table)
        .values(follow_user)
        .get_result::<DbFollowUser>(connection) {
            Ok(_u) => Ok(status::Accepted(None)),
            Err(e) => Err(status::Conflict(Some(e.to_string()))),
        }
    
}

/**
 * Method for blocking another user
 * @param blocker: the User object that is being created potentially
 *
 * @return returns Uuid of User if created, otherwise String indicating
 * which unique fields are taken (email/username)
 */
pub fn insert_block(blocker: Uuid, blockee: Uuid, connection: &PgConnection) -> Result<status::Accepted<String>, status::Conflict<String>> {
    // Prints the information that was received
    println!("Blocker: {}", blocker);
    println!("Blockee: {}", blockee);

    // Check if blocker already blocking blockee
    match get_block_relationship(blocker, blockee, connection) {
        Ok(r) => if r.iter().len() > 0 {
                    return Err(status::Conflict(Some("Already blocking".to_string())));
                 },
        Err(e) => return Err(status::Conflict(Some(e.to_string()))),
    }

    // Creates object to be inserted to the follow kennel table
    let block_user = BlockUser {
        blocker: blocker,
        blockee: blockee,
    };

    // Inserts kennel into database, returns uuid generated
    match diesel::insert_into(block_relationships::table)
        .values(block_user)
        .get_result::<DbBlockUser>(connection) {
            Ok(_u) => Ok(status::Accepted(None)),
            Err(e) => Err(status::Conflict(Some(e.to_string()))),
        }
    
}

/**
 * Method for registering by checking if unique email/username
 * @param user: the User object that is being created potentially
 * @param connection: database connection
 *
 * @return returns Uuid of User if created, otherwise String indicating
 * which unique fields are taken (email/username)
 */
pub fn insert(user: User, connection: &PgConnection) -> Result<Uuid, String> {
    // Prints the User information that was received (register)
    println!("Username: {}", user.username);
    println!("Email: {}", user.email);
    println!("Password: {}", user.password);

    // Searches columns for user with username and email and gets User if found
    let username_search = users::table.filter(users::username.eq(user.username.clone())).load::<DbUser>(&*connection).expect("Error");
    let email_search = users::table.filter(users::email.eq(user.email.clone())).load::<DbUser>(&*connection).expect("Error");

    // Creates vector for indicating missing fields
    let mut err_msg = "".to_string();

    // Username already exists
    if username_search.iter().len() > 0 {
        err_msg += "username";
    }

    // Email already exists
    if email_search.iter().len() > 0 {
        err_msg += "email";
    }

    // Inserts user into database, returns uuid generated    
    if err_msg.eq("") {
        match diesel::insert_into(users::table)
        .values(&DbUser::from_user(user))
        .get_result::<DbUser>(connection) {
            Ok(u) => return Ok(u.profile_uuid),
            Err(e) => return Err(e.to_string()),
        }
    }
    
    Err(err_msg)
}

/**
 * Method for changing password of a User in database
 * @param id: the uuid of a user
 * @param new_password: new password of user
 * @param connection: database connection
 *
 * @return returns bool indicating if successful password change
 */
pub fn update(id: Uuid, new_password: &str, connection: &PgConnection) -> bool {
    match diesel::update(users::table.find(id))
        .set(users::columns::password.eq(&bcrypt::hash(new_password, 12).unwrap()))
        .get_result::<DbUser>(connection) {
            Ok(_u) => true,
            Err(_e) => false,
        }
}

/**
 * Method for deleting a User from database
 * @param id: the uuid of a user
 * @param connection: database connection
 *
 * @return returns result indicating if successful deletion
 */
pub fn delete(id: Uuid, connection: &PgConnection) -> QueryResult<usize> {
    diesel::delete(users::table.find(id))
        .execute(connection)
}

// Struct representing the fields of block relationship row that is inserted
#[derive(Insertable, AsChangeset, Queryable, Serialize, Deserialize)]
#[table_name = "reviewer_follow_relationships"]
pub struct FollowUser {
    pub follower: Uuid,
    pub followee: Uuid,
}

// Struct representing the fields of block relationship row that is returned by DB
#[derive(Insertable, AsChangeset, Queryable, Serialize, Deserialize)]
#[table_name = "reviewer_follow_relationships"]
pub struct DbFollowUser {
    pub pkey: i64,
    pub follower: Uuid,
    pub followee: Uuid,
}

// Struct representing the fields of block relationship row that is inserted
#[derive(Insertable, AsChangeset, Queryable, Serialize, Deserialize)]
#[table_name = "block_relationships"]
pub struct BlockUser {
    pub blocker: Uuid,
    pub blockee: Uuid,
}

// Struct representing the fields of block relationship row that is returned by DB
#[derive(Insertable, AsChangeset, Queryable, Serialize, Deserialize)]
#[table_name = "block_relationships"]
pub struct DbBlockUser {
    pub pkey: i64,
    pub blocker: Uuid,
    pub blockee: Uuid,
}

// Struct representing the fields of a user passed in from frontend contains
#[derive(Queryable, AsChangeset, Serialize, Deserialize)]
#[table_name = "users"]
pub struct User {
    pub username: String,
    pub email: String,
    pub password: String,
}

// Struct represneting the fields of a user that is inserted into database
#[derive(Insertable, Queryable, AsChangeset, Serialize, Deserialize)]
#[table_name = "users"]
pub struct DbUser {
    pub profile_uuid: Uuid,
    pub username: String,
    pub email: String,
    pub password: String,
    pub profilepicture: Option<String>,
    pub sitewideban: bool,
}

// Converts a User to an DbUser by calling functions on passed in values
impl DbUser{

    fn from_user(user: User) -> DbUser {
        DbUser{
            profile_uuid: Uuid::new_v4(), // generate random uuid
            username: user.username,
            email: user.email,
            password: bcrypt::hash(user.password, 12).expect("Error"),
            profilepicture: Some("".to_string()),
            sitewideban: false,
        }
    }

}