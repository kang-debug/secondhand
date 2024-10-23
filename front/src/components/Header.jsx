import '../css/Header.css';
import Mark from '../assets/secondhand.svg';
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/user/userSlice";
import LoginModal from "../Modal/LoginModal.jsx";

export default () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isLoggedIn = useSelector((state) => state.user.isLoggedIn);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSignUpMode, setIsSignUpMode] = useState(false);

    const goToHome = () => {
        navigate("/");
    };

    const goToProductUpload = () => {
        if (isLoggedIn) {
            navigate("/product-upload");
        } else {
            alert("로그인을 해주세요");
            handleSignClick();
        }
    };

    const goToMyShop = () => {
        if (isLoggedIn) {
            navigate("/my-shop");
        } else {
            alert("로그인을 해주세요");
            handleSignClick();
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        localStorage.removeItem("token");
        navigate("/");
    };

    const handleSignClick = () => {
        setIsSignUpMode(false);
        setIsModalOpen(true);
    };

    return (
        <div className="header">
            <div className="auth-container">
                {isLoggedIn ? (
                    <>
                        <button className="signBtn" onClick={handleLogout}>로그아웃</button>
                        <button className="signBtn" onClick={() => navigate('/mypage')}>마이페이지</button>
                    </>
                ) : (
                    <button className="signBtn" onClick={handleSignClick}>로그인 / 회원가입</button>
                )}
            </div>
            <div className="search-container">
                <a className="mark" onClick={goToHome}>
                    <img src={Mark} alt="logo" className="markImg"/>
                </a>
                <div className="input-search">
                    <input type="text" placeholder="상품명 검색" maxLength="80" className="searchInput"/>
                    <button className="searchBtn">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="icon">
                            <path
                                d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6
                                457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4
                                25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1
                                416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/>
                        </svg>
                    </button>
                </div>
                <div className="icon-with-text">
                    <button className="icon-button" onClick={goToProductUpload}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" className="icon">
                            <path
                                d="M36.8 192l566.3 0c20.3 0 36.8-16.5 36.8-36.8c0-7.3-2.2-14.4-6.2-20.4L558.2 21.4C549.3 8
                                534.4 0 518.3 0L121.7 0c-16 0-31 8-39.9 21.4L6.2 134.7c-4
                                6.1-6.2 13.2-6.2 20.4C0 175.5 16.5 192 36.8 192zM64 224l0 160
                                0 80c0 26.5 21.5 48 48 48l224 0c26.5 0 48-21.5 48-48l0-80 0-160-64
                                0 0 160-192 0 0-160-64 0zm448 0l0 256c0 17.7 14.3 32 32 32s32-14.3 32-32l0-256-64 0z"/>
                        </svg>
                    </button>
                    <span className="icon-text">상품 등록</span>
                </div>
                <div className="icon-with-text">
                    <button className="icon-button" onClick={goToMyShop}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" className="icon">
                            <path
                                d="M32 464c0 26.5 21.5 48 48 48H560c26.5 0 48-21.5 48-48V336H32V464zM128 0c-8.8 0-16 7.2-16 16
                                0 8.8 7.2 16 16 16H160V80H48C39.2 80 32 87.2 32 96V320H608V96c0-8.8-7.2-16-16-16H480V32H512c8.8
                                0 16-7.2 16-16 0-8.8-7.2-16-16-16H128zM320 128c0 8.8-7.2 16-16 16s-16-7.2-16-16V96h32V128z"/>
                        </svg>
                    </button>
                    <span className="icon-text">내 상점</span>
                </div>
            </div>

            {isModalOpen && (
                <LoginModal
                    isSignUpMode={isSignUpMode}
                    setIsSignUpMode={setIsSignUpMode}
                    closeModal={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
};
