import React from "react";
import PropTypes from "prop-types";
import Tooltip from "./Tooltip";
import { FaRegQuestionCircle } from "react-icons/fa";

const TooltipCircle = ({ message, position = "bottom" }) => {
  return (
    <div>
      <Tooltip message={message} position={position}>
        <FaRegQuestionCircle
          style={{ fontSize: "20px", color: "#E9AE58", cursor: "pointer" }}
        />
      </Tooltip>
    </div>
  );
};

TooltipCircle.propTypes = {
  message: PropTypes.string.isRequired,
  position: PropTypes.oneOf(["top", "bottom", "left", "right"]),
};

export default TooltipCircle;