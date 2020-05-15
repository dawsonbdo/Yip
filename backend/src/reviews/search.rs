use diesel;
use diesel::prelude::*;
use uuid::Uuid;

use super::handlers;
use handlers::{Review, DisplayReview, DbReview};

use crate::schema::reviews;
use radix_heap;

/**
 * Method that returns a vector with all search result reviews
 * @param query: String of query
 * @param connection: database connection
 *
 * @return returns vector of reviews in kennel
 */
pub fn search_reviews(query: String, connection: &PgConnection) -> QueryResult<Vec<DisplayReview>> {
    
    // Get vector of all reviews in database (returns error if failed)
    let mut reviews = handlers::all(connection)?;
    
    // Convert query to lowercase
    let mut query_lowercase = query.clone();
    query_lowercase.make_ascii_lowercase();

    // Split query by words into tokens
    let query_words: Vec<&str> = query_lowercase.split(' ').collect();

    // Search and return reviews using tf-idf
    Ok(tf_idf(reviews, query_words, connection))
}

fn tf_idf(reviews: Vec<DbReview>, query_words: Vec<&str>, connection: &PgConnection) -> Vec<DisplayReview> {

	// Get number of reviews and terms
	let num_docs = reviews.len();
	let num_terms = query_words.len();

	// Creates vectors keep track of sum tf of each review
	let mut review_tfs : Vec<f32> = Vec::with_capacity(num_docs);
	let mut review_sum_tf_idfs : Vec<f32> = Vec::with_capacity(num_docs);

	// Initialize the vectors 0
	for i in 0..num_docs {
		review_tfs.push(0.0);
		review_sum_tf_idfs.push(0.0);
	}

	// Iterate through each query word
    for term_idx in 0..(num_terms) {

    	// Get current term
    	let term = &query_words[term_idx];

    	// Store num of docs that have the term
    	let mut num_docs_with_term = 0;

    	// Iterate through reviews calculating tf scores
	    for rev_idx in 0..(num_docs) {

	    	// Get current review
	    	let review = &reviews[rev_idx];

	    	// Calculate tf
	    	let tf = calc_tf(term, review);
	    		
	    	// Increment num docs with term
	    	if tf > 0.0 {
	    		num_docs_with_term += 1;
	    	}
	    	
	    	// Store tf of review
	    	review_tfs[rev_idx] = tf;
	    }

	    // Calculate idf for current term
	    let idf = (num_docs as f32 / num_docs_with_term as f32).ln();

    	// Increment sum tf-idfs
    	for i in 0..(num_docs) {
    		review_sum_tf_idfs[i] += review_tfs[i] * idf;
    	}
    }

	
    // Create heap to get top 10 reviews
    let mut heap = radix_heap::RadixHeapMap::new();

    // Push sum tf-idf values to heap
    for i in 0..num_docs {

    	// Pushes to heap if greater than 0
    	if ( review_sum_tf_idfs[i] > 0.0 ){
    		let wrapped_sumtfidf = ordered_float::NotNan::<f32>::from(review_sum_tf_idfs[i]);
    		heap.push(wrapped_sumtfidf, i);
    	}

    }

    // Create vector of reviews to be returned
    let mut searched_reviews : Vec<DisplayReview> = vec![];

    // Get top 10 reviews
    for _x in 0..10 {

    	// Make sure there are more reviews to grab
    	if let Some(a) = heap.pop() {

    		// Push review to vector
    		let (val, idx) = a;
    		searched_reviews.push(DbReview::to_review(&reviews[idx], connection));

    		println!("Review {}: {}", idx, val);
    	} else {
    		break;
    	}
    	
    }

    searched_reviews

}

fn calc_tf(term: &str, review: &DbReview) -> f32{

	// Convert review title/text to lowercase
	let mut title = review.title.clone();
	let mut text = review.text.clone();
	title.make_ascii_lowercase();
	text.make_ascii_lowercase();

	// Split title by words into tokens
    let title_tokens: Vec<&str> = title.split(' ').collect();

    // Split review body by words into tokens
    let review_tokens: Vec<&str> = text.split(' ').collect();

    // Calculate number of terms in total
    let total_words = (title_tokens.iter().len() + review_tokens.iter().len()) as i32;

    // Keep track of number of time term occures
    let mut term_count = 0;

	// Iterate through title calculating number of times term appears
	for t in title_tokens {

		// Check if matching term
		if t.eq(term){
			term_count += 1;
		}
	}

	// Iterate through review text calculating number of times term appears
	for t in review_tokens {

		// Check if matching term
		if t.eq(term){
			term_count += 1;
		}
	}

	//println!("Term Count: {} Total Words: {}", term_count, total_words);

	// Return tf value
	(term_count as f32) / (total_words as f32)
}