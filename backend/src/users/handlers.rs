use diesel;
use diesel::prelude::*;
use crate::schema::users;
use uuid::Uuid;
extern crate bcrypt;

/**
 * Method that returns a vector with all of the users in database
 */
pub fn all(connection: &PgConnection) -> QueryResult<Vec<DbUser>> {
    users::table.load::<DbUser>(&*connection)
}

/**
 * LOGIN: Method that returns UUID if successful login, otherwise nil UUID
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


// Function that returns the uuid of a user/email if they are linked to same user
pub fn username_email_linked(username: &str, email: &str, connection: &PgConnection) -> Uuid {

    // Looks for username in database, if found and username/email belong to same uuid, returns uuid
    match users::table.filter(users::username.eq(username)).load::<DbUser>(&*connection){
        Ok(u) => if u.iter().len() != 0 && u[0].username.eq(username) && u[0].email.eq(email) { u[0].profile_uuid } else { Uuid::nil() },
        Err(_e) => Uuid::nil(),
    }

}

// Function that returns the uuid of a user given their username
pub fn get_uuid_from_username(username: &str, connection: &PgConnection) -> Uuid {
    match users::table.filter(users::username.eq(username)).load::<DbUser>(&*connection){
        Ok(u) => u[0].profile_uuid,
        Err(_e) => Uuid::nil(),
    }
}

// Function that returns the DbUser tied to a uuid
pub fn get_user_from_uuid(id: Uuid, connection: &PgConnection) -> Result<DbUser, String> {
    match users::table.find(id).get_result::<DbUser>(connection){
        Ok(u) => Ok(u),
        Err(e) => Err(e.to_string()),
    }
}

/**
 * REGISTER: Method that attempts to create a new user in database 
 * if unique user/email and returns if successful
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
 * CHANGE PASSWORD: Method that attempt to change password of 
 */
pub fn update(id: Uuid, new_password: &str, connection: &PgConnection) -> bool {
    match diesel::update(users::table.find(id))
        .set(users::columns::password.eq(&bcrypt::hash(new_password, 12).unwrap()))
        .get_result::<DbUser>(connection) {
            Ok(_u) => true,
            Err(_e) => false,
        }
}

pub fn delete(id: Uuid, connection: &PgConnection) -> QueryResult<usize> {
    diesel::delete(users::table.find(id))
        .execute(connection)
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
    pub passwordsalt: i64,
    pub password: String,
    pub profilepicture: String,
    pub sitewideban: bool,
}

// Converts a User to an DbUser by calling functions on passed in values
impl DbUser{

    fn from_user(user: User) -> DbUser {
        DbUser{
            profile_uuid: Uuid::new_v4(), // generate random uuid
            username: user.username,
            email: user.email,
            passwordsalt: 0,
            password: bcrypt::hash(user.password, 12).expect("Error"),
            profilepicture: "".to_string(),
            sitewideban: false,
        }
    }

}