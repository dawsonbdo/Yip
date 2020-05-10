use multipart::server::Multipart;
use rocket::{
    data::{Data, FromData, Outcome, Transform, Transformed},
    post, routes, Request,
};
use std::io::Read;

use rocket::http::ContentType;
use super::handlers::Review;
use rocket_contrib::json::Json;


#[derive(Debug, Deserialize)]
pub struct ReviewMultipart {
    pub review: String,
    pub images: Vec<Vec<u8>>,
    pub names: Vec<String>,
}

impl<'a> FromData<'a> for ReviewMultipart {
    type Owned = Vec<u8>;
    type Borrowed = [u8];
    type Error = ();

    fn transform(_request: &Request, data: Data) -> Transform<Outcome<Self::Owned, Self::Error>> {
        let mut d = Vec::new();
        data.stream_to(&mut d).expect("Unable to read");

        Transform::Owned(Outcome::Success(d))
    }

    fn from_data(request: &Request, outcome: Transformed<'a, Self>) -> Outcome<Self, Self::Error> {
        let d = outcome.owned()?;

        let ct = request
            .headers()
            .get_one("Content-Type")
            .expect("no content-type");
        let idx = ct.find("boundary=").expect("no boundary");
        let boundary = &ct[(idx + "boundary=".len())..];

        let mut mp = Multipart::with_body(&d[..], boundary);

        // Custom implementation parts

        let mut review = None;
        let mut images = vec![];
        let mut names = vec![];

        mp.foreach_entry(|mut entry| match &*entry.headers.name {
            "review" => {
                let mut r = String::new();
                entry.data.read_to_string(&mut r).expect("not text");
                review = Some(r);
            }
            "image" => {
                let mut d = Vec::new();
                entry.data.read_to_end(&mut d).expect("not file");
                images.push(Some(d).expect("image not set"));
            }
            "name" => {
                let mut n = String::new();
                entry.data.read_to_string(&mut n).expect("not text");
                names.push(Some(n).expect("name not set"));
            }
            other => panic!("No known key {}", other),
        })
        .expect("Unable to iterate");

        let v = ReviewMultipart {
            review: review.expect("rip"),
            images: images,
            names: names,
        };

        // End custom

        Outcome::Success(v)
    }
}