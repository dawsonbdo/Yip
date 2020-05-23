#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use] extern crate rocket;
#[macro_use] extern crate diesel;
#[macro_use] extern crate serde_derive;

#[macro_use] extern crate serde_json;
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

static mut conns : Vec<Connection> = Vec::new(); 

// Keeps track of a connection with id and Sender
struct Connection {
    out: Sender,
    id: String,
}

/*
// Server web application handler
struct Server {
    out: Sender,
    count: Rc<Cell<u32>>,
    id: String,
}
*/

impl Handler for Connection {
    // 1.
    fn on_request(&mut self, req: &Request) -> Result<(Response)> {
        unsafe {
            conns.push(Connection {
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
            "/ws" => {
                // 2.
                println!("Browser Request from {:?}", req.origin().unwrap().unwrap());
                // Uncomment this and find what you can do with them when you develope
                println!("Client found is {:?}", req.client_addr().unwrap());
                let resp = Response::from_request(req);
                //println!("{:?} \n", &resp);
                resp
            }

            id => {
                    // Store the username?
                    let mut char_vec: Vec<char> = id.to_string().chars().collect();
                    char_vec.remove(0);
                    self.id = char_vec.into_iter().collect();;
                    Response::from_request(req)
                },//Ok(Response::new(404, "Not Found", b"404 - Not Found".to_vec())),
        }
    }

    fn on_open(&mut self, handshake: Handshake) -> Result<()> {
        println!("ON OPEN");
        // 3.
        //self.count.set(self.count.get() + 1);
        //let number_of_connection = self.count.get();

        //if number_of_connection > 5 {
            // panic!("There are more user connection than expected.");
        //}

        // 4.
        //let open_message = format!("{} entered and the number of live connections is {}", &handshake.peer_addr.unwrap(), &number_of_connection);
        // println!("{}", &handshake.local_addr.unwrap());

        //println!("{}", &open_message);
        //self.out.broadcast(open_message);

        Ok(())
    }

    fn on_message(&mut self, message: Message) -> Result<()> {
        // Iterate through connections
        
        unsafe {
            for connection in &conns{
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

        // 5. Get the message as a Message object
        let message = if raw_message.contains("!warn") {
            let warn_message = "One of the clients sent warning to the server.";
            println!("{}", &warn_message);
            Message::Text("There was warning from another user.".to_string())
        } else {
            Message::Text(raw_message.clone())
        };

        // 6. Send the message if the other user is connected, otherwise just database
        
        // Only send message to user
        unsafe {
            for connection in &conns{
                if (connection.id.eq(&user)){
                    println!("USER LOGGED in");
                    return connection.out.send(msg)
                }
            }
        }

        Ok(())

        //self.out.broadcast(message)
    }

    fn on_close(&mut self, code: CloseCode, reason: &str) {
        // Iterate through connections and remove
        unsafe {
            conns.retain(|c| !c.id.eq(&self.id) );
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

        // 7.
        //self.count.set(self.count.get() - 1)
    }

    fn on_error(&mut self, err: Error) {
        println!("The server encountered an error: {:?}", err);
    }
}

pub fn websocket() -> () {
  println!("Web Socket Server is ready at ws://127.0.0.1:8001/ws");
  println!("Server is ready at http://127.0.0.1:8000/");

  // Rc is a reference-counted box for sharing the count between handlers
  // since each handler needs to own its contents.
  // Cell gives us interior mutability so we can increment
  // or decrement the count between handlers.

  // Listen on an address and call the closure for each connection
  //let count = Rc::new(Cell::new(0));
  listen("127.0.0.1:8001", |out| { Connection { out: out, id: "".to_string() } }).unwrap()

}

// Load home page for empty file path
#[get("/")]
fn home() -> Option<NamedFile> {
	// Empty file path, give home page
	NamedFile::open("static/pages/index.html").ok()
}

// Load home page for random URL
#[get("/<url>", rank=2)]
fn url(url: String) -> Option<NamedFile> {
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