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

// getVideoMaterialRenderer$
export const getVideoMaterial$ = (mediaStream) => Rx.Observable.create(observer => {
  let video = createVideo(mediaStream);
  let videoTexture = new THREE.Texture(video);
  let material = new THREE.MeshLambertMaterial({ map : videoTexture });

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
    videoTexture = null;
    material = null;
  };
});
