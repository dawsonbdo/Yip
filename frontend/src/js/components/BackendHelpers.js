import axios from 'axios';

/**
 * File with helper functions for backend calls that are used by
 * multiple components in the frontend
 */

// Creates a JSON User object
export function createUserJson(username = "", email = "", password = "") {
    var form = {username: username, email: email, password: password};
    return form
};

// Creates a JSON Review object
export function createReviewJson(title = "", text = "", author = "") {
    var form = {kennelid: "00000000-0000-0000-0000-000000000000",
                title: title,
                author: author,
                //date_posted: "2",
                review_text: text,
                images: {},
                rating: 0,
                tags: {}};
    return form
};

// Updates the logged in state of a component that is passed in by checking database
export async function updateLoggedInState(page){
      // Send POST request with token for authenticatio
      const loggedIn = await axios({
        method: 'post',
        url: '/auth',
        data: localStorage.getItem('jwtToken')
      }).then((response) => {

        // Return if logged in (true/false)
        return response.data;

      });

      // Update logged in state
      page.setState({
        loggedIn: loggedIn
      });
}

// Returns if the user is curently logged in given the component
export function isLoggedIn(page){

	// Returns the pages logged in state
	return page.state.loggedIn;
	
}

// Function that formats a form to be sent in POST request
// const formUrlEncoded = x => Object.keys(x).reduce((p, c) => p + `&${c}=${encodeURIComponent(x[c])}`, '')
