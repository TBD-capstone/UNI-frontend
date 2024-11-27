import Modal from "./Modal";
import './ReportModal.css';
import {useTranslation} from "react-i18next";

const ReportModal = ({isOpen, handleClose}) => {
    const {t} = useTranslation();
    const handleClickPost = () => {
        handleClose();
    }
    return (
        <Modal className={'report-modal'} isOpen={isOpen} handleClose={handleClose} title={t('reportModal.report')}>
            <h4>{t('reportModal.report_reason')}</h4>
            <div className={'report-purpose'}>
                <div className='report-radio 1'>
                    <div>
                        <input type='radio' name={'radio-1'} id={'radio-1-1'}/>
                        <label id={'radio-1-1'}>{t('reportModal.profile')}</label>
                    </div>
                    <div>
                        <input type='radio' name={'radio-1'} id={'radio-1-2'}/>
                        <label id={'radio-1-2'}>{t('reportModal.chat')}</label>
                    </div>
                    <div>
                        <input type='radio' name={'radio-1'} id={'radio-1-3'}/>
                        <label id={'radio-1-3'}>Q&A</label>
                    </div>
                    <div>
                        <input type='radio' name={'radio-1'} id={'radio-1-4'}/>
                        <label id={'radio-1-4'}>{t('reportModal.review')}</label>
                    </div>
                </div>
                <hr width="1" size={'100'} color={'#D0D0D0'}/>
                <div className='report-radio after'>
                    <div>
                        <input type='radio' name={'radio-2'} id={'radio-2-1'}/>
                        <label id={'radio-2-1'}>{t('reportModal.abusive_language')}</label>
                    </div>
                    <div>
                        <input type='radio' name={'radio-2'} id={'radio-2-2'}/>
                        <label id={'radio-2-2'}>{t('reportModal.inappropriate_content')}</label>
                    </div>
                    <div>
                        <input type='radio' name={'radio-2'} id={'radio-2-3'}/>
                        <label id={'radio-2-3'}>{t('reportModal.illegal_activity')}</label>
                    </div>
                    <div>
                        <input type='radio' name={'radio-2'} id={'radio-2-4'}/>
                        <label id={'radio-2-4'}>{t('reportModal.spam')}</label>
                    </div>
                </div>
            </div>
            <h4>{t('reportModal.detail')}</h4>
            <input type={'text'} placeholder={t('reportModal.title_placeholder')} maxLength={25}/>
            <textarea placeholder={t('reportModal.detail_placeholder')}/>
            <button className={'report-modal-button'} onClick={handleClickPost}>{t('reportModal.report')}</button>
        </Modal>
    )
}

export default ReportModal;