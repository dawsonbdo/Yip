pub mod handlers;

use crate::db;

use handlers::Report;
use rocket_contrib::json::Json;

use db::DbConn;

use rocket::response::status;

/** 
 * Method that creates a report
 * @param kennel: JSON of the report
 *
 * @return returns TBD
 */
#[post("/create_report", data="<report>", rank=1)]
fn create_report(report: Json<Report>, connection: DbConn) -> Result<status::Accepted<String>, status::Conflict<String>> {
	
	// Attempt to insert report into database 
	let successful_report = handlers::insert(report.into_inner(), &connection);
	
	// Check if successful insertion into database
	match successful_report {
		Ok(_id) => Ok(status::Accepted(None)),
		Err(e) => Err(status::Conflict(Some(e.to_string()))),
	}
	
}

/**
 * Mount the report routes
 */
pub fn mount(rocket: rocket::Rocket) -> rocket::Rocket {
    rocket.mount("/", routes![create_report])  
}