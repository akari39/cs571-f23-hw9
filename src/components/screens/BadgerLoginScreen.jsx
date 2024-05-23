import { useRef, useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

function BadgerLoginScreen(props) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    function onLogin() {
        if (username.length === 0 || password.length === 0) {
            setErrorMsg('You must provide both a username and password!');
            return;
        }
        setSubmitting(true);
        props.handleLogin(username, password).catch(err => {
            setErrorMsg(err.message);
        }).finally(() => {
            setSubmitting(false);
        });
    }

    return <View style={styles.container}>
        <Text style={{ fontSize: 36 }}>BadgerChat Login</Text>
        <Text style={{ padding: 8 }}>Username</Text>
        <TextInput style={styles.input} value={username} onChangeText={setUsername} />
        <Text style={{ padding: 8 }}>Password</Text>
        <TextInput style={styles.input} textContentType={"password"} secureTextEntry={true} value={password} onChangeText={setPassword} />
        <View style={{ height: 8 }} />
        <Button color="crimson" title="Login" disabled={submitting} onPress={() => onLogin()} />
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