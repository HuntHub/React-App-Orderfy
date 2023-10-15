iimport React, { useReducer, useEffect } from 'react';
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
                return state;  // Order already present, just return the state
            }
            return {
                ...state,
                orders: [...state.orders, action.payload]
            };
        case 'UPDATE_ORDER':
            if (!state.orders.some(order => order.order_id === action.payload.order_id)) {
                return state;  // Order not present, just return the state
            }
            return {
                ...state,
                orders: state.orders.map(order => order.order_id === action.payload.order_id ? action.payload : order)
            };
        default:
            return state;
    }
}

const OrdersLists = ({ messageQueue, setMessageQueue }) => {
    const [state, dispatch] = useReducer(orderReducer, initialState);

    useEffect(() => {
        API.get('vendorapi', '/orders')
            .then(data => {
                dispatch({ type: 'SET_ORDERS', payload: data });
            })
            .catch(err => console.error("API Error:", err));
    }, []);

    useEffect(() => {
        if (messageQueue.length === 0) return;

        console.log(`Starting to process the queue at ${new Date()}. Queue length: ${messageQueue.length}`);
    
        const processQueue = () => {
            const currentMessage = messageQueue[0];
            if (currentMessage.message === "New order") {

                console.log(`Processing new order with ID ${currentMessage.order_id} from the queue at ${new Date()}`);
                const order = {
                    order_id: currentMessage.order_id,
                    order_status: "Order Received",
                    name_attribute: currentMessage.name_attribute
                };
                dispatch({ type: 'ADD_NEW_ORDER', payload: order });
            } 
            
            else if (currentMessage.message === "Order updated") {
                console.log(`Processing updated order with ID ${currentMessage.order_id} from the queue at ${new Date()}`);
                const updated = {
                    order_id: currentMessage.order_id,
                    order_status: "Ready",
                    name_attribute: currentMessage.name_attribute
                };
                dispatch({ type: 'UPDATE_ORDER', payload: updated });
            }
            console.log(`Finished processing order with ID ${currentMessage.order_id}. Removing from the queue at ${new Date()}`);
            setMessageQueue(prevQueue => prevQueue.slice(1));
        };
    
        processQueue();
    }, [messageQueue, setMessageQueue]);

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
                    .filter(order => order.order_status !== "Ready")
                    .map((order, idx) => (
                        <div key={order.order_id} className="order">
                            <div className="order-id">
                            <span className="order-id-text">Customer Name:</span>
                            <span className="order-id-value">{order.name_attribute}</span>
                            <button className="ready-button" onClick={() => handleOrderUpdate(order.order_id)}>Mark as Ready</button>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default OrdersLists;
