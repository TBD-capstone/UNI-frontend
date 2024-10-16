import './App.css';
import {Routes, Route, BrowserRouter, Router} from 'react-router-dom';
import UserPage from './pages/user-page/UserPage'
import MainPage from './pages/Mainpage'
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainPage/>}></Route>
          <Route path="/user" element={<UserPage/>}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
