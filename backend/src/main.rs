#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use] extern crate rocket;
#[macro_use] extern crate diesel;
#[macro_use] extern crate serde_derive;

extern crate serde_json;
extern crate dotenv;
extern crate rocket_contrib;
extern crate r2d2;
extern crate r2d2_diesel;
extern crate radix_heap;
extern crate ordered_float;
extern crate priority_queue;

use std::path::{Path, PathBuf};
use rocket::response::NamedFile;

// Database tables
mod users;
mod reviews;
mod kennels;
mod comments;
mod reports;
mod messages;

// Other stuff
mod auth;
mod schema;
mod db;
mod search;
mod error;

// Load home page for empty file path
#[get("/")]
fn home() -> Option<NamedFile> {
	// Empty file path, give home page
	NamedFile::open("static/pages/index.html").ok()
}

// Load home page for random URL
#[get("/<_url>", rank=2)]
fn url(_url: String) -> Option<NamedFile> {
	// Random file path, give home page
	NamedFile::open("static/pages/index.html").ok()
}


// Generic static file access
#[get("/<file..>", rank = 3)]
fn files(file: PathBuf) -> Option<NamedFile> {
	// Static file access
	NamedFile::open(Path::new("static/").join(file)).ok()
}

fn rocket() -> rocket::Rocket {
    // Set up db management and mount main routes
    let mut rocket = rocket::ignite()
    	.manage(db::init_pool())
    	.mount("/", routes![files, home, url]);

    // Mount rest of routes
    rocket = users::mount(rocket);
    rocket = reviews::mount(rocket);
    rocket = kennels::mount(rocket);
    rocket = comments::mount(rocket);
    rocket = reports::mount(rocket);
    rocket = messages::mount(rocket);

    // Return the Rocket
    return rocket;
}

fn main() {
    rocket().launch();
}
