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

    // Load reviews
    axios({
      method: 'post',
      url: '/load_reviews',
      data: localStorage.getItem('jwtToken')
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
            id: response.data[i].review_uuid
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
    let reviews;
    if (this.state.reviewsListed) {
      reviews = this.state.reviewArray.map(function (review) {
        return <ReviewCard reviewId={review.id} reviewName={review.title} reviewerName={review.author} reviewPreview={{ __html: review.text }} kennelName={review.kennel}/>
      });
    } else {
      // Loading Symbol
      reviews = <Row>
                  <Image className="mx-auto loadingIcon" src={LoadingIcon}></Image>
                </Row>;
    }

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
        </Jumbotron>
        {reviews}
      </div>
    )
  }
}

export default Home;