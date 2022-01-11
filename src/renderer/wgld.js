// シェーダを生成する関数
export default class WGLD {
  constructor (gl) {
    this.gl = gl
  }

  create_vs(script){
    // シェーダを格納する変数
    let shader;

    // scriptタグのtype属性をチェック
    // 頂点シェーダの場合
    shader = this.gl.createShader(this.gl.VERTEX_SHADER);

    // 生成されたシェーダにソースを割り当てる
    this.gl.shaderSource(shader, script);

    // シェーダをコンパイルする
    this.gl.compileShader(shader);

    // シェーダが正しくコンパイルされたかチェック
    if(this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)){

      // 成功していたらシェーダを返して終了
      return shader;
    }else{

      // 失敗していたらエラーログをアラートする
      alert(this.gl.getShaderInfoLog(shader));
    }
  }

  create_fs(script){
    // シェーダを格納する変数
    let shader;

    // フラグメントシェーダの場合
    shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);

    // 生成されたシェーダにソースを割り当てる
    this.gl.shaderSource(shader, script);

    // シェーダをコンパイルする
    this.gl.compileShader(shader);

    // シェーダが正しくコンパイルされたかチェック
    if(this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)){

      // 成功していたらシェーダを返して終了
      return shader;
    }else{

      // 失敗していたらエラーログをアラートする
      alert(this.gl.getShaderInfoLog(shader));
    }
  }

  // プログラムオブジェクトを生成しシェーダをリンクする関数
  create_program(vs, fs){
    // プログラムオブジェクトの生成
    let program = this.gl.createProgram();

    // プログラムオブジェクトにシェーダを割り当てる
    this.gl.attachShader(program, vs);
    this.gl.attachShader(program, fs);

    // シェーダをリンク
    this.gl.linkProgram(program);

    // シェーダのリンクが正しく行なわれたかチェック
    if(this.gl.getProgramParameter(program, this.gl.LINK_STATUS)){

      // 成功していたらプログラムオブジェクトを有効にする
      this.gl.useProgram(program);

      // プログラムオブジェクトを返して終了
      return program;
    }else{

      // 失敗していたらエラーログをアラートする
      alert(this.gl.getProgramInfoLog(program));
    }
  }

  // VBOを生成する関数
  create_vbo(data){
    // バッファオブジェクトの生成
    let vbo = this.gl.createBuffer();

    // バッファをバインドする
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);

    // バッファにデータをセット
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data), this.gl.STATIC_DRAW);

    // バッファのバインドを無効化
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

    // 生成した VBO を返して終了
    return vbo;
  }

  // VBOをバインドし登録する関数
  set_attribute (vbo, attL, attS) {
    // 引数として受け取った配列を処理する
    for(let i in vbo){
      // バッファをバインドする
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo[i]);

      // attributeLocationを有効にする
      this.gl.enableVertexAttribArray(attL[i]);

      // attributeLocationを通知し登録する
      this.gl.vertexAttribPointer(attL[i], attS[i], this.gl.FLOAT, false, 0, 0);
    }
  }

  // IBOを生成する関数
  create_ibo(data){
    // バッファオブジェクトの生成
    let ibo = this.gl.createBuffer();

    // バッファをバインドする
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibo);

    // バッファにデータをセット
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), this.gl.STATIC_DRAW);

    // バッファのバインドを無効化
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);

    // 生成したIBOを返して終了
    return ibo;
  }

  // テクスチャを生成する関数
  // ちょっとだけ変えた(texをreturnするようにした)
  create_texture(source){
    // イメージオブジェクトの生成
    let img = new Image();

    // データのオンロードをトリガーにする
    img.onload = function () {
      // テクスチャオブジェクトの生成
      let tex = this.gl.createTexture();

      // テクスチャをバインドする
      this.gl.bindTexture(this.gl.TEXTURE_2D, tex);

      // テクスチャへイメージを適用
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, img);

      // ミップマップを生成
      this.gl.generateMipmap(this.gl.TEXTURE_2D);

      // テクスチャのバインドを無効化
      this.gl.bindTexture(this.gl.TEXTURE_2D, null);

      // 生成したテクスチャを変数に代入
      textureInstnace.t = tex;
    };

    // イメージオブジェクトのソースを指定
    img.src = source;
  }

  create_framebuffer(width, height){
    // フレームバッファの生成
    let frameBuffer = this.gl.createFramebuffer();

    // フレームバッファをWebGLにバインド
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, frameBuffer);

    // 深度バッファ用レンダーバッファの生成とバインド
    let depthRenderBuffer = this.gl.createRenderbuffer();
    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, depthRenderBuffer);

    // レンダーバッファを深度バッファとして設定
    this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, width, height);

    // フレームバッファにレンダーバッファを関連付ける
    this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, depthRenderBuffer);

    // フレームバッファ用テクスチャの生成
    let fTexture = this.gl.createTexture();

    // フレームバッファ用のテクスチャをバインド
    this.gl.bindTexture(this.gl.TEXTURE_2D, fTexture);

    // フレームバッファ用のテクスチャにカラー用のメモリ領域を確保
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, width, height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);

    // テクスチャパラメータ
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);

    // フレームバッファにテクスチャを関連付ける
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, fTexture, 0);

    // 各種オブジェクトのバインドを解除
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    this.this.gl.bindRenderbuffer(this.this.gl.RENDERBUFFER, null);
    this.this.gl.bindFramebuffer(this.this.gl.FRAMEBUFFER, null);

    // オブジェクトを返して終了
    return {f : frameBuffer, d : depthRenderBuffer, t : fTexture};
  }
}
