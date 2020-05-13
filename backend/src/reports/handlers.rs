use diesel;
use diesel::prelude::*;
use uuid::Uuid;
use crate::schema::reports;

/**
 * Method that returns a vector with all of the reports
 */
pub fn all(connection: &PgConnection) -> QueryResult<Vec<DbReport>> {
    reports::table.load::<DbReport>(&*connection)
}

/**
 * LOAD REPORT: Method that returns a DbReport given the uuid
 */
pub fn get(id: Uuid, connection: &PgConnection) -> QueryResult<DbReport> {

    // Searches report table for the uuid and gets the report
    reports::table.find(id).get_result::<DbReport>(connection)
}

/**
 * CREATE REPORT: Method that attempts to create a new report in database, returns URL? 
 */
pub fn insert(report: Report, connection: &PgConnection) -> Result<Uuid, String> {
    // Prints the Report information that was received (register)
    println!("Reason: {}", report.reason);
    println!("Is Comment: {}", report.is_comment);


    // Inserts report into database, returns uuid generated
    match diesel::insert_into(reports::table)
        .values(&DbReport::from_report(report))
        .get_result::<DbReport>(connection) {
            Ok(r) => Ok(r.report_uuid),
            Err(e) => Err(e.to_string()),
        }
}

/**
 * EDIT Report: Method that updates a report in database
 */
pub fn update(id: Uuid, report: Report, connection: &PgConnection) -> bool {
    match diesel::update(reports::table.find(id))
        .set(&DbReport::from_report(report))
        .get_result::<DbReport>(connection) {
            Ok(_u) => return true,
            Err(_e) => return false,
        }
}

/**
 * DELETE Report: Method that removes a report in database
 */
pub fn delete(id: Uuid, connection: &PgConnection) -> QueryResult<usize> {
    diesel::delete(reports::table.find(id))
        .execute(connection)
}


// Struct representing the fields of a report passed in from frontend contains
#[derive(Queryable, Serialize, Deserialize)]
pub struct Report {
    pub kennel: String,
    pub is_comment: bool,
    pub comment_id: String,
    pub review_id: String,
    pub reason: String,
    pub escalated: bool,
}

// Struct represneting the fields of a report that is inserted into database
#[derive(Insertable, AsChangeset, Queryable, Serialize, Deserialize)]
#[table_name = "reports"]
pub struct DbReport {
    pub report_uuid: Uuid,
    pub kennel: Uuid,
    pub is_comment: bool,
    pub comment_id: Option<Uuid>,
    pub review_id: Option<Uuid>,
    pub reason: String,
    pub escalated: bool,
}

// Converts a Report to an DbReport by calling functions on passed in values
impl DbReport{

    fn from_report(report: Report) -> DbReport {
        DbReport{
            report_uuid: Uuid::new_v4(),
            kennel: Uuid::parse_str(&report.kennel).unwrap(),
            is_comment: report.is_comment,
            comment_id: {
                let uuid = Uuid::parse_str(&report.comment_id).unwrap();
                if uuid.is_nil() {None} else {Some(uuid)}
            },
            review_id: {
                let uuid = Uuid::parse_str(&report.review_id).unwrap();
                if uuid.is_nil() {None} else {Some(uuid)}
            },
            reason: report.reason,
            escalated: report.escalated,
        }
    }

}