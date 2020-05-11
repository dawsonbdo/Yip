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
      document.getElementById('authstatus').innerHTML = "Logged In: " + isLoggedIn(this);

      // Load reviews
      axios({
            method: 'get',
            url: '/reviews'
        }).then(response => {

            alert('Listed reviews');

            // Gets list of IDs by splitting up response string by commas
            var reviewIds = response.data.split(",");

            // Go through reviews filling up the review cards
            for ( int i = 1; i < reviewIds.length; i++ ){

              // Index 1 is the starting point
              var reviewId = reviewIds[i];
            
              // Figures out url of GET request
              var reqUrl = "/get_review/" + reviewId;

              // Send GET request with review id as query string
              axios({
                  method: 'get',
                  url: reqUrl
              }).then(review => {

                  alert('Review successfully grabbed from database!');

                  // TODO: Fill in review cards using returned reviews
                  var card1 = document.getElementById('c1');
                    
                  //card1.setState({reviewName: review.data.title});
                  //card1.props.reviewerName = review.data.author;
                  //card1.props.reviewPreview = review.data.review_text;
                   
              }).catch(error2 => {

                  // Review not found in database
                  alert('Review does not exist');

              });
      
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