use diesel::result::Error as DieselError;

pub enum Error{
    IO(std::io::Result<()>),
    DieselError(DieselError),
}

impl Error{

}