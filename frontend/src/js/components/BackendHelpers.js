import axios from 'axios';

/**
 * File with helper functions for backend calls that are used by
 * multiple components in the frontend
 */

// Creates a JSON with the User object used in database
export function createUserJson(username = "", email = "", password = "") {
    var form = {id: '12345678-1234-4321-4321-123456701234', username: username, email: email, password: password, profilepic: "", sitewideban: false};
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
