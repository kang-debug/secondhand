import React, { useState } from 'react';
import axios from '../api/axios';
import { useDispatch } from 'react-redux';
import { login } from '../features/user/userSlice';
import './css/LoginModal.css';

function LoginModal({ isSignUpMode, setIsSignUpMode, closeModal }) {
    const [email, setEmail] = useState('');
    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const dispatch = useDispatch();

    const handleSignUpModeToggle = () => {
        setEmail('');
        setNickname('');
        setPassword('');
        setConfirmPassword('');
        setIsSignUpMode(true);
    };

    const handleLogin = async () => {
        try {
            const response = await axios.post('/users/login', { email, password });
            const { token } = response.data;
            localStorage.setItem('token', token);
            dispatch(login(token));
            alert('로그인 성공');
            closeModal();
        } catch (error) {
            const errorMessage = error.response?.data || '로그인 실패';
            alert(errorMessage);
        }
    };

    const handleSignUp = async () => {
        if (password !== confirmPassword) {
            alert('비밀번호가 일치하지 않습니다.');
            setPassword('');
            setConfirmPassword('');
            return;
        }

        try {
            const response = await axios.post('/users/register', {
                email,
                nickname,
                password,
            });

            if (response.status === 201 || response.status === 200) {
                alert('회원가입이 완료되었습니다.');
                closeModal();
            }
        } catch (error) {
            alert(error.response?.data || '회원가입 중 오류가 발생했습니다.');
        }
    };

    // Enter 키 감지 함수
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            if (isSignUpMode) {
                handleSignUp();
            } else {
                handleLogin();
            }
        }
    };

    return (
        <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {isSignUpMode ? (
                    <>
                        <h2>회원가입</h2>
                        <div className="input-group">
                            <label htmlFor="email">이메일</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={handleKeyDown} // Enter 키 감지
                                placeholder="이메일 입력"
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor="nickname">닉네임</label>
                            <input
                                type="text"
                                id="nickname"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                onKeyDown={handleKeyDown} // Enter 키 감지
                                placeholder="닉네임 입력"
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor="password">비밀번호</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={handleKeyDown} // Enter 키 감지
                                placeholder="비밀번호 입력"
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor="confirmPassword">비밀번호 확인</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                onKeyDown={handleKeyDown} // Enter 키 감지
                                placeholder="비밀번호 확인 입력"
                            />
                        </div>
                        <button className="login-button" onClick={handleSignUp}>회원가입</button>
                    </>
                ) : (
                    <>
                        <h2>로그인</h2>
                        <div className="input-group">
                            <label htmlFor="email">이메일</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={handleKeyDown} // Enter 키 감지
                                placeholder="이메일 입력"
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor="password">비밀번호</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={handleKeyDown} // Enter 키 감지
                                placeholder="비밀번호 입력"
                            />
                        </div>
                        <button className="login-button" onClick={handleLogin}>로그인</button>
                        <button className="login-button" onClick={handleSignUpModeToggle}>회원가입</button>
                    </>
                )}
                <button className="close-button" onClick={closeModal}>X</button>
            </div>
        </div>
    );
}

export default LoginModal;
