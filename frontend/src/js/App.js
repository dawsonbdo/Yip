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
import CreateKennel from './components/CreateKennel';
import SearchResults from './components/SearchResults';
import Profile from './components/Profile';

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
          <Route path="/review" exact component={Review} />
		  <Route path="/editkennel" exact component={EditKennel} />
		  <Route path="/createkennel" exact component={CreateKennel} />
		  <Route path="/searchresults" exact component={SearchResults} />
		  <Route path="/profile" exact component={Profile} />
		  <Route path="/kennel" exact component={Kennel} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;

// Entry for rendering React components
const wrapper = document.getElementById("app");
wrapper ? ReactDOM.render(<App />, wrapper) : false;