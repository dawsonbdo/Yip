import React from 'react';
import ReactDOM from 'react-dom'
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/App.css';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Home from "./components/Home";
import Register from "./components/Register";
import Login from "./components/Login";
import CreateReview from "./components/CreateReview"
import RecoverPassword from './components/RecoverPassword';
import Review from './components/Review';
import Kennel from './components/Kennel';
import EditKennel from './components/EditKennel';
import EditReview from './components/EditReview';
import CreateKennel from './components/CreateKennel';
import SearchResults from './components/SearchResults';
import Profile from './components/Profile';
import Report from './components/Report';
import TransferOwnership from './components/TransferOwnership';

function App() {
  
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/login" exact component={Login} />
          <Route path="/register" exact component={Register} />
          <Route path="/createreview" exact component={CreateReview} />
          <Route path="/recoverpassword" exact component={RecoverPassword} />
          <Route path="/review-:id" exact component={Review} />
		  <Route path="/editkennel" exact component={EditKennel} />
		  <Route path="/editreview" exact component={EditReview} />
		  <Route path="/createkennel" exact component={CreateKennel} />
		  <Route path="/searchresults-:searchType-:query" exact component={SearchResults} />
		  <Route path="/user-:username" exact component={Profile} />
		  <Route path="/kennel-:kennelName" component={Kennel} />
          <Route path="/report" exact component={Report} />
		  <Route path="/transferownership" exact component={TransferOwnership} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;

// Entry for rendering React components
const wrapper = document.getElementById("app");
wrapper ? ReactDOM.render(<App />, wrapper) : false;