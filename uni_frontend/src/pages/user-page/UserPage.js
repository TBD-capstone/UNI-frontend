import {dummy_l} from '../Dummy';
import "./UserPage.css";
import {useLocation, useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";

const UserPage = () => {
    const [user, setUser] = useState(null);
    const {pathname} = useLocation();
    const navigate = useNavigate();
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
            navigate(`${pathname}/edit`);
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
            const result = fetch(`/api/user/${user_id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
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
    }, [pathname]);

    return (
        user ? (
            <div>
                <div className="Image-back-container">
                    <img className="Image-back" src={user.img_back} alt="배경사진"/>
                </div>
                <div>
                    <MoveButton owner={true}/>
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