import React from "react";

const AddressConfirmedModal = ({ isOpen, closeModal, product }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>확정된 배송지 정보</h3>
                <p>우편번호: {product.postalCode}</p>
                <p>주소: {product.address}</p>
                <p>상세 주소: {product.detailAddress}</p>
                <button onClick={closeModal}>닫기</button>
            </div>
        </div>
    );
};

export default AddressConfirmedModal;