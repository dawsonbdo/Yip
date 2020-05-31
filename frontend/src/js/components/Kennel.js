import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import ReviewCard from './ReviewCard';
import Message from './Message';
import YipNavBar from './YipNavBar';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Image from 'react-bootstrap/Image';
import Button from 'react-bootstrap/Button';
import Jumbotron from "react-bootstrap/Jumbotron";
import LoadingIcon from '../../assets/loadingIcon.gif';
import TagCard from './TagCard';
import RuleCard from './RuleCard';
import Nav from 'react-bootstrap/Nav';
import Toast from 'react-bootstrap/Toast';
import axios from 'axios';
import { followKennelJson, updateLoggedInState, isLoggedIn } from './BackendHelpers.js';

class Kennel extends Component {
    constructor(props) {
        super(props);

        this.state = {
            kennel_name: "",
            follower_count: null,
            showReviews: true,
            showRules: false,
            showTags: false,
            description: "",
            showReviewReports: false,
            showCommentReports: false,
            isFollowing: false,
            followBtnText: "Follow",
            reviewArray: [],
            tagsArray: [],
            bansArray: [],
            reportsReviewsArray: [],
            reportsCommentsArray: [],
            mutedArray: [],
            rulesArray: [],
            rulesStringProp: "",
            tagsString: "",
            mutedString: "",
            bannedString: "",
            kennelReviewsListed: false,
            kennelInfoListed: false,
            isModerator: false,
            moderator: "",
            loginPrompt: false,
            loginPromptAction: "",
            isFiltered: false,
            showPopup: null
        }

        this.handleSelect = this.handleSelect.bind(this);
        this.followKennel = this.followKennel.bind(this);
        this.filterReviews = this.filterReviews.bind(this);
        this.defaultReviewGet = this.defaultReviewGet.bind(this);
    }

    handleSelect(eventKey) {

        if (this.state.isFiltered == true) {
            this.defaultReviewGet();
        }

        if (eventKey == "reviews") {
            this.setState({ showReviews: true, showRules: false, showTags: false, showReviewReports: false, showCommentReports: false });
        }
        if (eventKey == "rules") {
            this.setState({ showReviews: false, showRules: true, showTags: false, showReviewReports: false, showCommentReports: false });
        }
        if (eventKey == "tags") {
            this.setState({ showReviews: false, showRules: false, showTags: true, showReviewReports: false, showCommentReports: false });
        }
        if (eventKey == "reviewReports") {
            this.setState({ showReviews: false, showRules: false, showTags: false, showReviewReports: true, showCommentReports: false });
        }
        if (eventKey == "commentReports") {
            this.setState({ showReviews: false, showRules: false, showTags: false, showReviewReports: false, showCommentReports: true });
        }

    }

    followKennel() {

        updateLoggedInState(this);
        if (isLoggedIn(this)) {

            if (!this.state.isFollowing) {
                this.setState({ isFollowing: true, followBtnText: "Unfollow" });
            }
            else {
                this.setState({ isFollowing: false, followBtnText: "Follow" });
            }
        }
        else {
            this.setState({ loginPrompt: true, loginPromptAction: "follow" });
        }

        // Get kennel name somehow
        var kennelName = this.props.match.params.kennelName;

        // Get token
        var token = localStorage.getItem('jwtToken');

        // Create JSON form to send to backend
        var form = followKennelJson(kennelName, token);

        // Send POST request to follow kennel
        if (!this.state.isFollowing) {
            axios({
                method: 'post',
                url: '/follow_kennel',
                data: form
            }).then(response => {


            }).catch(error => {

                // Error for failed follow
                this.setState({ showPopup: 'Failed to follow kennel' })

            });
        }
        else {
            axios({
                method: 'post',
                url: '/unfollow_kennel',
                data: form
            }).then(response => {

            }).catch(error => {

                // Error for failed follow
                this.setState({ showPopup: 'Failed to unfollow kennel' })

            });

        }
    }

    componentDidMount() {
        updateLoggedInState(this);

        // Get kennel name from URL
        var kennelName = this.props.match.params.kennelName;
        var token = localStorage.getItem('jwtToken')

        // Gets all default reviews with no tag filtering
        this.defaultReviewGet();

        // Get token 
        var token = localStorage.getItem('jwtToken');

        // Format URL to send in GET request
        var reqUrl = "/get_kennel/" + kennelName + "/" + token;

        // Send GET request with kennel name to get kennel information
        axios({
            method: 'get',
            url: reqUrl
        }).then(response => {

            // Updates kennel name
            this.setState({
                kennel_name: response.data.kennel_name,
                follower_count: response.data.follower_count,
                moderator: response.data.mod_name
            });

            if (response.data.is_following) {
                this.setState({ isFollowing: true, followBtnText: "Unfollow" });
            }

            // Split rules be newline to display in rules cards
            var rulesArr = response.data.rules.split("\n");
            for (var i = 0; i < rulesArr.length; i++) {
                this.state.rulesArray.push(rulesArr[i]);
            }

            // Iterate through tags
            var tagsStr = "";
            if (response.data.tags.length > 0) {
                tagsStr = tagsStr + response.data.tags[0];
                this.state.tagsArray.push(response.data.tags[0]);
            }
            for (var i = 1; i < response.data.tags.length; i++) {

                // Add tags to tagsArray and recreate tag string as prop for editkennel
                tagsStr = tagsStr + ", " + response.data.tags[i];
                this.state.tagsArray.push(response.data.tags[i]);
            }

            // Iterate through muted words
            var mutedStr = "";
            if (response.data.muted_words.length > 0) {
                mutedStr = mutedStr + response.data.muted_words[0];
                this.setState({mutedArray: response.data.muted_words});
            }
            for (var i = 1; i < response.data.muted_words.length; i++) {

                // Build muted words string from array as prop for editkennel
                mutedStr = mutedStr + ", " + response.data.muted_words[i];

            }

            // Iterate through bans
            if(response.data.banned_users != null && response.data.banned_users.length > 0) {
                this.setState({bansArray: response.data.banned_users});
            } 


            this.setState({ rulesStringProp: response.data.rules });
            this.setState({ tagsString: tagsStr });
            this.setState({ mutedString: mutedStr });
            this.setState({ kennelInfoListed: true });
            this.setState({ isModerator: response.data.is_moderator });
            this.setState({ description: response.data.description });

        }).catch(error => {

            // Review not found in database
            this.setState({ showPopup: 'Kennel does not exist in database' })

        });


        // Get token 
        var token = localStorage.getItem('jwtToken');

        // Format URL to send in GET request
        reqUrl = "/get_kennel_reports_reviews/" + kennelName + "/" + token;

        // Send GET request with kennel name to get kennel information
        axios({
            method: 'get',
            url: reqUrl
        }).then(response => {

            if (response.data.length > 0) {
                this.state.reportsReviewsArray.push(response.data[0]);
            }
            for (var i = 1; i < response.data.length; i++) {
                this.state.reportsReviewsArray.push(response.data[i]);
            }

        }).catch(error => {

            // Review not found in database
            this.setState({ showPopup: 'Review Report error' });

        });

        // Get token 
        var token = localStorage.getItem('jwtToken');

        // Format URL to send in GET request
        reqUrl = "/get_kennel_reports_comments/" + kennelName + "/" + token;

        // Send GET request with kennel name to get kennel information
        axios({
            method: 'get',
            url: reqUrl
        }).then(response => {

            // Iterate through tags
            if (response.data.length > 0) {
                this.state.reportsCommentsArray.push(response.data[0]);
            }
            for (var i = 1; i < response.data.length; i++) {

                this.state.reportsCommentsArray.push(response.data[i]);
            }

        }).catch(error => {

            // Review not found in database
            this.setState({ showPopup: 'Comment Report error' })

        });
    }

    // Makes a get request for all reviews with a given tag
    filterReviews(tag) {
        var kennelName = this.props.match.params.kennelName;
        var token = localStorage.getItem('jwtToken')

        // Format URL to send in GET request
        var reqUrl = "/get_kennel_reviews_filtered/" + kennelName + "/" + token + "/" + tag;

        // Send GET request with kennel name to get reviews in kennel
        axios({
            method: 'get',
            url: reqUrl
        }).then(response => {

            //Clear current reviews
            this.setState({ reviewArray: [] });
            this.setState({ kennelReviewsListed: false });

            // Iterate through reviews
            for (var i = 0; i < response.data.length; i++) {
                // Add review name, reviewer's username, review text to reviewArray
                this.state.reviewArray.push({
                    title: response.data[i].title,
                    author: response.data[i].author,
                    text: response.data[i].text,
                    kennel: response.data[i].kennel_name,
                    rating: response.data[i].rating,
                    id: response.data[i].review_uuid,
                    isLiked: response.data[i].is_liked,
                    isDisliked: response.data[i].is_disliked,
                    timestamp: response.data[i].timestamp
                });
            }

            this.setState({ kennelReviewsListed: true });
            this.setState({ showReviews: true, showRules: false, showTags: false, showReviewReports: false, showCommentReports: false });
            this.setState({ isFiltered: true });

        }).catch(error => {
            // Review not found in database
            this.setState({ showPopup: 'Kennel does not exist/No reviews in kennel' });

        });
    }

    // Makes a get request for all reviews (no tag filter set)
    defaultReviewGet() {
        var kennelName = this.props.match.params.kennelName;
        var token = localStorage.getItem('jwtToken')

        // Format URL to send in GET request
        var reqUrl = "/get_kennel_reviews/" + kennelName + "/" + token;

        // Send GET request with kennel name to get reviews in kennel
        axios({
            method: 'get',
            url: reqUrl
        }).then(response => {

            // Iterate through reviews
            if (!this.kennelReviewsListed) {

                //Clear current reviews
                this.setState({ reviewArray: [] });

                for (var i = 0; i < response.data.length; i++) {

                    // Add review name, reviewer's username, review text to reviewArray
                    this.state.reviewArray.push({
                        title: response.data[i].title,
                        author: response.data[i].author,
                        text: response.data[i].text,
                        kennel: response.data[i].kennel_name,
                        rating: response.data[i].rating,
                        id: response.data[i].review_uuid,
                        isLiked: response.data[i].is_liked,
                        isDisliked: response.data[i].is_disliked,
                        timestamp: response.data[i].timestamp
                    });

                }
                this.setState({ kennelReviewsListed: true });
                this.setState({ isFiltered: false });
            }

        }).catch(error => {

            // Review not found in database
            this.setState({ showPopup: 'Kennel does not exist/No reviews in kennel' })

        });
    }


    render() {
        // Used to pass function into mapping function
        var tempFunc = this.filterReviews;

        // Renders content for Reviews and Tags tabs
        const reviews = this.state.reviewArray.map(function (review) {
            return <ReviewCard reviewId={review.id} reviewName={review.title} reviewerName={review.author} reviewPreview={{ __html: review.text }}
                kennelName={review.kennel} rating={review.rating} isLiked={review.isLiked} isDisliked={review.isDisliked} timestamp={review.timestamp} />
        });
        const tags = this.state.tagsArray.map(function (tag) {
            return <Link onClick={() => tempFunc(tag)}>
                <TagCard tag={tag} />
            </Link>
        });
        const rules = this.state.rulesArray.map(function (rule) {
            return <RuleCard rule={rule} />
        });
        const reviewReports = this.state.reportsReviewsArray.map(function (report) {
            return <Message messageText={report.reason} messagerName={report.author} timestamp={report.timestamp} reportTitle={report.title} commentBody="" reviewId={report.review_uuid} reportId={report.report_id} kennelName={report.kennel_name} />
        });
        let nameOfKennel = this.state.kennel_name;
        const commentReports = this.state.reportsCommentsArray.map(function (report) {
            return <Message messageText={report.reason} messagerName={report.author_name} timestamp={report.timestamp} reportTitle="" commentBody={report.text} reviewId="" reportId={report.report_id} kennelName={nameOfKennel} />
        });

        // Determines what to display based on which tab selected
        let kennelContent;
        if (this.state.showReviews) {
            kennelContent = reviews;
        }
        if (this.state.showRules) {
            kennelContent = rules;
        }
        if (this.state.showTags) {
            kennelContent = tags;
        }
        if (this.state.showReviewReports) {
            kennelContent = reviewReports;
        }
        if (this.state.showCommentReports) {
            kennelContent = commentReports;
        }


        // Renders either kennel or loading screen
        let kennel;
        if (this.state.kennelInfoListed && this.state.kennelReviewsListed) {
            kennel = <Container>
                <Toast style={{
                    position: 'fixed',
                    top: 110,
                    zIndex: 1,
                    left: '50%',
                    transform: 'translate(-50%, 0%)'
                }} className="mx-auto logInEntry" onClose={() => this.setState({ loginPrompt: false })} show={this.state.loginPrompt}>
                    <Toast.Header className="logInLabel">
                        <strong className="mx-auto">You must sign in to {this.state.loginPromptAction} kennels</strong>
                    </Toast.Header>
                    <Toast.Body style={{ textAlign: 'center' }}>Click <a href="/login">here</a> to sign in</Toast.Body>
                </Toast>

                <Row className="align-items-center">
                    <Col className="text-center">

                        <Toast className="mx-auto smallPopup" onClose={() => this.setState({ showPopup: null })} show={this.state.showPopup} autohide>
                            <Toast.Header className="smallPopup">
                                <strong className="mx-auto">{this.state.showPopup}</strong>
                            </Toast.Header>
                        </Toast>
                        <Jumbotron id="jumbotron" className="text-left">
                            <Row>
                                <Col xs={7}>
                                    <h1>{this.state.kennel_name}</h1>
                                    <h3><a class="profileLink" href={`/user-${this.state.moderator}`}>Moderator: {this.state.moderator}</a></h3>
                                    <h4>{this.state.follower_count} Followers</h4>
                                </Col>
                                <Col>
                                    <div className="float-right kennelBtns">
                                        {/*If isModerator then render the Edit Kennel Button*/}
                                        {this.state.isModerator &&
                                            <div>
                                                <Link to={{
                                                    pathname: "/editkennel",
                                                    state: {
                                                        rules: this.state.rulesStringProp,
                                                        tags: this.state.tagsArray,
                                                        mutedWords: this.state.mutedArray,
                                                        bans: this.state.bansArray,
                                                        kennel_name: this.state.kennel_name,
                                                        description: this.state.description
                                                    }
                                                }}><Button className="logInEntry" variant="link">Edit Kennel</Button></Link>
                                                <Link to={{
                                                    pathname: "/transferownership",
                                                    state: {
                                                        rules: this.state.rulesStringProp,
                                                        tags: this.state.tagsString,
                                                        mutedWords: this.state.mutedString,
                                                        kennel_name: this.state.kennel_name,
                                                        description: this.state.description
                                                    }
                                                }}><Button className="logInEntry" variant="link">Transfer Ownership</Button></Link></div>
                                        }
                                        <Button onClick={this.followKennel} className="logInEntry" type="submit" variant="primary">{this.state.followBtnText}</Button>
                                        {isLoggedIn(this) &&
                                            <Link to={{
                                                pathname: "/createreview",
                                                state: {
                                                    kennel_name: this.state.kennel_name
                                                }
                                            }}><Button className="logInEntry" type="submit" variant="link">Post Review</Button></Link>}
                                    </div>
                                </Col>
                            </Row>
                            <p>{this.state.description}</p>
                            <Nav onSelect={this.handleSelect} defaultActiveKey="reviews" variant="tabs" as="ul">
                                <Nav.Item as="li">
                                    <Nav.Link eventKey="reviews">Reviews</Nav.Link>
                                </Nav.Item>
                                <Nav.Item as="li">
                                    <Nav.Link eventKey="rules">Rules</Nav.Link>
                                </Nav.Item>
                                <Nav.Item as="li">
                                    <Nav.Link eventKey="tags">Tags</Nav.Link>
                                </Nav.Item>
                                {this.state.isModerator &&
                                    <>
                                        <Nav.Item as="li">
                                            <Nav.Link eventKey="reviewReports">Reported Reviews</Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item as="li">
                                            <Nav.Link eventKey="commentReports">Reported Comments</Nav.Link>
                                        </Nav.Item>
                                    </>
                                }
                            </Nav>
                        </Jumbotron>
                    </Col>

                </Row>
                <div>{kennelContent}</div>
            </Container>
        } else {
            kennel = <Row>
                <Image className="mx-auto loadingIcon loading" src={LoadingIcon}></Image>
            </Row>;
        }

        // Kennel page
        return (
            <div>
                <YipNavBar />
                {kennel}
            </div>
        )
    }
}

export default Kennel;