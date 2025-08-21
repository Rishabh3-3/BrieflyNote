// src/components/Header.jsx
import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Card } from 'react-bootstrap';

const Header = () => {
  return (
    <header className="bg-dark text-white py-4 shadow-lg border-bottom border-dark">
      <div className="container mx-auto px-4 text-center">
        <h1
          className="display-4 fw-bold"
          style={{
            textShadow: '2px 2px 6px rgba(0, 0, 0, 0.7)',
            letterSpacing: '2px',
            color: '#f0f0f0'
          }}
        >
          BrieflyNote
        </h1>
        <p
          className="fst-italic"
          style={{
            color: '#b0bec5',
            fontSize: '1rem',
            textShadow: '1px 1px 3px rgba(0, 0, 0, 0.4)'
          }}
        >
          Driven by AssemblyAI’s speech intelligence platform
        </p>
      </div>
    </header>
  );
};

export default Header;