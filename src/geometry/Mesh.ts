import {vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';
import * as Loader from 'webgl-obj-loader';

class Mesh extends Drawable {
  posTemp: Array<number>;
  norTemp: Array<number>;
  idxTemp: Array<number>;

  indices: Uint32Array;
  positions: Float32Array;
  normals: Float32Array;
  center: vec4;

  objString: string;

  constructor(objString: string, center: vec3) {
    super(); // Call the constructor of the super class. This is required.
    this.center = vec4.fromValues(center[0], center[1], center[2], 1);

    this.posTemp = Array<number>();
    this.norTemp = Array<number>();
    this.idxTemp = Array<number>();

    this.objString = objString;
    this.setUpMesh();
  }

  getInd () {
    return this.idxTemp;
   }
   
   getNorm () {
     return this.norTemp;
   }
 
   getPos () {
     return this.posTemp;
   }

   translateVertices(pos : vec3) {
    for(var i = 0; i < this.posTemp.length; i = i + 4) {
        //input vertex x, y, z
        var xCom = this.posTemp[i];
        var yCom = this.posTemp[i+1];
        var zCom = this.posTemp[i+2];
        
        var vert = vec3.fromValues(xCom + pos[0], yCom + pos[1], zCom+ pos[2]);

        this.posTemp[i] = vert[0];
        this.posTemp[i+1] = vert[1];
        this.posTemp[i+2] = vert[2];
        this.posTemp[i+3] = 1;
    }
}
scaleVertices(scale: vec3) {
  var newPositions = new Array<number>();
  for(var i = 0; i < this.posTemp.length; i = i + 4) {
      //input vertex x, y, z
      var xCom = this.posTemp[i];
      var yCom = this.posTemp[i+1];
      var zCom = this.posTemp[i+2];
      
      //console.log("original: " + positions[i], positions[i+1], positions[i+2]);
      //apply rotation in x, y, z direction to the vertex
      var vert = vec3.fromValues(xCom * scale[0], yCom * scale[1], zCom * scale[2]);

      this.posTemp[i] = vert[0];
      this.posTemp[i+1] = vert[1];
      this.posTemp[i+2] = vert[2];
      this.posTemp[i+3] = 1;
      //console.log("rotateed Pos: " + newPositions[i], newPositions[i+1], newPositions[i+2]);
  }
  return newPositions;
}

   setInd = function(ind : Array<number>) {
    this.idxTemp = Uint32Array.from(ind);
   }
   
  setNorm = function(norm : Array<number>) {
    this.norTemp = Float32Array.from(norm);
   }
 
  setPos = function(pos : Array<number>) {
    this.posTemp = Float32Array.from(pos);
  }

  setUpMesh() {
    var loadedMesh = new Loader.Mesh(this.objString);

     for (var i = 0; i < loadedMesh.vertices.length; i++) {
      this.posTemp.push(loadedMesh.vertices[i]);
      if (i % 3 == 2) this.posTemp.push(1.0);
    }

    for (var i = 0; i < loadedMesh.vertexNormals.length; i++) {
      this.norTemp.push(loadedMesh.vertexNormals[i]);
      if (i % 3 == 2) this.norTemp.push(0.0);
    }
    this.idxTemp = loadedMesh.indices;
  }

  create() {  
    this.indices = new Uint32Array(this.idxTemp);
    this.normals = new Float32Array(this.norTemp);
    this.positions = new Float32Array(this.posTemp);

    this.generateIdx();
    this.generatePos();
    this.generateNor();

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

    //console.log(`Created Mesh from OBJ`);
    this.objString = ""; // hacky clear
  }
};

export default Mesh;
