import { useEffect, useState } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';

import * as SecureStore from 'expo-secure-store';
import BadgerChatroomScreen from './screens/BadgerChatroomScreen';
import BadgerRegisterScreen from './screens/BadgerRegisterScreen';
import BadgerLoginScreen from './screens/BadgerLoginScreen';
import BadgerLandingScreen from './screens/BadgerLandingScreen';
import BadgerLogoutScreen from './screens/BadgerLogoutScreen';
import CS571 from '@cs571/mobile-client';
import BadgerConversionScreen from './screens/BadgerConversionScreen';

const ChatDrawer = createDrawerNavigator();

export default function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isGuestVisiting, setIsGuestVisiting] = useState(false);
  const [chatrooms, setChatrooms] = useState([]);

  useEffect(() => {
    checkLoginStatus();
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
    }).catch(err => {
      alert(err);
    });
  }, []);

  async function checkLoginStatus() {
    const userInfo = await SecureStore.getItemAsync("userInfo");
    if (userInfo !== undefined && userInfo !== null && userInfo.length > 0 && userInfo !== "{}") {
      setIsLoggedIn(true);
    }
  }


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
      })
    }).then(async res => {
      const json = await res.json();
      if (res.status === 200) {
        return json;
      } else {
        throw new Error(json.msg);
      }
    }).then(json => {
      SecureStore.setItemAsync("userInfo", JSON.stringify(json));
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
      })
    }).then(async res => {
      const json = await res.json();
      if (res.status === 200) {
        return json;
      } else {
        throw new Error(json.msg);
      }
    }).then(json => {
      SecureStore.setItemAsync("userInfo", JSON.stringify(json));
      setIsLoggedIn(true); // I should really do a fetch to register first!
    });
  }

  function guestVisit() {
    setIsGuestVisiting(true);
  }

  function goToSignUp() {
    setIsGuestVisiting(false);
    setIsRegistering(true);
  }

  function logout() {
    SecureStore.deleteItemAsync("userInfo");
    setIsLoggedIn(false);
  }

  if (isLoggedIn || isGuestVisiting) {
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
          {
            !isGuestVisiting ? <ChatDrawer.Screen name="Logout" component={(props) => <BadgerLogoutScreen logout={logout} />} options={{
              drawerActiveBackgroundColor: "rgba(255, 0, 0, 0.2)",
              drawerLabelStyle: { color: "red" }
            }} /> : <ChatDrawer.Screen name="Signup" component={(props) => <BadgerConversionScreen goToSignUp={goToSignUp} />} options={{
              drawerActiveBackgroundColor: "rgba(255, 0, 0, 0.2)",
              drawerLabelStyle: { color: "red" }
            }} />
          }
        </ChatDrawer.Navigator>
      </NavigationContainer>
    );
  } else if (isRegistering) {
    return <BadgerRegisterScreen handleSignup={handleSignup} setIsRegistering={setIsRegistering} />
  } else {
    return <BadgerLoginScreen handleLogin={handleLogin} setIsRegistering={setIsRegistering} guestVisit={guestVisit} />
  }
}