import React, {Component} from 'react';

import Jumbotron from "react-bootstrap/Jumbotron";
import Button from 'react-bootstrap/Button';
import ReviewCard  from './ReviewCard';
import YipNavBar from "./YipNavBar";
import CommentCard from './CommentCard';

import { isLoggedIn, updateLoggedInState } from './BackendHelpers.js';

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
               <ReviewCard />
               <ReviewCard />
               <ReviewCard />
               <ReviewCard />
               <ReviewCard />
               <ReviewCard />
               <CommentCard />
            </div>
        )
    }
}

export default Home;