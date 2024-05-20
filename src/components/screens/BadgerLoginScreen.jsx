import { useRef, useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";
import * as SecureStore from 'expo-secure-store';

function BadgerLoginScreen(props) {
    const usernameInput = useRef();
    const passwordInput = useRef();
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    function onLogin() {
        const username = usernameInput.current.value;
        const password = passwordInput.current.value;
        if (username.length === 0 || password.length === 0) {
            setErrorMsg('You must provide both a username and password!');
            return;
        }
        setSubmitting(true);
        fetch("https://cs571.org/api/f23/hw9/login", {
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
            setErrorMsg(json.msg);
            const userInfo = json.user;
            SecureStore.setItemAsync("userInfo", JSON.stringify(userInfo));
        }).catch(err => {
            setErrorMsg(err.message);
        }).finally(() => {
            setSubmitting(false);
        });
    }

    return <View style={styles.container}>
        <Text style={{ fontSize: 36 }}>BadgerChat Login</Text>
        <Text style={{ padding: 8 }}>Username</Text>
        <TextInput style={styles.input} ref={usernameInput} />
        <Text style={{ padding: 8 }}>Password</Text>
        <TextInput style={styles.input} textContentType={"password"} secureTextEntry={true} ref={passwordInput} />
        <View style={{ height: 8 }} />
        <Button color="crimson" title="Login" onPress={() => {
            props.handleLogin("myusername", "mypassword")
        }} />
        {
            errorMsg.length > 0 ? <Text style={{ padding: 16, color: "red" }}>{errorMsg}</Text> : <></>
        }
        <Text style={{ padding: 16 }}>New here?</Text>
        <Button color="grey" title="Signup" onPress={() => props.setIsRegistering(true)} />
    </View>;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    input: {
        height: 40,
        width: 180,
        borderWidth: 1,
        padding: 10,
    },
});

export default BadgerLoginScreen;