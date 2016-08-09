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
    let canvas = document.createElement('canvas');

    let seriously = new Seriously();
    let reformat = seriously.transform('reformat');

    let source = seriously.source(video);
    source.mode = 'none';

    let target = seriously.target(canvas);

    reformat.width = target.width;
    reformat.height = target.height;
    reformat.mode = 'disort';

    // source.width = canvas.width;
    // source.height = canvas.height;
    let chroma = seriously.effect('chroma');
    // chroma.weight = 1.32;
    chroma.balance = 0;
    chroma.screen = 'rgb(0, 255, 0)';
    chroma.clipWhite = 0.85;
    chroma.clipBlack = 0.5125;

    chroma.source = source;
    
    reformat.source = chroma;
    target.source = reformat;

    seriously.go();

    let videoTexture = new THREE.Texture(canvas);
    let material = new THREE.MeshLambertMaterial({ 
      map : videoTexture,
      transparent: true,
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
      seriously.destroy(); // destroy composition

      video = null;
      canvas = null;
      seriously = null;
      reformat = null;
      source = null;
      target = null;
      chroma = null;
      videoTexture = null;
      material = null;
    };
  });
};
