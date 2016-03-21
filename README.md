# first-webrtc

Sequense
===

0. offer: new RTCPeerConnection
0. offer: createDataChannel()
0. offer: createOffer()
0. offer: setLocalDescription()
0. offer: onIceCanaidate fetch LocalSDP, and send to answer
0. answer: new RTCPeerConnection
0. answer: setRemoteDescription(offer.localSDP)
0. answer: createAnswer()
0. answer: setLocalDescription()
0. answer: onIceCanaidate fetch LocalSDP, and send to offer
0. offer: setRemoteDescription(answer.localSDP)
