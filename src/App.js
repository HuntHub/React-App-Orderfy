import React, { useState, useEffect } from 'react';
import './App.css';
import OrdersLists from './orderslists';
import Navigation from './navigation';  // Adjust the path as needed
import './navigation.css';
import { withAuthenticator } from '@aws-amplify/ui-react';
import './auth-styles.css';
import { Helmet } from 'react-helmet';

function App() {

    console.log("App component mounted at", new Date().toISOString());

    const [newOrder, setNewOrder] = useState(null);  // State for new orders
    const [updatedOrder, setUpdatedOrder] = useState(null);  // State for updated orders

    useEffect(() => {
        let socket;

        const connectWebSocket = () => { 
            try {
                socket = new WebSocket('wss://3tlbn73ji6.execute-api.us-east-1.amazonaws.com/test');

                socket.addEventListener('open', (event) => {
                    console.log('WebSocket connection opened:', event);
                    console.log('WebSocket state:', socket.readyState);
                });

                socket.addEventListener('message', (event) => {
                    const data = JSON.parse(event.data);
                    console.log('WebSocket message received:', data);

                    if (data.message === "Order updated" && data.order_id !== updatedOrder) {
                        setUpdatedOrder(data.order_id);
                        console.log(data.message, data.order_id);
                        setTimeout(() => setUpdatedOrder(null), 500);

                    } else if (data.message === "New order" && data.order_id !== newOrder) {
                        setNewOrder(data.order_id);
                        console.log(data.message, data.order_id);
                    }
                });

                socket.addEventListener('close', (event) => {
                    if (event.wasClean) {
                        console.log(`Closed cleanly, code=${event.code}, reason=${event.reason}`);
                    } else {
                        console.error('Connection terminated abnormally.');
                    }
                    console.log('WebSocket state:', socket.readyState);

                    // Automatic Reconnection
                    setTimeout(() => {
                        console.log('Attempting to reconnect...');
                        connectWebSocket();
                    }, 500);
                });

                socket.addEventListener('error', (error) => {
                    console.error(`WebSocket Error:`, error);
                });

            } catch (error) {
                console.error("Error while establishing WebSocket connection:", error);
            }
        };

        connectWebSocket(); // Initial call to establish the connection

        return () => {
            if (socket) {
                socket.close();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);  // Empty dependency array ensures this effect runs once

    return (
        <div className="App">
            <Helmet>
                <title>Orderfy</title>
            </Helmet>
            <header className="App-header">
                <Navigation />
                <div className="app-title">
                    <h1>Order Interface</h1>
                </div>
                <OrdersLists newOrder={newOrder} updatedOrder={updatedOrder} />
            </header>
        </div>
    );
}

export default withAuthenticator(App, { includeGreetings: true });