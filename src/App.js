import React from 'react';
import './App.css';
import OrdersLists from './orderslists';
import Navigation from './navigation';  // Adjust the path as needed
import './navigation.css';
import { withAuthenticator } from '@aws-amplify/ui-react';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Navigation />
        <div className="app-title">
          <h1>Order Interface</h1>
        </div>
        <OrdersLists />
      </header>
    </div>
  );
}

export default withAuthenticator(App, { includeGreetings: true });