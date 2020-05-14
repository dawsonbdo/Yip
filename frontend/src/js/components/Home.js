import React, {Component} from 'react';

import Jumbotron from "react-bootstrap/Jumbotron";
import Button from 'react-bootstrap/Button';
import ReviewCard  from './ReviewCard';
import YipNavBar from "./YipNavBar";
import CommentCard from './CommentCard';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import { isLoggedIn, updateLoggedInState } from './BackendHelpers.js';

import axios from 'axios' 

class Home extends Component {
    constructor(props){
      super(props);

      // Creates state to keep track of if logged in
      this.state = { loggedIn: false };
    }

    // After component is loaded, update auth state
    componentDidMount(){

      // Updates logged in state of the component
      updateLoggedInState(this);
    }

    // Displays if logged in on home page
    componentDidUpdate(){

      // Sets HTML on page to display logged in status
      // LOGGED IN WORKS NOW
      //document.getElementById('authstatus').innerHTML = "Logged In: " + isLoggedIn(this);

      // Load reviews
      axios({
          method: 'post',
          url: '/load_reviews',
          data: localStorage.getItem('jwtToken')
      }).then(response => {

          alert('Listed reviews');

          // TODO: Populate ReviewCards using response.data (this is an array of DisplayReview objs)
          //       (check backend/src/reviews/handlers.rs for the fields of a DisplayReview)
          
          // Iterate through reviews
          for (var i = 0; i < response.data.length; i++ ){

            // Print reviews to console for now
            console.log(response.data[i]);

          } 
        
      }).catch(error => {

          // Review not found in database
          alert('Failed to list reviews');

      });

    }

    render() {

        return (
            <div>
              <YipNavBar />
              <Jumbotron id="jumbotron" className="text-center">
                <h1>Welcome to Yip!</h1>
                <p>
                  A community-based review site.
                </p>
                <p id = "authstatus">
                </p>
                <p>
                  <Button variant="warning">Learn more</Button>
                </p>
              </Jumbotron>
               <ReviewCard id="c1" reviewName={"Review Name"} reviewerName={"Name"} reviewPreview={"dasfasdfasdf"} />
               <ReviewCard reviewName={"Review Name"} reviewerName={"Name"} reviewPreview={"dasfasdfasdf"} />
               <ReviewCard reviewName={"Review Name"} reviewerName={"Name"} reviewPreview={"dasfasdfasdf"} />
               <ReviewCard reviewName={"Review Name"} reviewerName={"Name"} reviewPreview={"dasfasdfasdf"} />
               <ReviewCard reviewName={"Review Name"} reviewerName={"Name"} reviewPreview={"dasfasdfasdf"} />
               <ReviewCard reviewName={"Review Name"} reviewerName={"Name"} reviewPreview={"dasfasdfasdf"} />
               <CommentCard commenterName={"Name"} commentText={"Comment"} />
            </div>
        )
    }
}

export default Home;