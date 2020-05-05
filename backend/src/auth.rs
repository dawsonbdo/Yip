use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,
    company: String,
    exp: usize,
}

pub fn create_token() -> String {
    let key = b"secret";
    let my_claims =
        Claims { sub: "yip.com".to_owned(), company: "CORGI".to_owned(), exp: 10000000000 };
    let _token = match encode(&Header::default(), &my_claims, &EncodingKey::from_secret(key)) {
        Ok(t) => return t,
        Err(e) => return e.to_string(), // in practice you would return the error
    };
}

pub fn validate_token(token: String) -> bool {
    //println!("TOKEN: {}", token);

    let key = b"secret";
    let validation = Validation { sub: Some("yip.com".to_string()), ..Validation::default() };
    let _token_data = match decode::<Claims>(&token, &DecodingKey::from_secret(key), &validation) {
        Ok(_c) => return true,
        Err(_err) => return false,
    };
}

    