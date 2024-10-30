import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Mainpage from './mainpage';
import Register from './Register';


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Mainpage />} />
                <Route path="/register" element={<Register />} />
            </Routes>
        </Router>
    );
}

export default App;
