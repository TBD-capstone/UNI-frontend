import "./EditPage.css";
import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import GoogleMap from "../user-page/util/GoogleMap";
import { useTranslation } from "react-i18next";

const EditPage = () => {
    const { t } = useTranslation();
    const {userId} = useParams();
    const [user, setUser] = useState(null);
    const [hashtag, setHashtag] = useState("");
    const [profileImage, setProfileImage] = useState(null);
    const [backgroundImage, setBackgroundImage] = useState(null);
    const [position, setPosition] = useState(null);
    const [markerName, setMarkerName] = useState("");
    const [markerDescription, setMarkerDescription] = useState("");
    const [markerAdd, setMarkerAdd] = useState(false);
    const [markerDelete, setMarkerDelete] = useState(false);
    const [markerUpdate, setMarkerUpdate] = useState(false);
    const [markers, setMarkers] = useState([{
        id: 1,
        latitude: 37.282,
        longitude: 127.043,
        name: "first",
        description: "this is first"
    }, {
        id: 2,
        latitude: 37.283,
        longitude: 127.044,
        name: "second",
        description: "this is second"
    }]);
    const basicHashtags = ["여행",
        "행정",
        "부동산",
        "은행",
        "휴대폰",
        "언어교환",
        "대학 생활",
        "맛집",
        "게임",
        "쇼핑"];
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
        setHashtag(() => e.target.value);
    }

    const handleKeyDownHashtag = (e) => {
        if (e.key === "Enter" && hashtag !== "") {
            appendHashtag(hashtag);
        }
    };
    const appendHashtag = (hashtag) => {
        if (user.hashtags.includes(hashtag))
            alert("이미 존재하는 해시태그입니다.");
        else {
            setUser((prev) => ({
                ...prev,
                hashtags: [...prev.hashtags, hashtag]
            }));
            setHashtag("");
        }
    };
    const deleteHashtag = (hashtag) => {
        setUser((prev) => ({
            ...prev,
            hashtags: prev.hashtags.filter(word => word !== hashtag)
        }));
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


    const handleChangeProfileImage = (e) => {
        setProfileImage(e.target.files[0]);
    }
    const handleChangeBackgroundImage = (e) => {
        setBackgroundImage(e.target.files[0]);
    }

    const handleClickSubmit = (e) => {
        e.preventDefault();

        if (!profileImage && !backgroundImage)
            return;

        const formData = new FormData();
        if (profileImage)
            formData.append('profileImage', profileImage);
        if (backgroundImage)
            formData.append('backgroundImage', backgroundImage);

        fetch(`/api/user/${userId}/update-profile`, {
            method: 'POST',
            // headers: {
            //     'Content-Type': 'multipart/form-data'
            // },
            body: formData
        }).then(response => response.json())
            .then((data) => {
                setUser((prev) => ({...prev, imgBack: data.imgBack, imgProf: data.imgProf}));
                alert('Upload Success!');
            })
            .catch((err) => {
                console.log(err);
                alert('error: fetch fail');
            });
    };

    const setting = (latLng) => {
        setPosition(() => ({
            latitude: latLng.lat,
            longitude: latLng.lng
        }));
    }

    const handleChangeMarkerName = (e) => {
        setMarkerName(() => e.target.value);
    }
    const handleChangeMarkerDescription = (e) => {
        setMarkerDescription(() => e.target.value);
    }

    const handleClickAdd = () => {
        if (!position || markerName.trim() === "" || markerDescription.trim() === "") {
            alert("There is no marker, or some text is empty.");
            return;
        }
        if (markers.some((e) => e.name === markerName)) {
            alert("duplicated title existed");
            return;
        }
        const result = fetch(`/api/markers/add/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                latitude: position.latitude,
                longitude: position.longitude,
                name: markerName,
                description: markerDescription
            })
        })
            .then((response) => {
                console.log(response.json());
                alert("Marker add Success!");
            })
            .catch((err) => {
                console.log(err);
                alert('error: fetch fail');
            });
    }
    const handleClickDelete = () => {
        if (markerName.trim() === "") {
            alert("Title text is empty.");
            return;
        }
        const i = markers.findIndex((e) => e.name === markerName);
        if (i < 0) {
            alert("duplicated title not existed");
            return;
        }
        const result = fetch(`/api/markers/delete/${markers[i].id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then((response) => {
                console.log(response.json());
                alert("Marker delete Success!");
            })
            .catch((err) => {
                console.log(err);
                alert('error: fetch fail');
            });
    }
    const handleClickUpdate = () => {
        if (!position || markerName.trim() === "" || markerDescription.trim() === "") {
            alert("There is no marker, or some text is empty.");
            return;
        }
        alert("미구현");
    };

    const BasicHashtag = (props) => {
        const handleClickBasicHashtag = () => {
            if(user.hashtags.includes(props.basicHashtag)) {
                deleteHashtag(props.basicHashtag);
            }
            else {
                appendHashtag(props.basicHashtag);
            }
        }
        return (
            <div className="Hashtag Basic"  onClick={handleClickBasicHashtag}>
                <span>#{props.basicHashtag}</span>
            </div>
        );
    }

    useEffect(() => {
        (async () => {
            await fetch(`/api/user/${userId}`, {
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
            await fetch(`/api/markers/user/${userId}`, {
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
                    setMarkers(() => data);
                })
                .catch((err) => {
                    console.log(err);
                });
        })();

    }, [userId]);

    const handleClickMarkerAdd = () => {
        setMarkerAdd(prev => !prev);
        setMarkerDelete(() => false);
        setMarkerUpdate(() => false);
    };
    const handleClickMarkerDelete = () => {
        setMarkerAdd(() => false);
        setMarkerDelete(prev => !prev);
        setMarkerUpdate(() => false);
    };
    const handleClickMarkerUpdate = () => {
        setMarkerAdd(() => false);
        setMarkerDelete(() => false);
        setMarkerUpdate(prev => !prev);
    };

    return (
        user ? (
            <div>
                <div className="Image-back-container">
                    <img className="Image-back" src={user.imgBack} alt="배경사진"/>
                </div>
                <div>
                    <button
                        className="Complete"
                        onClick={handleClickComplete}
                    >{t("editPage.edit")}
                    </button>
                </div>
                <div className="Content-container">
                    <div className="Profile-container">
                        <div className="Image-prof-container">
                            <img className="Image-prof" src={user.imgProf} alt="프로필사진"/>
                        </div>
                        <div className="Profile-content">
                            <p>⭐ {user.star}</p>
                            <p>{t("editPage.user")}: {user.userName}</p>
                            <span>{t("editPage.region")}: </span>
                            <input
                                type="text"
                                value={user.region}
                                onChange={handleChangeRegion}
                            />
                            <p>{t("editPage.university")}: {user.univ}</p>
                            <p>{t("editPage.employ_count")}: {user.numEmployment}</p>
                            <span>{t("editPage.time")}: </span>
                            <input
                                type="text"
                                value={user.time}
                                onChange={handleChangeTime}
                            />
                            <span>{t("editPage.basic_hashtag")}</span>
                            <div className="Hashtag-section">
                                {basicHashtags.map((basicHashtag, i) => {
                                    return (
                                        <BasicHashtag basicHashtag={basicHashtag} key={`basicHashtag-${i}`}/>
                                    );
                                })}
                            </div>
                            <div className="Hashtag-section">
                                {user.hashtags && user.hashtags.map((hashtag, i) => {
                                    return (
                                        <div className="Hashtag" key={`hashtag-${i}`}>
                                            <span>#{hashtag}</span>
                                            <button onClick={() => deleteHashtag(hashtag)}>X</button>
                                        </div>
                                    )
                                })}
                            </div>
                            <input
                                type="text"
                                value={hashtag}
                                placeholder="hashtag"
                                onKeyDown={(e) => handleKeyDownHashtag(e)}
                                onChange={handleChangeHashtag}
                            />
                            <span>{t("editPage.profile_image")}: </span>
                            <input type='file' accept="image/png, image/jpeg" onChange={handleChangeProfileImage}/>
                            <span>{t("editPage.background_image")}: </span>
                            <input type='file' accept="image/png, image/jpeg" onChange={handleChangeBackgroundImage}/>
                            <button onClick={handleClickSubmit}>{t("editPage.image_upload")}</button>
                        </div>
                    </div>
                    <div className="Map-section">
                        <span>{t("editPage.map")}: </span>
                        <div className="Map-container">
                            <GoogleMap markers={markers} setting={setting}/>
                        </div>
                        <button onClick={handleClickMarkerAdd}>{t("editPage.marker_add")}</button>
                        <button onClick={handleClickMarkerDelete}>{t("editPage.marker_delete")}</button>
                        {/*<button onClick={handleClickMarkerUpdate}>Marker Update</button>*/}
                        {(markerAdd || markerDelete) &&
                            <input
                                type="text"
                                placeholder={t("editPage.marker_title_placeholder")}
                                value={markerName}
                                onChange={handleChangeMarkerName}
                            />}
                        {(markerAdd || markerUpdate) && <input
                            type="text"
                            placeholder={t("editPage.marker_description_placeholder")}
                            value={markerDescription}
                            onChange={handleChangeMarkerDescription}
                        />
                        }
                        {markerAdd && <button onClick={handleClickAdd}>{t("editPage.add")}</button>}
                        {markerDelete && <button onClick={handleClickDelete}>{t("editPage.delete")}</button>}
                        {/*{markerUpdate && <button onClick={handleClickUpdate}>Update</button>}*/}
                    </div>
                    <div className="SelfPR">
                        <span>{t("editPage.self_pr")}</span>
                        <textarea
                            className="Explain"
                            value={user.description}
                            onChange={handleChangeDescription}
                            maxLength={100}
                        />
                    </div>
                </div>
            </div>) : null
    );
}

export default EditPage;