use diesel;
use diesel::prelude::*;
use crate::schema::users;

extern crate bcrypt;

/**
 * Method that returns a vector with all of the users in database
 */
pub fn all(connection: &PgConnection) -> QueryResult<Vec<User>> {
    users::table.load::<User>(&*connection)
}

/**
 * LOGIN: Method that returns wheter or not a user is in the database 
 */
pub fn get(user: User, connection: &PgConnection) -> bool {
    // Prints the User information that was sent (login)
    println!("Login: {}", user.email);
    println!("Password: {}", user.password);

    // Searches columns for user with username and email and gets User if found
    let username_search = users::table.filter(users::username.eq(user.username)).load::<User>(&*connection).expect("Error");
    let email_search = users::table.filter(users::email.eq(user.email)).load::<User>(&*connection).expect("Error");

    // Checks if User with username was found
    if username_search.iter().len() > 0 {

        // Check if the password matches the password of the User in database
        return bcrypt::verify(&user.password, &username_search[0].password).expect("Error")


    } else if email_search.iter().len() > 0 { // Checks if User with email was found

        // Check if the password matches the password of the User in database
        return bcrypt::verify(&user.password, &email_search[0].password).expect("Error")

    }

    // Password incorrect or email incorrect
    return false;

}

/**
 * REGISTER: Method that attempts to create a new user in database 
 * if unique user/email and returns if successful
 */
pub fn insert(user: User, connection: &PgConnection) -> bool {
    // Prints the User information that was received (register)
    println!("Email: {}", user.email);
    println!("Username: {}", user.username);
    println!("Password: {}", user.password);

    // Inserts user into database if email or username not taken
    match diesel::insert_into(users::table)
        .values(&InsertableUser::from_user(user))
        .get_result::<User>(connection) {
            Ok(_u) => return true,
            Err(_e) => return false,
        }
}

pub fn update(id: uuid::Uuid, user: User, connection: &PgConnection) -> QueryResult<User> {
    diesel::update(users::table.find(id))
        .set(&user)
        .get_result(connection)
}

pub fn delete(id: uuid::Uuid, connection: &PgConnection) -> QueryResult<usize> {
    diesel::delete(users::table.find(id))
        .execute(connection)
}

// Struct representing the fields of a user passed in from frontend contains
#[derive(Queryable, AsChangeset, Serialize, Deserialize)]
#[table_name = "users"]
pub struct User {
    pub id: uuid::Uuid,
    pub username: String,
    pub email: String,
    pub password: String,
    pub profilepic: String,
    pub sitewideban: bool,
}

// Struct represneting the fields of a user that is inserted into database
#[derive(Insertable)]
#[table_name = "users"]
pub struct InsertableUser {
    id: uuid::Uuid,
    username: String,
    email: String,
    password: String,
    profilepic: String,
    sitewideban: bool,
}

// Converts a User to an InsertableUser by calling functions on passed in values
impl InsertableUser{

    fn from_user(user: User) -> InsertableUser {
        InsertableUser{
            id: uuid::Uuid::new_v4(), // generate random uuid
            username: user.username,
            email: user.email,
            password: bcrypt::hash(user.password, 12).expect("Error"),
            profilepic: "".to_string(),
            sitewideban: false,
        }
    }

}