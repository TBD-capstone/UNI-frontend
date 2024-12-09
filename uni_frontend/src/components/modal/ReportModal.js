import Modal from "./Modal";
import './ReportModal.css';
import {useTranslation} from "react-i18next";
import {useState} from "react";
import {postReport} from "../../api/reportAxios";

const ReportModal = ({isOpen, handleClose, reportedId, reporterId}) => {
    const {t} = useTranslation();

    const ReportRadio = ({children, value, name, defaultChecked}) => {
        return (
            <label>
                <input
                    type='radio'
                    name={name}
                    value={value}
                    defaultChecked={defaultChecked}
                />
                {children}
            </label>
        )
    }

    const RadioGroup = ({label, children}) => (
        <fieldset className="radio-container">
            <legend>{label}</legend>
            {children}
        </fieldset>
    );

    const handleClickPost = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        console.log(data);
        if (!data.category || !data.reason) {
            alert(t('reportModal.select_none'));
            return;
        }
        if (!data.title || data.title.length < 5) {
            alert(t('reportModal.title_none'))
            return;
        }
        if (!data.detail || data.detail.length < 10) {
            alert(t('reportModal.detail_none'));
            return;
        }
        await postReport({
            reporterId: reporterId,
            reportedId: reportedId,
            title: data.title,
            category: data.category,
            detail: data.detail,
            reason: data.reason
        });
        handleClose();
        // .catch((err) => {
        //     console.log(err);
        //     alert(t("userPage.chat_error"));
        // });

    };
    return (
        <Modal className={'report-modal'} isOpen={isOpen} handleClose={handleClose} title={t('reportModal.report')}>
            <form
                className={'report-purpose'}
                onSubmit={handleClickPost}
            >
                <h4>{t('reportModal.report_reason')}</h4>
                <RadioGroup label={t('reportModal.category')}>
                    <ReportRadio name={'category'} value={'PROFILE'}>
                        {t('reportModal.profile')}
                    </ReportRadio>
                    <ReportRadio name={'category'} value={'CHAT'}>
                        {t('reportModal.chat')}
                    </ReportRadio>
                    <ReportRadio name={'category'} value={'QNA'}>
                        Q&A
                    </ReportRadio>
                    <ReportRadio name={'category'} value={'REVIEW'}>
                        {t('reportModal.review')}
                    </ReportRadio>
                </RadioGroup>
                <RadioGroup label={t('reportModal.reason')}>
                    <ReportRadio name={'reason'} value={'ABUSIVE_LANGUAGE'}>
                        {t('reportModal.abusive_language')}
                    </ReportRadio>
                    <ReportRadio name={'reason'} value={'INAPPROPRIATE_CONTENT'}>
                        {t('reportModal.inappropriate_content')}
                    </ReportRadio>
                    <ReportRadio name={'reason'} value={'ILLEGAL_ACTIVITY'}>
                        {t('reportModal.illegal_activity')}
                    </ReportRadio>
                    <ReportRadio name={'reason'} value={'SPAM'}>
                        {t('reportModal.spam')}
                    </ReportRadio>
                    <ReportRadio name={'reason'} value={'OTHER'}>
                        {t('reportModal.other')}
                    </ReportRadio>
                </RadioGroup>
                <h4>{t('reportModal.detail')}</h4>
                <input
                    name={'title'}
                    type={'text'}
                    placeholder={t('reportModal.title_placeholder')}
                    maxLength={25}
                />
                <textarea
                    name={'detail'}
                    placeholder={t('reportModal.detail_placeholder')}
                    maxLength={100}
                />
                <button type={'submit'} className={'report-modal-button'}>{t('reportModal.report')}</button>
            </form>
        </Modal>
    )
}

export default ReportModal;