import React, { useEffect, useState } from 'react';
import { API } from 'aws-amplify';
import './orderslists.css';

const OrdersLists = ({ updatedOrder }) => {  // <-- Destructure the new prop
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        API.get('vendorapi', '/orders')
            .then(data => {
                console.log(data);  // Log the data to the console
                setOrders(data);
            })
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        // If there's an updated order, and it exists in the orders array
        if (updatedOrder && orders.some(order => order.order_id === updatedOrder)) {
            const newOrders = orders.map(order => {
                if (order.order_id === updatedOrder) {
                    return {
                        ...order,
                        order_status: "Ready"  // Or any other status based on your backend's logic
                    };
                }
                return order;
            });
            setOrders(newOrders);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updatedOrder]);

    useEffect(() => {
        // Logic to add a new order to the orders array
        // For example, you can add a new order when a "New order" event is received
        if (updatedOrder && !orders.some(order => order.order_id === updatedOrder)) {
            // Create a new order object and add it to the orders array
            const newOrder = {
                order_id: updatedOrder,
                order_status: "Order Received" // You can set any initial status for new orders
            };
            setOrders(prevOrders => [...prevOrders, newOrder]);
            console.log("New order added to orders array:", newOrder);
        }
    }, [updatedOrder, orders]);
    const handleOrderUpdate = (order_id) => {
        const body = {
            order_id,
            new_status: "Ready"
        };

        API.post('vendorapi', '/updateorder', {
            body
        }).then(response => {
            console.log(response);
        }).catch(error => {
            console.error(error.response);
        });
    };

    return (
        <div>
            <h2 className="order-list-header">Order List:</h2>
            {Array.isArray(orders) ? orders.map(order => (
                order.order_status !== "Ready" && (
                    <div key={order.order_id} className="order">
                        <p className="order-id">Order ID: {order.order_id}</p>
                        <p className="status">Status: {order.order_status}</p>
                        <button className="ready-button" onClick={() => handleOrderUpdate(order.order_id)}>Mark as Ready</button>
                    </div>
                )
            )) : <p>Orders is not an array. It's a {typeof orders}</p>}
        </div>
    );
};

export default OrdersLists;