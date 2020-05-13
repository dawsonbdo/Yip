pub mod handlers;

use crate::auth;
use crate::db;

use handlers::Message;
use rocket_contrib::json::Json;

use db::DbConn;
use uuid::Uuid;

use rocket::response::status;