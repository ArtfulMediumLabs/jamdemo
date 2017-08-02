// grab the room from the URL
// var room = location.search && location.search.split('?')[1];
var room = 'Practice Room';

// create our webrtc connection
var webrtc = new SimpleWebRTC({
    // the id/element dom element that will hold "our" video
    localVideoEl: 'localVideo',
    // the id/element dom element that will hold remote videos
    remoteVideosEl: '',
    // immediately ask for camera access
    autoRequestMedia: true,
    debug: false,
    detectSpeakingEvents: true
});

console.log(webrtc);

//when it's ready, join if we got a room from the URL
webrtc.on('readyToCall', function () {
    // you can name it anything
    if (room) webrtc.joinRoom(room);
});

function showVolume(el, volume) {
    if (!el) return;
    if (volume < -45) { // vary between -45 and -20
        el.style.height = '0px';
    } else if (volume > -20) {
        el.style.height = '100%';
    } else {
        el.style.height = '' + Math.floor((volume + 100) * 100 / 25 - 220) + '%';
    }
}
webrtc.on('channelMessage', function (peer, label, data) {
    if (data.type == 'volume') {
        showVolume(document.getElementById('micVolume' + peer.id), (data.volume * 10 + '%') );
    }
});
webrtc.on('videoAdded', function (video, peer) {
    console.log('video added', peer);
    var remotes = document.getElementById('remotes');
    if (remotes) {
        var d = document.createElement('div');
        d.className = 'videoContainer';
        d.id = 'container_' + webrtc.getDomId(peer);
        d.appendChild(video);
        var vol = document.createElement('div');
        vol.id = 'volume_' + peer.id;
        vol.className = 'volume_bar';
        // video.onclick = function () {
        //     video.style.width = video.videoWidth + 'px';
        //     video.style.height = video.videoHeight + 'px';
        // };
        d.appendChild(vol);
        remotes.appendChild(d);
    }
});
webrtc.on('videoRemoved', function (video, peer) {
    console.log('video removed ', peer);
    var remotes = document.getElementById('remotes');
    var el = document.getElementById('container_' + webrtc.getDomId(peer));
    if (remotes && el) {
        remotes.removeChild(el);
    }
});
webrtc.on('volumeChange', function (volume, treshold) {
    //console.log('own volume', volume);
    showVolume(document.getElementById('localVolume'), volume);
});

// Since we use this twice we put it here
function setRoom(name) {
    $('form').remove();
    $('h1').text(room);
    $('#subTitle').html('Link to join: <a href="' + location.href + '">' + location.href + '</a>');
    $('body').addClass('active');
}

// if (room) {
//     setRoom(room);
// } else {
//     // $('form').submit(function () {
//     //     var val = $('#sessionInput').val().toLowerCase().replace(/\s/g, '-').replace(/[^A-Za-z0-9_\-]/g, '');
//     //     webrtc.createRoom(val, function (err, name) {
//     //         console.log(' create room cb', arguments);

//     //         var newUrl = location.pathname + '?' + name;
//     //         if (!err) {
//     //             history.replaceState({foo: 'bar'}, null, newUrl);
//     //             setRoom(name);
//     //         } else {
//     //             console.log(err);
//     //         }
//     //     });
//     //     return false;
//     // });
// }

var button = $('#screenShareButton'),
    setButton = function (bool) {
        button.text(bool ? 'share screen' : 'stop sharing');
    };
webrtc.on('localScreenStopped', function () {
    setButton(true);
});

setButton(true);

button.click(function () {
    if (webrtc.getLocalScreen()) {
        webrtc.stopScreenShare();
        setButton(true);
    } else {
        webrtc.shareScreen(function (err) {
            if (err) {
                setButton(true);
            } else {
                setButton(false);
            }
        });

    }
});

/*
*  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
*
*  Use of this source code is governed by a BSD-style license
*  that can be found in the LICENSE file in the root of the source
*  tree.
*/
var audioInputSelect = document.querySelector('#audioSource');

function gotDevices(deviceInfos) {
  //console.log(deviceInfos);
  for (var i = 0; i !== deviceInfos.length; ++i) {
    var deviceInfo = deviceInfos[i];
    var option = document.createElement('option');
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === 'audioinput') {
        option.text = deviceInfo.label || 'microphone ' + (audioInputSelect.length + 1);
        audioInputSelect.appendChild(option);
    } else {
      //console.log('Some other kind of source/device: ', deviceInfo);
    }
  }
}
function handleError(error) {
  console.log('navigator.getUserMedia error: ', error);
}

navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);

/**----------------------------------------------------------------------* 
 * END WebRTC BSD-style license
 */ 

/**
 * Listener function for changing audio source input
 */
function changeAudioSource() {
    var audioSource = audioInputSelect.value;
    var constraints = {
        audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
        video: true
    };
    webrtc.config.media = constraints;
    console.log("changed audio source to " + '"' + audioInputSelect.options[audioInputSelect.selectedIndex].text + '"');
}

audioInputSelect.addEventListener('change', function() {
    changeAudioSource();
});

/**
 * Active/Deactivate mic
 */
var micMuteButton = document.querySelector('#micMute');
micMuteButton.addEventListener('click', toggleMic, false);
var micState = 'active';
renderMicButton(micState);

function toggleMic() {
    if(micState == 'active') {
        webrtc.mute();
        micState = 'inactive';
    } else {
        webrtc.unmute();
        micState = 'active';
        micMuteButton.classList.remove('active');
    }
    renderMicButton(micState);
}

function renderMicButton(micState) {
    if(micState == 'active') {
        micMuteButton.classList.add('active');
    } else {
        micMuteButton.classList.remove('active'); 
    }
}