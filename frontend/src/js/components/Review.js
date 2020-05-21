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

import { reportJson, createCommentJson, likeDislikeReviewJson, deleteReviewJson, isLoggedIn, updateLoggedInState } from './BackendHelpers.js';

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
			reviewImgs: [],
			rating: 0,
			isLiked: false,
			isDisliked: false,
			isBookmarked: false,
			kennel: ""
		};

		// Binds button handler
		this.postComment = this.postComment.bind(this);
		this.likeReview = this.likeReview.bind(this);
		this.dislikeReview = this.dislikeReview.bind(this);
		this.deleteReview = this.deleteReview.bind(this);
		this.bookmarkReview = this.bookmarkReview.bind(this);
	}

	componentDidMount() {
		// TODO: Display stuff based on if logged in or not (ie form to post comment)
		updateLoggedInState(this);

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
					reviewText: response.data.text,
					rating: response.data.rating,
					kennel: response.data.kennel_name
				});

				if(response.data.is_liked) {
					this.setState({isLiked: true});
				}
				if(response.data.is_disliked) {
					this.setState({isDisliked: true});
				}
				if(response.data.is_bookmarked) {
					this.setState({isBookmarked: true});
				}

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

				for(var i = 0; i < response.data.length; i++) {
					this.state.commentArray.push({
						author: response.data[i].author_name,
						text: response.data[i].text,
						time: response.data[i].timestamp,
						rating: response.data[i].rating,
						commentId: response.data[i].comment_uuid,
						isLiked: response.data[i].is_liked,
						isDisliked: response.data[i].is_disliked
					});

				}
				this.setState({ commentsListed: true });
			}

		}).catch(error => {

			// Review comments not found in database
			alert('Review comments not found');

		});
	}

	bookmarkReview() {
		// TODO: Get uuid of review from url probably
		//var reviewId = "92b516fd-775a-41d8-9462-df94840c9a5d";
		var reviewId = this.props.match.params.id;

		// Get token
		var token = localStorage.getItem('jwtToken');

		// Create form for request (same for bookmark)
		var form = likeDislikeReviewJson(reviewId, token);

		var url;
		if (this.state.isBookmarked){
			url = '/unbookmark_review';
		} else {
			url = '/bookmark_review';
		}

		this.setState({ isBookmarked: !this.state.isBookmarked });

		// Send POST request
		axios({
			method: 'post',
			url: url,
			data: form
		}).then(response => {

			if (this.state.isBookmarked){
				alert('Review successfully bookmarked!');
			} else {
				alert('Review successfully unbookmarked!');
			}


		}).catch(error => {

			// Failed to dislike review
			alert('Review bookmark/unbookmark failed');

			// Revert preemptive frontend update
			this.setState({ isBookmarked: !this.state.isBookmarked });

		});
	}

	dislikeReview() {
		updateLoggedInState(this);
		if(isLoggedIn(this)) {
			// If already disliked removes dislike
			if(this.state.isDisliked) {
				this.setState({ isDisliked: false, rating: this.state.rating + 1 });
			}

			// If liked remove like and add dislike
			else if(this.state.isLiked) {
				this.setState({ isLiked: false, isDisliked: true, rating: this.state.rating - 2 });
			}

			// Otherwise add dislike
			else {
				this.setState({ isDisliked: true, rating: this.state.rating - 1 });
			}

		}
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

			// alert('Review successfully disliked!');

		}).catch(error => {

			// Failed to dislike review
			alert('Review dislike failed');

		});
	}

	likeReview() {
		updateLoggedInState(this);
		if(isLoggedIn(this)) {
			// If already liked removes like
			if(this.state.isLiked) {
				this.setState({ isLiked: false, rating: this.state.rating - 1 });
			}

			// If disliked remove dislike and add like
			else if(this.state.isDisliked) {
				this.setState({ isDisliked: false, isLiked: true, rating: this.state.rating + 2 });
			}

			// Otherwise add like
			else {
				this.setState({ isLiked: true, rating: this.state.rating + 1 });
			}

		}
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

			//alert('Review successfully liked!');


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
			this.props.history.goBack();


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
			url: '/create_comment/' + this.state.kennel,
			data: form
		}).then(response => {

			alert('Comment successfully posted to database!');

			let comments = this.state.commentArray;

			// TODO: Update page to display comment
			comments.unshift({
						author: response.data.author_name,
						text: response.data.text,
						time: response.data.timestamp,
						rating: response.data.rating,
						commentId: response.data.comment_uuid,
						isLiked: response.data.is_liked,
						isDisliked: response.data.is_disliked
			});

			// Update state to cause rerender
			this.setState({ commentArray: comments });

		}).catch(error => {

			// Failed to post comment
			alert('Comment post failed');

		});
	}

	render() {

		// Gets the comments in their comment cards
		let nameOfKennel = this.state.kennel;
		let idOfReview = this.props.match.params.id;
		let comments = this.state.commentArray.map(function (comment) {
			return <CommentCard commentId={comment.commentId} commenterName={comment.author} commentText={comment.text} 
			timestamp={comment.time} rating={comment.rating} isLiked={comment.isLiked} isDisliked={comment.isDisliked}
			kennel={nameOfKennel} review={idOfReview}/>
		});

		let likeIconOpacity;
		let dislikeIconOpacity;
		let bookmarkOpacity;

		if(this.state.isLiked) {
			likeIconOpacity = {opacity: 1.0, cursor: 'pointer'};
		}
		else {
			likeIconOpacity = {opacity: .6, cursor: 'pointer'};
		}

		if(this.state.isDisliked) {
			dislikeIconOpacity = {opacity: 1.0, cursor: 'pointer'};
		}
		else {
			dislikeIconOpacity = {opacity: .6, cursor: 'pointer'};
		}

		if(this.state.isBookmarked) {
			bookmarkOpacity = {opacity: 1.0, cursor: 'pointer'};
		}
		else {
			bookmarkOpacity = {opacity: .6, cursor: 'pointer'};
		}


		// ONLY DISPLAYS REVIEW CONTENTS WHEN EVERYTHING IS LOADED FROM BACKEND/DATABASE
		let reviewContent;
		if (this.state.reviewListed && this.state.commentsListed) {
			reviewContent =
				<div>
					<Jumbotron id="jumbotron">
						<Row>
							<Col className="text-left">
								<h1 id="title">{this.state.reviewTitle}</h1>
								<h4 id="author"><a class="profileLink" href={`/user-${this.state.reviewAuthor}`}>Reviewer: {this.state.reviewAuthor}</a></h4>
								<h5 id="kennel"><a class="profileLink" href={`/kennel-${this.state.kennel}`}>Kennel: {this.state.kennel}</a></h5>
							</Col>
							<Col className="text-right reviewIcon">
								<Image onClick={this.deleteReview} style={{cursor: 'pointer'}} className="likePadding float-right" src={trashIcon} />
								<Image onClick={this.bookmarkReview} style={bookmarkOpacity} className="likePadding float-right" src={bookmarkIcon} />
								<Link to={{
									pathname: '/report',
									state: {
                                        is_comment: false,
                                        comment_id: "",
										kennel_name: this.state.kennel,
										review_id: this.props.match.params.id
									}
								}}><Image className="likePadding float-right pl-5" src={reportIcon} /></Link>
								<Image onClick={this.dislikeReview} style={dislikeIconOpacity} className="likePadding float-right" src={dislikeIcon} />
								<h4 className="likePadding float-right">{this.state.rating}</h4>
								<Image onClick={this.likeReview} style={likeIconOpacity} className="likePadding float-right" src={likeIcon} />
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