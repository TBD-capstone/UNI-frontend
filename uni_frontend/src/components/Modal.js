import './Modal.css';

const Modal = ({className, children, isOpen, handleClose, title}) => {
    const classes = 'modal ' + className;

    return (
        isOpen &&
        <div className={'modal-background'}>
            <div className={classes}>
                <div className={'modal-top'}>
                    <span>{title}</span>
                    <button onClick={handleClose}>X</button>
                </div>
                {children}
            </div>
        </div>

    )
};

export default Modal;