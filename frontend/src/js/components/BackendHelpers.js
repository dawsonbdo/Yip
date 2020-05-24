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
export function createReviewJson(id = "", title = "", text = "", author = "") {
    var form = {kennel_uuid: id,
                title: title,
                author: author,
                text: text,
                images: {},
                rating: 0,
                tags: {},
              };
    return form
};

// Creates a report Json
export function reportJson(kennel = "", is_comment = "", comment_id = "", review_id = "", reason = "", escalated = false, token = "") {
    var form = {kennel: kennel,
                is_comment: is_comment,
                comment_id: comment_id,
                review_id: review_id,
                reason: reason,
                escalated: escalated,
                reporter_token: token,
              };
    return form

};

// Creates a JSON Kennel object
export function createKennelJson(name = "", tags = "", muted_words = "", rules = "", token ="", description ="") {
    var form = {kennel_uuid: "00000000-0000-0000-0000-000000000000",
                tags: tags,
                kennel_name: name,
                muted_words: muted_words,
                rules: rules,
                token: token,
                description: description
                };

    return form
};

// Creates a JSON Kennel object for editing
export function editKennelJson(name = "", tags = "", muted_words = "", rules = "", bans ="", token ="", description="") {
    var form = {kennel_uuid: "00000000-0000-0000-0000-000000000000",
                tags: tags,
                kennel_name: name,
                muted_words: muted_words,
                rules: rules,
                bans: bans,
                token: token,
                description: description
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

// Creates a JSON object for deleting reviews
export function deleteReviewJson(review_uuid = "", token = "") {
    var form = {review_uuid: review_uuid, token: token};
    return form
};

function getDateTime(){
  var today = new Date();
  var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var dateTime = date+' '+time;
  return dateTime;
}

// Updates the user state of the page
export async function updateLoggedInUserAndWebSocket(page){
      // Send POST request with token for authenticatio
      const localUser = await axios({
        method: 'get',
        url: '/get_username/' + localStorage.getItem('jwtToken'),
      }).then((response) => {
            //alert("CREATING SOCKET");

            // Create web socket
            var ws = new WebSocket('ws://127.0.0.1:8001/' + response.data);

            var that = page;

            // Adds message whenever received
            ws.onmessage = function(msg) { 
              
              that.createHTMLMessage(msg.data, 'server');
              
            };

            var inputElem = document.querySelector('.chatMessage');

            // Set states
            page.setState({ inputElem: inputElem });
            page.setState({ ws: ws });


            // Add listener to input
            inputElem.addEventListener('keypress', function (e) {
                var key = e.which || e.keyCode;
                if (key === 13) {
                    //alert("EMTER");

                    // Get input and token and recipieint
                    var inputElem = document.querySelector('.chatMessage');
                    var token = localStorage.getItem('jwtToken');
                    var recipient = that.state.recipient;

                    console.log("RECIPIENT");
                    console.log(recipient);

                    var msg = that.state.user + "-" + inputElem.value;

                    // Create HTML message on local client
                    that.createHTMLMessage(msg, 'client');

                    // Send message to websocket server
                    ws.send(recipient + "-" + inputElem.value);

                    // Create form for request
                    var form = {
                        sender: token, //token
                        recipient: recipient, //recipient username
                        text: inputElem.value,
                    };

                    console.log("FORM");
                    console.log(form);

                    
                    // Send POST request
                    axios({
                        method: 'post',
                        url: '/create_message',
                        data: form
                    }).then(response => {

                        //alert('Msg sucessfuly created in db');

                    }).catch(error => {

                        // Failed to dislike review
                        alert('Msg unsuccessfuly sent to db');

                    });
                    
                    

                    // Empty input after sending
                    inputElem.value = "";
                    that.setState({ inputElem: inputElem });
                }
            });
        

        // Return username ("" if none)
        return response.data;

      });

      // Update logged in state
      page.setState({
        user: localUser
      });
}

export async function setAllUsers(page){
        axios({
            method: 'get',
            url: '/get_all_users'
        }).then(response => {

            alert('All users receieved');

            if ( response.data == undefined || response.data.length == 0 ){
                alert('No past messages in inbox');
                return;
            }

            var users = [];

            for ( var i = 0; i < response.data.length; i++ ){
              console.log("TYPE " + (typeof response.data[i]));
                if ( response.data[i] != page.state.user ){
                  users.push({name: response.data[i]});
                }
            }

            page.setState({allUsers: users});

           
        }).catch(error => {

            // Failed to dislike review
            alert('Failed to load all users');

        });
}

// Updates the user state of the page
export async function updateLoggedInUser(page){
      // Send POST request with token for authenticatio
      const localUser = await axios({
        method: 'get',
        url: '/get_username/' + localStorage.getItem('jwtToken'),
      }).then((response) => {

        // Return username ("" if none)
        return response.data;

      });

      // Update logged in state
      page.setState({
        user: localUser
      });
}

// Updates the logged in state of a component that is passed in by checking database
export async function updateLoggedInState(page){
      // Send POST request with token for authenticatio
      const loggedIn = await axios({
        method: 'post',
        url: '/auth/' + localStorage.getItem('jwtToken')
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
