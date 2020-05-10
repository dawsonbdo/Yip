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

class Review extends Component {

	constructor(props){
		super(props)
	}

	componentDidMount(){
		// Parse the id from URL
		var reviewId = "1";

		// Send POST request with database User json
    	axios({
            method: 'post',
            url: '/get_review',
            data: reviewId
        }).then(response => {

            // TODO: Fill in html using response 
       		

            alert('Review successfully grabbed from database!');
        
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
					<h1>{this.props.reviewName}</h1>
					<h4>{this.props.reviewerName}</h4>
				</Jumbotron>

				<Row className="reviewContent">
					<Col xs={7} className="text-left">
						<p dangerouslySetInnerHTML={{__html: this.props.reviewText}}></p>
					</Col>

					<Col xs={5} className="reviewPicture text-center align">
						<Image src={this.props.reviewImg[0]} />
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
