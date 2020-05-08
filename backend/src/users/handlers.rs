use diesel;
use diesel::prelude::*;
use diesel::result::Error;
use crate::schema::users;

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
pub fn get(user: User, connection: &PgConnection) -> uuid::Uuid {

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
            return username_search[0].id;
        }


    } else if email_search.iter().len() > 0 { // Checks if User with email was found

        // Check if the password matches the password of the User in database
        if bcrypt::verify(&user.password, &email_search[0].password).expect("Error") {

            // Returns UUID
            return email_search[0].id;
        }

    }

    // Password incorrect or email incorrect, return nil UUID
    return uuid::Uuid::nil();

}


// Function that returns the uuid of a user/email if they are linked to same user
pub fn username_email_linked(username: &str, email: &str, connection: &PgConnection) -> uuid::Uuid {

    // Looks for username in database, if found and username/email belong to same uuid, returns uuid
    match users::table.filter(users::username.eq(username)).load::<DbUser>(&*connection){
        Ok(u) => return if u.iter().len() != 0 && u[0].username.eq(username) && u[0].email.eq(email) { u[0].id } else { uuid::Uuid::nil() },
        Err(_e) => return uuid::Uuid::nil(),
    }

}

// Function that returns the uuid of a user given their username
pub fn get_uuid_from_username(username: &str, connection: &PgConnection) -> uuid::Uuid {
    match users::table.filter(users::username.eq(username)).load::<DbUser>(&*connection){
        Ok(u) => return u[0].id,
        Err(_e) => return uuid::Uuid::nil(),
    }
}

/**
 * REGISTER: Method that attempts to create a new user in database 
 * if unique user/email and returns if successful
 */
pub fn insert(user: User, connection: &PgConnection) -> Result<uuid::Uuid, String> {
    // Prints the User information that was received (register)
    println!("Username: {}", user.username);
    println!("Email: {}", user.email);
    println!("Password: {}", user.password);

    // Searches columns for user with username and email and gets User if found
    let username_search = users::table.filter(users::username.eq(user.username.clone())).load::<DbUser>(&*connection).expect("Error");
    let email_search = users::table.filter(users::email.eq(user.email.clone())).load::<DbUser>(&*connection).expect("Error");

    // Creates vector for indicating missing fields
    let mut errMsg = "".to_string();

    // Username already exists
    if username_search.iter().len() > 0 {
        errMsg += "username";
    }

    // Email already exists
    if email_search.iter().len() > 0 {
        errMsg += "email";
    }

    // Inserts user into database, returns uuid generated    
    if errMsg.eq("") {
        match diesel::insert_into(users::table)
        .values(&DbUser::from_user(user))
        .get_result::<DbUser>(connection) {
            Ok(u) => return Ok(u.id),
            Err(e) => return Err(errMsg),
        }
    }
    
    return Err(errMsg);

    
    
}

/**
 * CHANGE PASSWORD: Method that attempt to change password of 
 */
pub fn update(id: uuid::Uuid, new_password: &str, connection: &PgConnection) -> bool {
    match diesel::update(users::table.find(id))
        .set(users::columns::password.eq(&bcrypt::hash(new_password, 12).unwrap()))
        .get_result::<DbUser>(connection) {
            Ok(_u) => return true,
            Err(_e) => return false,
        }
}

pub fn delete(id: uuid::Uuid, connection: &PgConnection) -> QueryResult<usize> {
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
    pub id: uuid::Uuid,
    pub username: String,
    pub email: String,
    pub password: String,
    pub profilepic: String,
    pub sitewideban: bool,
}

// Converts a User to an DbUser by calling functions on passed in values
impl DbUser{

    fn from_user(user: User) -> DbUser {
        DbUser{
            id: uuid::Uuid::new_v4(), // generate random uuid
            username: user.username,
            email: user.email,
            password: bcrypt::hash(user.password, 12).expect("Error"),
            profilepic: "".to_string(),
            sitewideban: false,
        }
    }

}