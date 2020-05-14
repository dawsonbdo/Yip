import React, { Component } from 'react';

import Jumbotron from "react-bootstrap/Jumbotron";
import Button from 'react-bootstrap/Button';
import ReviewCard from './ReviewCard';
import YipNavBar from "./YipNavBar";
import CommentCard from './CommentCard';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import { isLoggedIn, updateLoggedInState } from './BackendHelpers.js';

import axios from 'axios'

class Home extends Component {
  constructor(props) {
    super(props);

    // Creates state to keep track of if logged in
    this.state = {
      loggedIn: false,
      reviewArray: [],
      reviewsListed: false
    };

  }

  // After component is loaded, update auth state
  componentDidMount() {

    // Updates logged in state of the component
    updateLoggedInState(this);

    /* Testing get followed kennels, move to navbar dropdown when implemented
    var token = localStorage.getItem('jwtToken');
    var url = '/get_followed_kennels/' + token;
    axios({
      method: 'get',
      url: url,
    }).then(response => {
      for( var i = 0; i < response.data.length; i++ ) {
        alert("following: " + response.data[i].kennel_name);
      }
    }).catch(error => {
      alert('Failed to get kennels');
    });*/
  }

  // Displays if logged in on home page
  componentDidUpdate() {

    // Sets HTML on page to display logged in status
    //document.getElementById('authstatus').innerHTML = "Logged In: " + isLoggedIn(this);

    // Load reviews
    axios({
      method: 'post',
      url: '/load_reviews',
      data: localStorage.getItem('jwtToken')
    }).then(response => {

      //alert('Listed reviews');

      // TODO: Populate ReviewCards using response.data (this is an array of DisplayReview objs)
      //       (check backend/src/reviews/handlers.rs for the fields of a DisplayReview)

      // Iterate through reviews

      if (!this.state.reviewsListed) {
        for (var i = response.data.length - 1; i >= 0; i--) {

          // Print reviews to console for now
          console.log(response.data[i]);
          this.state.reviewArray.push({
            title: response.data[i].title,
            author: response.data[i].author,
            text: response.data[i].text
          });

        }

        this.setState({ reviewsListed: true });
      }

    }).catch(error => {

      // Review not found in database
      alert('Failed to list reviews');

    });

  }



  render() {
    const reviews = this.state.reviewArray.map(function (review) {
      return <ReviewCard reviewName={review.title} reviewerName={review.author} reviewPreview={review.text} />
    });

    return (
      <div>
        <YipNavBar />
        <Jumbotron id="jumbotron" className="text-center">
          <h1>Welcome to Yip!</h1>
          <p>
            A community-based review site.
                </p>
          <p id="authstatus">
          </p>
          <p>
            <Button variant="warning">Learn more</Button>
          </p>
        </Jumbotron>
        {reviews}
      </div>
    )
  }
}

export default Home;