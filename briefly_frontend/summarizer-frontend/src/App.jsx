import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Layout from './components/Layout';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import Home from './pages/Home';
import Result from './pages/Result';
import ProtectedRoute from './components/ProtectedRoute';
import RequireAuth from './components/RequireAuth';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Card } from 'react-bootstrap';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Layout>
                  <Home />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/result"
            element={
              <RequireAuth>
                <Layout>
                  <Result />
                </Layout>
              </RequireAuth>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;

