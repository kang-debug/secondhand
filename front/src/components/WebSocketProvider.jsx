import React, { useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WebSocketProvider = () => {
    useEffect(() => {
        const socket = new SockJS('http://localhost:8080/ws');
        const stompClient = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                stompClient.subscribe('/topic/bid-updates', (message) => {
                    alert(message.body);
                });
            },
        });

        stompClient.activate();

        return () => {
            if (stompClient) stompClient.deactivate();
        };
    }, []);

    return null;
};

export default WebSocketProvider;
