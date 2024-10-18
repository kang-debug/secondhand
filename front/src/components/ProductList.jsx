import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import './css/ProductList.css';
import { useNavigate } from 'react-router-dom';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();

    const fetchProducts = async () => {
        try {
            const response = await axios.get('/products');
            console.log("응답 데이터:", response.data);

            if (Array.isArray(response.data)) {
                setProducts(response.data);
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
                            alt={product.name}
                            className="product-image"
                        />
                        <div className="product-name">{product.name}</div>
                        <div className="product-price">{product.currentPrice.toLocaleString()} 원</div>
                        <div className="product-uploader">올린 사람: {product.uploadedBy}</div>
                    </div>
                ))
            ) : (
                <h1>등록된 상품이 없습니다.</h1>
            )}
        </div>
    );
};

export default ProductList;
