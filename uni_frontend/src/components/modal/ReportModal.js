import Modal from "./Modal";
import './ReportModal.css';
import {useTranslation} from "react-i18next";
import {useState} from "react";
import {postReport} from "../../api/reportAxios";

const ReportModal = ({isOpen, handleClose, reportedId, reporterId}) => {
    const {t} = useTranslation();
    const [category, setCategory] = useState("");
    const [reason, setReason] = useState("");
    const [title, setTitle] = useState("")
    const [detail, setDetail] = useState("");

    const ReportRadio = ({children, value, name, defaultChecked}) => {
        return (
            <label>
                <input
                    type='radio'
                    name={name}
                    value={value}
                    onChange={handleChangeReason}
                    defaultChecked={defaultChecked}
                />
                {children}
            </label>
    )}

    const handleClickPost = async () => {
        if (category.length === 0 || reason.length === 0) {
            alert(t('reportModal.select_none'));
            return;
        }
        if (title.length < 5) {
            alert(t('reportModal.title_none'))
        }
        if (detail.length < 10) {
            alert(t('reportModal.detail_none'));
            return;
        }
        await postReport({
            reporterId: reporterId,
            title: title,
            reportedUserId: reportedId,
            reporterUserId: reporterId,
            category: category,
            detailedReason: detail,
            reason: reason
        });
        handleClose();
        // .catch((err) => {
        //     console.log(err);
        //     alert(t("userPage.chat_error"));
        // });
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
                    <ReportRadio name={'radio-target'} value={'PROFILE'}>
                        {t('reportModal.profile')}
                    </ReportRadio>
                    <ReportRadio name={'radio-target'} value={'CHAT'}>
                        {t('reportModal.chat')}
                    </ReportRadio>
                    <ReportRadio name={'radio-target'} value={'QNA'}>
                        Q&A
                    </ReportRadio>
                    <ReportRadio name={'radio-target'} value={'REVIEW'}>
                        {t('reportModal.review')}
                    </ReportRadio>
                </div>
                <hr width="1" size={'100'} color={'#D0D0D0'}/>
                <div className='report-radio after'>
                    <ReportRadio name={'radio-reason'} value={'ABUSIVE_LANGUAGE'}>
                        {t('reportModal.abusive_language')}
                    </ReportRadio>
                    <ReportRadio name={'radio-reason'} value={'INAPPROPRIATE_CONTENT'}>
                        {t('reportModal.inappropriate_content')}
                    </ReportRadio>
                    <ReportRadio name={'radio-reason'} value={'ILLEGAL_ACTIVITY'}>
                        {t('reportModal.illegal_activity')}
                    </ReportRadio>
                    <ReportRadio name={'radio-reason'} value={'SPAM'}>
                        {t('reportModal.spam')}
                    </ReportRadio>
                    <ReportRadio name={'radio-reason'} value={'OTHER'}>
                        {t('reportModal.other')}
                    </ReportRadio>
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