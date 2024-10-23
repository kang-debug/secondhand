import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../api/axios';
import '../css/ProductDetail.css';
import Header from './Header';
import { fetchUserProfile, initializeUser, selectUserProfile } from "../features/user/userSlice.jsx";
import { useDispatch, useSelector } from "react-redux";
import LoginModal from "../Modal/LoginModal.jsx";

const ProductDetail = () => {
    const { productId } = useParams();
    const dispatch = useDispatch();
    const profile = useSelector(selectUserProfile);
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [bidPrice, setBidPrice] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (localStorage.getItem('token')) {
            dispatch(initializeUser());
            dispatch(fetchUserProfile());
        }
    }, [dispatch]);

    useEffect(() => {
        if (profile) {
            console.log('프로필 데이터:', profile);
        }
    }, [profile]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`/products/${productId}`);
                setProduct(response.data);
                console.log("응답 데이터:", response.data);
            } catch (error) {
                console.error('상품 정보를 불러오는 중 오류 발생: ', error);
            }
        };

        if (productId) {
            fetchProduct();
        }
    }, [productId]);

    const handleModalClose = () => {
        setIsModalOpen(false);
        if (localStorage.getItem('token')) {
            dispatch(fetchUserProfile());
        }
    };

    const handleBid = async () => {
        if (!profile) {
            alert('로그인 해주세요');
            setIsModalOpen(true);
            return;
        }

        if (bidPrice === '' || parseInt(bidPrice, 10) <= product.currentPrice) {
            alert("입찰가는 현재 가격보다 높아야 합니다.");
            return;
        }

        if (parseInt(bidPrice, 10) > profile.balance) {
            alert("보유 금액이 부족합니다.");
            return;
        }
        try {
            await axios.patch(`/products/${productId}/bid`, {
                newBidPrice: parseInt(bidPrice, 10),
                bidderId: profile.memberId // 로그인한 사용자의 ID를 전송합니다.
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            alert('입찰에 성공했습니다.');
            window.location.reload();
        } catch (error) {
            console.error('입찰 중 오류 발생:', error);
            alert('입찰 중 오류가 발생했습니다.');
        }
    };

    const handleEndAuction = async () => {
        try {
            await axios.patch(`/products/${productId}/end-auction`);
            alert('경매가 종료되었습니다.');
            setProduct({ ...product, auctionEndTime: new Date().toISOString() }); // 경매 종료 업데이트
        } catch (error) {
            console.error('경매 종료 중 오류 발생:', error);
            alert('경매 종료 중 오류가 발생했습니다.');
        }
    };

    const handleDeleteProduct = async () => {
        try {
            await axios.delete(`/products/${productId}`);
            alert('상품이 삭제되었습니다.');
            navigate('/my-shop');
        } catch (error) {
            console.error('상품 삭제 중 오류 발생:', error);
            alert('상품 삭제 중 오류가 발생했습니다.');
        }
    };

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

    if (!product) {
        return <div>로딩 중...</div>;
    }

    const isProductOwner = profile?.memberId === product?.member?.memberId;
    const auctionEnded = new Date(product.auctionEndTime) <= new Date();

    return (
        <div className="product-detail">
            <Header />
            <h2>{product.name}</h2>
            <div className="product-images">
                {product.imageUrls && product.imageUrls.length > 0 ? (
                    product.imageUrls.map((url, index) => (
                        <img key={index} src={url} alt={`product-${index}`} className="detail-image" />
                    ))
                ) : (
                    <img src="/default-image.png" alt="default" className="detail-image" />
                )}
            </div>
            <div className="product-info">
                <p>현재 가격: {product.currentPrice.toLocaleString()} 원</p>
                <p>올린 사람: {product.member.nickname}</p>
                <p>
                    최고 입찰자: {product.highestBidder ? product.highestBidder.nickname : '아직 없음'}
                </p>
                <p>남은 시간: {calculateRemainingTime(product.auctionEndTime)}</p>
                <p>상품 설명: {product.description}</p>
            </div>
            {isProductOwner ? (
                <div className="bid-section">
                    {auctionEnded ? (
                        <button onClick={handleDeleteProduct}>상품 삭제</button>
                    ) : (
                        <button onClick={handleEndAuction}>경매 종료</button>
                    )}
                </div>
            ) : (
                !auctionEnded && (
                    <div className="bid-section">
                        <input
                            type="number"
                            value={bidPrice}
                            onChange={(e) => setBidPrice(e.target.value)}
                            placeholder="입찰 금액 입력"
                        />
                        <button onClick={handleBid}>입찰하기</button>
                    </div>
                )
            )}

            {isModalOpen && (
                <LoginModal
                    closeModal={handleModalClose}
                />
            )}
        </div>
    );
};

export default ProductDetail;
