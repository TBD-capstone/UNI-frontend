import React from "react";
import styled from "styled-components";

const Container = styled.div`
  position: relative;
  width: fit-content;
  height: fit-content;
  display: inline-block;

  &:hover > .tooltip,
  &:active > .tooltip {
    display: block;
  }

  .tooltip {
    white-space: pre-line;
    display: none;
    position: absolute;
    background-color: #ffffff;
    border: #7bb05b solid 1px;
    border-radius: 5px;
    color: #000;
    font-size: 12px;
    font-weight: 500;
    height: auto;
    letter-spacing: -0.25px;
    padding: 5px 11px;
    width: max-content;
    z-index: 100;

    /* Positioning based on prop */
    ${({ position }) => {
      switch (position) {
        case "top":
          return `
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            margin-bottom: 8px;
          `;
        case "right":
          return `
            left: 100%;
            top: 50%;
            transform: translateY(-55%);
            margin-left: 8px;
          `;
        case "left":
          return `
            right: 100%;
            top: 50%;
            transform: translateY(-50%);
            margin-right: 8px;
          `;
        case "bottom":
        default:
          return `
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            margin-top: 5px;
          `;
      }
    }}
  }

  .tooltip::after,
  .tooltip::before {
    content: "";
    position: absolute;
    border-style: solid;
    display: block;
    left: 50%;
    transform: translateX(-50%);
  }

  /* Arrow styles, adjusted based on position */
  ${({ position }) => {
    switch (position) {
      case "top":
        return `
          .tooltip::after {
            border-width: 8px 6px 0 6px;
            border-color: #eef3fd transparent transparent transparent;
            bottom: -7px;
          }
          .tooltip::before {
            border-width: 8px 6px 0 6px;
            border-color: #7BB05B transparent transparent transparent;
            bottom: -8px;
          }
        `;
      case "right":
        return `
          .tooltip::after {
            border-width: 6px 8px 6px 0;
            border-color: transparent #eef3fd transparent transparent;
            left: -4px;
            top: 50%;
            transform: translate(-50%, -50%);
          }
          .tooltip::before {
            border-width: 6px 8px 6px 0;
            border-color: transparent #7BB05B transparent transparent;
            left: -5px;
            top: 50%;
            transform: translate(-50%, -50%);
          }
        `;
      case "left":
        return `
          .tooltip::after,
          .tooltip::before {
            left: 102%;
          }
          .tooltip::after {
            border-width: 6px 0 6px 8px;
            border-color: transparent transparent transparent #eef3fd;
            right: -15px;
            top: 50%;
            transform: translate(-50%, -50%);
          }
          .tooltip::before {
            border-width: 6px 0 6px 8px;
            border-color: transparent transparent transparent #7BB05B;
            right: -9px;
            top: 50%;
            transform: translate(-50%, -50%);
          }
        `;
      case "bottom":
      default:
        return `
          .tooltip::after {
            border-width: 0 6px 8px 6px;
            border-color: transparent transparent #eef3fd transparent;
            top: -7px;
          }
          .tooltip::before {
            border-width: 0 6px 8px 6px;
            border-color: transparent transparent #7BB05B transparent;
            top: -8px;
          }
        `;
    }
  }}
`;

const Tooltip = ({ children, message, position = "bottom" }) => {
  return (
    <Container position={position}>
      {children}
      <div className='tooltip'>{message}</div>
    </Container>
  );
};

export default Tooltip;