use diesel;
use diesel::prelude::*;
use uuid::Uuid;

use crate::reviews;
use reviews::handlers::{Review, DisplayReview, DbReview};

use crate::kennels;
use kennels::handlers::{Kennel, DbKennel, DisplayKennel};

use radix_heap;

/**
 * Method that returns a vector with all search result reviews
 * @param query: String of query
 * @param connection: database connection
 *
 * @return returns vector of reviews matching query
 */
pub fn search_reviews(query: String, connection: &PgConnection) -> QueryResult<Vec<DisplayReview>> {
    
    // Get vector of all reviews in database (returns error if failed)
    let mut reviews = reviews::handlers::all(connection)?;
    
    // Convert query to lowercase
    let mut query_lowercase = query.clone();
    query_lowercase.make_ascii_lowercase();

    // Split query by words into tokens
    let query_words: Vec<&str> = query_lowercase.split(' ').collect();

    // Search and return reviews using tf-idf
    Ok(tf_idf(reviews, query_words, connection))
}

/**
 * Helper method that calculates tf-idf of reviews/query words
 * and returns the top 20 reviews given the query words based on tf-idf score
 * @param reviews: the reviews
 * @param query_words: the terms
 * @param connection: database connection
 *
 * @return returns vector of reviews
 */
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
	    	let tf = calc_tf_review(term, review);
	    		
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

    // Get top 20 reviews
    for _x in 0..20 {

    	// Make sure there are more reviews to grab
    	if let Some(a) = heap.pop() {

    		// Push review to vector
    		let (val, idx) = a;
    		searched_reviews.push(reviews::handlers::to_review(&reviews[idx]));

    		println!("Review {}: {}", idx, val);
    	} else {
    		break;
    	}
    	
    }

    //jaro_dist("martha", "marhta");

    searched_reviews

}

/**
 * Helper method that calculates tf of a review (using title and body text) given term
 * @param term: the term that tf calculated for
 * @param review: the document that term frequency is calculated for
 *
 * @return returns the tf value
 */
fn calc_tf_review(term: &str, review: &DbReview) -> f32{

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
    let mut j_dist = 0.0;

	// Iterate through title calculating number of times term appears
	for t in title_tokens {

		// Check if matching term
		if t.eq(term){
			term_count += 1;
		}
        j_dist += jaro_dist(&t, term);
	}

	// Iterate through review text calculating number of times term appears
	for t in review_tokens {

		// Check if matching term
		if t.eq(term){
			term_count += 1;
		}
        j_dist += jaro_dist(&t, term);
	}

    println!("Jaro Score ({}): {}", term, j_dist);
    println!("TF: {}", (term_count as f32) / (total_words as f32));

	//println!("Term Count: {} Total Words: {}", term_count, total_words);
    j_dist + (term_count as f32) / (total_words as f32)
	// Return tf value
	//(term_count as f32) / (total_words as f32)
}

/**
 * Helper method that returns jaro distance of two strings
 * @param str1: 1st string
 * @param str2: 2nd string
 *
 * @return returns value
 */
pub fn jaro_dist(str1: &str, str2: &str) -> f32 {

    //println!("WTF");

    let s1 : Vec<char> = str1.to_string().chars().collect();
    let s2 : Vec<char> = str2.to_string().chars().collect();

    let mut m = 0.0;
    for c in str1.to_string().chars(){
        if str2.contains(c){
            m += 1.0;
        }
    }

    let mut t = 0.0;
    if s1.len() > s2.len() {

        for i in 0..s2.len(){
            if !s1[i].eq(&s2[i]){
                t += 1.0;
            }
        }

        t += (s1.len() - s2.len()) as f32;

    } else {

        for i in 0..s1.len(){
            if !s1[i].eq(&s2[i]){
                t += 1.0;
            }
        }

        t += (s2.len() - s1.len()) as f32;

    }

    //println!("VALS: {} {} {} {}", m, t, s1.len(), s2.len());


    t = t/2.0;

    let d = (1 as f32/3 as f32) * ((m / s1.len() as f32 ) + (m / s2.len() as f32) + ((m-t) / m as f32));

    //let t1 : String = s1.iter().collect();
    //let t2 : String = s2.iter().collect();
    //println!("JARO DIST ({}, {}): {}", t1, t2, d);

    if d > 0.85 {
        d
    } else {
        0.0
    }
    //println!("VALS: {} {} {} {}", m, t, s1.len(), s2.len());

    

  
}

/**
 * Method that returns a vector with all search result kennels
 * @param query: String of query
 * @param connection: database connection
 *
 * @return returns vector of kennels matching query
 */
pub fn search_kennels(query: String, connection: &PgConnection) -> QueryResult<Vec<DisplayKennel>> {
    
    // Get vector of all kennels in database (returns error if failed)
    let mut kennels = kennels::handlers::all(connection)?;
    
    // Convert query to lowercase
    let mut query_lowercase = query.clone();
    query_lowercase.make_ascii_lowercase();

    // Split query by words into tokens
    let query_words: Vec<&str> = query_lowercase.split(' ').collect();

    // Search and return kennels using tf-idf
    Ok(kennel_similarity(kennels, query_words, connection))
}

/**
 * Helper method that calculates similarity scores for kennels and query words
 * and returns the top 20 kennels given the query words based on the score
 * @param kennels: the kennels
 * @param query_words: the terms
 * @param connection: database connection
 *
 * @return returns vector of reviews
 */
fn kennel_similarity(kennels: Vec<DbKennel>, query_words: Vec<&str>, connection: &PgConnection) -> Vec<DisplayKennel> {

    // Get number of kennels and terms
    let num_kennels = kennels.len();
    let num_terms = query_words.len();

    // Creates vectors keep track of sum tf of each review
    let mut kennel_scores : Vec<f32> = Vec::with_capacity(num_kennels);

    // Initialize the vectors 0
    for i in 0..num_kennels {
        kennel_scores.push(0.0);
    }

    // Iterate through each query word
    for term_idx in 0..num_terms {

        // Get current term
        let term = &query_words[term_idx];

        // Iterate through kennels
        for kennel_idx in 0..num_kennels {

            // Get pseudo tf value
            let tf = calc_tf_kennel(term, &kennels[kennel_idx]);

            // Update kennel score
            kennel_scores[kennel_idx] += tf;
        }
    }

    // Create heap to get top 20 kennels
    let mut heap = radix_heap::RadixHeapMap::new();

    // Push sum tf-idf values to heap
    for i in 0..num_kennels {

        // Pushes to heap if greater than 0
        if ( kennel_scores[i] > 0.0 ){
            let score = ordered_float::NotNan::<f32>::from(kennel_scores[i]);
            heap.push(score, i);
        }

    }

    // Create vector of kennels to be returned
    let mut searched_kennels : Vec<DisplayKennel> = vec![];

    // Get top 20 kennels
    for _x in 0..20 {

        // Make sure there are more kennels to grab
        if let Some(a) = heap.pop() {

            // Push kennel to vector
            let (val, idx) = a;
            searched_kennels.push(kennels::handlers::to_display_kennel(&kennels[idx], "".to_string(), connection));

            println!("Kennel {}: {}", idx, val);
        } else {
            break;
        }
        
    }

    searched_kennels

}

/**
 * Helper method that calculates tf of a kennel (using title and tags) given term
 * @param term: the term that tf calculated for
 * @param kennel: the kennel that term frequency is calculated for
 *
 * @return returns the tf value
 */
fn calc_tf_kennel(term: &str, kennel: &DbKennel) -> f32{

    let empty_vec : Vec<String> = vec!["".to_string()];

    // Convert kennel name/tags to lowercase
    let mut name = kennel.kennel_name.clone();
    let mut tags = match kennel.tags.as_ref() {
        Some(t) => t,
        None => &empty_vec,
    };

    name.make_ascii_lowercase();

    // Calculate number of terms in total
    let total_words = (tags.iter().len() + 1) as i32;

    // Keep track of number of time term occures
    let mut term_count = 0;

    // If term occurs in title, count as 3 occurrences
    if name.contains(term) {
        term_count += 3;
    }

    // Iterate through tags
    for t in tags {

        let mut tag = t.to_string();
        tag.make_ascii_lowercase();

        // Check if matching term
        if tag.contains(term){
            term_count += 1;
        }
    }

    println!("Term Count: {} Total Words: {}", term_count, total_words);

    // Return tf value
    (term_count as f32) / (total_words as f32)
}
