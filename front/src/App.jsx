import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile, initializeUser, logout } from "./features/user/userSlice";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Header from "./components/Header.jsx";
import MyPage from "./components/MyPage";
import './App.css';
import Upload from "./components/Upload.jsx";
import MyShop from "./components/MyShop.jsx";
import ProductList from "./components/ProductList.jsx";
import ProductDetail from "./components/ProductDetail.jsx";
import WebSocketProvider from "./components/WebSocketProvider.jsx";



function App() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(initializeUser());
        if (localStorage.getItem('token')) {
            dispatch(fetchUserProfile());
        }
    }, [dispatch]);

    return (
        <div className="App">
            <Header />
            <ProductList/>
        </div>
    );
}

function AppWrapper() {
    return (
        <Router>
            <WebSocketProvider />
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/mypage" element={<MyPage />} />
                <Route path="/product-upload" element={<Upload />} />
                <Route path="/my-shop" element={<MyShop />} />
                <Route path="/product/:productId" element={<ProductDetail />} />
            </Routes>
        </Router>
    );
}

export default AppWrapper;