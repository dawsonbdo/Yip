import React, { Component } from 'react';

import Jumbotron from "react-bootstrap/Jumbotron";
import Button from 'react-bootstrap/Button';
import ReviewCard from './ReviewCard';
import YipNavBar from "./YipNavBar";
import KennelCard from './KennelCard';
import Container from 'react-bootstrap/Container';
import LoadingIcon from '../../assets/loadingIcon.gif';
import Image from 'react-bootstrap/Image';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import axios from 'axios'

class SearchResults extends Component {
    constructor(props) {
        super(props);

        // States track when to display results, if there are results, and results
        this.state = {
            searchDisplay: false,
            results: false,
            resultArray: [],
        };
    }

    componentDidUpdate(prevProps) {
        // Checks if user was redirected to this page from another search results page
        if (prevProps.location.key != this.props.location.key) {
            // Resets component
            window.location.reload();
        }
    }

    componentDidMount() {

        // Search kennels or reviews depending on what user selected
        if (this.props.match.params.searchType == "Kennels") {
            this.searchKennels(this.props.match.params.query);
        }
        else {
            this.searchReviews(this.props.match.params.query);
        }

    }

    // Searches all kennels using query passed in
    searchKennels(query) {
        axios({
            method: 'get',
            url: '/search_kennels/' + query,
        }).then(response => {

            console.log("KENNEL SEARCH QUERY: " + query);

            // Iterate through kennels
            for (var i = 0; i < response.data.length; i++) {

                // Print kennels to console for now
                console.log(response.data[i]);

                var tagsStr = "";
                if (response.data[i].tags.length > 0) {
                    tagsStr = tagsStr + response.data[i].tags[0];
                }
                for (var j = 1; j < response.data[i].tags.length; j++) {
                    tagsStr = tagsStr + ", " + response.data[i].tags[j];
                }

                // Add kennel info to array for rendering kennel cards
                this.state.resultArray.push({
                    kennelName: response.data[i].kennel_name,
                    kennelRules: response.data[i].rules,
                    kennelTags: tagsStr,
                    followerCount: response.data[i].follower_count
                });

            }
            this.setState({ searchDisplay: true, results: true });


        }).catch(error => {

            // Review not found in database
            //alert('Failed to search kennels');
            this.setState({ searchDisplay: true, results: false });

        });
    }

    // Searches all reviews using query passed in
    searchReviews(query) {
        axios({
            method: 'get',
            url: '/search_reviews/' + query,
        }).then(response => {

            console.log("REVIEW SEARCH QUERY: " + query);

            // Iterate through reviews
            for (var i = 0; i < response.data.length; i++) {

                // Print reviews to console for now
                console.log(response.data[i]);

                // Adds review info to array for rendering review cards
                this.state.resultArray.push({
                    title: response.data[i].title,
                    author: response.data[i].author,
                    text: response.data[i].text,
                    kennel: response.data[i].kennel_name,
                    rating: response.data[i].rating,
                    id: response.data[i].review_uuid,
                    isLiked: response.data[i].is_liked,
                    isDisliked: response.data[i].is_disliked
                });

            }

            this.setState({ searchDisplay: true, results: true });

        }).catch(error => {

            // Review not found in database
            //alert('Failed to search reviews');
            this.setState({ searchDisplay: true, results: false });

        });
    }

    render() {

        // DYNAMICALLY GET REVIEWS HERE AND PUT IT IN THE IF STATEMENT BELOW
        let results;
        if (this.props.match.params.searchType == "Reviews") {
            results = this.state.resultArray.map(function (result) {
                return <ReviewCard reviewId={result.id} reviewName={result.title} reviewerName={result.author} reviewPreview={{ __html: result.text }}
                    kennelName={result.kennel} rating={result.rating} isLiked={result.isLiked} isDisliked={result.isDisliked} />
            });
        }
        else {
            results = this.state.resultArray.map(function (result) {
                return <KennelCard kennelName={result.kennelName} kennelRules={result.kennelRules} kennelTags={result.kennelTags} followerCount={result.followerCount} />
            });
        }

        let search;
        if (this.state.searchDisplay && this.state.results) {
            search =
                <div>
                    <Jumbotron id="jumbotron" className="text-center">
                        <h1>Results for '{this.props.match.params.query}' in {this.props.match.params.searchType}: </h1>
                    </Jumbotron>
                    <Container>
                        <Row>
                            <Col>
                                {results}
                            </Col>
                        </Row>
                    </Container>
                </div>
        } else if (this.state.searchDisplay && !this.state.results) {
            search =
                <div>
                    <Jumbotron id="jumbotron" className="text-center">
                        <h1>No results for '{this.props.match.params.query}' in {this.props.match.params.searchType}. </h1>
                    </Jumbotron>
                    <Container>
                        <Row>
                            <Col>
                                {results}
                            </Col>
                        </Row>
                    </Container>
                </div>
        } else {
            search =
                <Row>
                    <Image className="mx-auto loadingIcon loading" src={LoadingIcon}></Image>
                </Row>;
        }

        return (
            <div>
                <YipNavBar />
                {search}
            </div>
        )
    }
}

export default SearchResults;