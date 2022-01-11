import wgld from './wgld';

class Element {
    constructor (gl) {
        this.gl = gl;
        this.w = new wgld(gl);
        this.Index;
        this.indexLength;
        this.VBOList = [];
        this.cap = [];
        this.unCap = [];
        this.uniform = {};
        this.texture = { 0 : null,}
        this.stencilSetting = [this.gl.ALWAYS, 1, ~0, this.gl.KEEP, this.gl.KEEP, this.gl.KEEP];
        this.colorIndex;
        this.colorLength;
    }
    setCapability (cap) {
        this.cap.push(cap);
    }
    unSetCapability (cap) {
        this.unCap.push(cap);
    }
    setTexture (unit, texture) {
        this.texture[unit] = texture;
    }
    setUniform (key, value) {
        this.uniform[key] = value;
    }
    setStencil (func, ref, mask, fail, zfail, zpass) {
        this.stencilSetting = [func, ref, mask, fail, zfail, zpass];
    }
    setColor(color) {
        let newColor = [];
        for (let i=0; i<this.colorLength; i++) {
            newColor.push(color[0], color[1], color[2], color[3]);
        }
        this.VBOList[this.colorIndex] = this.w.create_vbo(newColor);
    }
}
// class Merge {
//     constructor (gl, ) {
//         this.element = {};
//         this.mergeInstance = [];
//         this.uniform = {};
//         this.texture = null;
//         this.textureUnit = 0;
//     }
//     setElement (element) {
//         if(element.constructor.name=='Merge') {
//             this.mergeInstance.push(element);
//             return;
//         } else if (this.element[element.constructor.name] == undefined) {
//             this.element[element.constructor.name] = [];
//         }
//         this.element[element.constructor.name].push(Object.create(element));
//     }
//     setTexture (unit, texture) {
//         this.texture = texture;
//         this.textureUnit = unit;
//     }
//     setUniform (key, value) {
//         this.uniform[key] = value;
//     }
//     // setPersonalMMatrix (element, mMatrix) {
//     //     // jsは全て参照渡しなのでこれでおけ
//     //     let mvpMatrix = this.element[element.constructor.name].uniform['mvpMatrix'];
//     //     m.multiply(mvpMatrix, mMatrix, mvpMatrix);
//     // }
// }

class Point extends Element {
    constructor (gl) {
        super(gl);
    }
    init (shader, color) {
        const dataDictionary = {
            'position'     : this.w.create_vbo([.0, .0, .0]),
            'normal'       : this.w.create_vbo([1., 1., 1.]),
            'color'        : this.w.create_vbo(color),
            'textureCoord' : this.w.create_vbo([0, 0]),
        }
        let i = 0;
        for (let key of shader.attList) {
            this.VBOList.push(dataDictionary[key]);
            if (key == 'color') {
                this.colorIndex = i;
            }
            i++;
        }
        this.colorLength = 1;
        this.indexLength = 1;
        this.Index = this.w.create_ibo([0]);
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    }
}
class Cube extends Element {
    constructor (gl) {
        super(gl);
    }
    init (shader, color) {
        const data = cube(1, color);
        const dataDictionary = {
            'position'     : this.w.create_vbo(data.p),
            'normal'       : this.w.create_vbo(data.n),
            'color'        : this.w.create_vbo(data.c),
            'textureCoord' : this.w.create_vbo(data.t),
        }
        let i = 0;
        for (let key of shader.attList) {
            this.VBOList.push(dataDictionary[key]);
            if (key == 'color') {
                this.colorIndex = i;
            }
            i++;
        }
        this.colorLength = data.p.length/3;
        this.indexLength = data.i.length;
        this.Index = this.w.create_ibo(data.i);
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    }
}
class Sphere extends Element {
    constructor (gl) {
        super(gl);
    }
    init (shader, nVertex, color) {
        const data = sphere(nVertex, nVertex, 1, color);
        const dataDictionary = {
            'position'     : this.w.create_vbo(data.p),
            'normal'       : this.w.create_vbo(data.n),
            'color'        : this.w.create_vbo(data.c),
            'textureCoord' : this.w.create_vbo(data.t),
        }
        let i = 0;
        for (let key of shader.attList) {
            this.VBOList.push(dataDictionary[key]);
            if (key == 'color') {
                this.colorIndex = i;
            }
            i++;
        }
        this.colorLength = data.p.length/3;
        this.indexLength = data.i.length;
        this.Index = this.w.create_ibo(data.i);
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    }
}
class Torus extends Element {
    constructor (gl) {
        super(gl)
    }
    init (shader, nVertex, irad, orad, color) {
        const data = torus(nVertex, nVertex, irad, orad, color);
        const dataDictionary = {
            'position'     : this.w.create_vbo(data.p),
            'normal'       : this.w.create_vbo(data.n),
            'color'        : this.w.create_vbo(data.c),
            'textureCoord' : this.w.create_vbo(data.t),
        }
        let i = 0;
        for (let key of shader.attList) {
            this.VBOList.push(dataDictionary[key]);
            if (key == 'color') {
                this.colorIndex = i;
            }
            i++;
        }
        this.indexLength = data.i.length;
        this.Index = this.w.create_ibo(data.i);
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    }
}
class Texture extends Element {
    constructor (gl) {
        super(gl);
    }
    init (shader) {
        const position = [
            -1.0,  1.0,  0.0,
            1.0,  1.0,  0.0,
            -1.0, -1.0,  0.0,
            1.0, -1.0,  0.0
        ];
        const color = [
            1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0
        ];
        const index = [
            0, 2, 1,
            3, 1, 2
        ];
        const dataDictionary = {
            'position'     : this.w.create_vbo(position),
            'color'        : this.w.create_vbo(color),
        }
        let i = 0;
        for (let key of shader.attList) {
            this.VBOList.push(dataDictionary[key]);
            if (key == 'color') {
                this.colorIndex = i;
            }
            i++;
        }
        this.indexLength = index.length;
        this.Index = this.w.create_ibo(index);
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    }
}

class ImgTexture {
    constructor (gl) {
        this.gl = gl;
    }
    init (sourcePath) {
        this.t = null;
        return this.changeImg(sourcePath);
    }
	changeImg (sourcePath) {
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
			return this;
		});
	}
}

export const torus = function (row, column, irad, orad, color){
    let pos = new Array(), nor = new Array(),
        col = new Array(), st  = new Array(), idx = new Array();
    for(let i = 0; i <= row; i++){
        let r = Math.PI * 2 / row * i;
        let rr = Math.cos(r);
        let ry = Math.sin(r);
        for(let ii = 0; ii <= column; ii++){
            let tr = Math.PI * 2 / column * ii;
            let tx = (rr * irad + orad) * Math.cos(tr);
            let ty = ry * irad;
            let tz = (rr * irad + orad) * Math.sin(tr);
            let rx = rr * Math.cos(tr);
            let rz = rr * Math.sin(tr);
			let tc;
            if(color){
                 tc = color;
            }else{
                tc = hsva(360 / column * ii, 1, 1, 1);
            }
            let rs = 1 / column * ii;
            let rt = 1 / row * i + 0.5;
            if(rt > 1.0){rt -= 1.0;}
            rt = 1.0 - rt;
            pos.push(tx, ty, tz);
            nor.push(rx, ry, rz);
            col.push(tc[0], tc[1], tc[2], tc[3]);
            st.push(rs, rt);
        }
    }
    for(let i = 0; i < row; i++){
        for(let ii = 0; ii < column; ii++){
            let r = (column + 1) * i + ii;
            idx.push(r, r + column + 1, r + 1);
            idx.push(r + column + 1, r + column + 2, r + 1);
        }
    }
    return {p : pos, n : nor, c : col, t : st, i : idx};
}

export const sphere = function (row, column, rad, color){
    let pos = new Array(), nor = new Array(),
        col = new Array(), st  = new Array(), idx = new Array(), tc;
    for(let i = 0; i <= row; i++){
        let r = Math.PI / row * i;
        let ry = Math.cos(r);
        let rr = Math.sin(r);
        for(let ii = 0; ii <= column; ii++){
            let tr = Math.PI * 2 / column * ii;
            let tx = rr * rad * Math.cos(tr);
            let ty = ry * rad;
            let tz = rr * rad * Math.sin(tr);
            let rx = rr * Math.cos(tr);
            let rz = rr * Math.sin(tr);
            if(color){
                tc = color;
            }else{
                tc = hsva(360 / row * i, 1, 1, 1);
            }
            pos.push(tx, ty, tz);
            nor.push(rx, ry, rz);
            col.push(tc[0], tc[1], tc[2], tc[3]);
            st.push(1 - 1 / column * ii, 1 / row * i);
        }
    }
    let r = 0;
    for(let i = 0; i < row; i++){
        for(let ii = 0; ii < column; ii++){
            r = (column + 1) * i + ii;
            idx.push(r, r + 1, r + column + 2);
            idx.push(r, r + column + 2, r + column + 1);
        }
    }
    return {p : pos, n : nor, c : col, t : st, i : idx};
}

export const cube = function (side, color) {
    let hs = side * 0.5;
    let pos = [
        -hs, -hs,  hs,  hs, -hs,  hs,  hs,  hs,  hs, -hs,  hs,  hs,
        -hs, -hs, -hs, -hs,  hs, -hs,  hs,  hs, -hs,  hs, -hs, -hs,
        -hs,  hs, -hs, -hs,  hs,  hs,  hs,  hs,  hs,  hs,  hs, -hs,
        -hs, -hs, -hs,  hs, -hs, -hs,  hs, -hs,  hs, -hs, -hs,  hs,
        hs, -hs, -hs,  hs,  hs, -hs,  hs,  hs,  hs,  hs, -hs,  hs,
        -hs, -hs, -hs, -hs, -hs,  hs, -hs,  hs,  hs, -hs,  hs, -hs
    ];
    let nor = [
        -1.0, -1.0,  1.0,  1.0, -1.0,  1.0,  1.0,  1.0,  1.0, -1.0,  1.0,  1.0,
        -1.0, -1.0, -1.0, -1.0,  1.0, -1.0,  1.0,  1.0, -1.0,  1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0, -1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0, -1.0,
        -1.0, -1.0, -1.0,  1.0, -1.0, -1.0,  1.0, -1.0,  1.0, -1.0, -1.0,  1.0,
        1.0, -1.0, -1.0,  1.0,  1.0, -1.0,  1.0,  1.0,  1.0,  1.0, -1.0,  1.0,
        -1.0, -1.0, -1.0, -1.0, -1.0,  1.0, -1.0,  1.0,  1.0, -1.0,  1.0, -1.0
    ];
    let tc, col = new Array();
    for(let i = 0; i < pos.length / 3; i++){
        if(color){
            tc = color;
        }else{
            tc = hsva(360 / pos.length / 3 * i, 1, 1, 1);
        }
        col.push(tc[0], tc[1], tc[2], tc[3]);
    }
    let st = [
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0
    ];
    let idx = [
        0,  1,  2,  0,  2,  3,
        4,  5,  6,  4,  6,  7,
        8,  9, 10,  8, 10, 11,
        12, 13, 14, 12, 14, 15,
        16, 17, 18, 16, 18, 19,
        20, 21, 22, 20, 22, 23
    ];
    return {p : pos, n : nor, c : col, t : st, i : idx};
}

export const hsva = function (h, s, v, a) {
    if(s > 1 || v > 1 || a > 1){return;}
    let th = h % 360;
    let i = Math.floor(th / 60);
    let f = th / 60 - i;
    let m = v * (1 - s);
    let n = v * (1 - s * f);
    let k = v * (1 - s * (1 - f));
    let color = new Array();
    if(!s > 0 && !s < 0){
        color.push(v, v, v, a);
    } else {
        let r = new Array(v, n, m, m, k, v);
        let g = new Array(k, v, v, n, m, m);
        let b = new Array(m, m, k, v, v, n);
        color.push(r[i], g[i], b[i], a);
    }
    return color;
}

export { Point, Cube, Sphere, Torus, Texture, ImgTexture, };
