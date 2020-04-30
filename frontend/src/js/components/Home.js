import React, {Component} from 'react';

import Jumbotron from "react-bootstrap/Jumbotron";
import Button from 'react-bootstrap/Button';

class Home extends Component {
    render() {
        return (
            <div>
                <Jumbotron id="jumbotron">
                  <h1>Welcome to Yip!</h1>
                  <p>
                    A community-based review site.
                  </p>
                  <p>
                    <Button variant="warning">Learn more</Button>
                  </p>
                </Jumbotron>
            </div>
        )
    }
}

export default Home;