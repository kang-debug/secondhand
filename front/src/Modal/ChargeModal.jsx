import React from 'react';
import axios from '../api/axios.jsx';
import '../css/ChargeModal.css';

const ChargeModal = ({ onClose }) => {
    const handleCharge = async (amount) => {
        try {
            const response = await axios.post('/users/charge', { amount });
            alert(`${amount}원이 충전되었습니다.`);
            onClose();
            window.location.reload();
        } catch (error) {
            console.error('충전 중 오류 발생:', error);
            alert('충전 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>X</button>
                <h2>보유금액 충전</h2>
                <div className="charge-options">
                    {[10000, 20000, 30000, 50000].map((amount) => (
                        <button key={amount} onClick={() => handleCharge(amount)}>
                            {amount.toLocaleString()} 원 충전
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ChargeModal;
