import { useEffect, useState } from "react";
import { Button, RefreshControl, ScrollView, StyleSheet, Text, View, TextInput } from "react-native";
import * as SecureStore from 'expo-secure-store';
import { Modal } from "react-native";
import CS571 from "@cs571/mobile-client";

function BadgerChatroomScreen(props) {
    const MAX_PAGE_NUM = 4;
    const [userInfo, setUserInfo] = useState({});
    const [chatMessages, setChatMessages] = useState([]);
    const [pageNum, setPageNum] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showAddPostModal, setShowAddPostModal] = useState(false);

    useEffect(() => {
        readUserInfo();
        loadChatroom(pageNum);
    }, []);

    useEffect(() => {
        loadChatroom(pageNum);
    }, [pageNum]);

    async function readUserInfo() {
        const userInfo = await SecureStore.getItemAsync("userInfo");
        setUserInfo(JSON.parse(userInfo));
    }

    function loadChatroom(index) {
        setLoading(true);
        fetch(`https://cs571.org/api/f23/hw9/messages?chatroom=${props.name}&page=${index}`, {
            method: "GET",
            headers: {
                "X-CS571-ID": CS571.getBadgerId(),
                "Content-Type": "application/json",
            },
        }).then(async res => {
            const json = await res.json();
            if (res.status === 200) {
                return json;
            } else {
                throw new Error(json.msg);
            }
        }).then(json => {
            setChatMessages(json.messages);
        }).catch(err => {
            alert(err);
        }).finally(() => {
            setLoading(false);
        });
    }

    async function deletePost(id) {
        fetch(`https://cs571.org/api/f23/hw9/messages?id=${id}`, {
            method: "DELETE",
            headers: {
                "X-CS571-ID": CS571.getBadgerId(),
                "Content-Type": "application/json",
                "Authorization": `Bearer ${userInfo.token}`
            },
        }).then(async res => {
            const json = await res.json();
            alert(json.msg);
        }).then(_ => {
            loadChatroom(pageNum);
        });
    }

    const [createPostTitle, setCreatePostTitle] = useState("");
    const [createPostContent, setCreatePostContent] = useState("");
    const [creatingPost, setCreatingPost] = useState(false);

    function createPost() {
        setCreatingPost(true);
        fetch(`https://cs571.org/api/f23/hw9/messages?chatroom=${props.name}`, {
            method: "POST",
            headers: {
                "X-CS571-ID": CS571.getBadgerId(),
                "Content-Type": "application/json",
                "Authorization": `Bearer ${userInfo.token}`
            },
            body: JSON.stringify({
                "title": createPostTitle,
                "content": createPostContent
            })
        }).then(async res => {
            setShowAddPostModal(false);
            setCreatePostTitle("");
            setCreatePostContent("");
            const json = await res.json();
            alert(json.msg);
            loadChatroom(pageNum);
        }).finally(() => {
            setCreatingPost(false);
        });
    }

    return <View style={{ flex: 1 }}>
        <Modal
            animationType="slide"
            visible={showAddPostModal}
            transparent={true}
            statusBarTranslucent={true}
            presentationStyle={"pageSheet"}>
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={{ fontSize: 20 }}>Create a Post</Text>
                    <View style={{ height: 8 }} />
                    <Text style={{ fontSize: 20 }}>Title</Text>
                    <View style={{ height: 4 }} />
                    <TextInput style={styles.input} value={createPostTitle} onChangeText={setCreatePostTitle} />
                    <View style={{ height: 8 }} />
                    <Text style={{ fontSize: 20 }}>Body</Text>
                    <View style={{ height: 4 }} />
                    <TextInput style={[styles.input, { height: 100 }]} value={createPostContent} onChangeText={setCreatePostContent} />
                    <View style={{ height: 16 }} />
                    <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center" }}>
                        <Button title="CREATE POST" disabled={createPostTitle.length === 0 && createPostContent.length === 0 && !creatingPost} onPress={createPost} />
                        <View style={{ width: 8 }} />
                        <Button title="CANCEL" color={"grey"} onPress={() => { setShowAddPostModal(false); }} />
                    </View>
                </View>
            </View>
        </Modal>
        <View style={{ flex: 1 }}>
            <ScrollView
                contentContainerStyle={{ paddingTop: 4, paddingBottom: 4 }}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={() => loadChatroom(pageNum)}
                    />
                }>
                {
                    chatMessages.map(message => {
                        return <View key={message.id} style={[styles.card, {
                            margin: 4
                        }]}>
                            <Text style={styles.title}>{message.title}</Text>
                            <Text>by {message.poster} | Posted on {new Date(message.created).toLocaleDateString("en-US")} at {new Date(message.created).toLocaleTimeString("en-US")}</Text>
                            <View style={{ height: 4 }} />
                            <Text style={styles.content}>{message.content}</Text>
                            <View style={{ height: 4 }} />
                            {userInfo.user.username === message.poster ? <Button title="DELETE POST" color={"red"} onPress={() => {
                                deletePost(message.id);
                            }} /> : <></>}
                        </View>;
                    })
                }
            </ScrollView>
            <View style={{ backgroundColor: "white" }}>
                <Text style={{ padding: 8, textAlign: "center" }}>You are on page {pageNum} of {MAX_PAGE_NUM}</Text>
                <View style={{ flexDirection: "row", justifyContent: "center", alignItems: 'stretch' }}>
                    <View style={{ flex: 1 }}>
                        <Button title="PREVIOUS PAGE" disabled={pageNum <= 1} onPress={() => {
                            setPageNum(pageNum - 1);
                        }} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Button title="NEXT PAGE" disabled={pageNum >= MAX_PAGE_NUM} onPress={() => {
                            setPageNum(pageNum + 1);
                        }} />
                    </View>
                </View>
            </View>
            <View style={{ width: "100%" }}>
                <Button title="ADD POST" color="#802015" onPress={() => { setShowAddPostModal(true); }} />
            </View>
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
    card: {
        padding: 16,
        elevation: 5,
        borderRadius: 10,
        backgroundColor: "white",
    },
    title: {
        fontSize: 22,
        fontWeight: "500",
    },
    content: {
        fontSize: 16
    },
    centeredView: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalView: {
        width: "75%",
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'flex-start',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    input: {
        height: 40,
        width: "100%",
        borderWidth: 1,
        padding: 10,
    }
});

export default BadgerChatroomScreen;