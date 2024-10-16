import dummy_back from '../../logo.svg';
import "./UserPage.css"  /*임의로 css 설정, 디자인 확정 후 추후 분리 및 적용*/

const dummy = {
    img_prof: dummy_back,
    img_back: dummy_back,
    region: "서울",
    explain: "소웨, 4학년",
    num_employment: 3,
    star: 4.3,
    time: "07:00 ~ 20:00"
}

function UserPage() {

    function Context(props) {
        return (
            <div className="Context">
                <span>{props.text}</span>
            </div>
        );
    }
    function Inform() {
        function InformBox (props) {
            return (
                <div className="Inform-block">
                    <span>{props.inform_type}: {props.inform_data}{props.inform_unit}</span>
                </div>
            );
        }
        return (
            <div className="Inform">
                <InformBox inform_type="고용" inform_data={dummy.num_employment} inform_unit="회"/>
                <InformBox inform_type="평점" inform_data={dummy.star} inform_unit="점"/>
                <InformBox inform_type="가능 시간" inform_data={dummy.time} inform_unit="회"/>
            </div>
        );
    }

    function handleClickReport() {
        alert("신고");
    }
    function handleClickEdit() {
        alert("편집");
    }

    return (
        <div>
            <div className="Image-back-container">
                <img className="Image-back" src={dummy.img_back} alt="배경사진"/>
            </div>
            <div className="Image-prof-container">
                <img className="Image-prof" src={dummy.img_prof} alt="프로필사진"/>
            </div>
            <div>
                <button className="Edit" onClick={handleClickReport}>Report</button>
                <button className="Edit" onClick={handleClickEdit}>Edit</button>
            </div>
            <div className="Prof-content">
                <Context text={dummy.region}></Context>
                <Context text={dummy.explain}></Context>
                <Inform></Inform>
            </div>
        </div>
    );
}

export default UserPage;