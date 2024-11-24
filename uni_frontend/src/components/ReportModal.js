import Modal from "./Modal";
import './ReportModal.css';

const ReportModal = (props) => {
    return (
        <Modal className={'report-modal'} isOpen={props.isOpen} handleClose={props.handleClose} title={'신고'}>
            <h4>부정 행위</h4>
            <div className={'report-purpose'}>
                <div className='report-radio 1'>
                    <div>
                        <input type='radio' name={'radio-1'} id={'radio-1-1'}/>
                        <label id={'radio-1-1'}>사유 1</label>
                    </div>
                    <div>
                        <input type='radio' name={'radio-1'} id={'radio-1-2'}/>
                        <label id={'radio-1-2'}>사유 2</label>
                    </div>
                    <div>
                        <input type='radio' name={'radio-1'} id={'radio-1-3'}/>
                        <label id={'radio-1-3'}>사유 3</label>
                    </div>
                    <div>
                        <input type='radio' name={'radio-1'} id={'radio-1-4'}/>
                        <label id={'radio-1-4'}>사유 4</label>
                    </div>
                </div>
                <div className='report-radio after'>
                    <div>
                        <input type='radio' name={'radio-2'} id={'radio-2-1'}/>
                        <label id={'radio-2-1'}>사유 1</label>
                    </div>
                    <div>
                        <input type='radio' name={'radio-2'} id={'radio-2-2'}/>
                        <label id={'radio-2-2'}>사유 2</label>
                    </div>
                    <div>
                        <input type='radio' name={'radio-2'} id={'radio-2-3'}/>
                        <label id={'radio-2-3'}>사유 3</label>
                    </div>
                    <div>
                        <input type='radio' name={'radio-2'} id={'radio-2-4'}/>
                        <label id={'radio-2-4'}>사유 4</label>
                    </div>
                </div>
            </div>
            <h4>상세 내용</h4>
            <textarea />
            <button>신고</button>
        </Modal>
    )
}

export default ReportModal;