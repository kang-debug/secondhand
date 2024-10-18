import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {fetchUserProfile, initializeUser, selectUserProfile} from '../features/user/userSlice';
import Header from './Header';
import './css/MyPage.css';

const MyPage = () => {
    const dispatch = useDispatch();
    const profile = useSelector(selectUserProfile);

    useEffect(() => {
        dispatch(initializeUser());
        if (localStorage.getItem('token')) {
            dispatch(fetchUserProfile());
        }
    }, [dispatch]);

    if (!profile) {
        return <div className="loading">로딩 중...</div>;
    }

    return (
        <div className="mypage">
            <Header />
            <div className="mypage-content">
                <h1>내 정보</h1>
                <table className="profile-table">
                    <tbody>
                    <tr>
                        <th>이메일</th>
                        <td>{profile.email}</td>
                    </tr>
                    <tr>
                        <th>닉네임</th>
                        <td>{profile.nickname}</td>
                    </tr>
                    <tr>
                        <th>보유금액</th>
                        <td>{profile.balance} 원</td>
                    </tr>
                    <tr>
                        <th>개설일</th>
                        <td>{new Date(profile.createdAt).toLocaleDateString()}</td>
                    </tr>
                    </tbody>
                </table>
                <button className="charge-button">보유금액 충전</button>
            </div>
        </div>
    );
};

export default MyPage;
