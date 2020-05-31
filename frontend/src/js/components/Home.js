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
import Attributes from './Attributes';
import { Link } from 'react-router-dom';
import Toast from 'react-bootstrap/Toast';

import KennelCard from './KennelCard';

import { isLoggedIn, updateLoggedInState, updateLoggedInUser } from './BackendHelpers.js';

import axios from 'axios'

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loggedIn: false,
      reviewArray: [],
      reviewsListed: false,
      user: "",
      kennelArrayTop: [],
      kennelArrayNew: [],
      showPopup: null
    };

    this.resetAuthState = this.resetAuthState.bind(this);

  }

  /**
   * Called by navbar if user logs out from homepage.
   * Resets homepage and its components (review cards) to logged out state.
   */
  resetAuthState() {
    location.reload();
  }

  /**
   * updates auth state after homepage loaded and lists reviews
   */
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

          // Add necessary review info for rendering review cards to reviewArray
          this.state.reviewArray.push({
            title: response.data[i].title,
            author: response.data[i].author,
            text: response.data[i].text,
            kennel: response.data[i].kennel_name,
            rating: response.data[i].rating,
            id: response.data[i].review_uuid,
            isLiked: response.data[i].is_liked,
            isDisliked: response.data[i].is_disliked,
            timestamp: response.data[i].timestamp
          });

        }

        // Used for loading logic
        this.setState({ reviewsListed: true });
      }

    }).catch(error => {

      // Review not found in database
      this.setState({ showPopup: 'Failed to list reviews' });

    });


    // Load top 5 kennels
    axios({
      method: 'get',
      url: '/get_top_kennels'
    }).then(response => {

      let kennelArray = []

      for (var i = 0; i < response.data.length; i++) {

        var tagsStr = "";
        // Make sure there are tags in the kennel to avoid error
        if (response.data[i].tags != null) {
          if (response.data[i].tags.length > 0) {
            tagsStr = tagsStr + response.data[i].tags[0];
          }
          for (var j = 1; j < response.data[i].tags.length; j++) {
            tagsStr = tagsStr + ", " + response.data[i].tags[j];
          }
        } else {
          tagsStr = "None" // No tags
        }

        kennelArray.push({
          kennelName: response.data[i].kennel_name,
          kennelRules: response.data[i].rules,
          kennelTags: tagsStr,
          followerCount: response.data[i].follower_count
        });
      }

      // Used for loading logic
      this.setState({ kennelArrayTop: kennelArray });


    }).catch(error => {

      // Kennel not found in database
      this.setState({ showPopup: 'Failed to list top kennels' });

    });


    // Load newest 5 kennels
    axios({
      method: 'get',
      url: '/get_new_kennels'
    }).then(response => {

      let kennelArray = []

      for (var i = 0; i < response.data.length; i++) {

        var tagsStr = "";
        // Make sure there are tags in the kennel to avoid error
        if (response.data[i].tags != null) {
          if (response.data[i].tags.length > 0) {
            tagsStr = tagsStr + response.data[i].tags[0];
          }
          for (var j = 1; j < response.data[i].tags.length; j++) {
            tagsStr = tagsStr + ", " + response.data[i].tags[j];
          }
        } else {
          tagsStr = "None" // No tags
        }

        kennelArray.push({
          kennelName: response.data[i].kennel_name,
          kennelRules: response.data[i].rules,
          kennelTags: tagsStr,
          followerCount: response.data[i].follower_count
        });
      }

      // Used for loading logic
      this.setState({ kennelArrayNew: kennelArray });


    }).catch(error => {

      // Kennel not found in database
      this.setState({ showPopup: 'Failed to list top kennels' });

    });
  }


  render() {

    // Personalized or general greeting depending on whether used logged in
    let greeting = "Welcome to Yip!";
    let homePageMessage = "A community-based review site.";
    if (this.state.loggedIn) {
      greeting = "Welcome back, " + this.state.user + "!";
      homePageMessage = "Check out the latest reviews from kennels and reviewers you follow."
    }

    let homeContent;
    let reviews;
    /*
    let kennels = this.state.kennelArray.map(function (kennel) {
            return <KennelCard kennelName={kennel.kennelName} kennelRules={kennel.kennelRules} kennelTags={kennel.kennelTags} followerCount={kennel.followerCount} />
        });
      */
    let kennelsTop = this.state.kennelArrayTop.map(function (kennel) {
      return <li><Link to={`/kennel-${kennel.kennelName}`}>{kennel.kennelName}</Link></li>
    });

    let kennelsNew = this.state.kennelArrayNew.map(function (kennel) {
      return <li><Link to={`/kennel-${kennel.kennelName}`}>{kennel.kennelName}</Link></li>
    });


    /* PREVIOUS HOME PAGE -----------------------------------
     
    homeContent = <div>
          <Jumbotron id="jumbotron" className="text-center">
          <h1>{greeting}</h1>
          <p>{homePageMessage}</p>
          <p id="authstatus">
          </p>
          </Jumbotron>
          {reviews}
        </div>;  


    // PREVIOUS HOME PAGE ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ */

    // Renders when reviews are loaded from backend
    if (this.state.reviewsListed) {
      reviews = this.state.reviewArray.map(function (review) {
        return <ReviewCard reviewId={review.id} reviewName={review.title} reviewerName={review.author} reviewPreview={{ __html: review.text }}
          kennelName={review.kennel} rating={review.rating} isLiked={review.isLiked} isDisliked={review.isDisliked} timestamp={review.timestamp} />
      });
      homeContent = <div>
        <div class="homereviews">
          <Jumbotron id="jumbotron" className="text-center">
            <h1>{greeting}</h1>
            <p>{homePageMessage}</p>
            <p id="authstatus">
            </p>
          </Jumbotron>
          <Toast className="mx-auto smallPopup" onClose={() => this.setState({ showPopup: null })} show={this.state.showPopup} autohide>
            <Toast.Header className="smallPopup">
              <strong className="mx-auto">{this.state.showPopup}</strong>
            </Toast.Header>
          </Toast>
          {reviews}
          <div className="text-center">
            <Link to="/attributes">Credit attributed for use of icons found here.</Link>
          </div>
        </div>
        <div class="homepanel">
          <Jumbotron id="jumbotron" className="text-center">
            <h1> Top Kennels </h1>
          </Jumbotron>
          <ul>
            {kennelsTop}
          </ul>
          <Jumbotron id="jumbotron" className="text-center">
            <h1> New Kennels </h1>
          </Jumbotron>
          <ul>
            {kennelsNew}
          </ul>
        </div>
      </div>;

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