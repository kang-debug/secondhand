import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import './css/myshop.css';
import Header from './Header.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile, initializeUser, selectUserProfile } from '../features/user/userSlice';

const MyShop = () => {
    const [products, setProducts] = useState([]);
    const dispatch = useDispatch();
    const profile = useSelector(selectUserProfile);

    useEffect(() => {
        const fetchMyProducts = async () => {
            try {
                const response = await axios.get(`/products/member/${profile.memberId}`);
                setProducts(response.data);
            } catch (error) {
                console.error('상품 목록을 불러오는 중 오류 발생:', error);
            }
        };

        dispatch(initializeUser());
        if (localStorage.getItem('token')) {
            dispatch(fetchUserProfile());
        }
    }, [profile]);

    return (
        <div className="myshop-container">
            <Header />
            <h2>{profile?.nickname}의 상점</h2>
            <div className="myshop-product-list">
                {products.length > 0 ? (
                    products.map((product) => (
                        <div className="myshop-product-card" key={product.productId}>
                            <div className="myshop-product-image">
                                <img
                                    src={product.imageUrl ? product.imageUrl : '/default-image.png'}
                                    alt={product.name}
                                />
                            </div>
                            <div className="myshop-product-name">{product.name}</div>
                            <div className="myshop-product-price">{product.currentPrice.toLocaleString()} 원</div>
                            <div className="myshop-product-description">{product.description}</div>
                        </div>
                    ))
                ) : (
                    <h3>등록된 상품이 없습니다.</h3>
                )}
            </div>
        </div>
    );
};

export default MyShop;
