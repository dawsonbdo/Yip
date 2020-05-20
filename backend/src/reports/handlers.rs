use diesel;
use diesel::prelude::*;
use uuid::Uuid;
use crate::schema::reports;
use super::super::{kennels};
use chrono::{NaiveDate, NaiveDateTime};
use crate::auth;

/**
 * Method that converts a Report to InsertReport
 * @param report: the InputReport
 *
 * @return returns a InsertReport
 */
fn from_report(report: InputReport, connection: &PgConnection) -> InsertReport {
    InsertReport{
        report_uuid: Uuid::new_v4(),
        kennel: kennels::handlers::get_kennel_uuid_from_name(report.kennel.clone(), connection),
        is_comment: report.is_comment,
        comment_id: match Uuid::parse_str(&report.comment_id) {
            Ok(u) => Some(u),
            Err(e) => None,
        },
        review_id: match Uuid::parse_str(&report.review_id) {
            Ok(u) => Some(u),
            Err(e) => None,
        },
        reason: report.reason,
        escalated: report.escalated,
        reporter_name: auth::get_user_from_token(&report.reporter_token),
    }
}

/**
 * Method that converts a DbReport to DisplayReport
 * @param report: the DbReport
 *
 * @return returns a DisplayReport
 */
fn to_report(report: &DbReport, connection: &PgConnection) -> DisplayReport {
    DisplayReport{
        report_uuid: report.report_uuid,
        kennel_name: kennels::handlers::get(report.kennel, connection).unwrap().kennel_name,
        is_comment: report.is_comment,
        comment_id: report.comment_id,
        review_id: report.review_id,
        reason: report.reason.clone(),
        escalated: report.escalated,
        reporter_name: report.reporter_name.clone(),
        timestamp: report.timestamp,
    }
}

/**
 * Method that gets returns all reports in a kennel
 * @param kennel_uuid: uuid of kennel
 * @param connection: database connection
 *
 * @return returns vector of all DbKennels
 */
pub fn all_kennel_reports(kennel_uuid: Uuid, connection: &PgConnection) -> QueryResult<Vec<DisplayReport>> {

    // Load all reports with the given kennel id and convert to DisplayReports
    Ok(reports::table.filter(reports::kennel.eq(kennel_uuid)).load::<DbReport>(connection)
    .unwrap()
    .iter()
    .map(|report| to_report(report, connection))
    .collect())
}

/**
 * Method that gets returns all reports in database
 * @param connection: database connection
 *
 * @return returns vector of all DbReports
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
pub fn insert(report: InputReport, connection: &PgConnection) -> Result<Uuid, String> {
    // Prints the Report information that was received (register)
    println!("Reason: {}", report.reason);
    println!("Is Comment: {}", report.is_comment);

    // Inserts report into database, returns uuid generated
    match diesel::insert_into(reports::table)
        .values(from_report(report, connection))
        .get_result::<DbReport>(connection) {
            Ok(r) => Ok(r.report_uuid),
            Err(e) => Err(e.to_string()),
        }

}

/**
 * EDIT Report: Method that updates a report in database
 */
pub fn update(id: Uuid, report: InputReport, connection: &PgConnection) -> bool {
    match diesel::update(reports::table.find(id))
        .set(from_report(report, connection))
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
pub struct InputReport {
    pub kennel: String,
    pub is_comment: bool,
    pub comment_id: String,
    pub review_id: String,
    pub reason: String,
    pub escalated: bool,
    pub reporter_token: String,
}

// Struct represneting the fields of a report that is inserted into database
#[derive(Insertable, AsChangeset, Queryable, Serialize, Deserialize)]
#[table_name = "reports"]
pub struct InsertReport {
    pub report_uuid: Uuid,
    pub kennel: Uuid,
    pub is_comment: bool,
    pub comment_id: Option<Uuid>,
    pub review_id: Option<Uuid>,
    pub reason: String,
    pub escalated: bool,
    pub reporter_name: String,
}

// Struct represneting the fields of a report that is retrived from database
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
    pub reporter_name: String,
    pub timestamp: NaiveDateTime
}

// Struct represneting the fields of a report that are needed on frontend
#[derive(Queryable, Serialize, Deserialize)]
pub struct DisplayReport {
    pub report_uuid: Uuid,
    pub kennel_name: String,
    pub is_comment: bool,
    pub comment_id: Option<Uuid>,
    pub review_id: Option<Uuid>,
    pub reason: String,
    pub escalated: bool,
    pub reporter_name: String,
    pub timestamp: NaiveDateTime,
}

#[derive(Queryable, Serialize, Deserialize, Debug, std::hash::Hash, std::cmp::PartialEq, std::cmp::Eq)]
pub struct ReviewReport {
    pub kennel_name: String, //kennel name
    pub title: String,
    pub author: String, //username
    pub timestamp: NaiveDateTime,
    pub text: String,
    pub images: Vec<String>,
    pub rating: i32,
    pub tags: Vec<String>,
    pub is_author: bool,
    pub is_liked: bool,
    pub is_disliked: bool,
    pub is_bookmarked: bool,
    pub review_uuid: Uuid,
    pub hotness: i64,
    pub reason: String,
}

#[derive(Queryable, Serialize, Deserialize, Debug, std::hash::Hash, std::cmp::PartialEq, std::cmp::Eq)]
pub struct CommentReport {
    pub comment_uuid: Uuid,
    pub author_name: String,
    pub timestamp: String,
    pub text: String,
    pub is_author: bool,
    pub rating: i32,
    pub is_liked: bool,
    pub is_disliked: bool,
    pub reason: String,
}