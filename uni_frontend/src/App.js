import './App.css';
import {Routes, Route, BrowserRouter} from 'react-router-dom';
import UserPage from './pages/user-page/UserPage'
import MainPage from './pages/Mainpage'
import ChatPage from "./pages/chat-page/ChatPage";
import EditPage from "./pages/edit-page/EditPage";

const App = () => {
    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<MainPage/>}></Route>
                    <Route path="/user" element={<UserPage/>}></Route>
                    <Route path="/user/:id" element={<UserPage/>}></Route>
                    <Route path="/user/:id/edit" element={<EditPage/>}></Route>
                    <Route path="/chat/:id" element={<ChatPage/>}></Route>
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
