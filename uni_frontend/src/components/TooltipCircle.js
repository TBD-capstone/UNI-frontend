import React from 'react';
import Tooltip from './Tooltip';
import { FaRegQuestionCircle } from 'react-icons/fa';

const TooltipCircle = ({message}) => {
  return (
    <div>
      <Tooltip message={message}>
        <FaRegQuestionCircle style={{ fontSize: '20px', color: '#E9AE58', cursor: 'pointer' }} />
      </Tooltip>
    </div>
  );
};

export default TooltipCircle;
