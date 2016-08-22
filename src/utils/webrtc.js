import Rx from 'rx';

const devices$ = Rx.Observable.fromPromise(navigator.mediaDevices && navigator.mediaDevices.enumerateDevices && navigator.mediaDevices.enumerateDevices());

const videoInput$ = devices$
  .map(devices => devices.filter(device => device.kind === 'videoinput'))
  .filter(devices => devices && devices.length)
  // take back-cam only (assumption.. last, of multiple cams)
  // .filter(devices => devices.length > 1)
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
    let video = document.createElement('video');
    video.srcObject = mediaStream;

    observer.next(video);

    return () => {
      mediaStream.getVideoTracks().forEach(videoTrack => videoTrack.stop());
      video = null;
    };
  })
);
