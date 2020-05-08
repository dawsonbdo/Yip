import React, { Component } from 'react';
import Row from 'react-bootstrap/Row';
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
	render() {
		return (
			<div>
				<YipNavBar />
				<Jumbotron id="jumbotron" className="text-left">
					<h1>Review Name</h1>
					<h4>Reviewer Name</h4>
				</Jumbotron>

				<Row className="reviewContent">
					<Col xs={7} className="text-left">
						<p>
							Ralof: Hey, you. You're finally awake. You were trying to cross the border,
							right? Walked right into that Imperial ambush, same as us, and that
							thief over there.
							<br /> <br />
							Lokir: Damn you Stormcloaks. Skyrim was fine until you came along. Empire was
							nice and lazy. If they hadn't been looking for you, I could've stolen
							that horse and been half way to Hammerfell. You there. You and me -- we
							should be here. It's these Stormcloaks the Empire wants.
							<br /> <br />
							Ralof: We're all brothers and sisters in binds now, thief.
							<br /> <br />
							Imperial Soldier: Shut up back there!
							<br /> <br />
							[Lokir looks at the gagged man.]
							<br /> <br />
							Lokir: And what's wrong with him?
							<br /> <br />
							Ralof: Watch your tongue! You're speaking to Ulfric Stormcloak, the true High
							King.
							<br /> <br />
							Lokir: Ulfric? The Jarl of Windhelm? You're the leader of the rebellion. But if
							they captured you... Oh gods, where are they taking us?
							<br /> <br />
							Ralof: I don't know where we're going, but Sovngarde awaits.
							<br /> <br />
							Lokir: No, this can't be happening. This isn't happening.
							<br /> <br />
							Ralof: Hey, what village are you from, horse thief?
							<br /> <br />
							Lokir: Why do you care?
							<br /> <br />
							Ralof: A Nord's last thoughts should be of home.
							<br /> <br />
							Lokir: Rorikstead. I'm...I'm from Rorikstead.
                        </p>
					</Col>

					<Col xs={5} className="reviewPicture text-center">
						<Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/ToddHoward2010sm_%28cropped%29.jpg/640px-ToddHoward2010sm_%28cropped%29.jpg" />
					</Col>
				</Row>

				<Row>
					<Col></Col>

					<Col cs={10} className="reviewContent text-center">
						<Container fluid>
							<Row className="align-items-center">
								<Col></Col>
								<Col className="text-center">
									<div className="logInForm">
										<h1 className="logInLabel">CreateReview</h1>
										<Form className="logInEntryContainer">
											<div className="logInEntryContainer">
												<Form.Control id="login" className="logInEntry" size="lg" type="text" placeholder="Title" />
											</div>
											<div className="logInEntryContainer">
												<Form.Control id="password" className="logInEntry" size="lg" as="textarea" placeholder="Enter Review Description" />
											</div>
											<div>
												<Link><Button variant="link">Forgot Password?</Button></Link>
											</div>
											<div className="logInEntryContainer">
												<Button onClick={this.attemptLogin} className="logInEntry" variant="primary">Submit</Button>
											</div>
										</Form>
									</div>
								</Col>
								<Col></Col>
							</Row>
						</Container>
					</Col>

					<Col></Col>
				</Row>

				<CommentCard />
				<CommentCard />
				<CommentCard />
			</div>
		);
	}
}

export default Review;