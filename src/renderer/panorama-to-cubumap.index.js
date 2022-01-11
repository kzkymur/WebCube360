const { createCanvas, loadImage } = require('canvas');

const origincanvas = createCanvas();
const originctx = origincanvas.getContext('2d');

const canvases = [];
for (let i=0; i<6; i++) { canvases.push(createCanvas()); }
const ctxs = canvases.map(canvas => canvas.getContext('2d'));

const { renderFace } = require('./convert');


const getDataURL = (imgData, i) => {
  canvases[i].width = imgData.width;
  canvases[i].height = imgData.height;
  ctxs[i].putImageData(imgData, 0, 0);
  return new Promise(resolve => resolve(canvases[i]));
}


const convertImage = (src, usrOptions) => {
  const options = {
    rotation: 180,
    interpolation: 'lanczos',
    outformat: 'jpg',
    outtype: 'file',
    width: Infinity,
    ...usrOptions
  }
  return new Promise(resolve => {
    loadImage(src).then((img) => {
      const { width, height } = img;
      origincanvas.width = width / 8;
      origincanvas.height = height / 8;
      originctx.drawImage(img, 0, 0, origincanvas.width, origincanvas.height);
      const data = originctx.getImageData(0, 0, origincanvas.width, origincanvas.height);
      processImage(data, options).then(x => resolve(x));
    })
  });
}


const processFace = (data, options, facename, i) => {
  return new Promise(resolve => {
    const optons = {
      data,
      face: facename,
      rotation: Math.PI * options.rotation / 180,
      interpolation: options.interpolation,
      maxWidth: options.width
    };

    renderFace(optons).then(data => {

      getDataURL(data, i).then(file => {
        resolve(file);
      })
      // getDataURL(data, options.outformat).then(file => {
      //     if (options.outtype === 'file') {
      //         fs.writeFile(`${facename}.${options.outformat}`, file, "binary", (err) => {
      //             if (err) console.log(err);
      //             else {
      //                 console.log("The file was saved!");
      //                 resolve(`${facename}.${options.outformat} was saved`)
      //             }
      //         });
      //     } else {
      //         resolve({
      //             buffer: file,
      //             filename: `${facename}.${options.outformat}`
      //         });
      //     }
      // })
    })
  });
}


const processImage = (data, options) => {
  const faces = ["pz", "nz", "px", "nx", "py", "ny"].map((face, i) => processFace(data, options, face, i));
  return new Promise(resolve => Promise.all(faces).then(x => resolve(x)));
}

const createConvertFrame = async (src, usrOptions) => {
  const options = {
    rotation: 180,
    interpolation: 'lanczos',
    outformat: 'jpg',
    outtype: 'file',
    width: Infinity,
    ...usrOptions
  }
  const video = document.createElement("video");
  video.src = src;
  video.setAttribute("controls", "");
  video.muted = true;
  await video.play();
  

  return () => new Promise(resolve => {
      const { videoWidth, videoHeight } = video;
      origincanvas.width = videoWidth / 4;
      origincanvas.height = videoHeight / 4;
      originctx.drawImage(video, 0, 0, origincanvas.width, origincanvas.height);
      const data = originctx.getImageData(0, 0, origincanvas.width, origincanvas.height);
      processImage(data, options).then(x => resolve(x));
  });
}

module.exports = {
  convertImage,
  createConvertFrame,
}
