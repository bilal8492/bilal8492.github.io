import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Work from "./pages/Work";
import Contact from "./pages/Contact";
import "./styles/global.css";

const App = () => {
  return (
    <Router>
      <Header />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/work" component={Work} />
        <Route path="/contact" component={Contact} />
      </Switch>
      <Footer />
    </Router>
  );
};

export default App;
