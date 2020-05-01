import React, {Component} from 'react';

import Jumbotron from "react-bootstrap/Jumbotron";
import Button from 'react-bootstrap/Button';
import ReviewCard  from './ReviewCard';
import YipNavBar from "./YipNavBar";

class Home extends Component {
    render() {
        return (
            <div>
              <YipNavBar />
              <Jumbotron id="jumbotron" className="text-center">
                <h1>Welcome to Yip!</h1>
                <p>
                  A community-based review site.
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
            </div>
        )
    }
}

export default Home;