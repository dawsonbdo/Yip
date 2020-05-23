// Stuff for querying database
use diesel;
use diesel::prelude::*;

// Database tables
use crate::schema::users;
use crate::schema::block_relationships;
use crate::schema::reviewer_follow_relationships;

// Misc
use uuid::Uuid;
extern crate bcrypt;
use crate::auth;
use rocket::response::status;

/**
 * Method that converts a User to a DbUser
 * @param user: the User obj
 * 
 * @return returns a DbUser
 */
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

/**
 * Helper method that converts DbUser to DisplayUser
 * @param user: the DbUser
 * @param token: user token
 * @param connection: database connection
 *
 * @return returns a DisplayUser
 */
pub fn to_display_user(user: DbUser, token: String, connection: &PgConnection) -> DisplayUser {

    // Converts token into uuid
    let profile_uuid = auth::get_uuid_from_token(&token);

    // Return display kennel created
    DisplayUser {
        username: user.username,
        profilepicture: user.profilepicture,
        sitewideban: user.sitewideban,
        is_owner: user.profile_uuid.eq(&profile_uuid),
        is_blocked: match get_block_relationship(profile_uuid, user.profile_uuid, connection) {
                        Ok(_u) => true,
                        Err(_e) => false,
                    },
        is_followed: match get_follow_relationship(profile_uuid, user.profile_uuid, connection) {
                        Ok(_u) => true,
                        Err(_e) => false,
                    },
    }

}

/**
 * Method that returns the row corresponding to follow/followee uuid if exists
 * @param blocker: the blockee uuid
 * @param blockee: the blockee uuid
 * @param connection: database connection
 *
 * @return returns a result containing DbBlockUser if found, otherwise error
 */
pub fn get_follow_relationship(follower: Uuid, followee: Uuid, connection: &PgConnection) -> QueryResult<DbFollowUser>{
    
    // Filters block relationship table
    reviewer_follow_relationships::table
             .filter(reviewer_follow_relationships::follower.eq(follower))
             .filter(reviewer_follow_relationships::followee.eq(followee))
             .get_result::<DbFollowUser>(&*connection)
}

/**
 * Method that returns the row corresponding to blocker/blockee uuid if exists
 * @param blocker: the blockee uuid
 * @param blockee: the blockee uuid
 * @param connection: database connection
 *
 * @return returns a result containing DbBlockUser if found, otherwise error
 */
pub fn get_block_relationship(blocker: Uuid, blockee: Uuid, connection: &PgConnection) -> QueryResult<DbBlockUser>{
    
    // Filters block relationship table
    block_relationships::table
             .filter(block_relationships::blocker.eq(blocker))
             .filter(block_relationships::blockee.eq(blockee))
             .get_result::<DbBlockUser>(&*connection)
}

/**
 * Method that converts DbFollowUser to DisplayFollowerUser
 * @param followee: the DbFollowUser
 * @param connection: database connection
 *
 * @return returns a DisplayFollowUser
 */
fn to_display_follower(followee: &DbFollowUser, connection: &PgConnection) -> DisplayFollowUser {
    DisplayFollowUser{
        followee: match get_user_from_uuid(followee.followee, connection){
            Ok(f) => f.username,
            Err(_e) => "".to_string(),
        }
    }
}

/**
 * Method that returns a vector with all of the users a user is following
 * @param id: Uuid of user
 * @param connection: database connection
 *
 * @return returns a vector of DbUsers
 */
pub fn all_user_followees(id: Uuid, connection: &PgConnection) -> QueryResult<Vec<DisplayFollowUser>> {
    match reviewer_follow_relationships::table
        .filter(reviewer_follow_relationships::follower.eq(id))
        .load::<DbFollowUser>(&*connection){
            Ok(followees) => Ok(followees.iter().map(|followee| to_display_follower(followee, connection)).collect()),
            Err(e) => Err(e),
        }
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
pub fn get_username_from_uuid(id: Uuid, connection: &PgConnection) -> String {
    match users::table.find(id).get_result::<DbUser>(connection){
        Ok(u) => u.username,
        Err(e) => e.to_string(),
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
    match users::table.filter(users::username.eq(username)).get_result::<DbUser>(&*connection){
        Ok(u) => u.profile_uuid,
        Err(_e) => Uuid::nil(),
    }
}

/**
 * Method that returns user of a user given their uuid
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

    // Deletes follow relationship from database, returns uuid generated
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

    // Creates object to be inserted to the follow kennel table
    let follow_user = FollowUser {
        follower: follower,
        followee: followee,
    };

    // Attempts to inserts follow relationship into database
    match diesel::insert_into(reviewer_follow_relationships::table)
        .values(follow_user)
        .get_result::<DbFollowUser>(connection) {
            Ok(_u) => Ok(status::Accepted(None)),
            Err(_e) => Err(status::Conflict(Some("Already following".to_string()))),
        }
    
}

/**
 * Method for unblocking another user
 * @param blocker: the blocker
 * @param blockee: the blockee
 *
 * @return returns Uuid of User if created, otherwise String indicating
 * which unique fields are taken (email/username)
 */
pub fn remove_block(blocker: Uuid, blockee: Uuid, connection: &PgConnection) -> QueryResult<usize> {
    // Prints the information that was received
    println!("Blocker: {}", blocker);
    println!("Blockee: {}", blockee);

    // Attemps to remove from database
    diesel::delete(block_relationships::table
             .filter(block_relationships::blocker.eq(blocker))
             .filter(block_relationships::blockee.eq(blockee)))
             .execute(connection)
    
}

/**
 * Method for blocking another user
 * @param blocker: the blocker
 * @param blockee: the blockee
 *
 * @return returns Uuid of User if created, otherwise String indicating
 * which unique fields are taken (email/username)
 */
pub fn insert_block(blocker: Uuid, blockee: Uuid, connection: &PgConnection) -> QueryResult<usize> {
    // Prints the information that was received
    println!("Blocker: {}", blocker);
    println!("Blockee: {}", blockee);

    // Creates object to be inserted to the follow kennel table
    let block_user = BlockUser {
        blocker: blocker,
        blockee: blockee,
    };

    // Inserts block relationship into database
    diesel::insert_into(block_relationships::table)
            .values(block_user)
            .execute(connection)
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
        .values(&from_user(user))
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

// Struct used for displaying followed users on profile
#[derive(Queryable, Serialize, Deserialize)]
pub struct DisplayFollowUser {
    pub followee: String,
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

// Struct represneting the fields of a user that are needed for frontend display
#[derive(Queryable, Serialize, Deserialize)]
pub struct DisplayUser {
    pub username: String,
    pub profilepicture: Option<String>,
    pub sitewideban: bool,
    pub is_owner: bool,
    pub is_blocked: bool,
    pub is_followed: bool,
}