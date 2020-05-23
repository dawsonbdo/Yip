#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use] extern crate rocket;
#[macro_use] extern crate diesel;
#[macro_use] extern crate serde_derive;

extern crate dotenv;
extern crate rocket_contrib;
extern crate r2d2;
extern crate r2d2_diesel;
extern crate radix_heap;
extern crate ordered_float;
extern crate priority_queue;
extern crate ws;

use std::path::{Path, PathBuf};
use rocket::response::NamedFile;

// Web socket imports
use ws::{
    listen,
    CloseCode,
    Error,
    Handler,
    Handshake,
    Message,
    Request,
    Response,
    Result,
    Sender,
};

use std::thread;


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

static mut CONNS : Vec<Connection> = Vec::new(); 

// Keeps track of a connection with id and Sender
struct Connection {
    out: Sender,
    id: String,
}

impl Handler for Connection {

    fn on_request(&mut self, req: &Request) -> Result<Response> {
        unsafe {
            CONNS.push(Connection {
                out: self.out.clone(),
                id: {
                    let mut char_vec: Vec<char> = req.resource().to_string().chars().collect();
                    char_vec.remove(0);
                    char_vec.into_iter().collect()
                },
            });
        }
        println!("ON REQUEST");
        match req.resource() {
            id => {
                    // Store the username?
                    let mut char_vec: Vec<char> = id.to_string().chars().collect();
                    char_vec.remove(0);
                    self.id = char_vec.into_iter().collect();
                    Response::from_request(req)
            },
        }
    }

    fn on_open(&mut self, _handshake: Handshake) -> Result<()> {
        println!("ON OPEN");
        Ok(())
    }

    fn on_message(&mut self, message: Message) -> Result<()> {
        // Iterate through connections (delete this l8r)
        unsafe {
            for connection in &CONNS{
                println!("Connection Id: {}", connection.id);
            }
        }
        
        let raw_message = message.into_text()?;
        println!("Message from: {}", self.id);
        println!("The message from the client is {:#?}", &raw_message);

        // Parse the message in format <user>-<message>
        let chars = raw_message.clone();
        let mut user = "".to_string();
        let mut msg = "".to_string();
        match chars.find('-') {
            Some(idx) => {
                user = chars.chars().into_iter().take(idx).collect();
                let mut iter = chars.chars().into_iter();
                iter.nth(idx);
                msg = iter.collect();
            },
            None => (),
        }

        println!("USER: {}", user);
        println!("MSG: {}", msg);

        // Get the message as a Message object
        let _message = if raw_message.contains("!warn") {
            let warn_message = "One of the clients sent warning to the server.";
            println!("{}", &warn_message);
            Message::Text("There was warning from another user.".to_string())
        } else {
            Message::Text(raw_message.clone())
        };

        // Send the message if the other user is connected to socket
        unsafe {
            for connection in &CONNS{
                if connection.id.eq(&user) {
                    println!("USER CONNECTED CURRENTLY");
                    return connection.out.send(msg)
                }
            }
        }

        Ok(())

    }

    fn on_close(&mut self, code: CloseCode, reason: &str) {
        // Iterate through connections and remove
        unsafe {
            CONNS.retain(|c| !c.id.eq(&self.id) );
        }

        println!("ON CLOSE");
        match code {
            CloseCode::Normal => println!("The client is done with the connection."),
            CloseCode::Away => println!("The client is leaving the site."),
            CloseCode::Abnormal => {
                println!("Closing handshake failed! Unable to obtain closing status from client.")
            },
            _ => println!("The client encountered an error: {}", reason),
        }

    }

    fn on_error(&mut self, err: Error) {
        println!("The server encountered an error: {:?}", err);
    }
}

pub fn websocket() -> () {
  println!("Web Socket Server is ready at ws://127.0.0.1:8001/ws");
  println!("Server is ready at http://127.0.0.1:8000/");

  // Listen on an address
  listen("127.0.0.1:8001", |out| { Connection { out: out, id: "".to_string() } }).unwrap()

}

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

    thread::spawn(|| {
        websocket();
          
    });

    
      rocket().launch();
}