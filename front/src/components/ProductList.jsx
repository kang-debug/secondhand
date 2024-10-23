import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import '../css/ProductList.css';
import { useNavigate } from "react-router-dom";

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();

    const fetchProducts = async () => {
        try {
            const response = await axios.get('/products');
            console.log("응답 데이터:", response.data); // 응답 데이터 로그

            if (Array.isArray(response.data)) {
                const filteredProducts = response.data.filter(product => {
                    const endTime = new Date(product.auctionEndTime);
                    return endTime > new Date();
                });
                setProducts(filteredProducts);
            } else {
                console.error("상품 목록 데이터가 배열이 아닙니다.");
                setProducts([]);
            }
        } catch (error) {
            console.error('상품 목록을 불러오는 중 오류 발생:', error);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

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
        <div className="product-list">
            {products.length > 0 ? (
                products.map((product) => (
                    <div className="product-card" key={product.productId} onClick={() => handleCardClick(product.productId)}>
                        <img
                            src={product.imageUrl ? product.imageUrl : '/default-image.png'}
                            alt={product.name} className="product-image"
                        />
                        <div className="product-details">
                            <table className="product-table">
                                <tbody>
                                <tr>
                                    <td className="detail-label">상품 이름</td>
                                    <td className="detail-value">{product.name}</td>
                                </tr>
                                <tr>
                                    <td className="detail-label">현재 가격</td>
                                    <td className="detail-value">{product.currentPrice.toLocaleString()}원</td>
                                </tr>
                                <tr>
                                    <td className="detail-label">최고 입찰자</td>
                                    <td className="detail-value">{product.highestBidder ? product.highestBidder : '아직 없음'}</td>
                                </tr>
                                <tr>
                                    <td className="detail-label">올린 사람</td>
                                    <td className="detail-value">{product.uploadedBy}</td>
                                </tr>
                                <tr>
                                    <td className="detail-label">남은 시간</td>
                                    <td className="detail-value">{calculateRemainingTime(product.auctionEndTime)}</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))
            ) : (
                <h1>등록된 상품이 없습니다.</h1>
            )}
        </div>
    );
};

export default ProductList;
