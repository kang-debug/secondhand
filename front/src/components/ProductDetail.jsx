import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios';
import './css/ProductDetail.css';
import Header from './Header';

const ProductDetail = () => {
    const { productId } = useParams(); // 올바른 파라미터 이름인 productId 사용
    const [product, setProduct] = useState(null);
    const [bidPrice, setBidPrice] = useState('');

    useEffect(() => {
        // 상품 정보를 가져오는 함수
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`/products/${productId}`);
                setProduct(response.data);
                console.log("응답 데이터:", response.data);
            } catch (error) {
                console.error('상품 정보를 불러오는 중 오류 발생: ', error);
            }
        };

        if (productId) { // 잘못된 변수 참조 수정 (id -> productId)
            fetchProduct();
        }
    }, [productId]); // 의존성 배열도 productId로 수정

    const handleBid = async () => {
        if (parseInt(bidPrice, 10) <= product.currentPrice) {
            alert("입찰가는 현재 가격보다 높아야 합니다.");
            return;
        }

        try {
            await axios.patch(`/products/${productId}/bid`, null, {
                params: { newBidPrice: bidPrice },
            });
            alert('입찰이 성공적으로 반영되었습니다.');
            setProduct({ ...product, currentPrice: parseInt(bidPrice, 10) });
        } catch (error) {
            console.error('입찰 중 오류 발생:', error);
            alert('입찰 중 오류가 발생했습니다.');
        }
    };

    if (!product) {
        return <div>로딩 중...</div>;
    }

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
                <p>설명: {product.description}</p>
            </div>
            <div className="bid-section">
                <input
                    type="number"
                    value={bidPrice}
                    onChange={(e) => setBidPrice(e.target.value)}
                    placeholder="입찰 금액 입력"
                />
                <button onClick={handleBid}>입찰하기</button>
            </div>
        </div>
    );
};

export default ProductDetail;
