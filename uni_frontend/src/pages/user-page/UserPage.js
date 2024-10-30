import {dummy_l} from '../Dummy';
import "./UserPage.css";
import {useLocation} from "react-router-dom";
import {useEffect, useState} from "react";

const UserPage = () => {
    const [user, setUser] = useState(null);
    const {pathname} = useLocation();
    const main_id = 0;  //접속한 사용자 ID

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
            alert("편집");
        }
        return (
            (props.owner ?
                    <button className="Edit" onClick={handleClickEdit}>Edit</button> :
                    <button className="Report" onClick={handleClickReport}>Report</button>
            )
        )
    }
    useEffect( () => {
        const user_id = Number(pathname.split('/').at(2));
        (async () => {
            const result = fetch(`http://localhost:8080/api/user/${user_id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            })
                .catch((err) => {
                    console.log(err);
                    alert('error: fetch fail');
                    setUser(dummy_l[user_id]);
                })
                .then(response => response.json())
                .then((data) => {
                    setUser(() => data);
                })
                .catch((err) => {
                    console.log(err);

                });
        })();
    }, [user, pathname]);

    return (
        user ? (
            <div>
                <div className="Image-back-container">
                    <img className="Image-back" src={user.img_back} alt="배경사진"/>
                </div>
                <div>
                    <MoveButton owner={main_id === user.user_id}/>
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
                            <p>{user.university}</p>
                            <p>{user.num_employment}회 고용</p>
                            <p>{user.time}</p>
                        </div>
                    </div>
                    <Context title="지도" text={"heelo"}></Context>
                    <Context title="자기소개" text={user.explain}></Context>
                </div>
            </div>) : null
    );
}

export default UserPage;