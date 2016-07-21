import Rx from 'rx';

const devices$ = Rx.Observable.fromPromise(navigator.mediaDevices && navigator.mediaDevices.enumerateDevices && navigator.mediaDevices.enumerateDevices());

const videoInput$ = devices$
  .map(devices => devices.filter(device => device.kind === 'videoinput'))
  .filter(devices => devices && devices.length)
  // take back-cam only (assumption.. last, of multiple cams)
  .filter(devices => devices.length > 1)
  .map(devices => devices[devices.length - 1]);

const mediaStream$ = videoInput$
  .map(videoDevice => videoDevice.deviceId)
  .flatMapLatest(videoDeviceId =>
    Rx.Observable.fromPromise(
      navigator.mediaDevices.getUserMedia({
        video : {
          deviceId: {
            exact: videoDeviceId,
          }
        },
        audio: false,
      }))
  );

const gameElement = document.getElementsByTagName('game')[0];

export const webRtcVideo$ = mediaStream$.flatMap(mediaStream =>
  Rx.Observable.create(observer => {
    const videoHolder = document.createElement('video-holder');
    positionElement(videoHolder);

    const video = document.createElement('video');
    positionElement(video);
    video.srcObject = mediaStream;

    videoHolder.appendChild(video);
    gameElement.insertBefore(videoHolder, gameElement.children[0]);

    let videoStereoHolder;
    let videoStereo;

    observer.next(enableWebRtcStereo => {
      if (enableWebRtcStereo) {
        videoStereoHolder = document.createElement('video-holder');
        positionElement(videoHolder);

        videoStereo = document.createElement('video');
        positionElement(videoStereo);
        videoStereo.src = video.src;

        positionElement(videoHolder, 'left');
        positionElement(video, 'left');
        positionElement(videoStereoHolder, 'right');
        positionElement(videoStereo, 'right');

        videoStereoHolder.appendChild(videoStereo);
        gameElement.insertBefore(videoStereoHolder, gameElement.children[0]);
      } else {
        // videoStereoHolder && gameElement.remove(videoStereoHolder);
        positionElement(video);
        positionElement(videoHolder);
      }

      return enableWebRtcStereo;
    });

    return () => {
      gameElement.removeChild(videoHolder);
      videoStereoHolder && gameElement.removeChild(videoStereoHolder);
      mediaStream.getVideoTracks().forEach(videoTrack => videoTrack.stop());
    };
  })
);

const stereoDeviation = '4vw';

function positionElement(element, eye) {
  const isVideo = element.tagName.toLowerCase() === 'video';

  element.style.position = 'absolute';
  element.style.left = '50%';
  element.style.top = '50%';
  element.style.minHeight = '100vh';
  element.style.marginLeft = '';
  element.style.marginRight = '';
  element.style.minWidth = '100vw';
  element.style.transform = 'translateX(-50%) translateY(-50%)';

  if (eye) {
    if (isVideo) {
      if (eye === 'left') {
        element.style.transform = `translateX(-50%) translateY(-50%) translateX(-${stereoDeviation})`;
      } else {
        element.style.transform = `translateX(-50%) translateY(-50%) translateX(${stereoDeviation})`;
      }
    } else {
      element.style.minWidth = '50vw';
      element.style.transform = 'translateY(-50%)';

      if (eye === 'left') {
        element.style.left = '0';
      } else {
        element.style.left = '';
        element.style.right = '0';
      }
    }
  }
}
