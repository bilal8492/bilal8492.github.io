import React from "react";
import "./Header.css";

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-content">
        <h1>Bilal's Portfolio</h1>
        <nav>
          <ul className="nav-links">
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/work">Work</a>
            </li>
            <li>
              <a href="/contact">Contact</a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
