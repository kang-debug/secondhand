import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile, initializeUser, selectUserProfile } from '../features/user/userSlice';
import Header from './Header';
import axios from '../api/axios';
import { useNavigate } from "react-router-dom";
import '../css/MyPage.css';
import ChargeModal from '../Modal/ChargeModal.jsx';

const MyPage = () => {
    const dispatch = useDispatch();
    const profile = useSelector(selectUserProfile);
    const [bidHistory, setBidHistory] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(initializeUser());
        if (localStorage.getItem('token')) {
            dispatch(fetchUserProfile());
        }
    }, [dispatch]);

    useEffect(() => {
        const fetchBidHistory = async () => {
            if (profile && profile.memberId) {
                try {
                    const response = await axios.get(`/products/bids/member/${profile.memberId}`);
                    console.log('입찰 기록 데이터:', response.data);

                    const uniqueBidHistory = response.data.reduce((acc, current) => {
                        const existingBid = acc.find(bid => bid.product.productId === current.product.productId);
                        if (!existingBid || new Date(existingBid.bidTime) < new Date(current.bidTime)) {
                            return acc.filter(bid => bid.product.productId !== current.product.productId).concat(current);
                        }
                        return acc;
                    }, []);

                    setBidHistory(uniqueBidHistory);
                } catch (error) {
                    console.error('입찰 기록을 불러오는 중 오류 발생:', error);
                }
            }
        };

        fetchBidHistory();
    }, [profile]);

    if (!profile) {
        return <div className="loading">로딩 중...</div>;
    }

    const calculateRemainingTime = (auctionEndTime) => {
        const endTime = new Date(auctionEndTime);
        const now = new Date();
        const timeDiff = endTime - now;

        if (timeDiff <= 0) {
            return '경매 종료';
        }

        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}시간 ${minutes}분`;
    };

    const handleCardClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    const handleChargeClick = () => {
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
    };

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
                <button className="charge-button" onClick={handleChargeClick}>보유금액 충전</button>
            </div>
            <h1>입찰 목록</h1>
            <div className="bid-history product-list" >
                {bidHistory.length > 0 ? (
                    bidHistory.map((bid) => (
                        <div className="product-card" key={bid.bidId} onClick={() => handleCardClick(bid.product.productId)}>
                            <img
                                src={bid.product?.imageUrl ? bid.product.imageUrl : '/default-image.png'}
                                alt={bid.product?.name || '상품 이미지'}
                                className="product-image"
                            />
                            <div className="product-details">
                                <table className="product-table">
                                    <tbody>
                                    <tr>
                                        <td className="detail-label">상품 이름</td>
                                        <td className="detail-value">{bid.product?.name || '상품 정보 없음'}</td>
                                    </tr>
                                    <tr>
                                        <td className="detail-label">현재 입찰자</td>
                                        <td className="detail-value">{bid.product?.highestBidder || '정보 없음'}</td>
                                    </tr>
                                    <tr>
                                        <td className="detail-label">현재 가격</td>
                                        <td className="detail-value">{bid.product?.currentPrice?.toLocaleString() || '정보 없음'}원</td>
                                    </tr>
                                    <tr>
                                        <td className="detail-label">본인 입찰가</td>
                                        <td className="detail-value">{bid.bidPrice.toLocaleString()}원</td>
                                    </tr>
                                    <tr>
                                        <td className="detail-label">남은 시간</td>
                                        <td className="detail-value">{calculateRemainingTime(bid.product.auctionEndTime)}</td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))
                ) : (
                    <h3>입찰한 상품이 없습니다.</h3>
                )}
            </div>

            {isModalOpen && <ChargeModal onClose={handleModalClose} />}
        </div>
    );
};

export default MyPage;
