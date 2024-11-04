import {dummy_l} from '../Dummy';
import "./UserPage.css";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";

const UserPage = () => {
    const {userId} = useParams();
    const [user, setUser] = useState(null);
    const {pathname} = useLocation();
    const navigate = useNavigate();

    const Context = (props) => {
        return (
            <div className="Context">
                <span>{props.title}</span>
                <p className="Explain">{props.text}</p>
            </div>
        );
    }
    const MoveButton = (props) => {

        const handleClickReport = () => {
            alert("신고");
        }
        const handleClickEdit = () => {
            navigate(`${pathname}/edit`);
        }
        const handleClickChat = () => {
                const result = fetch("/api/chat/request", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify( {"receiverId": userId })
                })
                    .catch((err) => {
                        console.log(err);
                        alert('error: fetch fail - chat');
                    })
                    .then(response => response.json())
                    .then((data) => {
                        navigate(`/chat/${data.chatRoomId}`, {
                                state: data
                            });
                        console.log(data);
                    })
                    .catch((err) => {
                        console.log(err);

                    });
        }
        return (
            (props.owner ?
                    <div>
                        <button className="Edit" onClick={handleClickEdit}>Edit</button>
                        <button className="Easter">Easter</button>
                    </div> :
                    <div>
                        <button className="Chatting" onClick={handleClickChat}>Chat</button>
                        <button className="Report" onClick={handleClickReport}>Report</button>
                    </div>
            )
        )
    }
    useEffect( () => {
        (async () => {
            const result = fetch(`/api/user/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .catch((err) => {
                    console.log(err);
                    alert('error: fetch fail');
                    setUser(dummy_l[userId]);
                })
                .then(response => response.json())
                .then((data) => {
                    setUser(() => data);
                })
                .catch((err) => {
                    console.log(err);

                });
        })();
    }, [userId, pathname]);

    return (
        user ? (
            <div>
                <div className="Image-back-container">
                    <img className="Image-back" src={user.img_back} alt="배경사진"/>
                </div>
                <div className="Button-section">
                    <MoveButton owner={false}/>
                </div>
                <div className="Content-container">
                    <div className="Profile-container">
                        <div className="Image-prof-container">
                            <img className="Image-prof" src={user.img_prof} alt="프로필사진"/>
                        </div>
                        <div className="Profile-content">
                            <p>{user.star}</p>
                            <span>{user.name}</span>
                            <span className="Region">{user.region}</span>
                            <p>{user.univ}</p>
                            <p>{user.numEmployment}회 고용</p>
                            <p>{user.time}</p>
                        </div>
                    </div>
                    <Context title="지도" text={user.region}></Context>
                    <Context title="자기소개" text={user.description}></Context>
                </div>
            </div>) : null
    );
}

export default UserPage;