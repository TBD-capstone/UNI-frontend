import Modal from "./Modal";
import './ReportModal.css';

const ReportModal = (props) => {
    return (
        <Modal className={'report-modal'} isOpen={props.isOpen} handleClose={props.handleClose} title={'신고'}>
            <h4>신고 사유</h4>
            <div className={'report-purpose'}>
                <div className='report-radio 1'>
                    <div>
                        <input type='radio' name={'radio-1'} id={'radio-1-1'}/>
                        <label id={'radio-1-1'}>프로필</label>
                    </div>
                    <div>
                        <input type='radio' name={'radio-1'} id={'radio-1-2'}/>
                        <label id={'radio-1-2'}>채팅</label>
                    </div>
                    <div>
                        <input type='radio' name={'radio-1'} id={'radio-1-3'}/>
                        <label id={'radio-1-3'}>Q&A</label>
                    </div>
                    <div>
                        <input type='radio' name={'radio-1'} id={'radio-1-4'}/>
                        <label id={'radio-1-4'}>후기</label>
                    </div>
                </div>
                <hr width="1" size={'100'} color={'#D0D0D0'}/>
                <div className='report-radio after'>
                    <div>
                        <input type='radio' name={'radio-2'} id={'radio-2-1'}/>
                        <label id={'radio-2-1'}>욕설/혐오/차별</label>
                    </div>
                    <div>
                        <input type='radio' name={'radio-2'} id={'radio-2-2'}/>
                        <label id={'radio-2-2'}>음란물</label>
                    </div>
                    <div>
                        <input type='radio' name={'radio-2'} id={'radio-2-3'}/>
                        <label id={'radio-2-3'}>도배</label>
                    </div>
                    <div>
                        <input type='radio' name={'radio-2'} id={'radio-2-4'}/>
                        <label id={'radio-2-4'}>스팸/홍보</label>
                    </div>
                </div>
            </div>
            <h4>상세 내용</h4>
            <input type={'text'} placeholder={'신고 제목을 작성해주세요'} maxLength={25}/>
            <textarea placeholder={'신고 내용을 작성해주세요'}/>
            <button className={'report-modal-button'} >신고</button>
        </Modal>
    )
}

export default ReportModal;