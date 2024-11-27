import "./EditPage.css";
import "../user-page/UserPage.css";
import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import GoogleMap from "../../components/GoogleMap";
import {useTranslation} from "react-i18next";
import EditModal from "../../components/modal/EditModal.js";
import Cookies from "js-cookie";

const EditPage = () => {
    const basicProfileImage = '/profile-image.png'
    const {t} = useTranslation();
    const {userId} = useParams();
    const [user, setUser] = useState(null);
    const [isOpenBasic, setIsOpenBasic] = useState(false);
    const [isOpenImage, setIsOpenImage] = useState(false);
    const [isOpenMap, setIsOpenMap] = useState(false);
    const [hashtag, setHashtag] = useState("");
    const [profileImage, setProfileImage] = useState(null);
    const [backgroundImage, setBackgroundImage] = useState(null);
    const [profileImagePreview, setProfileImagePreview] = useState(null);
    const [backgroundImagePreview, setBackgroundImagePreview] = useState(null);
    const [position, setPosition] = useState(null);
    const [markerName, setMarkerName] = useState("");
    const [markerDescription, setMarkerDescription] = useState("");
    const [markerAction, setMarkerAction] = useState('add');
    const [markers, setMarkers] = useState([]);
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
                alert('error: fetch fail');
            });
    };


    const handleChangeProfileImage = (e) => {
        setProfileImage(e.target.files[0]);
        const fileReader = new FileReader();
        fileReader.readAsDataURL(e.target.files[0]);
        fileReader.onloadend = () => {
            setProfileImagePreview(() => fileReader.result);
        }
    }
    const handleChangeBackgroundImage = (e) => {
        setBackgroundImage(e.target.files[0]);
        const fileReader = new FileReader();
        fileReader.readAsDataURL(e.target.files[0]);
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
                Cookies.set('imgProf', data.imgProf, { expires: 1, path: '/' });
                setIsOpenImage(() => false);
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

    const mapClose = () => {
        setIsOpenMap(() => false);
    }
    const handleClickAdd = () => {
        if (!position || markerName.trim() === "" || markerDescription.trim() === "") {
            alert(t('editPage.no_marker_data'));
            return;
        }
        if (markers.some((e) => e.name === markerName)) {
            alert(t('editPage.duplicated_title'));
            return;
        }
        fetch(`/api/markers/add/${userId}`, {
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
                mapClose();
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
        const i = markers.findIndex((e) => e.name === markerName);
        if (i < 0) {
            alert(t('editPage.no_target_marker'));
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
                mapClose();
                // alert("Marker delete Success!");
            })
            .catch((err) => {
                console.log(err);
                alert('error: fetch fail');
            });
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
            <div className="Hashtag Basic" onClick={handleClickBasicHashtag}>
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
        setMarkerAction(() => 'add');
    };
    const handleClickMarkerDelete = () => {
        setMarkerAction(() => 'delete');
    };
    const handleClickMarkerUpdate = () => {
        setMarkerAction(() => 'update');
    };

    return (
        user ? (
            <div className={'edit-container'}>
                <div className="Image-back-container">
                    <img className="Image-back" src={user.imgBack ? user.imgBack : '/basic_background.png'} alt="배경사진"/>
                </div>
                <div className={'button-section'}>
                    <button className="Complete" onClick={handleClickComplete}>{t("editPage.edit_complete")}</button>
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
                        <input
                            type="text"
                            value={user.time}
                            onChange={handleChangeTime}
                        />
                        <h3>{t("editPage.basic_hashtag")}</h3>
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
                        <h3>{t("editPage.self_pr")}</h3>
                        <textarea
                            className="selfPR"
                            value={user.description}
                            onChange={handleChangeDescription}
                            maxLength={100}
                        />
                        <button className={'edit-button'} onClick={handleClickEdit}>{t("editPage.edit")}</button>
                    </EditModal>
                    <EditModal title={t("editPage.image_upload")} isOpen={isOpenImage} setIsOpen={handleSetIsOpenImage}>
                        <h3>{t("editPage.profile_image")}</h3>
                        <label htmlFor='profile'>
                            <div className="image-edit-prof-container">
                                <img className="image-prof"
                                     src={profileImagePreview || user.imgProf || basicProfileImage}
                                     alt="profile"/>
                            </div>
                        </label>
                        <input type='file' id='profile' accept="image/png, image/jpeg"
                               onChange={handleChangeProfileImage}/>
                        <h3>{t("editPage.background_image")}</h3>
                        <label htmlFor='background'>
                            <div className="image-edit-back-container">
                                <img className="image-prof"
                                     src={backgroundImagePreview || user.imgBack || '/basic_background.png'}
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
                        <div className={'edit-select'}>
                            <button className={'edit-select'}
                                    onClick={handleClickMarkerAdd}>{t("editPage.marker_add")}</button>
                            <button className={'edit-select'}
                                    onClick={handleClickMarkerDelete}>{t("editPage.marker_delete")}</button>
                        </div>
                        {/*<button className={'edit-select'} onClick={handleClickMarkerUpdate}>Marker Update</button>*/}
                        {markerAction === 'add' &&
                            <>
                                <p>{t('editPage.marker_add_explain')}</p>
                                <input
                                    type="text"
                                    placeholder={t("editPage.marker_title_placeholder")}
                                    value={markerName}
                                    onChange={handleChangeMarkerName}
                                />
                                <input
                                    type="text"
                                    placeholder={t("editPage.marker_description_placeholder")}
                                    value={markerDescription}
                                    onChange={handleChangeMarkerDescription}
                                />
                                <button className={'edit-button'} onClick={handleClickAdd}>{t("editPage.add")}</button>
                            </>
                        }
                        {markerAction === 'delete' &&
                            <>
                                <p>{t('editPage.marker_delete_explain')}</p>
                                <input
                                    type="text"
                                    placeholder={t("editPage.marker_title_placeholder")}
                                    value={markerName}
                                    onChange={handleChangeMarkerName}
                                />
                                <button className={'edit-button'}
                                        onClick={handleClickDelete}>{t("editPage.delete")}</button>
                            </>
                        }
                        {/*{markerUpdate && <button onClick={handleClickUpdate}>Update</button>}*/}
                    </EditModal>
                </div>
            </div>) : null
    );
}

export default EditPage;