import { convertImage, createConvertFrame } from "panorama-to-cubemap";

export default class WebCube360 {
  constructor (gl, mode, sourcePath, onload) {
    this.gl = gl;
    this.mode = mode;
    this.t = null;
    this.onload = onload;
    this.changeImg(mode, sourcePath);
    return this;
  }
  changeImg (mode, sourcePath, onload) {
    if (mode === 'singleImg') {
      return this.setSingleTex(sourcePath);
    } else if (mode === 'cube') {
      return this.setCubeTex(sourcePath);
    } else if (mode === 'cubemovie') {
      return this.setCubeMovieTex(sourcePath);
    }
    if (onload !== undefined) this.onload = onload;
  }
  async setSingleTex (sourcePath) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = sourcePath;
    }).then(res => {
      let tex = this.gl.createTexture();
      this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, res);
      this.gl.generateMipmap(this.gl.TEXTURE_2D);
      this.gl.bindTexture(this.gl.TEXTURE_2D, null);

      this.t = tex;
      this.onload();
    });
  }
  setCubeTex (sourcePath) {
    return new Promise((resolve, reject) => {
      const cImg = [];
      if (Array.isArray(sourcePath) && sourcePath.length === 6) {
        for (let i = 0; i < 6; i++) {
          const data = new Image();
          data.onload = () => {
            cImg[i].imageDataLoaded = true;
            if (this.callLoaddedCheck(cImg)) {
              this.generateCubeMap(cImg);
              resolve();
            }
          };
          data.onerror = (e) => {
            reject(e);
          }
          data.src = sourcePath[i];
          cImg.push({ data, });
        }
      } else if (typeof sourcePath === 'string' || sourcePath instanceof String) {
        const url = sourcePath;
        const options = {
          rotation: 180,
          interpolation: "lanczos",
          outformat: "jpg",
          width: 256
        };
        convertImage(url, options).then(canvases => {
          canvases.forEach(c => {
            cImg.push({ data: c });
          });
          this.generateCubeMap(cImg);
          resolve();
        });
      }
    });
  }
  setCubeMovieTex (sourcePath) {
    return new Promise(async (resolve) => {
      const cImg = [];
      if (typeof sourcePath === 'string' || sourcePath instanceof String) {
        const url = sourcePath;
        const options = {
          rotation: 180,
          interpolation: "lanczos",
          outformat: "jpg",
          width: 512
        };
        const convertFrame = await createConvertFrame(url, options);
        const loopSetter = () => {
          convertFrame().then(canvases => {
            canvases.forEach(c => {
              cImg.push({ data: c });
            });
            this.generateCubeMap(cImg);
          });
        };
        this.intervalFunc = setInterval(loopSetter, 1000 / 15);
        resolve();
      }
    });
  }


  callLoaddedCheck (cImg) {
    return cImg[0].imageDataLoaded &&
      cImg[1].imageDataLoaded &&
      cImg[2].imageDataLoaded &&
      cImg[3].imageDataLoaded &&
      cImg[4].imageDataLoaded &&
      cImg[5].imageDataLoaded;
  }
  generateCubeMap (cImg) {
    // テクスチャオブジェクトの生成
    var tex = this.gl.createTexture();

    // テクスチャをキューブマップとしてバインドする
    this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, tex);

    // キューブマップ用のターゲットを格納する配列
    const target = [
      this.gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
      this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
      this.gl.TEXTURE_CUBE_MAP_POSITIVE_X,
      this.gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
      this.gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
      this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
    ];

    // ソースを順に処理する
    for(var j = 0; j < 6; j++){
      // テクスチャへイメージを適用
      this.gl.texImage2D(target[j], 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, cImg[j].data);
    }

    // ミップマップを生成
    this.gl.generateMipmap(this.gl.TEXTURE_CUBE_MAP);

    // テクスチャパラメータの設定
    this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

    // キューブマップテクスチャを変数に代入
    this.t = tex;

    // テクスチャのバインドを無効化
    this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, null);
  }
}
