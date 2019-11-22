import React from "react";
import "webrtc-adapter";
import faker from "faker";
import SignalingConnection from "./SignalingConnection";
import PeerConnection from "./PeerConnection";

class WebRTCPeerConnectionWithServer extends React.Component {
    state = {
        startDisabled: true,
        callDisabled: true,
        hangUpDisabled: true,
        pc1: null,
        pc2: null,
        localStream: null,
        localStream2: null,
        localStream3: null,
        localStream4: null,
        localStream5: null,
        clientID: new Date().getTime() % 1000,
        username: faker.internet.userName(),
        userList: [],
        streamNo: null
    };

    localVideoRef = React.createRef();
    localVideoRef2 = React.createRef();
    localVideoRef3 = React.createRef();
    localVideoRef4 = React.createRef();
    localVideoRef5 = React.createRef();
    remoteVideoRef = React.createRef();
    peerConnection = null;
    signalingConnection = null;

    setUsername = () => {
        const { username, clientID } = this.state;
        this.signalingConnection.sendToServer({
            name: username,
            date: Date.now(),
            id: clientID,
            type: "username"
        });
    };

    changeUsername = event =>
        this.setState({
            username: event.target.value
        });

    componentDidMount() {
        this.signalingConnection = new SignalingConnection({
            // socketURL: "localhost:6503",
            socketURL: "webrtc-sample-cedgiiiply.now.sh",
            onOpen: () =>
                this.setState({
                    startDisabled: false
                }),
            onMessage: this.onSignalingMessage
        });
    }

    onSignalingMessage = msg => {
        switch (msg.type) {
            case "id":
                this.setState({
                    clientID: msg.id
                });
                this.setUsername();
                break;

            case "rejectusername":
                this.setState({
                    username: msg.name
                });
                console.log(
                    `Your username has been set to <${
                        msg.name
                    }> because the name you chose is in use`
                );
                break;

            case "userlist": // Received an updated user list
                this.setState({
                    userList: msg.users
                });
                break;

            // // Signaling messages: these messages are used to trade WebRTC
            // // signaling information during negotiations leading up to a video
            // // call.

            case "video-offer": // Invitation and offer to chat
                this.createPeerConnection();
                this.peerConnection.videoOffer(msg);
                break;
        }
    };

    gotStream = stream => {
        if (this.state.streamNo == null) {
            this.localVideoRef.current.srcObject = stream;
            this.setState({
                localStream: stream,
                streamNo: 1
            });
            console.log('init 1')
            console.log(this.state)
        } else if (this.state.streamNo == 1){
            this.localVideoRef2.current.srcObject = stream;
            this.setState({
                localStream2: stream,
                streamNo: 2
            });
            console.log('init 2')
            console.log(this.state)
        } else if (this.state.streamNo == 2){
            this.localVideoRef3.current.srcObject = stream;
            this.setState({
                localStream3: stream,
                streamNo: 3
            });
            console.log('init 3')
            console.log(this.state)
        } else if (this.state.streamNo == 3){
            this.localVideoRef4.current.srcObject = stream;
            this.setState({
                localStream4: stream,
                streamNo: 4
            });
            console.log('init 4')
            console.log(this.state)
        } else if (this.state.streamNo == 4){
            this.localVideoRef5.current.srcObject = stream;
            this.setState({
                localStream5: stream,
                streamNo: 5
            });
            console.log('init 5')
            console.log(this.state)

            this.setState({
                startDisabled: true
            });
        }
        this.setState({
            callDisabled: false,
        });
    };
    gotRemoteTrack = event => {
        let remoteVideo = this.remoteVideoRef.current;

        if (remoteVideo.srcObject !== event.streams[0]) {
            remoteVideo.srcObject = event.streams[0];
        }

        this.setState({
            hangUpDisabled: false
        });
    };
    gotRemoteStream = event => {
        this.remoteVideoRef.current.srcObject = event.stream;
        this.setState({
            hangUpDisabled: false
        });
    };

    initMedia = () => {
        this.setState({
            startDisabled: false
        });
        navigator.mediaDevices
            .getUserMedia({
                audio: true,
                video: true
            })
            .then(this.gotStream)
            .catch(e => alert("getUserMedia() error:" + e.name));
    };

    call = user => {
        this.setState({
            targetUsername: user
        });
        this.createPeerConnection();
    };

    hangUp = () => {
        this.signalingConnection.sendToServer({
            name: this.state.username,
            target: this.state.targetUsername,
            type: "hang-up"
        });
        this.peerConnection.close();
    };

    createPeerConnection = () => {
        if (this.peerConnection) return;

        this.peerConnection = new PeerConnection({
            gotRemoteStream: this.gotRemoteStream,
            gotRemoteTrack: this.gotRemoteTrack,
            signalingConnection: this.signalingConnection,
            onClose: this.closeVideoCall,
            localStream: this.state.localStream,
            localStream2: this.state.localStream2,
            localStream3: this.state.localStream3,
            localStream4: this.state.localStream4,
            localStream5: this.state.localStream5,
            username: this.state.username,
            targetUsername: this.state.targetUsername,
            streamNo: this.state.streamNo
        });
    };

    closeVideoCall = () => {
        this.remoteVideoRef.current.srcObject &&
            this.remoteVideoRef.current.srcObject
                .getTracks()
                .forEach(track => track.stop());
        this.remoteVideoRef.current.src = null;

        this.setState({
            targetUsername: null,
            callDisabled: false
        });
    };

    // newStream = () => {
        
    // }

    // renderMultiple = () => {
    //     return 
    // }

    render() {
        const {
            startDisabled,
            callDisabled,
            hangUpDisabled,
            username,
            userList
        } = this.state;

        return (
            <div>
                <div>
                    Username:{" "}
                    <input
                        type="text"
                        value={username}
                        onChange={this.changeUsername}
                    />
                    <button onClick={this.setUsername}> Set Username </button>
                </div>
                <video
                    ref={this.localVideoRef}
                    autoPlay
                    muted
                    style={{
                        width: "240px",
                        height: "180px"
                    }}
                />
                <video
                    ref={this.localVideoRef2}
                    autoPlay
                    muted
                    style={{
                        width: "240px",
                        height: "180px"
                    }}
                />
                <video
                    ref={this.localVideoRef3}
                    autoPlay
                    muted
                    style={{
                        width: "240px",
                        height: "180px"
                    }}
                />
                <video
                    ref={this.localVideoRef4}
                    autoPlay
                    muted
                    style={{
                        width: "240px",
                        height: "180px"
                    }}
                />
                <video
                    ref={this.localVideoRef5}
                    autoPlay
                    muted
                    style={{
                        width: "240px",
                        height: "180px"
                    }}
                />
                <video
                    ref={this.remoteVideoRef}
                    autoPlay
                    muted
                    style={{
                        width: "240px",
                        height: "180px"
                    }}
                />
                <div>
                    <button onClick={this.initMedia} disabled={startDisabled}>
                        Init Media
                    </button>
                    <button onClick={this.hangUp} disabled={hangUpDisabled}>
                        Hang Up
                    </button>
                    <button onClick={this.newStream} disabled={hangUpDisabled}>
                        Hang Up
                    </button>
                </div>
                <div>
                    <ul>
                        {userList.map(user => (
                            <li key={user}>
                                {user}
                                {"  "}
                                {user !== username ? (
                                    <button
                                        onClick={() => this.call(user)}
                                        disabled={callDisabled}
                                    >
                                        Call
                                    </button>
                                ) : null}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    }
}

export default WebRTCPeerConnectionWithServer;



// WEBPACK FOOTER //
// ./src/WebRTCPeerConnectionWithServer.js