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
import shareIcon from '../../assets/share.png';
import bookmarkIcon from '../../assets/bookmark.png';
import reportIcon from '../../assets/report.png';
import trashIcon from '../../assets/trash.png';

import axios from 'axios'

import { createCommentJson } from './BackendHelpers.js';

class Review extends Component {

	constructor(props) {
		super(props)

		// States
		this.state = {
			loggedIn: false,
			commentArray: [],
			commentsListed: false
		};

		// Binds button handler
		this.postComment = this.postComment.bind(this);
		this.likeReview = this.likeReview.bind(this);
		this.dislikeReview = this.dislikeReview.bind(this);
	}

	componentDidMount() {
		// TODO: Display stuff based on if logged in or not (ie form to post comment)

		// TODO: Parse the id from URL eventually (currently just copy review id from DB)
		var reviewId = "b35994c2-3265-4bed-a597-177e170447a8";

		var token = localStorage.getItem('jwtToken');

		// Format URL to send in GET request
		var reqUrl = "/get_review/" + reviewId + "/" + token;

		// Send GET request with review id to get review information
		axios({
			method: 'get',
			url: reqUrl
		}).then(response => {

			// alert('Review successfully grabbed from database!');

			// TODO: Fill in html using response 
			document.getElementById('title').innerHTML = response.data.title;
			document.getElementById('author').innerHTML = response.data.author;
			document.getElementById('text').innerHTML = response.data.text;

			// Check that any images were returned cuz can be undefined
			if (response.data.images != undefined) {
				document.getElementById('img').src = response.data.images[0];
			}

			// TODO: Render edit/delete buttons depending on if author of review
			console.log("Is Author: " + response.data.is_author);

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

			//alert('Review comments successfully grabbed from database!');

			// TODO: Fill in html using response 

			// Fills in commentArray based on response data
			// Will populate comment cards
			if(!this.state.commentsListed) {
				for(var i = response.data.length - 1; i >= 0; i--) {
					this.state.commentArray.push({
						author: response.data[i].author_name,
						text: response.data[i].text,
						time: response.data[i].timestamp
					});
				}
				this.setState({ commentsListed: true });
			}

		}).catch(error => {

			// Review comments not found in database
			alert('Review comments not found');

		});
	}

	dislikeReview() {
		// TODO: Get uuid of review from url probably
		var reviewId = "b35994c2-3265-4bed-a597-177e170447a8";

		// Get token
		var token = localStorage.getItem('jwtToken');

		var form = {review_uuid: reviewId, token:token };

		// Send POST request
		axios({
			method: 'post',
			url: '/dislike_review',
			data: form
		}).then(response => {

			alert('Review successfully disliked!');


		}).catch(error => {

			// Failed to dislike review
			alert('Review dislike failed');

		});
	}

	likeReview() {
		// TODO: Get uuid of review from url probably
		var reviewId = "b35994c2-3265-4bed-a597-177e170447a8";

		// Get token
		var token = localStorage.getItem('jwtToken');

		var form = {review_uuid: reviewId, token:token };

		// Send POST request
		axios({
			method: 'post',
			url: '/like_review',
			data: form
		}).then(response => {

			alert('Review successfully liked!');


		}).catch(error => {

			// Failed to like review
			alert('Review like failed');

		});
	}

	postComment() {
		// TODO: Get uuid of review from url probably
		var reviewId = "92b516fd-775a-41d8-9462-df94840c9a5d";

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
		const comments = this.state.commentArray.map(function (comment) {
			return <CommentCard commenterName={comment.author} commentText={comment.text} timestamp={comment.time} />
		});

		return (
			<div>
				<YipNavBar />

				<Jumbotron id="jumbotron">
					<Row>
						<Col className="text-left">
							<h1 id="title"></h1>
							<h4 id="author"></h4>

						</Col>
						<Col className="text-right reviewIcon">
							<Image onClick={this.likeReview} className="likePadding" src={likeIcon} />
						<Image onClick={this.dislikeReview} className="likePadding" src={dislikeIcon} />
							<Link to="/"><Image className="pl-5 likePadding" src={shareIcon} /></Link>
							<Link to="/"><Image className="likePadding" src={bookmarkIcon} /></Link>
							<Link to="/"><Image className="likePadding" src={trashIcon} /></Link>
						</Col>
					</Row>

				</Jumbotron>

				<Row className="reviewContent">
					<Col xs={7} className="text-left">
						<p id="text"></p>
					</Col>

					<Col xs={5} className="reviewPicture text-center align">
						<Image id="img" />
					</Col>
				</Row>

				<Container className="pb-5">
				<Row className="align-items-center reviewLeaveComment">
					<Col></Col>
					<Col xs={10} className="text-center">
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
				</Container>
				{comments}
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
