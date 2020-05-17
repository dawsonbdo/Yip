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
export function createReviewJson(title = "", text = "", author = "", dateTime = "") {
    var form = {kennel_uuid: "f37c4d54-ab18-4e33-bd89-b4209ecd0f13",
                title: title,
                author: author,
                timestamp: dateTime,
                text: text,
                images: {},
                rating: 0,
                tags: {}};
    return form
};


// Creates a JSON Kennel object
export function createKennelJson(name = "", tags = "", muted_words = "", rules = "", token ="") {
    var form = {kennel_uuid: "00000000-0000-0000-0000-000000000000",
                tags: tags,
                kennel_name: name,
                muted_words: muted_words,
                rules: rules,
                token: token
                };

    return form
};

// Creates a JSON Comment object
export function createCommentJson(review_uuid = "", token = "", text = "") {
    var form = {review_uuid: review_uuid,
                author_token: token,
                timestamp: getDateTime(),
                text: text,
                };
    return form
};

// Creates a JSON object for following/unfollowing kennels
export function followKennelJson(kennel_name = "", token = "") {
    var form = {kennel_name: kennel_name, token: token};
    return form
};

// Creates a JSON object for following/unfollowing kennels
export function followUserJson(username = "", token = "") {
    var form = {token: token, username: username};
    return form
};

// Creates a JSON object for liking/dislking reviews
export function likeDislikeReviewJson(review_uuid = "", token = "") {
    var form = {review_uuid: review_uuid, token: token};
    return form
};

// Creates a JSON object for liking/dislking comments
export function likeDislikeCommentJson(comment_uuid = "", token = "") {
    var form = {comment_uuid: comment_uuid, token: token};
    return form
};

function getDateTime(){
  var today = new Date();
  var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var dateTime = date+' '+time;
  return dateTime;
}

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
