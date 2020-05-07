import React, {Component} from 'react';

import Jumbotron from "react-bootstrap/Jumbotron";
import Button from 'react-bootstrap/Button';
import YipNavBar from "./YipNavBar";
import CommentCard from './CommentCard';

class Review extends Component {
    render() {
        return (
            <div>
                <YipNavBar />
                <Jumbotron id="jumbotron" className="text-left">
                    <h1>Review Name</h1>
                    <h4>Reviewer Name</h4>
                </Jumbotron>
            </div>
        );
    }
}

export default Review;