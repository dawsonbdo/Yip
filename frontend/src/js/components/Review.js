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
import LoadingIcon from '../../assets/loadingIcon.gif';
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

import { createCommentJson, likeDislikeReviewJson, deleteReviewJson } from './BackendHelpers.js';

class Review extends Component {

	constructor(props) {
		super(props)

		// States
		this.state = {
			loggedIn: false,
			commentArray: [],
			commentsListed: false,
			reviewListed: false,
			reviewTitle: "",
			reviewAuthor: "",
			reviewText: "",
			reviewImgs: []
		};

		// Binds button handler
		this.postComment = this.postComment.bind(this);
		this.likeReview = this.likeReview.bind(this);
		this.dislikeReview = this.dislikeReview.bind(this);
		this.deleteReview = this.deleteReview.bind(this);
	}

	componentDidMount() {
		// TODO: Display stuff based on if logged in or not (ie form to post comment)

		// TODO: Parse the id from URL eventually (currently just copy review id from DB)

		// SKYRIM REVIEW
		//var reviewId = "92b516fd-775a-41d8-9462-df94840c9a5d";
		var reviewId = this.props.match.params.id;

		var token = localStorage.getItem('jwtToken');

		// Format URL to send in GET request
		var reqUrl = "/get_review/" + reviewId + "/" + token;

		// Send GET request with review id to get review information
		axios({
			method: 'get',
			url: reqUrl
		}).then(response => {

			// alert('Review successfully grabbed from database!');
			if (!this.reviewListed) {
				// TODO: Fill in html using response 
				this.setState({
					reviewTitle: response.data.title,
					reviewAuthor: response.data.author,
					reviewText: response.data.text
				});

				// Check that any images were returned cuz can be undefined
				if (response.data.images != undefined) {
					this.state.reviewImgs.push(response.data.images[0]);
				}

				// TODO: Render edit/delete buttons depending on if author of review
				console.log("Is Author: " + response.data.is_author);

				// TODO: Render like/dislike buttons depending on if liked
				console.log("Is Liked: " + response.data.is_liked);
				console.log("Is Disliked: " + response.data.is_disliked);

				this.setState({ reviewListed: true });
				this.forceUpdate();
			}
		}).catch(error => {

			// Review not found in database
			alert('Review does not exist');

		});

		reqUrl = "/get_comments/" + reviewId + "/" + token;

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

				for(var i = 1; i < response.data.length; i++) {
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
		//var reviewId = "92b516fd-775a-41d8-9462-df94840c9a5d";
		var reviewId = this.props.match.params.id;

		// Get token
		var token = localStorage.getItem('jwtToken');

		// Create form for request
		var form = likeDislikeReviewJson(reviewId, token);

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
		//var reviewId = "92b516fd-775a-41d8-9462-df94840c9a5d";
		var reviewId = this.props.match.params.id;

		// Get token
		var token = localStorage.getItem('jwtToken');

		// Create form for request
		var form = likeDislikeReviewJson(reviewId, token);

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

	deleteReview() {
		
		// Get review's id
		var reviewId = this.props.match.params.id;

		// Get token
		var token = localStorage.getItem('jwtToken');

		// Create form for request
		var form = deleteReviewJson(reviewId, token);

		// Send POST request
		axios({
			method: 'post',
			url: '/remove_review',
			data: form
		}).then(response => {

			alert('Review successfully removed!');


		}).catch(error => {

			alert('Review removal failed');

		});
		
	}

	postComment() {
		// TODO: Get uuid of review from url probably
		var reviewId = this.props.match.params.id;
		//var reviewId = "92b516fd-775a-41d8-9462-df94840c9a5d";

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

		// Gets the comments in their comment cards
		const comments = this.state.commentArray.map(function (comment) {
			return <CommentCard commenterName={comment.author} commentText={comment.text} timestamp={comment.time} />
		});


		// ONLY DISPLAYS REVIEW CONTENTS WHEN EVERYTHING IS LOADED FROM BACKEND/DATABASE
		let reviewContent;
		if (this.state.reviewListed && this.state.commentsListed) {
			reviewContent =
				<div>
					<Jumbotron id="jumbotron">
						<Row>
							<Col className="text-left">
								<h1 id="title">{this.state.reviewTitle}</h1>
								<h4 id="author"><a class="profileLink" href={`/user-${this.state.reviewAuthor}`}>{this.state.reviewAuthor}</a></h4>
							</Col>
							<Col className="text-right reviewIcon">
								<Image onClick={this.likeReview} className="likePadding" src={likeIcon} />
								<Image onClick={this.dislikeReview} className="likePadding" src={dislikeIcon} />
								<Link to="/"><Image className="pl-5 likePadding" src={shareIcon} /></Link>
								<Link to="/"><Image className="likePadding" src={bookmarkIcon} /></Link>
								<Image onClick={this.deleteReview} className="likePadding" src={trashIcon} />
							</Col>
						</Row>

					</Jumbotron>

					<Row className="reviewContent">
						<Col xs={7} className="text-left">
							<p id="text" dangerouslySetInnerHTML={{ __html: this.state.reviewText }}></p>
						</Col>

						<Col xs={5} className="reviewPicture text-center align">
							<Image id="img" src={this.state.reviewImgs[0]} />
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
				</div>;
		} else {

			// Loading Symbol
			reviewContent = <Row>
                  				<Image className="mx-auto loadingIcon loading" src={LoadingIcon}></Image>
               				</Row>;
		}

		return (
			<div>
				<YipNavBar />
				{reviewContent}
			</div>
		);
	}
}

export default Review;

/*Review.propTypes = {
	reviewName: PropTypes.string.isRequired,
	reviewerName: PropTypes.string.isRequired,
	reviewText: PropTypes.string.isRequired,
	reviewImg: PropTypes.string.isRequired
};*/
