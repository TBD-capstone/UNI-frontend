import React, {useState} from 'react';
import { IoIosArrowForward } from "react-icons/io";
import Modal from './Modal';
import './EditModal.css'

const EditModal = ({title, children}) => {
    const [isOpen, setIsOpen] = useState(false);
    const handleClickEditBox = () => {
        setIsOpen(() => true);
    };
    return (
        <>
            <Modal className={'edit-modal'} title={title} isOpen={isOpen} handleClose={() => setIsOpen(false)}>
                {children}
            </Modal>
            <div className={'edit-box'} onClick={handleClickEditBox}>
                <span>{title}</span>
                <IoIosArrowForward className={'edit-arrow'} />
            </div>
        </>
    );
};

export default EditModal;