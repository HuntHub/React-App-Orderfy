import React, { useReducer, useEffect } from 'react';
import { API } from 'aws-amplify';
import './orderslists.css';

const initialState = {
    orders: [],
    isLoading: true
};

function orderReducer(state, action) {
    switch (action.type) {
        case 'SET_ORDERS':
            return {
                ...state,
                orders: action.payload,
                isLoading: false
            };
        case 'ADD_NEW_ORDER':
            if (state.orders.some(order => order.order_id === action.payload.order_id)) {
                return state;
            } else {
                return {
                    ...state,
                    orders: [...state.orders, action.payload]
                };
            }
        case 'UPDATE_ORDER':
            return {
                ...state,
                orders: state.orders.map(order => order.order_id === action.payload.order_id ? action.payload : order)
            };
        default:
            return state;
    }
}

const OrdersLists = ({ newOrder, updatedOrder }) => {
    const [state, dispatch] = useReducer(orderReducer, initialState);

    useEffect(() => {
        API.get('vendorapi', '/orders')
            .then(data => {
                dispatch({ type: 'SET_ORDERS', payload: data });
            })
            .catch(err => console.error("API Error:", err));
    }, []);

    useEffect(() => {
        if (newOrder && !state.orders.some(order => order.order_id === newOrder)) {
            const order = {
                order_id: newOrder,
                order_status: "Order Received"
            };
            dispatch({ type: 'ADD_NEW_ORDER', payload: order });
        }
    }, [newOrder, state.orders]);

    useEffect(() => {
        if (updatedOrder && state.orders.some(order => order.order_id === updatedOrder)) {
            const updated = {
                order_id: updatedOrder,
                order_status: "Ready"
            };
            dispatch({ type: 'UPDATE_ORDER', payload: updated });
        }
    }, [updatedOrder, state.orders]);

    const handleOrderUpdate = (order_id) => {
        const body = {
            order_id,
            new_status: "Ready"
        };

        API.post('vendorapi', '/updateorder', { body })
            .then(response => {
                console.log("API Response:", response);
            })
            .catch(error => {
                console.error("API Error:", error.response);
            });
    };

    if (state.isLoading) {
        return <p>Loading orders...</p>;
    }

    return (
        <div>
            <div className="order-list-container">
                {state.orders
                    .filter(order => order.order_status !== "Ready")  // Filtering out orders with the "Ready" status
                    .map((order, idx) => (
                        <div key={idx} className="order">
                            <p className="order-id">Order ID: {order.order_id}</p>
                            <button className="ready-button" onClick={() => handleOrderUpdate(order.order_id)}>Mark as Ready</button>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default OrdersLists;