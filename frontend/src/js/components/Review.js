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
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import likeIcon from '../../assets/like.png';
import dislikeIcon from '../../assets/dislike.png';
import shareIcon from '../../assets/share.png';
import bookmarkIcon from '../../assets/bookmark.png';
import reportIcon from '../../assets/report.png';
import trashIcon from '../../assets/trash.png';
import editIcon from '../../assets/edit.png';
import Spinner from 'react-bootstrap/Spinner';
import Toast from 'react-bootstrap/Toast';

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
			reviewTags: "",
			reviewTagsArray: [],
			rating: 0,
			isLiked: false,
			isDisliked: false,
			isBookmarked: false,
			kennel: "",
			isAuthor: false,
			isModerator: false,
			isReported: false,
			loading: false,
			loginPrompt: false,
			action: "",
			showPopup: false,
			popupMsg: ""
		};

		// Binds button handler
		this.postComment = this.postComment.bind(this);
		this.likeReview = this.likeReview.bind(this);
		this.dislikeReview = this.dislikeReview.bind(this);
		this.deleteReview = this.deleteReview.bind(this);
		this.bookmarkReview = this.bookmarkReview.bind(this);
		this.getURL = this.getURL.bind(this);
		this.rerenderOnCommentDelete = this.rerenderOnCommentDelete.bind(this);
		this.handleInvalidCommentLike = this.handleInvalidCommentLike.bind(this);
	}

	/**
	 * Called by a comment card when deleted.
	 * Removes deleted comment from commentArray and rerenders comment cards to reflect deletion.
	 */
	rerenderOnCommentDelete(index) {
		this.state.commentArray.splice(index, 1);
		this.forceUpdate();
	}

	/**
	 * Called by comment card when user attempts to like/dislike a comment while logged out
	 */
	handleInvalidCommentLike() {
		this.setState({ loginPrompt: true, action: "like/dislike comments on" });
	}

	/**
	 * Loads review and its comments from database
	 */
	componentDidMount() {
		updateLoggedInState(this);

		// Gets review id from URL
		var reviewId = this.props.match.params.id;

		var token = localStorage.getItem('jwtToken');

		// Format URL to send in GET request
		var reqUrl = "/get_review/" + reviewId + "/" + token;

		// Send GET request with review id to get review information
		axios({
			method: 'get',
			url: reqUrl
		}).then(response => {

			if (!this.reviewListed) {

				// Sets states to contain review info for rendering
				this.setState({
					reviewTitle: response.data.title,
					reviewAuthor: response.data.author,
					reviewText: response.data.text,
					rating: response.data.rating,
					kennel: response.data.kennel_name,
					reviewTagsArray: response.data.tags
				});

				// Convert tags array to list of tags
				var tagsStr = "";
				if (response.data.tags.length > 0) {
					tagsStr = tagsStr + response.data.tags[0];
				}
				for (var i = 1; i < response.data.tags.length; i++) {
					tagsStr = tagsStr + ", " + response.data.tags[i];
				}
				this.setState({ reviewTags: tagsStr });

				// Renders like/dislike/bookmark icons to be selected or deselected
				if (response.data.is_liked) {
					this.setState({ isLiked: true });
				}
				if (response.data.is_disliked) {
					this.setState({ isDisliked: true });
				}
				if (response.data.is_bookmarked) {
					this.setState({ isBookmarked: true });
				}
				if (response.data.is_reported) {
					this.setState({ isReported: true });
				}


				// Check that any images were returned cuz can be undefined
				if (response.data.images != undefined) {
					this.state.reviewImgs.push(response.data.images[0]);
				}

				console.log("Is Author: " + response.data.is_author);
				console.log("Is Moderator: " + response.data.is_moderator);
				console.log("Is Liked: " + response.data.is_liked);
				console.log("Is Disliked: " + response.data.is_disliked);

				this.setState({ isAuthor: response.data.is_author });
				this.setState({ isModerator: response.data.is_moderator });
				this.setState({ reviewListed: true });
			}
		}).catch(error => {

			// Review not found in database
			this.setState({showPopup: true, popupMsg: "Error loading review"});

		});

		reqUrl = "/get_comments/" + reviewId + "/" + token;

		// Send GET request with review id to get comments
		axios({
			method: 'get',
			url: reqUrl
		}).then(response => {

			// Fills in commentArray based on response data to render comment cards
			if (!this.state.commentsListed) {

				for (var i = 0; i < response.data.length; i++) {
					this.state.commentArray.push({
						author: response.data[i].author_name,
						text: response.data[i].text,
						time: response.data[i].timestamp,
						rating: response.data[i].rating,
						commentId: response.data[i].comment_uuid,
						isLiked: response.data[i].is_liked,
						isDisliked: response.data[i].is_disliked,
						isAuthor: response.data[i].is_author,
						isReported: response.data[i].is_reported
					});

				}
				this.setState({ commentsListed: true });
			}

		}).catch(error => {

			// Review comments not found in database
			this.setState({showPopup: true, popupMsg: "Error loading review comments"});

		});
	}

	bookmarkReview() {
		// Get uuid of review from url probably
		var reviewId = this.props.match.params.id;

		// Get token
		var token = localStorage.getItem('jwtToken');

		// Create form for request (same for bookmark)
		var form = likeDislikeReviewJson(reviewId, token);

		var url;

		if (isLoggedIn(this)) {

			if (this.state.isBookmarked) {
				url = '/unbookmark_review';
			} else {
				url = '/bookmark_review';
			}

		} else {

			this.setState({ loginPrompt: true, action: "bookmark" });
			return;
		}

		this.setState({ isBookmarked: !this.state.isBookmarked });

		// Send POST request
		axios({
			method: 'post',
			url: url,
			data: form
		}).then(response => {

			// TODO: Toast 'successful review'


		}).catch(error => {
			this.setState({showPopup: true, popupMsg: "Failed to bookmark review"});

			// Revert preemptive frontend update
			this.setState({ isBookmarked: !this.state.isBookmarked });

		});
	}

	dislikeReview() {
		updateLoggedInState(this);
		if (isLoggedIn(this)) {
			// If already disliked removes dislike
			if (this.state.isDisliked) {
				this.setState({ isDisliked: false, rating: this.state.rating + 1 });
			}

			// If liked remove like and add dislike
			else if (this.state.isLiked) {
				this.setState({ isLiked: false, isDisliked: true, rating: this.state.rating - 2 });
			}

			// Otherwise add dislike
			else {
				this.setState({ isDisliked: true, rating: this.state.rating - 1 });
			}

		} else {

			// Renders popup prompting user to log in if logged out
			this.setState({ loginPrompt: true, action: "dislike" });
			return;
		}

		// review id from URL
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


		}).catch(error => {

			// Failed to dislike review
			this.setState({showPopup: true, popupMsg: "Failed to dislike review"});

		});
	}

	likeReview() {
		updateLoggedInState(this);
		if (isLoggedIn(this)) {
			// If already liked removes like
			if (this.state.isLiked) {
				this.setState({ isLiked: false, rating: this.state.rating - 1 });
			}

			// If disliked remove dislike and add like
			else if (this.state.isDisliked) {
				this.setState({ isDisliked: false, isLiked: true, rating: this.state.rating + 2 });
			}

			// Otherwise add like
			else {
				this.setState({ isLiked: true, rating: this.state.rating + 1 });
			}

		} else {

			// Renders popup prompting user to login
			this.setState({ loginPrompt: true, action: "like" });
			return;
		}

		// review id from URL
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


		}).catch(error => {

			// Failed to like review
			this.setState({showPopup: true, popupMsg: "Failed to like review"});

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
			// TODO: handle re-rendering page when returning back
			this.props.history.goBack();


		}).catch(error => {

			this.setState({showPopup: true, popupMsg: "Failed to delete review"});

		});

	}

	postComment(event) {
		event.preventDefault();
		event.stopPropagation();

		// Prompts user to login if they attempt to post comment logged out
		if (!isLoggedIn(this)) {

			this.setState({ loginPrompt: true, action: "comment on" });
			return;

		}

		this.setState({ loading: true });

		// id from URL
		var reviewId = this.props.match.params.id;

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

			let comments = this.state.commentArray;

			// Updates page to display new comment
			comments.unshift({
				author: response.data.author_name,
				text: response.data.text,
				time: response.data.timestamp,
				rating: response.data.rating,
				commentId: response.data.comment_uuid,
				isLiked: response.data.is_liked,
				isDisliked: response.data.is_disliked,
				isAuthor: true
			});

			// Clears text field after successful post
			document.getElementById('commentForm').reset();

			// Update state to cause rerender
			this.setState({ commentArray: comments, loading: false });

		}).catch(error => {

			// Failed to post comment
			this.setState({showPopup: true, popupMsg: "Comment failed"});
			this.setState({ loading: false });

		});
	}

	// Copies URL into clipboard to Share the Review URL
	getURL() {
		var url = document.createElement('textarea');
		url.innerText = window.location.href;
		document.body.appendChild(url);
		url.select();
		document.execCommand('copy');
		url.remove();
		this.setState({showPopup: true, popupMsg: "Copied URL to clipboard"});
	}

	render() {
		let loading = <div></div>;
		if (this.state.loading) {
			loading = <Spinner className="logInEntryContainer" animation="border" size="sm"></Spinner>;
		}

		// Gets the comments in their comment cards
		let nameOfKennel = this.state.kennel;
		let idOfReview = this.props.match.params.id;
		let modStatus = this.state.isModerator;
		let rerenderReview = this.rerenderOnCommentDelete;
		let handleInvalidLike = this.handleInvalidCommentLike;
		let isLoggedIn = this.state.loggedIn;
		let comments = this.state.commentArray.map(function (comment, index) {
			return <CommentCard commentId={comment.commentId} commenterName={comment.author} commentText={comment.text}
				timestamp={comment.time} rating={comment.rating} isLiked={comment.isLiked} isDisliked={comment.isDisliked}
				kennel={nameOfKennel} review={idOfReview} isAuthor={comment.isAuthor} isModerator={modStatus} commentIndex={index}
				rerenderReview={rerenderReview} handleInvalidLike={handleInvalidLike} loggedIn={isLoggedIn} isReported={comment.isReported} />
		});

		let likeIconOpacity;
		let dislikeIconOpacity;
		let bookmarkOpacity;
		let reportOpacity;

		// Update icon opacity to indicate whether selected
		if (this.state.isLiked) {
			likeIconOpacity = { opacity: 1.0, cursor: 'pointer' };
		}
		else {
			likeIconOpacity = { opacity: .6, cursor: 'pointer' };
		}

		if (this.state.isDisliked) {
			dislikeIconOpacity = { opacity: 1.0, cursor: 'pointer' };
		}
		else {
			dislikeIconOpacity = { opacity: .6, cursor: 'pointer' };
		}

		if (this.state.isBookmarked) {
			bookmarkOpacity = { opacity: 1.0, cursor: 'pointer' };
		}
		else {
			bookmarkOpacity = { opacity: .6, cursor: 'pointer' };
		}

		if (this.state.isReported) {
			reportOpacity = { opacity: 1.0, cursor: 'pointer' };
		}
		else {
			reportOpacity = { opacity: .6, cursor: 'pointer' };
		}


		// ONLY DISPLAYS REVIEW CONTENTS WHEN EVERYTHING IS LOADED FROM BACKEND/DATABASE
		let reviewContent;
		if (this.state.reviewListed && this.state.commentsListed) {
			reviewContent =
				<div>
					<Toast style={{
						position: 'fixed',
						top: 110,
						zIndex: 1,
						left: '50%',
						transform: 'translate(-50%, 0%)'
					}} className="mx-auto logInEntry" onClose={() => this.setState({ loginPrompt: false })} show={this.state.loginPrompt}>
						<Toast.Header className="logInLabel">
							<strong className="mx-auto">You must sign in to {this.state.action} reviews</strong>
						</Toast.Header>
						<Toast.Body style={{ textAlign: 'center' }}>Click <a href="/login">here</a> to sign in</Toast.Body>
					</Toast>
					<Toast style={{
						position: 'fixed',
						top: 110,
						zIndex: 1,
						left: '50%',
						transform: 'translate(-50%, 0%)'
					}} className="mx-auto smallPopup" onClose={() => this.setState({ showPopup: false })} show={this.state.showPopup} autohide>
						<Toast.Header className="smallPopup">
							<strong className="mx-auto">{this.state.popupMsg}</strong>
						</Toast.Header>
					</Toast>

					<Jumbotron id="jumbotron">
						<Row>
							<Col className="text-left">
								<h1 id="title">{this.state.reviewTitle}</h1>
								<h4 id="author"><a class="profileLink" href={`/user-${this.state.reviewAuthor}`}>Reviewer: {this.state.reviewAuthor}</a></h4>
								<h5 id="kennel"><a class="profileLink" href={`/kennel-${this.state.kennel}`}>Kennel: {this.state.kennel}</a></h5>
							</Col>
							<Col className="text-right reviewIcon">

								{/*If isAuthor of isModerator then render the deleteReview button*/}
								{(this.state.isAuthor || this.state.isModerator) &&
									<Image onClick={this.deleteReview} style={{ cursor: 'pointer' }} className="likePadding float-right" src={trashIcon} />
								}
								{/*If isAuthor then render the editReview button*/}
								{this.state.isAuthor &&
									<Link to={{
										pathname: "/editreview",
										state: {
											review_id: this.props.match.params.id,
											kennel_name: this.state.kennel,
											title: this.state.reviewTitle,
											text: this.state.reviewText,
											tags: this.state.reviewTagsArray,
											images: this.state.reviewImgs
										}
									}}><Image className="likePadding float-right pl-3" src={editIcon} width="60" /></Link>
								}
								<Image onClick={this.bookmarkReview} style={bookmarkOpacity} className="likePadding float-right" src={bookmarkIcon} />
								{(this.state.loggedIn && !this.state.isAuthor) &&
									<Link to={{
										pathname: '/report',
										state: {
											is_comment: false,
											comment_id: "",
											kennel_name: this.state.kennel,
											review_id: this.props.match.params.id
										}
									}}><Image className="likePadding float-right" style={reportOpacity} src={reportIcon} /></Link>}
								<Image onClick={this.getURL} style={{ cursor: 'pointer' }} className="likePadding float-right pl-5" src={shareIcon} />
								<Image onClick={this.dislikeReview} style={dislikeIconOpacity} className="likePadding float-right" src={dislikeIcon} />
								<h4 className="likePadding float-right">{this.state.rating}</h4>
								<Image onClick={this.likeReview} style={likeIconOpacity} className="likePadding float-right" src={likeIcon} />
							</Col>
						</Row>

					</Jumbotron>

					<Row className="reviewContent">
						<Col xs={7} className="text-left">
							<p id="text" dangerouslySetInnerHTML={{ __html: this.state.reviewText }}></p>
							<p>Tags: {this.state.reviewTags}</p>
						</Col>

						<Col xs={5} className="reviewPicture text-center align">
							<Image id="img" src={this.state.reviewImgs[0]} />
						</Col>
					</Row>
					<Container className="pb-5" id="comments">
						<Row className="align-items-center reviewLeaveComment">
							<Col></Col>
							<Col xs={10} className="text-center">
								<div className="logInForm">
									<h3 className="logInLabel pt-2 pb-2">Leave a Comment</h3>
									<Form id="commentForm" className="logInEntryContainer" onSubmit={this.postComment}>
										<div className="logInEntryContainer">
											<Form.Control id="reviewComment" className="logInEntry" size="xl" as="textarea" placeholder="Ex. This is a good review!" required />
										</div>
										<div className="logInEntryContainer">
											<Button className="logInEntry" type="submit" variant="primary"><div>Post{loading}</div></Button>
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