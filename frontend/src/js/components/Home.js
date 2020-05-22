import React, { Component } from 'react';

import Jumbotron from "react-bootstrap/Jumbotron";
import Button from 'react-bootstrap/Button';
import ReviewCard from './ReviewCard';
import YipNavBar from "./YipNavBar";
import Image from 'react-bootstrap/Image';
import LoadingIcon from '../../assets/loadingIcon.gif';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import { isLoggedIn, updateLoggedInState, updateLoggedInUser } from './BackendHelpers.js';

import axios from 'axios'

class Home extends Component {
  constructor(props) {
    super(props);

    // Creates state to keep track of if logged in
    this.state = {
      loggedIn: false,
      reviewArray: [],
      reviewsListed: false,
      user: ""
    };

    this.resetAuthState = this.resetAuthState.bind(this);

  }

  resetAuthState() {
    location.reload();
  }

  // After component is loaded, update auth state
  componentDidMount() {

    // Updates logged in state of the component
    updateLoggedInState(this);
    updateLoggedInUser(this);

    // Load reviews
    axios({
      method: 'post',
      url: '/load_reviews/' + localStorage.getItem('jwtToken')
    }).then(response => {

      // Iterate through reviews
      if (!this.state.reviewsListed) {
        for (var i = 0; i < response.data.length; i++) {

          // Print reviews to console for now
          console.log(response.data[i]);
          this.state.reviewArray.push({
            title: response.data[i].title,
            author: response.data[i].author,
            text: response.data[i].text,
            kennel: response.data[i].kennel_name,
            rating: response.data[i].rating,
            id: response.data[i].review_uuid,
            isLiked: response.data[i].is_liked,
            isDisliked: response.data[i].is_disliked
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
    let greeting = "Welcome to Yip!";
    let homePageMessage = "A community-based review site.";
    if (this.state.loggedIn) {
      greeting = "Welcome back, " + this.state.user + "!";
      homePageMessage = "Check out the latest reviews from kennels and reviewers you follow."
    }

    let homeContent;
    let reviews;
    if (this.state.reviewsListed) {
      reviews = this.state.reviewArray.map(function (review) {
        return <ReviewCard reviewId={review.id} reviewName={review.title} reviewerName={review.author} reviewPreview={{ __html: review.text }}
          kennelName={review.kennel} rating={review.rating} isLiked={review.isLiked} isDisliked={review.isDisliked} />
      });
      homeContent = <div>
        <Jumbotron id="jumbotron" className="text-center">
          <h1>{greeting}</h1>
          <p>{homePageMessage}</p>
          <p id="authstatus">
          </p>
        </Jumbotron>
        {reviews}
      </div>
    } else {
      // Loading Symbol
      homeContent = <Row>
        <Image className="mx-auto loadingIcon loading" src={LoadingIcon}></Image>
      </Row>;
    }

    return (
      <div>
        <YipNavBar fromHomePage={true} resetAuthHomePage={this.resetAuthState} />
        {homeContent}
      </div>
    )
  }
}

export default Home;