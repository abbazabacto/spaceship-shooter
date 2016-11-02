import Rx from 'rx';

const createVideo = (mediaStream) => {
  const video = document.createElement('video');
  if (typeof mediaStream === 'string') {
    video.src = document.location.href + mediaStream;
    video.play();
  } else {
    video.srcObject = mediaStream;
  }

  return video;
};

export const getVideoMaterialRenderer$ = (mediaStream) => {
  let video = createVideo(mediaStream);

  return Rx.Observable.create(observer => {
    let videoTexture = new THREE.Texture(video);
    let material = new THREE.MeshBasicMaterial({ 
      map: videoTexture,
    });

    videoTexture.minFilter = THREE.LinearFilter;

    observer.next(() => {
      if (video && video.ended) {
        observer.completed();
      }

      if (video && video.readyState === video.HAVE_ENOUGH_DATA){
        videoTexture.needsUpdate = true;
      }

      return material;
    });

    return () => {
      video.pause();
      video = null;

      videoTexture.needsUpdate = false;
      videoTexture = null;
      material = null;
    };
  });
};
