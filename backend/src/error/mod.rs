pub type Result<T> = std::result::Result<T, Error>;

pub enum Error{
    IO(std::io::Error),
    Diesel(diesel::result::Error),
    JsonWebToken(jsonwebtoken::errors::Error)
}

impl From<std::io::Error> for Error {
    fn from(err: std::io::Error) -> Error{
        Error::IO(err)
    }
}

impl From<diesel::result::Error> for Error {
    fn from(err: diesel::result::Error) -> Error{
        Error::Diesel(err)
    }
}

impl From<jsonwebtoken::errors::Error> for Error {
    fn from(err: jsonwebtoken::errors::Error) -> Error{
        Error::JsonWebToken(err)
    }
}