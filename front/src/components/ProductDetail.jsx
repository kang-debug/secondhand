import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../api/axios';
import '../css/ProductDetail.css';
import Header from './Header';
import { fetchUserProfile, initializeUser, selectUserProfile } from "../features/user/userSlice.jsx";
import { useDispatch, useSelector } from "react-redux";
import LoginModal from "../Modal/LoginModal.jsx";
import AddressConfirmedModal from "../Modal/AddressConfirmedModal.jsx";

const ProductDetail = () => {
    const { productId } = useParams();
    const dispatch = useDispatch();
    const profile = useSelector(selectUserProfile);
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [bidPrice, setBidPrice] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [address, setAddress] = useState('');
    const [detailAddress, setDetailAddress] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [isAddressConfirmed, setIsAddressConfirmed] = useState(false);
    const [isAddressConfirmedModalOpen, setIsAddressConfirmedModalOpen] = useState(false);

    useEffect(() => {
        if (localStorage.getItem('token')) {
            dispatch(initializeUser());
            dispatch(fetchUserProfile());
        }
    }, [dispatch]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`/products/${productId}`);
                setProduct(response.data);

                // 배송지 정보가 있다면 상태에 저장
                if (response.data.postalCode && response.data.address && response.data.detailAddress) {
                    setPostalCode(response.data.postalCode);
                    setAddress(response.data.address);
                    setDetailAddress(response.data.detailAddress);
                    setIsAddressConfirmed(true); // 이미 배송지가 확정된 경우 입력창 숨기기
                }
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


    const handleEnterAddress = () => {
        setIsAddressModalOpen(true);
        new window.daum.Postcode({
            oncomplete: function (data) {
                setAddress(data.address);
                setPostalCode(data.zonecode);
                setIsAddressModalOpen(false);
            },
        }).open();
    };

    const handleConfirmAddress = async () => {
        if (!postalCode || !address || !detailAddress) {
            alert('모든 배송지 정보를 입력해주세요.');
            return;
        }

        try {
            await axios.post(`/products/${productId}/confirm-address`, {
                postalCode,
                address,
                detailAddress,
            });
            alert('배송지가 확정되었습니다.');
            setProduct((prev) => ({
                ...prev,
                postalCode,
                address,
                detailAddress,
            }));
            setIsAddressConfirmed(true);
        } catch (error) {
            console.error('배송지 확정 중 오류 발생: ', error);
            alert('배송지 확정 중 오류가 발생했습니다.');
        }
    };

    const handlePurchaseConfirm = async () => {
        try {
            await axios.patch(`/products/${productId}/purchase-confirm`, null, {
                params: {
                    bidderId: product.highestBidder.memberId,
                },
            });

            alert(`${product.name}을 구매확정합니다, ${product.currentPrice.toLocaleString()}원이 차감됩니다.`);
            setProduct((prev) => ({
                ...prev,
                purchaseConfirmed: true,
            }));
        } catch (error) {
            console.error('구매 확정 중 오류 발생:', error);
            alert('구매 확정 중 오류가 발생했습니다.');
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
    const isHighestBidder = profile?.memberId === product?.highestBidder?.memberId;
    const auctionEnded = new Date(product.auctionEndTime) <= new Date();

    // 최고입찰자가 아니고, 상품을 올린 사람도 아니라면 접근할 수 없도록 처리
    if (auctionEnded && !isHighestBidder && !isProductOwner) {
        return (
            <div className="product-detail">
                <Header />
                <h2>경매가 끝이난 상품입니다.</h2>
                <p>최고 입찰자 또는 상품을 올린 사람이 아니기 때문에 접근하실 수 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="product-detail">
            <Header />
            <h1>{product.name}</h1>
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
                <table className="product-detail-table">
                    <tbody>
                    <tr>
                        <td className="details-table-label">현재 가격</td>
                        <td className="details-table-value">{product.currentPrice.toLocaleString()} 원</td>
                    </tr>
                    <tr>
                        <td className="details-table-label">올린 사람</td>
                        <td className="details-table-value">{product.member.nickname}</td>
                    </tr>
                    <tr>
                        <td className="details-table-label">최고 입찰자</td>
                        <td className="details-table-value">{product.highestBidder ? product.highestBidder.nickname : '아직 없음'}</td>
                    </tr>
                    <tr>
                        <td className="details-table-label">남은 시간</td>
                        <td className="details-table-value">{calculateRemainingTime(product.auctionEndTime)}</td>
                    </tr>
                    <tr>
                        <td className="details-table-label">상품 설명</td>
                        <td className="details-table-value">{product.description}</td>
                    </tr>
                    </tbody>
                </table>
                {product.purchaseConfirmed && (
                    <div className="confirmed-address">
                        <button className="button" onClick={() => setIsAddressConfirmedModalOpen(true)}>
                            배송지 확인하기
                        </button>
                        <button className="button" onClick={handleEnterAddress}>우편 번호 찾기</button>
                        <button className="button" onClick={handleConfirmAddress}>배송지 확정</button>
                    </div>
                )}
            </div>
            {isProductOwner ? (
                <div className="bid-section">
                    {auctionEnded ? (
                        <button className="button" onClick={handleDeleteProduct}>상품 삭제</button>
                    ) : (
                        <button className="button" onClick={handleEndAuction}>경매 종료</button>
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
                        <button className="button" onClick={handleBid}>입찰하기</button>
                    </div>
                )
            )}

            {isHighestBidder && auctionEnded && !product.purchaseConfirmed && (
                <div className="purchase-section">
                    <button className="button" onClick={handlePurchaseConfirm}>구매 확정</button>
                </div>
            )}

            {isHighestBidder && auctionEnded && product.purchaseConfirmed && !isAddressConfirmed && (
                <div className="address-section">

                    <p>우편번호 <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)}/></p>
                    <p>배송지 <input value={address} onChange={(e) => setAddress(e.target.value)}/></p>
                    <p>상세 주소 <input value={detailAddress} onChange={(e) => setDetailAddress(e.target.value)}
                                    placeholder="상세 주소 입력"/></p>
                </div>
            )}

            {isModalOpen && (
                <LoginModal closeModal={handleModalClose}/>
            )}

            <AddressConfirmedModal
                isOpen={isAddressConfirmedModalOpen}
                closeModal={() => setIsAddressConfirmedModalOpen(false)}
                product={product}
            />
        </div>
    );
};

export default ProductDetail;
