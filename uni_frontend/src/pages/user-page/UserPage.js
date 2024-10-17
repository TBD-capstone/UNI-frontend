import dummy_l from '../Dummy';
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
                <span>{props.text}</span>
            </div>
        );
    }
    const Inform = () => {
        const InformBox = (props) => {
            return (
                <div className="Inform-block">
                    <span>{props.inform_type}: {props.inform_data}{props.inform_unit}</span>
                </div>
            );
        }

        return (
            <div className="Inform">
                <InformBox inform_type="고용" inform_data={user.num_employment} inform_unit="회"/>
                <InformBox inform_type="평점" inform_data={user.star} inform_unit="점"/>
                <InformBox inform_type="가능 시간" inform_data={user.time} inform_unit="회"/>
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
                (props.owner?
                <button className="Edit" onClick={handleClickEdit}>Edit</button>:
                        <button className="Report" onClick={handleClickReport}>Report</button>
                )
        )
    }
    useEffect(() => {
        (async () => {
            setUser(dummy_l[Number(pathname.split('/').at(2))]);
        })();
    }, [user, pathname]);

    return (
        user?(
        <div>
            <div className="Image-back-container">
                <img className="Image-back" src={user.img_back} alt="배경사진"/>
            </div>
            <div className="Image-prof-container">
                <img className="Image-prof" src={user.img_prof} alt="프로필사진"/>
            </div>
            <div>
                <MoveButton owner={main_id===user.user_id}/>
            </div>
            <div className="Prof-content">
                <Context text={user.region}></Context>
                <Context text={user.explain}></Context>
                <Inform></Inform>
            </div>
        </div>):null
    );
}

export default UserPage;