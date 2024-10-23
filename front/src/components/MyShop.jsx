import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import '../css/myshop.css';
import Header from './Header.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile, initializeUser, selectUserProfile } from '../features/user/userSlice';
import { useNavigate } from "react-router-dom";

const MyShop = () => {
    const [products, setProducts] = useState([]);
    const dispatch = useDispatch();
    const profile = useSelector(selectUserProfile);
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(initializeUser());
        if (localStorage.getItem('token')) {
            dispatch(fetchUserProfile());
        }
    }, [dispatch]);

    useEffect(() => {
        const fetchMyProducts = async () => {
            if (profile && profile.memberId) {
                try {
                    const response = await axios.get(`/products/member/${profile.memberId}`);
                    setProducts(response.data);
                } catch (error) {
                    console.error('상품 목록을 불러오는 중 오류 발생:', error);
                }
            }
        };

        if (profile && profile.memberId) {
            fetchMyProducts();
        }
    }, [profile]);

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

    return (
        <div className="myshop-container">
            <Header />
            {profile ? (
                <>
                    <h2>{profile.nickname}의 상점</h2>
                    <div className="myshop-product-list">
                        {products.length > 0 ? (
                            products.map((product) => (
                                <div className="myshop-product-card" key={product.productId} onClick={() => handleCardClick(product.productId)}>
                                    <img
                                        src={product.imageUrl ? product.imageUrl : '/default-image.png'}
                                        alt={product.name}
                                        className="myshop-product-image"
                                    />
                                    <div className="myshop-product-details">
                                        <table className="myshop-product-table">
                                            <tbody>
                                            <tr>
                                                <td className="detail-label">상품 이름:</td>
                                                <td className="detail-value">{product.name}</td>
                                            </tr>
                                            <tr>
                                                <td className="detail-label">현재 가격:</td>
                                                <td className="detail-value">{product.currentPrice.toLocaleString()} 원</td>
                                            </tr>
                                            <tr>
                                                <td className="detail-label">남은 시간:</td>
                                                <td className="detail-value">{calculateRemainingTime(product.auctionEndTime)}</td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <h3>등록된 상품이 없습니다.</h3>
                        )}
                    </div>
                </>
            ) : (
                <h3>로딩 중...</h3>
            )}
        </div>
    );
};

export default MyShop;
