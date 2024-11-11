import "./EditPage.css";
import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";

const EditPage = () => {
    const {userId} = useParams();
    const [user, setUser] = useState(null);
    const [hashtag, setHashtag] = useState("");
    const navigate = useNavigate();

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

    const handleChangeHashtag = (e) => {
        setHashtag((prev) => e.target.value);
    }

    const handleKeyDownHashtag = (e) => {
        if (e.key === "Enter" && hashtag !== "") {
            if (user.hashtags.includes(hashtag))
                alert("이미 존재하는 해시태그입니다.");
            else {
                setUser((prev) => ({
                    ...prev,
                    hashtags: [...prev.hashtags, hashtag]
                }));
                setHashtag("");
            }
        }
    }

    const handleClickComplete = () => {
        const result = fetch(`/api/user/${userId}`, {
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

    useEffect(() => {
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
                })
                .then(response => response.json())
                .then((data) => {
                    setUser(() => data);
                })
                .catch((err) => {
                    console.log(err);

                });
        })();
    }, [userId]);

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
                    >Edit
                    </button>
                </div>
                <div className="Content-container">
                    <div className="Profile-container">
                        <div className="Image-prof-container">
                            <img className="Image-prof" src={user.img_prof} alt="프로필사진"/>
                        </div>
                        <div className="Profile-content">
                            <p>{user.star}</p>
                            <p>User: {user.userName}</p>
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
                            {user.hashtags && user.hashtags.map((hashtag, i) => {
                                return (
                                    <div className="Hashtag" key={`hashtag-${i}`}>
                                        <span>#{hashtag}</span>
                                        <button onClick={() => setUser((prev) => ({
                                            ...prev,
                                            hashtags: prev.hashtags.filter(word => word !== hashtag)
                                        }))}>X
                                        </button>
                                    </div>
                                )
                            })}
                            <input
                                type="text"
                                value={hashtag}
                                placeholder="hashtag"
                                onKeyDown={(e) => handleKeyDownHashtag(e)}
                                onChange={handleChangeHashtag}
                            />
                        </div>
                    </div>
                    <div className="SelfPR">
                        <span>지도</span>
                        <p>{user.region}</p>
                    </div>
                    <div className="SelfPR">
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