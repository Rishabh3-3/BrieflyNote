// src/components/Footer.jsx
import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Card } from 'react-bootstrap';


const Footer = () => {
  return (
    <footer className="bg-dark text-white py-3 mt-8 border-top border-dark">
      <div className="container mx-auto px-4 text-center text-xs text-muted">
        &copy; {new Date().getFullYear()} Rishabh Singh. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
