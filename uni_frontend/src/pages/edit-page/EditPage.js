import "./EditPage.css";
import "../user-page/UserPage.css";
import {useNavigate} from "react-router-dom";
import React, {useEffect, useState} from "react";
import GoogleMap from "../../components/GoogleMap";
import {useTranslation} from "react-i18next";
import EditModal from "../../components/modal/EditModal.js";
import TimeSelector from "../../components/TimeSelector";

const EditMarkerInput = (props) => {
    const t = useTranslation();
    const [markerName, setMarkerName] = useState("");
    const [markerDescription, setMarkerDescription] = useState("");
    const [markerAction, setMarkerAction] = useState('add');
    const handleClickMarkerAdd = () => {
        setMarkerAction(() => 'add');
    };
    const handleClickMarkerDelete = () => {
        setMarkerAction(() => 'delete');
    };

    const handleChangeMarkerName = (e) => {
        setMarkerName(() => e.target.value);
    }
    const handleChangeMarkerDescription = (e) => {
        setMarkerDescription(() => e.target.value);
    }

    const handleClickAdd = () => {
        if (!props.position || markerName.trim() === "" || markerDescription.trim() === "") {
            alert(t('editPage.no_marker_data'));
            return;
        }
        if (props.markers.some((e) => e.name === markerName)) {
            alert(t('editPage.duplicated_title'));
            return;
        }
        fetch(`/api/markers/add/${props.userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                latitude: props.position.latitude,
                longitude: props.position.longitude,
                name: markerName,
                description: markerDescription
            })
        })
            .then((response) => {
                console.log(response.json());
                props.mapClose();
                // alert("Marker add Success!");
            })
            .catch((err) => {
                console.log(err);
                alert('error: fetch fail');
            });
    }
    const handleClickDelete = () => {
        if (markerName.trim() === "") {
            alert(t('editPage.no_title'));
            return;
        }
        const i = props.markers.findIndex((e) => e.name === markerName);
        if (i < 0) {
            alert(t('editPage.no_target_marker'));
            return;
        }
        const result = fetch(`/api/markers/delete/${props.markers[i].id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then((response) => {
                console.log(response.json());
                props.mapClose();
                // alert("Marker delete Success!");
            })
            .catch((err) => {
                console.log(err);
                alert('error: fetch fail');
            });
    }

    return <>
        <div className={"edit-select"}>
            <button className={"edit-select"}
                    onClick={handleClickMarkerAdd}>{props.t}</button>
            <button className={"edit-select"}
                    onClick={handleClickMarkerDelete}>{props.t1}</button>
        </div>
        {/*<button className={'edit-select'} onClick={handleClickMarkerUpdate}>Marker Update</button>*/}
        {markerAction === "add" &&
            <>
                <p>{props.t2}</p>
                <input
                    type="text"
                    placeholder={props.placeholder}
                    value={markerName}
                    onChange={handleChangeMarkerName}
                />
                <input
                    type="text"
                    placeholder={props.placeholder1}
                    value={props.value1}
                    onChange={handleChangeMarkerDescription}
                />
                <button className={"edit-button"} onClick={handleClickAdd}>{props.t3}</button>
            </>
        }
        {markerAction === "delete" &&
            <>
                <p>{props.t4}</p>
                <input
                    type="text"
                    placeholder={props.placeholder}
                    value={markerName}
                    onChange={handleChangeMarkerName}
                />
                <button className={"edit-button"}
                        onClick={handleClickDelete}>{props.t5}</button>
            </>
        }
        {/*{markerUpdate && <button onClick={handleClickUpdate}>Update</button>}*/}
    </>;
}

const EditPage = () => {
    const basicProfileImage = '/profile-image.png'
    const {t} = useTranslation();
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);
    const [time, setTime] = useState([]);
    const [isOpenBasic, setIsOpenBasic] = useState(false);
    const [isOpenImage, setIsOpenImage] = useState(false);
    const [isOpenMap, setIsOpenMap] = useState(false);
    const [hashtag, setHashtag] = useState("");
    const [profileImage, setProfileImage] = useState(null);
    const [backgroundImage, setBackgroundImage] = useState(null);
    const [profileImagePreview, setProfileImagePreview] = useState(null);
    const [backgroundImagePreview, setBackgroundImagePreview] = useState(null);
    const [position, setPosition] = useState(null);
    const [markers, setMarkers] = useState([]);
    const basicHashtags = [
        "여행",
        "행정",
        "부동산",
        "은행",
        "휴대폰",
        "언어교환",
        "대학 생활",
        "맛집",
        "게임",
        "쇼핑"
    ];
    const navigate = useNavigate();

    const handleChangeRegion = (e) => {
        setUser((prev) => ({
            ...prev,
            region: e.target.value
        }));
    };
    const handleChangeTime = (value) => {
        setTime(value);
        setUser((prev) => ({
            ...prev,
            time: `${time[0]} ${time[1]} - ${time[2]} ${time[3]}`
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
    const handleClickTag = () => {
        appendHashtag(hashtag);
    }
    const appendHashtag = (hashtag) => {
        if (hashtag.length === 0) {
            return;
        }
        if (user.hashtags.includes(hashtag))
            alert(t('editPage.duplicate_hash'));
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
        navigate(`/user/${user.userId}`);
    };
    const handleClickEdit = () => {
        fetch(`/api/user/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify
            (user)
        })
            .then(() => {
                setIsOpenBasic(() => false);
                //     alert("Success");
            })
            .catch((err) => {
                console.log(err);
            });
    };


    const handleChangeProfileImage = (e) => {
        const file = e.target.files[0];
        if (!file) {
            return;
        }
        setProfileImage(file);
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onloadend = () => {
            setProfileImagePreview(() => fileReader.result);
        }
    }
    const handleChangeBackgroundImage = (e) => {
        const file = e.target.files[0];
        if (!file) {
            return;
        }
        setBackgroundImage(file);
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onloadend = () => {
            setBackgroundImagePreview(() => fileReader.result);
        }
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
            body: formData
        }).then(response => response.json())
            .then((data) => {
                setUser((prev) => ({...prev, imgBack: data.imgBack, imgProf: data.imgProf}));
                setIsOpenImage(() => false);
                alert('Upload Success!');
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const setting = (latLng) => {
        setPosition(() => ({
            latitude: latLng.lat,
            longitude: latLng.lng
        }));
    }

    const mapClose = () => {
        setIsOpenMap(() => false);
    }
    // const handleClickUpdate = () => {
    //     if (!position || markerName.trim() === "" || markerDescription.trim() === "") {
    //         alert("There is no marker, or some text is empty.");
    //         return;
    //     }
    //     alert("미구현");
    // };

    const handleSetIsOpenBasic = (value) => {
        setIsOpenBasic(value);
    }
    const handleSetIsOpenImage = (value) => {
        setIsOpenImage(value);
    }
    const handleSetIsOpenMap = (value) => {
        setIsOpenMap(value);
    }

    const BasicHashtag = (props) => {
        const handleClickBasicHashtag = () => {
            if (user.hashtags.includes(props.basicHashtag)) {
                deleteHashtag(props.basicHashtag);
            } else {
                appendHashtag(props.basicHashtag);
            }
        }
        return (
            <div className="hashtag-item basic-hashtag" onClick={handleClickBasicHashtag}>
                <span>#{props.basicHashtag}</span>
            </div>
        );
    }

    useEffect(() => {
        (async () => {
            const result = await fetch('api/user/me', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .catch((err) => {
                    console.log(err);
                    alert('error: fetch fail');
                })
                .then(response => response.json());
            setUserId(() => result.userId);
            await fetch(`/api/user/${result.userId}`, {
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
                    if (data.time) {
                        setTime(() => data.time.split('-'));
                    } else {
                        setTime(['12', 'am', '12', 'am']);
                    }
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

    // const handleClickMarkerUpdate = () => {
    //     setMarkerAction(() => 'update');
    // };

    return (
        user ? (
            <div className={'edit-container'}>
                <div className="Image-back-container">
                    <img className="Image-back" src={user.imgBack ? user.imgBack : '/basic_background.png'} alt="배경사진"/>
                </div>
                <div className={'button-section'}>
                    <button className="complete-button"
                            onClick={handleClickComplete}>{t("editPage.edit_complete")}</button>
                </div>
                <div>
                </div>
                <div className="user-content-container">
                    <div className="image-prof-container">
                        <img className="image-prof" src={user.imgProf ? user.imgProf : basicProfileImage} alt="프로필사진"/>
                    </div>
                    <div className="profile-container">
                        <h2>{user.userName}</h2>
                        <p>{user.univ}</p>
                    </div>
                    <h3>{t('editPage.profile_editing')}</h3>
                    <EditModal title={t('editPage.basic_information')} isOpen={isOpenBasic}
                               setIsOpen={handleSetIsOpenBasic}>
                        <h3>{t("editPage.region")}</h3>
                        <input
                            type="text"
                            value={user.region}
                            onChange={handleChangeRegion}
                        />
                        <h3>{t("editPage.time")}</h3>
                        <TimeSelector onChange={handleChangeTime}/>
                        <h3>{t("editPage.basic_hashtag")}</h3>
                        <div className="hashtag-section">
                            {basicHashtags.map((basicHashtag, i) => {
                                return (
                                    <BasicHashtag basicHashtag={basicHashtag} key={`basicHashtag-${i}`}/>
                                );
                            })}
                        </div>
                        <div className="hashtag-section">
                            {user.hashtags && user.hashtags.map((hashtag, i) => {
                                return (
                                    <div className="hashtag-item" key={`hashtag-${i}`}>
                                        <span>#{hashtag}</span>
                                        <button onClick={() => deleteHashtag(hashtag)}>X</button>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="hashtag-input">
                            <input
                                type="text"
                                value={hashtag}
                                placeholder="hashtag"
                                onKeyDown={(e) => handleKeyDownHashtag(e)}
                                onChange={handleChangeHashtag}
                                maxLength={25}
                            />
                            <button onClick={handleClickTag}>Tag!</button>
                        </div>
                        <h3>{t("editPage.self_pr")}</h3>
                        <textarea
                            className="selfPR"
                            value={user.description}
                            onChange={handleChangeDescription}
                            maxLength={1000}
                        />
                        <button className={'edit-button'} onClick={handleClickEdit}>{t("editPage.edit")}</button>
                    </EditModal>
                    <EditModal title={t("editPage.image_upload")} isOpen={isOpenImage} setIsOpen={handleSetIsOpenImage}>
                        <h3>{t("editPage.profile_image")}</h3>
                        <label htmlFor='profile'>
                            <div className="image-edit-prof-container">
                                <img className="image-prof"
                                     src={profileImagePreview || user.imgProf}
                                     alt="profile"/>
                            </div>
                        </label>
                        <input type='file' id='profile' accept="image/png, image/jpeg"
                               onChange={handleChangeProfileImage}/>
                        <h3>{t("editPage.background_image")}</h3>
                        <label htmlFor='background'>
                            <div className="image-edit-back-container">
                                <img className="image-prof"
                                     src={backgroundImagePreview || user.imgBack}
                                     alt="background"/>
                            </div>
                        </label>
                        <input type='file' id='background' accept="image/png, image/jpeg"
                               onChange={handleChangeBackgroundImage}/>
                        <button className={'edit-button'}
                                onClick={handleClickSubmit}>{t("editPage.image_upload")}</button>
                    </EditModal>
                    <EditModal title={t("editPage.map")} isOpen={isOpenMap} setIsOpen={handleSetIsOpenMap}>
                        <div>
                            <div className="edit-map-container">
                                <GoogleMap markers={markers} setting={setting}/>
                            </div>
                        </div>
                        <EditMarkerInput markers={markers} mapClose={mapClose} position={position}
                                         userId={userId}
                                         t={t("editPage.marker_add")}
                                         t1={t("editPage.marker_delete")}
                                         t2={t('editPage.marker_add_explain')}
                                         placeholder={t("editPage.marker_title_placeholder")}
                                         placeholder1={t("editPage.marker_description_placeholder")}
                                         t3={t("editPage.add")}
                                         t4={t('editPage.marker_delete_explain')}
                                         t5={t("editPage.delete")}/>
                    </EditModal>
                </div>
            </div>) : null
    );
}

export default EditPage;