import React, { useState, useEffect } from 'react';
import { Navbar, Button } from 'react-bootstrap';
import { Auth } from 'aws-amplify';

const Navigation = () => {
    const [username, setUsername] = useState('');

  const handleLogout = async () => {
    try {
      await Auth.signOut();
      window.location.reload();  // Force a reload to update the auth state in the app
    } catch (error) {
      console.log('error signing out:', error);
    }
  }

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        const attributesArr = await Auth.userAttributes(user);
        let name = '';
        
        for(let attribute of attributesArr) {
          if (attribute.Name === 'name') {
            name = attribute.Value;
          }
        }

        setUsername(name);
      } catch (error) {
        console.log('error getting user:', error);
      }
    };
    fetchUser();
  }, []);

  return (
    <Navbar expand="lg" className="navigation">
      <Navbar.Brand className="app-name" href="#">Orderfy</Navbar.Brand>
      <Navbar.Brand className="interface-title" href="#">Hello, {username}</Navbar.Brand>
      <Button variant="outline-danger" className="logout-button" onClick={handleLogout}>Logout</Button>
    </Navbar>
  );
}

export default Navigation;