import React from "react";
import styled from "styled-components";

const Button = () => {
    return (
        <StyledWrapper>
            <div className="icon-container">
                <svg
                    width="19px"
                    height="21px"
                    viewBox="0 0 19 21"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                >
                    {/* <title>Export PDF</title> */}
                    <g id="Page-1" stroke="none" strokeWidth={1} fill="none" fillRule="evenodd">
                        <g id="Artboard" transform="translate(-142.000000, -122.000000)">
                            <g id="Group" transform="translate(142.000000, 122.000000)">
                                <path
                                    d="M3.4,4 L11.5,4 L11.5,4 L16,8.25 L16,17.6 C16,19.4777681 14.4777681,21 12.6,21 L3.4,21 C1.52223185,21 6.74049485e-16,19.4777681 0,17.6 L0,7.4 C2.14128934e-16,5.52223185 1.52223185,4 3.4,4 Z"
                                    id="Rectangle-Copy"
                                    fill="#ffc4c4ff"
                                />
                                <path
                                    d="M6.4,0 L12,0 L12,0 L19,6.5 L19,14.6 C19,16.4777681 17.4777681,18 15.6,18 L6.4,18 C4.52223185,18 3,16.4777681 3,14.6 L3,3.4 C3,1.52223185 4.52223185,7.89029623e-16 6.4,0 Z"
                                    id="Rectangle"
                                    fill="#eb8587ff"
                                />
                                <path
                                    d="M12,0 L12,5.5 C12,6.05228475 12.4477153,6.5 13,6.5 L19,6.5 L19,6.5 L12,0 Z"
                                    id="Path-2"
                                    fill="#b16464ff"
                                />
                            </g>
                        </g>
                    </g>
                </svg>
                <svg
                    width="19px"
                    height="21px"
                    viewBox="0 0 19 21"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                >
                    {/* <title>Export PDF</title> */}
                    <g id="Page-1" stroke="none" strokeWidth={1} fill="none" fillRule="evenodd">
                        <g id="Artboard" transform="translate(-142.000000, -122.000000)">
                            <g id="Group" transform="translate(142.000000, 122.000000)">
                                <path
                                    d="M3.4,4 L11.5,4 L11.5,4 L16,8.25 L16,17.6 C16,19.4777681 14.4777681,21 12.6,21 L3.4,21 C1.52223185,21 6.74049485e-16,19.4777681 0,17.6 L0,7.4 C2.14128934e-16,5.52223185 1.52223185,4 3.4,4 Z"
                                    id="Rectangle-Copy"
                                    fill="#ffc4c4ff"
                                />
                                <path
                                    d="M6.4,0 L12,0 L12,0 L19,6.5 L19,14.6 C19,16.4777681 17.4777681,18 15.6,18 L6.4,18 C4.52223185,18 3,16.4777681 3,14.6 L3,3.4 C3,1.52223185 4.52223185,7.89029623e-16 6.4,0 Z"
                                    id="Rectangle"
                                    fill="#eb8585ff"
                                />
                                <path
                                    d="M12,0 L12,5.5 C12,6.05228475 12.4477153,6.5 13,6.5 L19,6.5 L19,6.5 L12,0 Z"
                                    id="Path-2"
                                    fill="#b16464ff"
                                />
                            </g>
                        </g>
                    </g>
                </svg>
            </div>
            
        </StyledWrapper>
    );
};

const StyledWrapper = styled.div`
  .icon-container {
    width: 7vw;
    height: 3vw;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #fff;
    border-radius: 8px;
    box-shadow: 5px 5px 15px 0 #ababab4d;
    cursor: pointer;
  }

  .icon-container svg {
    width: 2vw;
    height: auto;
  }

  .icon-container svg:last-child {
    position: absolute;
  }

  .icon-container:active {
    animation: press 0.2s 1 linear;
  }

  .icon-container:active svg:last-child {
    animation: bounce 0.2s 1 linear;
  }

  .text {
    color: #666;
    font-family: sans-serif;
    font-size: 16px;
    font-weight: bold;
    margin-top: 20px;
    user-select: none;
  }

  @keyframes press {
    0% {
      transform: scale(1);
    }

    50% {
      transform: scale(0.92);
    }

    to {
      transform: scale(1);
    }
  }

  @keyframes bounce {
    50% {
      transform: rotate(5deg) translate(20px, -50px);
    }

    to {
      transform: scale(0.9) rotate(10deg) translate(50px, -80px);
      opacity: 0;
    }
  }
`;

export default Button;
