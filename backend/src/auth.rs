use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation, errors::Result};
use serde::{Deserialize, Serialize};

// Struct used for creating tokens
#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: uuid::Uuid, // uuid tied to username
    company: String,
    exp: usize,
}

// Function that creates a token using a UUID as payload and CORGI
pub fn create_token(id: uuid::Uuid) -> Result<String> {
    let key = b"secret";
    let my_claims =
        Claims { sub: id, company: "CORGI".to_owned(), exp: 10000000000 };
    encode(&Header::default(), &my_claims, &EncodingKey::from_secret(key)) 
}

// Function that validates a token
pub fn validate_token(token: String) -> bool {
    let key = b"secret";
    let validation = Validation { leeway: 60, ..Validation::default() };
    let _token_data = match decode::<Claims>(&token, &DecodingKey::from_secret(key), &validation) {
        Ok(_c) => return true,
        Err(_err) => return false,
    };
}

// Function that returns the uuid of a user given their token
pub fn get_uuid_from_token(token: &str) -> uuid::Uuid {
    let key = b"secret";
    let validation = Validation { leeway: 60, ..Validation::default() };
    let _token_data = match decode::<Claims>(token, &DecodingKey::from_secret(key), &validation) {
        Ok(d) => return d.claims.sub,
        Err(_e) => return uuid::Uuid::nil(),
    };
}


    