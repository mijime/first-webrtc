const RTCPeerConnection =
RTCPeerConnection ||
webkitRTCPeerConnection ||
mozRTCPeerConnection;

class PeerConnection {
  constructor({name, type, provider}, ...args) {
    this.name = name;
    this.type = type;
    this.provider = provider;

    this.peer = new RTCPeerConnection(...args);
    this.peer.ondatachannel = this.onDataChannel.bind(this);
    this.peer.onicecandidate = this.onIceCandidate.bind(this);
    this.peer.onsignalingstatechange = this.onLog.bind(this);
    this.peer.oniceconnectionstatechange = this.onLog.bind(this);
    this.peer.onnegotiationneeded = this.onLog.bind(this);
  }

  setRemoteDescription (sdp) {
    console.log(new Date(), this, 'setRemoteDescription', sdp);
    this.peer.setRemoteDescription(sdp);
    return sdp;
  }

  onIceCandidate (e) {
    console.log(new Date(), this, e.type, e);

    if (e.candidate && this.peer.remoteDescription.type != '')
      return this.addIceCandidate(e.candidate);
    else
      return this.provider.send({
        id: this.name,
        type: this.type,
      }, this.peer.localDescription);
  }

  setLocalDescription (sdp) {
    console.log(new Date(), this, 'setLocalDescription', sdp);
    this.peer.setLocalDescription(sdp);
    return sdp;
  }

  receiveOffer () {
    return this.provider.receive({
      id: this.name,
      type: 'offer',
    })
    .then(sdp => this.setRemoteDescription(sdp));
  }

  receiveAnswer () {
    return this.provider.receive({
      id: this.name,
      type: 'answer',
    })
    .then(sdp => this.setRemoteDescription(sdp));
  }

  createOffer (optional) {
    console.log(new Date(), this, 'createOffer', optional);
    return new Promise(resolve => this.peer.createOffer(resolve, this.onError.bind(this), optional))
      .then(sdp => this.setLocalDescription(sdp));
  }

  createAnswer (optional) {
    console.log(new Date(), this, 'createAnswer', optional);
    return new Promise(resolve => this.peer.createAnswer(resolve, this.onError.bind(this), optional))
      .then(sdp => this.setLocalDescription(sdp));
  }

  onDataChannel (e) {
    console.log(new Date(), this, e.type, e);
    this.channel = e.channel;
  }

  onError (e) {
    console.log(new Date(), this, e.type, e);
  }

  onOpen (e) {
    console.log(new Date(), this, e.type, e);
  }

  onMessage (e) {
    console.log(new Date(), this, e.type, e);
  }

  onClose (e) {
    console.log(new Date(), this, e.type, e);
  }

  onLog (e) {
    console.log(new Date(), this, e.type, e);
  }

  addIceCandidate (candidate) {
    console.log(new Date(), this, candidate);
    return this.peer.addIceCandidate(candidate);
  }

  createDataChannel ({label, optional}) {
    const channel = this.peer.createDataChannel(label, optional);

    channel.onerror = this.onLog.bind(this);
    channel.onmessage = this.onLog.bind(this);
    channel.onopen = this.onLog.bind(this);
    channel.onclose = this.onLog.bind(this);

    return channel;
  }
}

class Provider {
  send ({id, type}, sdp) {
    return fetch(`/api/${type}/${id}`, {
      method: 'POST',
      body: JSON.stringify(sdp),
    });
  }

  receive ({id, type}) {
    return new Promise(resolve => {
      const pid = setInterval(() => {
        return fetch(`/api/${type}/${id}`)
          .then(e => e.json())
          .then(sdp => new RTCSessionDescription(sdp))
          .then(resolve)
          .then(() => clearInterval(pid));
      }, 1000 * 5);
    });
  }
}

const iceServers = [];
const optional = [{RtcDataChannels: true}];
const provider = new Provider();

window.createOffer = (name) => {
  const pc = new PeerConnection({
    name,
    provider,
    type: 'offer',
  }, {iceServers}, {optional});
  const dc = pc.createDataChannel({label:'CHANNEL'});

  pc.createOffer().then(() => pc.receiveAnswer());

  return {pc,dc};
}

window.createAnswer = (name) => {
  const pc = new PeerConnection({
    name,
    provider,
    type: 'answer',
  }, {iceServers}, {optional});
  const dc = pc.createDataChannel({label:'CHANNEL'});

  pc.receiveOffer().then(() => pc.createAnswer());

  return {pc,dc};
}
