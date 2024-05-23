import { Button, StyleSheet, Text, View, TextInput } from "react-native";
import { useRef, useState } from "react";

function BadgerRegisterScreen(props) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    function onRegister() {
        if (username.length === 0) {
            setErrorMsg("Please enter a username.");
            return;
        }
        if (password.length === 0) {
            setErrorMsg("Please enter a password.");
            return;
        }
        if (password !== confirmPassword) {
            setErrorMsg("Passwords do not match");
            return;
        }
        setSubmitting(true);
        props.handleSignup(username, password).catch(err => {
            setErrorMsg(err.message);
        }).finally(() => {
            setSubmitting(false);
        });
    }

    return <View style={styles.container}>
        <Text style={{ fontSize: 36 }}>Join BadgerChat!</Text>
        <Text style={{ fontSize: 36 }}>BadgerChat Login</Text>
        <Text style={{ padding: 8 }}>Username</Text>
        <TextInput style={styles.input} value={username} onChangeText={setUsername} />
        <Text style={{ padding: 8 }}>Password</Text>
        <TextInput style={styles.input} textContentType={"password"} secureTextEntry={true} value={password} onChangeText={setPassword} />
        <View style={{ height: 8 }} />
        <Text style={{ padding: 8 }}>Confirm Password</Text>
        <TextInput style={styles.input} textContentType={"password"} secureTextEntry={true} value={confirmPassword} onChangeText={setConfirmPassword} />
        {
            errorMsg.length > 0 ? <Text style={{ padding: 16, color: "red" }}>{errorMsg}</Text> : <></>
        }
        <View style={{ height: 16 }} />
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            <Button color="crimson" title="Signup" disabled={submitting} onPress={() => onRegister()} />
            <View style={{ width: 8 }} />
            <Button color="grey" title="Nevermind!" onPress={() => props.setIsRegistering(false)} />
        </View>
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

export default BadgerRegisterScreen;