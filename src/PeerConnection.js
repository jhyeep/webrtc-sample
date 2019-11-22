class PeerConnection {
    constructor({
        gotRemoteStream,
        gotRemoteTrack,
        signalingConnection,
        onClose,
        localStream,
        localStream2,
        localStream3,
        localStream4,
        localStream5,
        username,
        targetUsername,
        streamNo
    }) {
        this.signalingConnection = signalingConnection;
        this.onClose = onClose;
        this.localStream = localStream;
        this.localStream2 = localStream2;
        this.localStream3 = localStream3;
        this.localStream4 = localStream4;
        this.localStream5 = localStream5;
        this.username = username;
        this.targetUsername = targetUsername;
        this.streamNo = streamNo;

        this.peerConnection = new RTCPeerConnection({
            iceServers: [{
                urls: `turn:${window.location.hostname}`,
                username: "webrtc",
                credential: "turnserver"
            }]
        });
        this.peerConnection.onicecandidate = this.handleICECandidateEvent;
        this.peerConnection.oniceconnectionstatechange = this.handleICEConnectionStateChangeEvent;
        // peerConnection.onicegatheringstatechange = this.handleICEGatheringStateChangeEvent;
        this.peerConnection.onsignalingstatechange = this.handleSignalingStateChangeEvent;
        this.peerConnection.onnegotiationneeded = this.handleNegotiationNeededEvent;
        this.peerConnection.onaddtrack = gotRemoteTrack;
        this.peerConnection.onaddstream = gotRemoteStream;

        console.log(localStream.getTracks());
        this.peerConnection.addStream(this.localStream);
        if (this.streamNo >= 2) {
            console.log(localStream2.getTracks());
            this.peerConnection.addStream(this.localStream2);
        }
        if (this.streamNo >= 3) {
            console.log(localStream3.getTracks());
            this.peerConnection.addStream(this.localStream3);
        }
        if (this.streamNo >= 4) {
            console.log(localStream4.getTracks());
            this.peerConnection.addStream(this.localStream4);
        }
        if (this.streamNo >= 5) {
            console.log(localStream5.getTracks());
            this.peerConnection.addStream(this.localStream5);
        }

        this.msgUnlisten = this.signalingConnection.addMsgListener(this.onSignalingMessage);

        console.log("peerconnection created", this.peerConnection);
    }

    handleICECandidateEvent = event => {
        if (event.candidate) {
            this.signalingConnection.sendToServer({
                type: "new-ice-candidate",
                target: this.targetUsername,
                candidate: event.candidate
            });
        }
    };

    handleICEConnectionStateChangeEvent = event => {
        switch (this.peerConnection.iceConnectionState) {
            case "closed":
            case "failed":
            case "disconnected":
                this.close();
        }
    };

    handleSignalingStateChangeEvent = event => {
        switch (this.peerConnection.signalingState) {
            case "closed":
                this.close();
        }
    };

    handleNegotiationNeededEvent = () => {
        const {
            username,
            targetUsername
        } = this;
        this.peerConnection
            .createOffer()
            .then(offer => this.peerConnection.setLocalDescription(offer))
            .then(() =>
                this.signalingConnection.sendToServer({
                    name: username,
                    target: targetUsername,
                    type: "video-offer",
                    sdp: this.peerConnection.localDescription
                })
            )
            .catch(console.error);
    };

    videoOffer = ({
        sdp
    }) => {
        const {
            username,
            targetUsername
        } = this;

        this.peerConnection
            .setRemoteDescription(new RTCSessionDescription(sdp))
            .then(() => this.peerConnection.createAnswer())
            .then(answer => {
                return this.peerConnection.setLocalDescription(answer);
            })
            .then(() => {
                this.signalingConnection.sendToServer({
                    name: username,
                    targetUsername: targetUsername,
                    type: "video-answer",
                    sdp: this.peerConnection.localDescription
                });
            })
            .catch(console.error);
    }

    videoAnswer = ({
        sdp
    }) => {
        this.peerConnection
            .setRemoteDescription(new RTCSessionDescription(sdp))
            .catch(console.error);
    }

    newICECandidate = ({
        candidate
    }) => {
        this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }

    onSignalingMessage = (msg) => {
        switch (msg.type) {
            case "video-answer": // Callee has answered our offer
                this.videoAnswer(msg);
                break;

            case "new-ice-candidate": // A new ICE candidate has been received
                this.newICECandidate(msg)
                break;

            case "hang-up": // The other peer has hung up the call
                this.close()
                break;
        }
    }

    close = () => {
        this.peerConnection.close();
        this.peerConnection = null;

        this.onClose()
    }

}

export default PeerConnection;


// WEBPACK FOOTER //
// ./src/PeerConnection.js