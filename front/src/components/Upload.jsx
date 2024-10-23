import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import '../css/Upload.css';
import Header from "./Header.jsx";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile, initializeUser, selectUserProfile } from '../features/user/userSlice';

const Upload = () => {
    const navigate = useNavigate();
    const [productImages, setProductImages] = useState([]);
    const [productName, setProductName] = useState('');
    const [startPrice, setStartPrice] = useState('');
    const [description, setDescription] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const dispatch = useDispatch();
    const profile = useSelector(selectUserProfile);

    useEffect(() => {
        dispatch(initializeUser());
        if (localStorage.getItem('token')) {
            dispatch(fetchUserProfile());
        }
    }, [dispatch]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);

        if (productImages.length + files.length > 5) {
            alert("최대 5개의 이미지만 업로드할 수 있습니다.");
            return;
        }

        setProductImages((prevImages) => [...prevImages, ...files]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (productImages.length === 0 || !productName || !startPrice) {
            alert('사진을 등록해주세요');
            return;
        }

        if (parseInt(startPrice, 10) < 1000) {
            alert('경매 시작 금액은 최소 1000원 이상이어야 합니다.');
            setErrorMessage("경매 시작 금액은 최소 1000원 이상이어야 합니다.");
            return;
        }

        if (!profile || !profile.memberId) {
            alert("로그인 후 이용 가능합니다.");
            return;
        }

        const formData = new FormData();
        formData.append('memberId', profile.memberId);
        formData.append('name', productName);
        formData.append('description', description);
        formData.append('startingPrice', startPrice);

        productImages.forEach((image) => {
            formData.append('images', image);
        });

        try {
            await axios.post('/products/create', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            alert('상품이 성공적으로 등록되었습니다.');
            navigate("/");
        } catch (error) {
            console.error("상품 등록 중 오류:", error);
            setErrorMessage("상품 등록 중 오류가 발생했습니다.");
        }
    };

    const removeImage = (index) => {
        setProductImages(productImages.filter((_, i) => i !== index));
    };

    return (
        <div className="product-upload">
            <Header />
            <h2>상품 등록</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="productImage">상품 이미지 등록 (최대 5개)</label>
                    <input type="file" id="productImage" multiple onChange={handleImageChange} />
                    <div className="image-preview">
                        {productImages.map((image, index) => (
                            <div key={index} className="image-container">
                                <img src={URL.createObjectURL(image)} alt={`preview-${index}`} className="preview-img" />
                                <button type="button" onClick={() => removeImage(index)} className="remove-image">X</button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="productName">상품 명 (필수)</label>
                    <input
                        type="text"
                        id="productName"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="startPrice">경매 시작 가격 (필수)</label>
                    <input
                        type="number"
                        id="startPrice"
                        value={startPrice}
                        onChange={(e) => setStartPrice(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="description">상품 설명</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                </div>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                <button type="submit" className="submit-button">상품 등록</button>
            </form>
        </div>
    );
};

export default Upload;
