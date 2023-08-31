import React, { useEffect, useState } from 'react';
import { API } from 'aws-amplify';
import './orderslists.css';

const OrdersLists = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        API.get('vendorapi', '/orders')
            .then(data => {
                console.log(data);  // Log the data to the console
                setOrders(data);
            })
            .catch(err => console.error(err));
    }, []);

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