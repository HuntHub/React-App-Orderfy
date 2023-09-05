import React, { useState, useEffect } from 'react';
import './App.css';
import OrdersLists from './orderslists';
import Navigation from './navigation';  // Adjust the path as needed
import './navigation.css';
import { withAuthenticator } from '@aws-amplify/ui-react';

function App() {
    const [updatedOrder, setUpdatedOrder] = useState(null);  // <-- Add this state

    useEffect(() => {
        let socket;

        try {
            socket = new WebSocket('wss://3tlbn73ji6.execute-api.us-east-1.amazonaws.com/test');

            socket.addEventListener('open', (event) => {
                console.log('WebSocket connection opened:', event);
                console.log('WebSocket state:', socket.readyState);
            });

            socket.addEventListener('message', (event) => {
                const data = JSON.parse(event.data);
                if (data.message === "Order updated") {
                    setUpdatedOrder(data.order_id);
                }
            });

            socket.addEventListener('close', (event) => {
                if (event.wasClean) {
                    console.log(`Closed cleanly, code=${event.code}, reason=${event.reason}`);
                } else {
                    console.error('Connection terminated abnormally.');
                }
                console.log('WebSocket state:', socket.readyState);
            });

            socket.addEventListener('error', (error) => {
                console.error(`WebSocket Error:`, error);
            });

        } catch (error) {
            console.error("Error while establishing WebSocket connection:", error);
        }

        return () => {
            if (socket) {
                socket.close();
            }
        };
    }, []);

    return (
        <div className="App">
            <header className="App-header">
                <Navigation />
                <div className="app-title">
                    <h1>Order Interface</h1>
                </div>
                <OrdersLists updatedOrder={updatedOrder} />
            </header>
        </div>
    );
}

export default withAuthenticator(App, { includeGreetings: true });