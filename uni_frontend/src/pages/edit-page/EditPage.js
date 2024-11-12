import {dummy_l} from '../Dummy';
import "./EditPage.css";
import {useLocation, useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";

const EditPage = () => {
    const [user, setUser] = useState(null);
    const {pathname} = useLocation();
    const navigate = useNavigate();
    const main_id = 0;  //접속한 사용자 ID

    const handleChangeRegion = (e) => {
        setUser((prev) => ({
            ...prev,
            region: e.target.value
        }));
    };
    const handleChangeTime = (e) => {
        setUser((prev) => ({
            ...prev,
            time: e.target.value
        }));
    };

    const handleChangeDescription = (e) => {
        setUser((prev) => ({
            ...prev,
            description: e.target.value
        }));
    };

    const handleClickComplete = () => {
        const user_id = Number(pathname.split('/').at(2));
        const result = fetch(`/api/user/${user_id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        })
            .then(() => {
                alert("성공");
                navigate(`/user/${user.userId}`);
            })
            .catch((err) => {
                console.log(err);
                alert('error: fetch fail');
            });
    };

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
                    <button
                        className="Complete"
                        onClick={handleClickComplete}
                    >수정</button>
                </div>
                <div className="Content-container">
                    <div className="Profile-container">
                        <div className="Image-prof-container">
                            <img className="Image-prof" src={user.img_prof} alt="프로필사진"/>
                        </div>
                        <div className="Profile-content">
                            <p>{user.star}</p>
                            <p>User: {user.userName}</p>
                            <p>Region: {user.region}</p>
                            <span>Region: </span>
                            <input
                                type="text"
                                value={user.region}
                                onChange={handleChangeRegion}
                            />
                            <p>Univ: {user.univ}</p>
                            <p>Employ count: {user.numEmployment}</p>
                            <span>Time: </span>
                            <input
                                type="text"
                                value={user.time}
                                onChange={handleChangeTime}
                            />
                        </div>
                    </div>
                    <div className="Context">
                        <span>지도</span>
                        <p>{user.region}</p>
                    </div>
                    <div className="Context">
                        <span>자기 소개</span>
                        <textarea
                            className="Explain"
                            value={user.description}
                            onChange={handleChangeDescription}
                        />
                    </div>
                </div>
            </div>) : null
    );
}

export default EditPage;