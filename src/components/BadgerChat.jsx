import { useEffect, useState } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';

import * as SecureStore from 'expo-secure-store';
import BadgerChatroomScreen from './screens/BadgerChatroomScreen';
import BadgerRegisterScreen from './screens/BadgerRegisterScreen';
import BadgerLoginScreen from './screens/BadgerLoginScreen';
import BadgerLandingScreen from './screens/BadgerLandingScreen';
import CS571 from '@cs571/mobile-client';

const ChatDrawer = createDrawerNavigator();

export default function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false);
  const [chatrooms, setChatrooms] = useState([]);

  useEffect(() => {
    fetch("https://cs571.org/api/f23/hw9/chatrooms", {
      method: 'GET',
      headers: {
        "X-CS571-ID": CS571.getBadgerId(),
      },
    }).then(async res => {
      const json = await res.json();
      if (res.status === 200) {
        return json;
      } else {
        throw new Error(json.msg);
      }
    }).then(json => {
      setChatrooms(json);
    });
  }, []);

  async function handleLogin(username, password) {
    return fetch("https://cs571.org/api/f23/hw9/login", {
      method: 'POST',
      headers: {
        "X-CS571-ID": CS571.getBadgerId(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "username": username,
        "password": password,
      }),
      credentials: "include"
    }).then(async res => {
      const json = await res.json();
      if (res.status === 200) {
        return json;
      } else {
        throw new Error(json.msg);
      }
    }).then(json => {
      const userInfo = json.user;
      SecureStore.setItemAsync("userInfo", JSON.stringify(userInfo));
      setIsLoggedIn(true);
    }); // I should really do a fetch to login first!
  }

  async function handleSignup(username, password) {
    return fetch("https://cs571.org/api/f23/hw9/register", {
      method: 'POST',
      headers: {
        "X-CS571-ID": CS571.getBadgerId(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "username": username,
        "password": password,
      }),
      credentials: "include"
    }).then(async res => {
      const json = await res.json();
      if (res.status === 200) {
        return json;
      } else {
        throw new Error(json.msg);
      }
    }).then(json => {
      const userInfo = json.user;
      SecureStore.setItemAsync("userInfo", JSON.stringify(userInfo));
      setIsLoggedIn(true); // I should really do a fetch to register first!
    });
  }

  if (isLoggedIn) {
    return (
      <NavigationContainer>
        <ChatDrawer.Navigator>
          <ChatDrawer.Screen name="Landing" component={BadgerLandingScreen} />
          {
            chatrooms.map(chatroom => {
              return <ChatDrawer.Screen key={chatroom} name={chatroom}>
                {(props) => <BadgerChatroomScreen name={chatroom} />}
              </ChatDrawer.Screen>
            })
          }
        </ChatDrawer.Navigator>
      </NavigationContainer>
    );
  } else if (isRegistering) {
    return <BadgerRegisterScreen handleSignup={handleSignup} setIsRegistering={setIsRegistering} />
  } else {
    return <BadgerLoginScreen handleLogin={handleLogin} setIsRegistering={setIsRegistering} />
  }
}