pub mod handlers;

use crate::db;

use handlers::{InputReport, DisplayReport};
use rocket_contrib::json::Json;

use db::DbConn;

use rocket::response::status;
use crate::auth;


/**
 * Method that prints out all the reports in database
 * @param connection: database connection
 *
 * @return N/A
 */
#[get("/reports", rank=1)]
fn list_reports(connection: DbConn) -> () {

	// Makes database call to get all users
	let all_reports = handlers::all(&connection)
        .map(|report| Json(report));
        
	// Prints out title/text/rating of each review in database
	for vec in all_reports {
		for r in vec.iter() {
			println!("Kennel: {} Is Comment: {} Reason: {}", r.kennel, r.is_comment, r.reason);
		} 
	}

}

/** 
 * Method that returns vector of kennel reviews
 * @param kennel_name: the name of the kennel that is queried
 * @param connection: database connection
 *
 * @return returns JSON of the review or error status
 */
#[get("/get_kennel_reports/<kennel_name>")]
fn get_kennel_reports(kennel_name: String, connection: DbConn) -> Result<Json<Vec<DisplayReport>>, status::NotFound<String>> {

	// Converts kennel name to kennel id
	let kennel_uuid = super::kennels::handlers::get_kennel_uuid_from_name(kennel_name, &connection);

	// Check for nil id (meaning kennel name does not exist)
	if kennel_uuid.is_nil() {
		return Err(status::NotFound("Kennel not found".to_string()));
	}

	// Makes database call to get all reviews with kennel uuid
	let all_reports = handlers::all_kennel_reports(kennel_uuid, &connection);

	
	// Prints out title/text/rating of each review in database
	for v in &all_reports {
		for r in v.iter() {
			println!("Kennel: {} Is Comment: {} Reason: {}", r.kennel_name, r.is_comment, r.reason);
		} 
	}
	

	Ok(Json(all_reports.unwrap()))
}

/** 
 * Method that creates a report
 * @param kennel: JSON of the report
 *
 * @return returns TBD
 */
#[post("/create_report", data="<report>", rank=1)]
fn create_report(report: Json<InputReport>, connection: DbConn) -> Result<status::Accepted<String>, status::Conflict<String>> {
	
	// Check that valid user reporting
	if auth::get_uuid_from_token(&report.reporter_token).is_nil(){
		return Err(status::Conflict(Some("Invalid user trying to report".to_string())));
	}

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
    rocket.mount("/", routes![create_report, get_kennel_reports, list_reports])  
}