import { RxCross1 } from "react-icons/rx";
import './Modal.css';

const Modal = ({className, children, isOpen, handleClose, title}) => {
    const classes = 'modal ' + className;

    return (
        isOpen &&
        <div className={'modal-background'}>
            <div className={classes}>
                <div className={'modal-top'}>
                    <span>{title}</span>
                    <RxCross1 className={'modal-close'} onClick={handleClose}/>
                </div>
                {children}
            </div>
        </div>

    )
};

export default Modal;