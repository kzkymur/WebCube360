import Wgld from './wgld';
import { matIV, qtnIV, } from './minMatrixb';
import { torus, cube, } from './element';
import WebCube360 from './WebCube360';
import vs from './vertex.vs';
import fs from './fragment.fs';
import panorama from '../../img/panorama.jpg';
import snowboard from '../../img/panorama-snowboard.mp4';
import PZ from '../../img/cube_PZ.png';
import NZ from '../../img/cube_NZ.png';
import PX from '../../img/cube_PX.png';
import NX from '../../img/cube_NX.png';
import PY from '../../img/cube_PY.png';
import NY from '../../img/cube_NY.png';

// sample_031
//
// WebGLでキューブ環境マッピング

// canvas とクォータニオンをグローバルに扱う
const q = new qtnIV();
let qt = q.identity(q.create());

// マウスムーブイベントに登録する処理
export const onMouseMove = (c) => (e) => {
  const cw = c.width;
  const ch = c.height;
  const wh = 1 / Math.sqrt(cw * cw + ch * ch);
  let x = e.clientX - c.offsetLeft - cw * 0.5;
  let y = e.clientY - c.offsetTop - ch * 0.5;
  let sq = Math.sqrt(x * x + y * y);
  const r = sq * 2.0 * Math.PI * wh;
  if(sq != 1){
    sq = 1 / sq;
    x *= sq;
    y *= sq;
  }
  qt = q.rotate(r, [y, x, 0.0]);
}

const render = (gl) => {
  const wgld = new Wgld(gl);

  // 頂点シェーダとフラグメントシェーダ、プログラムオブジェクトの生成
  const v_shader = wgld.create_vs(vs);
  const f_shader = wgld.create_fs(fs);
  const prg = wgld.create_program(v_shader, f_shader);

  // attributeLocationを配列に取得
  const attLocation = new Array();
  attLocation[0] = gl.getAttribLocation(prg, 'position');
  attLocation[1] = gl.getAttribLocation(prg, 'normal');
  attLocation[2] = gl.getAttribLocation(prg, 'color');

  // attributeの要素数を配列に格納
  const attStride = new Array();
  attStride[0] = 3;
  attStride[1] = 3;
  attStride[2] = 4;

  // キューブモデル
  const cubeData      = cube(2.0, [1.0, 1.0, 1.0, 1.0]);
  const cPosition     = wgld.create_vbo(cubeData.p);
  const cNormal       = wgld.create_vbo(cubeData.n);
  const cColor        = wgld.create_vbo(cubeData.c);
  const cVBOList      = [cPosition, cNormal, cColor];
  const cIndex        = wgld.create_ibo(cubeData.i);

  // トーラスモデル
  const torusData     = torus(64, 64, 1.0, 2.0, [1.0, 1.0, 1.0, 1.0]);
  const tPosition     = wgld.create_vbo(torusData.p);
  const tNormal       = wgld.create_vbo(torusData.n);
  const tColor        = wgld.create_vbo(torusData.c);
  const tVBOList      = [tPosition, tNormal, tColor];
  const tIndex        = wgld.create_ibo(torusData.i);

  // uniformLocationを配列に取得
  const uniLocation = new Array();
  uniLocation[0] = gl.getUniformLocation(prg, 'mMatrix');
  uniLocation[1] = gl.getUniformLocation(prg, 'mvpMatrix');
  uniLocation[2] = gl.getUniformLocation(prg, 'eyePosition');
  uniLocation[3] = gl.getUniformLocation(prg, 'cubeTexture');
  uniLocation[4] = gl.getUniformLocation(prg, 'reflection');

  // 各種行列の生成と初期化
  const m = new matIV();
  let mMatrix   = m.identity(m.create());
  let vMatrix   = m.identity(m.create());
  let pMatrix   = m.identity(m.create());
  let tmpMatrix = m.identity(m.create());
  let mvpMatrix = m.identity(m.create());

  // 深度テストを有効にする
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  // キューブマップ用イメージのソースを配列に格納
  // const cubeSourse = [PZ, NZ, PX, NX, PY, NY];
  const cubeSourse = snowboard;

  // キューブマップテクスチャの生成
  const cubeMap = new WebCube360(gl, 'cubemovie', cubeSourse);

  // 視点座標
  let eyePosition = [0.0, 0.0, 20.0];

  // カウンタの宣言
  let count = 0;

  // 恒常ループ
  const loop = () => {
    // カウンタをインクリメントする
    count++;

    // カウンタを元にラジアンを算出
    const rad  = (count % 360) * Math.PI / 180;
    const rad2 = ((count + 180) % 360) * Math.PI / 180;

    // canvas を初期化
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // ビュー×プロジェクション座標変換行列
    eyePosition = q.toVecIII([0.0, 0.0, 20.0], qt);
    const camUp = q.toVecIII([0.0, 1.0, 0.0], qt);
    vMatrix = m.lookAt(eyePosition, [0, 0, 0], camUp);
    // m.perspective(45, c.width / c.height, 0.1, 200, pMatrix);
    pMatrix = m.perspective(45, 1, 0.1, 200);
    tmpMatrix = m.multiply(pMatrix, vMatrix);

    // 背景用キューブをレンダリング
    wgld.set_attribute(cVBOList, attLocation, attStride);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cIndex);
    mMatrix = m.identity();
    mMatrix = m.scale(mMatrix, [100.0, 100.0, 100.0]);
    mvpMatrix = m.multiply(tmpMatrix, mMatrix);
    gl.uniformMatrix4fv(uniLocation[0], false, mMatrix);
    gl.uniformMatrix4fv(uniLocation[1], false, mvpMatrix);
    gl.uniform3fv(uniLocation[2], eyePosition);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap.t);
    gl.uniform1i(uniLocation[3], 0);
    gl.uniform1i(uniLocation[4], false);
    gl.drawElements(gl.TRIANGLES, cubeData.i.length, gl.UNSIGNED_SHORT, 0);

    // トーラスをレンダリング
    wgld.set_attribute(tVBOList, attLocation, attStride);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tIndex);
    mMatrix = m.identity();
    mMatrix = m.rotate(mMatrix, rad2, [0, 0, 1]);
    mMatrix = m.translate(mMatrix, [5.0, 0.0, 0.0]);
    mMatrix = m.rotate(mMatrix, rad, [1, 0, 1]);
    mvpMatrix = m.multiply(tmpMatrix, mMatrix);
    gl.uniformMatrix4fv(uniLocation[0], false, mMatrix);
    gl.uniformMatrix4fv(uniLocation[1], false, mvpMatrix);
    gl.uniform1i(uniLocation[4], true);
    gl.drawElements(gl.TRIANGLES, torusData.i.length, gl.UNSIGNED_SHORT, 0);

    // コンテキストの再描画
    gl.flush();

  };
  setInterval(loop, 1000 / 15);
};

export default render;
