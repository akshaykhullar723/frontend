import React, { useEffect, useState } from 'react';
import socketIOClient from 'socket.io-client';
import './App.css';
const ENDPOINT = process.env.REACT_APP_API_URL || "https://order-display-project.onrender.com";

function App() {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const socket = socketIOClient(ENDPOINT);

        // Handle real-time updates
        socket.on('update', (data) => {
            setOrders(prevOrders => {
                const existingOrderIndex = prevOrders.findIndex(order => order.order_number === data.order_number);

                if (existingOrderIndex > -1) {
                    const updatedOrders = [...prevOrders];
                    updatedOrders[existingOrderIndex] = data;
                    return updatedOrders;
                } else {
                    return [data, ...prevOrders];
                }
            });
        });

        // Handle clearing orders
        socket.on('clear', () => {
            setOrders([]);
        });

        // Fetch initial orders
        fetch(`${ENDPOINT}/orders`)
            .then(response => response.json())
            .then(data => setOrders(data))
            .catch(error => console.error('Error fetching orders:', error));

        // Clean up on component unmount
        return () => socket.disconnect();
    }, []);

    const handleClearOrders = () => {
        if (window.confirm('Do you really want to clear all orders?')) {
            fetch(`${ENDPOINT}/clear_orders`, {
                method: 'POST'
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'All orders cleared') {
                    setOrders([]);
                }
            })
            .catch(error => console.error('Error clearing orders:', error));
        }
    };

    return (
        <div className="App">
            <h1>Order Display</h1>
            <button onClick={handleClearOrders} className="clear-button">Clear Orders</button>
            <table>
                <thead>
                    <tr>
                        <th className="order_number">Order Number</th>
                        <th className="party_name">Party Name</th>
                        <th className="station_name">Station Name</th>
                        <th className="division">Division</th>
                        <th className="transport">Transport</th>
                        <th className="shipment">Shipment</th>
                        <th className="timestamp">Timestamp</th>
                        <th className="quantity">Quantity</th>
                        <th className="packed">Packed</th>
                        <th className="packed_time">Packed Time</th>
                        <th className="billed">Billed</th>
                        <th className="billed_time">Billed Time</th>
                        <th className="dispatched">Dispatched</th>
                        <th className="dispatched_time">Dispatched Time</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.length === 0 ? (
                        <tr>
                            <td colSpan="14" className="no-orders">No orders available.</td>
                        </tr>
                    ) : (
                        orders.map((order, index) => (
                            <tr key={index}>
                                <td className="order_number">{order.order_number}</td>
                                <td className="party_name">{order.party_name}</td>
                                <td className="station_name">{order.station_name}</td>
                                <td className="division">{order.division}</td>
                                <td className="transport">{order.transport}</td>
                                <td className="shipment">{order.shipment}</td>
                                <td className="timestamp">{order.timestamp}</td>
                                <td className="quantity">{order.quantity || ''}</td>
                                <td className="packed">{order.packed || ''}</td>
                                <td className="packed_time">{order.packed_time || ''}</td>
                                <td className="billed">{order.billed || ''}</td>
                                <td className="billed_time">{order.billed_time || ''}</td>
                                <td className="dispatched">{order.dispatched || ''}</td>
                                <td className="dispatched_time">{order.dispatched_time || ''}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default App;
