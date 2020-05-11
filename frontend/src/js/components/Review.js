import React, { Component } from 'react';
import Row from 'react-bootstrap/Row';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Jumbotron from "react-bootstrap/Jumbotron";
import Image from 'react-bootstrap/Image';
import YipNavBar from "./YipNavBar";
import CommentCard from './CommentCard';
import commentIcon from '../../assets/comment.png';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import axios from 'axios' 

class Review extends Component {

	constructor(props){
		super(props)
	}

	componentDidMount(){
		// TODO: Parse the id from URL eventually (currently just copy review id from DB)
		var reviewId = "692bb316-9b88-441e-a79a-4f34aaa143ea";

		// Format URL to send in GET request
		var reqUrl = "/get_review/" + reviewId;

		// Send GET request with review id as query string
    	axios({
            method: 'get',
            url: reqUrl
        }).then(response => {

            alert('Review successfully grabbed from database!');

            // TODO: Fill in html using response 
            document.getElementById('title').innerHTML = response.data.title;
            document.getElementById('author').innerHTML = response.data.author;
            document.getElementById('img').src = response.data.images[0];
            document.getElementById('text').innerHTML = response.data.review_text; 
        
        }).catch(error => {

            // Review not found in database
            alert('Review does not exist');

        });
	}

	render() {
		return (
			<div>
				<YipNavBar />
				<Jumbotron id="jumbotron" className="text-left">
					<h1 id="title">{this.props.reviewName}</h1>
					<h4 id="author">{this.props.reviewerName}</h4>
				</Jumbotron>

				<Row className="reviewContent">
					<Col xs={7} className="text-left">
						<p id="text" dangerouslySetInnerHTML={{__html: this.props.reviewText}}></p>
					</Col>

					<Col xs={5} className="reviewPicture text-center align">
						<Image id="img" src={this.props.reviewImg[0]} />
					</Col>
				</Row>

				<Row className="align-items-center reviewLeaveComment">
					<Col></Col>
					<Col className="text-center">
						<div className="logInForm">
							<h3 className="logInLabel pt-2 pb-2">Leave a Comment</h3>
							<Form className="logInEntryContainer">
								<div className="logInEntryContainer">
									<Form.Control id="reviewComment" className="logInEntry" size="xl" as="textarea" placeholder="Ex. This is a good review!" />
								</div>
								<div className="logInEntryContainer">
									<Button className="logInEntry" variant="primary">Post</Button>
								</div>
							</Form>
						</div>
					</Col>
					<Col></Col>
				</Row>

				<CommentCard commenterName={"Name"} commentText={"Comment"} />
				<CommentCard commenterName={"Name"} commentText={"Comment"} />
				<CommentCard commenterName={"Name"} commentText={"Comment"} />
			</div>
		);
	}
}

export default Review;

Review.propTypes = {
	reviewName: PropTypes.string.isRequired,
	reviewerName: PropTypes.string.isRequired,
	reviewText: PropTypes.string.isRequired,
	reviewImg: PropTypes.string.isRequired
};
