import Modal from "./Modal";
import './ReportModal.css';
import {useTranslation} from "react-i18next";
import {useState} from "react";

const ReportModal = ({isOpen, handleClose, reportedId, reporterId}) => {
    const {t} = useTranslation();
    const [category, setCategory] = useState("");
    const [reason, setReason] = useState("");
    const [title, setTitle] = useState("")
    const [detail, setDetail] = useState("");
    const handleClickPost = () => {
        if(category.length === 0 || reason.length === 0) {
            alert("선택해주세요");
            return;
        }
        if(title.length < 5) {
            alert("신고 제목은 최소 5자 이상이어야 합니다.")
        }
        if(detail.length < 10) {
            alert("신고 사유는 최소 10자 이상이어야 합니다.");
            return;
        }
        fetch(`/api/user/${reportedId}/report`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "title": title,
                "reportedUserId": reportedId,
                "reporterUserId": reporterId,
                "category": category,
                "detailedReason": detail,
                "reason": reason
            })
        })
            .then(() => handleClose())
            .catch((err) => {
                console.log(err);
                alert(t("userPage.chat_error"));
            });
    }
    const handleChangeTitle = (e) => {
        setTitle(() => e.target.value);
    }
    const handleChangeReason = (e) => {
        setCategory(() => e.target.value);
    }
    const handleChangeCategory = (e) => {
        setReason(() => e.target.value)
    }
    const handleChangeReportReason = (e) => {
        setDetail(() => e.target.value);
    };
    return (
        <Modal className={'report-modal'} isOpen={isOpen} handleClose={handleClose} title={t('reportModal.report')}>
            <h4>{t('reportModal.report_reason')}</h4>
            <div className={'report-purpose'}>
                <div className='report-radio 1'>
                    <div>
                        <input type='radio' name={'radio-1'} id={'radio-1-1'} value={'PROFILE'} onChange={handleChangeReason}/>
                        <label id={'radio-1-1'}>{t('reportModal.profile')}</label>
                    </div>
                    <div>
                        <input type='radio' name={'radio-1'} id={'radio-1-2'} value={'CHAT'} onChange={handleChangeReason} />
                        <label id={'radio-1-2'}>{t('reportModal.chat')}</label>
                    </div>
                    <div>
                        <input type='radio' name={'radio-1'} id={'radio-1-3'} value={'QNA'} onChange={handleChangeReason}/>
                        <label id={'radio-1-3'}>Q&A</label>
                    </div>
                    <div>
                        <input type='radio' name={'radio-1'} id={'radio-1-4'} value={'REVIEW'} onChange={handleChangeReason}/>
                        <label id={'radio-1-4'}>{t('reportModal.review')}</label>
                    </div>
                </div>
                <hr width="1" size={'100'} color={'#D0D0D0'}/>
                <div className='report-radio after'>
                    <div>
                        <input type='radio' name={'radio-2'} id={'radio-2-1'} value={'ABUSIVE_LANGUAGE'} onChange={handleChangeCategory}/>
                        <label id={'radio-2-1'}>{t('reportModal.abusive_language')}</label>
                    </div>
                    <div>
                        <input type='radio' name={'radio-2'} id={'radio-2-2'} value={'INAPPROPRIATE_CONTENT'} onChange={handleChangeCategory}/>
                        <label id={'radio-2-2'}>{t('reportModal.inappropriate_content')}</label>
                    </div>
                    <div>
                        <input type='radio' name={'radio-2'} id={'radio-2-3'} value={'ILLEGAL_ACTIVITY'} onChange={handleChangeCategory}/>
                        <label id={'radio-2-3'}>{t('reportModal.illegal_activity')}</label>
                    </div>
                    <div>
                        <input type='radio' name={'radio-2'} id={'radio-2-4'} value={'SPAM'} onChange={handleChangeCategory}/>
                        <label id={'radio-2-4'}>{t('reportModal.spam')}</label>
                    </div>
                </div>
            </div>
            <h4>{t('reportModal.detail')}</h4>
            <input
                type={'text'}
                value={title}
                onChange={handleChangeTitle}
                placeholder={t('reportModal.title_placeholder')}
                maxLength={25}
            />
            <textarea
                value={detail}
                onChange={handleChangeReportReason}
                placeholder={t('reportModal.detail_placeholder')}
            />
            <button className={'report-modal-button'} onClick={handleClickPost}>{t('reportModal.report')}</button>
        </Modal>
    )
}

export default ReportModal;