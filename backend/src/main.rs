#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use] extern crate rocket;

extern crate rocket_contrib;

use std::path::{Path, PathBuf};
use rocket::response::content;
use rocket::request::Form;
use rocket::response::NamedFile;
use std::fs;

use std::fs::OpenOptions;
use std::io::Write;

use std::fs::File;
use std::io::{self, BufRead};

use std::hash::{Hash, Hasher};
use std::collections::hash_map::DefaultHasher;

#[derive(FromForm)]
struct UserLogin {
    login: String,
    password: String,
}

// Handle login request
#[post("/login", data="<input>", rank=1)]
fn login(input: Form<UserLogin>) -> () {
	println!("Username/Email: {}", input.login);
	println!("Password: {}", input.password);
}

// Load home page for empty file path
#[get("/<url>", rank=2)]
fn url(url: String) -> Option<NamedFile> {
	// Empty file path, give home page
	//NamedFile::open(Path::new("static/pages/homepage.html")).ok()
	NamedFile::open("static/pages/index.html").ok()
}

// Load home page for empty file path
#[get("/")]
fn home() -> Option<NamedFile> {
	// Empty file path, give home page
	//NamedFile::open(Path::new("static/pages/homepage.html")).ok()
	NamedFile::open("static/pages/index.html").ok()
}

// Generic static file access
#[get("/<file..>", rank = 3)]
fn files(file: PathBuf) -> Option<NamedFile> {
	// Static file access
	NamedFile::open(Path::new("static/").join(file)).ok()
}

fn rocket() -> rocket::Rocket {
    rocket::ignite().mount("/", routes![files, home, url, login])
}

fn main() {
    rocket().launch();
}
