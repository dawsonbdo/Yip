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
import likeIcon from '../../assets/like.png';
import dislikeIcon from '../../assets/dislike.png';
import Review from './Review';

import axios from 'axios'

import { createCommentJson } from './BackendHelpers.js';

class Profile extends Component {

	constructor(props) {
		super(props)

		// Binds button handler
		this.postComment = this.postComment.bind(this);
	}

	componentDidMount() {
		// TODO: Display stuff based on if logged in or not (ie form to post comment)

		// TODO: Parse the id from URL eventually (currently just copy review id from DB)
		var reviewId = "dcbcf675-e7a7-44b2-8f7a-ec6f2bbbb039";
		var token = localStorage.getItem('jwtToken');

		// Format URL to send in GET request
		var reqUrl = "/get_review/" + reviewId + "/" + token;

		// Send GET request with review id to get review information
		axios({
			method: 'get',
			url: reqUrl
		}).then(response => {

			alert('Review successfully grabbed from database!');

			// TODO: Fill in html using response 
			document.getElementById('title').innerHTML = response.data.title;
			document.getElementById('author').innerHTML = response.data.author;
			document.getElementById('text').innerHTML = response.data.text; 

			// Check that any images were returned cuz can be undefined
			if ( response.data.images != undefined ){
				document.getElementById('img').src = response.data.images[0];
			}

			// TODO: Render edit/delete buttons depending on if author of review
			console.log("Is Author: " + response.data.isAuthor);

		}).catch(error => {

			// Review not found in database
			alert('Review does not exist');

		});

		reqUrl = "/get_comments/" + reviewId;

		// Send GET request with review id to get comments
		axios({
			method: 'get',
			url: reqUrl
		}).then(response => {

			alert('Review comments successfully grabbed from database!');

			// TODO: Fill in html using response 

			// TODO: Populate CommentCards using response.data (this is an array of DisplayComment objs)
			//       (Fields of DisplayComment: author_name, timestamp, text)

			// Iterate through comments
			for (var i = 0; i < response.data.length; i++) {

				// Print comments to console for now
				console.log(response.data[i]);

			}

		}).catch(error => {

			// Review comments not found in database
			alert('Review comments not found');

		});
	}

	postComment() {
		// TODO: Get uuid of review from url probably
		var reviewId = "dcbcf675-e7a7-44b2-8f7a-ec6f2bbbb039";

		// Get token
		var token = localStorage.getItem('jwtToken');

		// Get text from comment field
		var text = document.getElementById('reviewComment').value;

		// Create JSON obj of comment
		var form = createCommentJson(reviewId, token, text);

		console.log(form);

		// Send POST request
		axios({
			method: 'post',
			url: '/create_comment',
			data: form
		}).then(response => {

			alert('Comment successfully posted to database!');

			// TODO: Update page to display comment


		}).catch(error => {

			// Failed to post comment
			alert('Comment post failed');

		});
	}

	render() {
		return (
			<div>
				<YipNavBar />
				<Jumbotron id="jumbotron" className="text-left">
					<h1 id="title">{this.props.reviewName}</h1>
					<h4 id="author">{this.props.reviewerName}</h4>
					<Link to="/"><Image className="likePadding" src={likeIcon} /></Link>
					<Link to="/"><Image className="likePadding" src={dislikeIcon} /></Link>
				</Jumbotron>

				<Row className="reviewContent">
					<Col xs={7} className="text-left">
						<p id="text" dangerouslySetInnerHTML={{ __html: this.props.reviewText }}></p>
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
									<Button onClick={this.postComment} className="logInEntry" variant="primary">Post</Button>
								</div>
							</Form>
						</div>
					</Col>
					<Col></Col>
				</Row>

			</div>
		);
	}
}

export default Profile;

Review.propTypes = {
	reviewName: PropTypes.string.isRequired,
	reviewerName: PropTypes.string.isRequired,
	reviewText: PropTypes.string.isRequired,
	reviewImg: PropTypes.string.isRequired
};
