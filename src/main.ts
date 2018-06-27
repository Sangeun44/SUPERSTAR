import { vec3, vec4, mat3, mat4 } from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import * as fs from 'fs';

//event
const event: CustomEvent & { dataTransfer?: any } =
    new CustomEvent("name", { bubbles: true, cancelable: true });

//audio
import {Audio} from 'three';
import Analyser from './Analyser';

//geometry
import Mesh from './geometry/Mesh';
import Track from './geometry/Track';
// import Icosphere from './geometry/Icosphere';
import Square from './geometry/Square';
import Background from './geometry/Background';
import Cube from './geometry/Cube';

import { readTextFile } from './globals';
import { setGL } from './globals';

import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import ShaderProgram, { Shader } from './rendering/gl/ShaderProgram';

import Button from './Button';

//audio variables
let audioFile: undefined;
let audioCtx: AudioContext;
let audioSrc: AudioBufferSourceNode;
let audioBuf: AudioBuffer;
let analyserNode: AnalyserNode;
let delay: DelayNode;
let gain: GainNode;

let generator: Analyser;
let playing: boolean = false;
let paused: boolean = false;
let started: boolean = false;
let startTime: number = new Date().getTime();
let loaded: boolean = false; 

let lastVol = 50;

let song: any; 

const parseJson = require('parse-json');
let jsonFile: string; //jsonFile name

//list of buttons to create
let buttons = Array<Button>();
let buttonNum = 0;

let points = 0;
let health = 100;
let epsilon = 0.5;

let startTick = 0;
let endTick = 0;
let tickFrame = 0;

let keyBoard = Array<Mesh>();
let track: Track;

let bpm = 0;

let play = 0;
//shapes
let square: Square;
let background: Background;

//time
let count: number = 0.0;

//objects
let marioString: string; //objString name
let mario: Mesh;

let longboi1: Mesh;
let longboi2: Mesh;
let longboi3: Mesh;
let longboi4: Mesh;
let longboi5: Mesh;
let longboi6: Mesh;
let longboi7: Mesh;

let buttonStr: string;
let buttonTipStr: string;

let buttonA: Mesh;
let buttonATip: Mesh;
let downA: boolean;

let buttonF: Mesh;
let buttonFTip: Mesh;
let downF: boolean;

let buttonS: Mesh;
let buttonSTip: Mesh;
let downS: boolean;

let buttonD: Mesh;
let buttonDTip: Mesh;
let downD: boolean;

let buttonJ: Mesh;
let buttonJTip: Mesh;
let downJ: boolean;

let buttonK: Mesh;
let buttonKTip: Mesh;
let downK: boolean;

let buttonL: Mesh;
let buttonLTip: Mesh;
let downL: boolean;

let buttonP: Mesh;
let buttonPTip: Mesh;
let downP: boolean;

//music 
var JukeBox: AudioContext;
var source, sourceJS;
var analyser: AnalyserNode;
var bufferLength: number;
var array: Uint8Array;
var heightsArray: Uint8Array;

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  Difficulty: "easy",
  Song: "Shooting Stars",
  Health: 100,
  Score: 0,
  'Play/Pause': playPause,
  'Load Song': loadScene // A function pointer, essentially
};

function play_music() {
  JukeBox = new AudioContext();

  var musicStr = controls.Song;
  var musicPath = './src/resources/music/mp3/' + musicStr + '.mp3';

  fetch(musicPath)
    .then(r => r.arrayBuffer())
    .then(b => JukeBox.decodeAudioData(b))
    .then(data => {
      const audio_buf = JukeBox.createBufferSource();
      audio_buf.buffer = data;
      audio_buf.loop = false;
      audio_buf.connect(JukeBox.destination);
      audio_buf.start(0);
    });
    console.log(`Music On!` + musicStr);

  fetch(musicPath)
    .then(r => r.arrayBuffer())
    .then(b => JukeBox.decodeAudioData(b))
    .then(data => {
      //audio context
      sourceJS = JukeBox.createScriptProcessor(2048, 1, 1);
      sourceJS.connect(JukeBox.destination);
      
      analyser = JukeBox.createAnalyser();
      analyser.smoothingTimeConstant = 0.5;
      analyser.fftSize = 256;

      source = JukeBox.createBufferSource();
      source.buffer = data;

      source.connect(analyser);
      analyser.connect(sourceJS);
      analyser.connect(JukeBox.destination);
      source.connect(JukeBox.destination);

      array = new Uint8Array(analyser.frequencyBinCount);
      bufferLength = analyser.frequencyBinCount;
      var dataArray = new Uint8Array(bufferLength);

      analyser.getByteFrequencyData(array);
      //source.start(0);
      
      var canvas = document.getElementById("canvas");
      function render() {
        requestAnimationFrame(render);
        analyser.getByteFrequencyData(dataArray);
        heightsArray = dataArray;
        console.log("length: " + heightsArray.length);
      }
    });
}

function createAndConnectAudioBuffer() {
  // create the source buffer
  audioSrc = audioCtx.createBufferSource();
  // connect source and analyser
  audioSrc.connect(analyserNode);
  analyserNode.connect(audioCtx.destination);
}

function setupAudio() {
  //if song is playing, stop buffer and close
  if(started) {
    audioSrc.stop();
    audioCtx.close();
  }



  
}

function playPause() {

}

//initial visuals
function loadVisuals() {
  console.log("load visualization");
  var longboiStr = readTextFile('./src/resources/obj/longboi.obj');
  longboi1 = new Mesh(longboiStr, vec3.fromValues(0, 0, 0));
  longboi1.translateVertices(vec3.fromValues(0, 0, -35));
  longboi1.create();

  longboi2 = new Mesh(longboiStr, vec3.fromValues(0, 0, 0));
  longboi2.scaleVertices(vec3.fromValues(1.5,1.5,1.5));
  longboi2.translateVertices(vec3.fromValues(0, 0, -35));
  longboi2.create();

  longboi3 = new Mesh(longboiStr, vec3.fromValues(0, 0, 0));
  longboi3.scaleVertices(vec3.fromValues(2,2,2));
  longboi3.translateVertices(vec3.fromValues(0, 0, -35));
  longboi3.create();

  longboi4 = new Mesh(longboiStr, vec3.fromValues(0, 0, 0));
  longboi4.translateVertices(vec3.fromValues(-10, -10, -35));
  longboi4.create();

  longboi5 = new Mesh(longboiStr, vec3.fromValues(0, 0, 0));
  longboi5.translateVertices(vec3.fromValues(10, -10, -35));
  longboi5.create();

  longboi6 = new Mesh(longboiStr, vec3.fromValues(0, 0, 0));
  longboi6.translateVertices(vec3.fromValues(-5, -5, -35));
  longboi6.create();

  longboi7 = new Mesh(longboiStr, vec3.fromValues(0, 0, 0));
  longboi7.translateVertices(vec3.fromValues(5, -5,-35));
  longboi7.create();
}

function loadScene() {
  console.log("load scene");
  //Mario 
  marioString = readTextFile('./src/resources/obj/wahoo.obj');
  mario = new Mesh(marioString, vec3.fromValues(0, 0, 0));
  mario.translateVertices(vec3.fromValues(0, -5, -20));
  mario.create();

  square = new Square(vec3.fromValues(0, 0, 0));
  square.create();

  background = new Background(vec3.fromValues(0, 0, 0));
  background.create();
}

function loadButtonsEasy() {
  console.log("load buttons easy");
  buttonStr = readTextFile('./src/resources/obj/button.obj');
  buttonTipStr = readTextFile('./src/resources/obj/tip.obj');

  //S
  buttonS = new Mesh(buttonStr, vec3.fromValues(0, 0, 0));
  buttonS.translateVertices(vec3.fromValues(-7, 0, 0));
  buttonS.create();

  buttonSTip = new Mesh(buttonTipStr, vec3.fromValues(0, 0, 0));
  buttonSTip.translateVertices(vec3.fromValues(-7, 1, 0));
  buttonSTip.create();

  //D
  buttonD = new Mesh(buttonStr, vec3.fromValues(0, 0, 0));
  buttonD.translateVertices(vec3.fromValues(-4.5, 0, 0));
  buttonD.create();

  buttonDTip = new Mesh(buttonTipStr, vec3.fromValues(0, 0, 0));
  buttonDTip.translateVertices(vec3.fromValues(-4.5, 1, 0));
  buttonDTip.create();

  //F
  buttonF = new Mesh(buttonStr, vec3.fromValues(0, 0, 0));
  buttonF.translateVertices(vec3.fromValues(-2, 0, 0));
  buttonF.create();

  buttonFTip = new Mesh(buttonTipStr, vec3.fromValues(0, 0, 0));
  buttonFTip.translateVertices(vec3.fromValues(-2, 1, 0));
  buttonFTip.create();

  //J
  buttonJ = new Mesh(buttonStr, vec3.fromValues(0, 0, 0));
  buttonJ.translateVertices(vec3.fromValues(2, 0, 0));
  buttonJ.create();

  buttonJTip = new Mesh(buttonTipStr, vec3.fromValues(0, 0, 0));
  buttonJTip.translateVertices(vec3.fromValues(2, 1, 0));
  buttonJTip.create();

  //K
  buttonK = new Mesh(buttonStr, vec3.fromValues(0, 0, 0));
  buttonK.translateVertices(vec3.fromValues(4.5, 0, 0));
  buttonK.create();

  buttonKTip = new Mesh(buttonTipStr, vec3.fromValues(0, 0, 0));
  buttonKTip.translateVertices(vec3.fromValues(4.5, 1, 0));
  buttonKTip.create();

  //L
  buttonL = new Mesh(buttonStr, vec3.fromValues(0, 0, 0));
  buttonL.translateVertices(vec3.fromValues(7, 0, 0));
  buttonL.create();

  buttonLTip = new Mesh(buttonTipStr, vec3.fromValues(0, 0, 0));
  buttonLTip.translateVertices(vec3.fromValues(7, 1, 0));
  buttonLTip.create();

  keyBoard.push(buttonS, buttonD, buttonF, buttonJ, buttonK, buttonL);
}

function loadButtonsHard() {
  console.log("load buttons hard");

  buttonStr = readTextFile('./src/resources/obj/button.obj');
  buttonTipStr = readTextFile('./src/resources/obj/tip.obj');

  //A
  buttonA = new Mesh(buttonStr, vec3.fromValues(0, 0, 0));
  buttonA.translateVertices(vec3.fromValues(-9.5, 0, 0));
  buttonA.create();

  buttonATip = new Mesh(buttonTipStr, vec3.fromValues(0, 0, 0));
  buttonATip.translateVertices(vec3.fromValues(-9.5, 1, 0));
  buttonATip.create();

  //S
  buttonS = new Mesh(buttonStr, vec3.fromValues(0, 0, 0));
  buttonS.translateVertices(vec3.fromValues(-7, 0, 0));
  buttonS.create();

  buttonSTip = new Mesh(buttonTipStr, vec3.fromValues(0, 0, 0));
  buttonSTip.translateVertices(vec3.fromValues(-7, 1, 0));
  buttonSTip.create();

  //D
  buttonD = new Mesh(buttonStr, vec3.fromValues(0, 0, 0));
  buttonD.translateVertices(vec3.fromValues(-4.5, 0, 0));
  buttonD.create();

  buttonDTip = new Mesh(buttonTipStr, vec3.fromValues(0, 0, 0));
  buttonDTip.translateVertices(vec3.fromValues(-4.5, 1, 0));
  buttonDTip.create();

  //F
  buttonF = new Mesh(buttonStr, vec3.fromValues(0, 0, 0));
  buttonF.translateVertices(vec3.fromValues(-2, 0, 0));
  buttonF.create();

  buttonFTip = new Mesh(buttonTipStr, vec3.fromValues(0, 0, 0));
  buttonFTip.translateVertices(vec3.fromValues(-2, 1, 0));
  buttonFTip.create();

  //J
  buttonJ = new Mesh(buttonStr, vec3.fromValues(0, 0, 0));
  buttonJ.translateVertices(vec3.fromValues(2, 0, 0));
  buttonJ.create();

  buttonJTip = new Mesh(buttonTipStr, vec3.fromValues(0, 0, 0));
  buttonJTip.translateVertices(vec3.fromValues(2, 1, 0));
  buttonJTip.create();

  //K
  buttonK = new Mesh(buttonStr, vec3.fromValues(0, 0, 0));
  buttonK.translateVertices(vec3.fromValues(4.5, 0, 0));
  buttonK.create();

  buttonKTip = new Mesh(buttonTipStr, vec3.fromValues(0, 0, 0));
  buttonKTip.translateVertices(vec3.fromValues(4.5, 1, 0));
  buttonKTip.create();

  //L
  buttonL = new Mesh(buttonStr, vec3.fromValues(0, 0, 0));
  buttonL.translateVertices(vec3.fromValues(7, 0, 0));
  buttonL.create();

  buttonLTip = new Mesh(buttonTipStr, vec3.fromValues(0, 0, 0));
  buttonLTip.translateVertices(vec3.fromValues(7, 1, 0));
  buttonLTip.create();

  //;
  buttonP = new Mesh(buttonStr, vec3.fromValues(0, 0, 0));
  buttonP.translateVertices(vec3.fromValues(9.5, 0, 0));
  buttonP.create();

  buttonPTip = new Mesh(buttonTipStr, vec3.fromValues(0, 0, 0));
  buttonPTip.translateVertices(vec3.fromValues(9.5, 1, 0));
  buttonPTip.create();

  keyBoard.push(buttonA, buttonS, buttonD, buttonF, buttonJ, buttonK, buttonL, buttonP);
}

//read the JSON file determined by the user -- currntly doing a test midi json
async function parseJSON() {
  console.log("parse the json file");

  var musicStr = controls.Song;
  if (musicStr == 'Connect-Goofy') {
    musicStr = "Connect";
  }
  const musicPath = './src/resources/music/json/' + musicStr + '.json';
  const jsonFileStr = readTextFile(musicPath);
  const jsonFile = JSON.parse(jsonFileStr);
  parseAfterReading(jsonFile);
  // try {
  //   const fetchResult = fetch(musicPath);
  //   const response = await fetchResult;
  //   const jsonData = await response.json();
  //   parseAfterReading(jsonData);
  // } catch (e) {
  //   throw Error(e);
  // }
  const header = jsonFile.header;
  const bpm3 = header.bpm;
  bpm = parseFloat(JSON.stringify(bpm3));
  // console.log("bpm" + bpm);
  loadTrack();
  // fetch(musicPath)
  // .then(response => response.json())
  // .then(jsonResponse => parseAfterReading(jsonResponse));
}

function parseAfterReading(json: JSON) {
  if (controls.Difficulty == 'easy') {
    console.log("parse the easy json")
    parseTracksEasy(json);
  } else if (controls.Difficulty == 'hard') {
    console.log("parse the hard json")
    parseTracksHard(json);
  }

  // console.log("buttons: " + buttons.length);
  // console.log("parse" + buttons.length);
  buttons.sort(function (a: any, b: any) {
    return a.getTime() - b.getTime();
  });
  console.log("sorted the buttons");

}

//easy version
function parseTracksEasy(json: JSON) {
  console.log("parse easy into track");
  //tracks are in an array
  var json2 = JSON.parse(JSON.stringify(json));
  var length = parseInt(JSON.stringify(json2.tracks.length));
  // console.log("length: " + length);
  for (let i = 0; i < length; i++) {
    //track's notes are in an array
    var oneTrack = json2.tracks[i];
    let notes = oneTrack["notes"];
    var noteLength = parseInt(JSON.stringify(notes.length));
    // console.log("LENGTH OF NOTES: " + noteLength);
    //if the track has notes to be played
    if (noteLength > 0) {
      var currTime = 0;
      for (let note of notes) {
        var number = parseFloat(JSON.stringify(note.midi));
        var time = parseFloat(JSON.stringify(note.time));
        var deltaTime = time - currTime;
        currTime = time;
        // console.log("time " + time);
        // console.log("dtime " + deltaTime);
        // console.log("midi " + number);

        //connect - 0.35
        //run - 0.25
        //if the time difference between one note and the other is :
        if (deltaTime > 0.7) {
          var b;
          if (number > 0 && number < 55) {
            b = new Button("S", time);
          } else if (number > 55 && number < 65) {
            b = new Button("D", time);
          } else if (number > 65 && number < 70) {
            b = new Button("F", time);
          } else if (number > 70 && number < 75) {
            b = new Button("J", time);
          } else if (number > 75 && number < 83) {
            b = new Button("K", time);
          } else if (number > 83 && number < 127) {
            b = new Button("L", time);
          }
          buttons.push(b);
        }
      }
    }
  }
}

//hard version
function parseTracksHard(json: JSON) {
  console.log("parse hard into track");
  //tracks are in an array
  var json2 = JSON.parse(JSON.stringify(json));
  var length = parseInt(JSON.stringify(json2.tracks.length));
  for (let i = 0; i < length; i++) {
    //track's notes are in an array
    var oneTrack = json2.tracks[i];
    let notes = oneTrack["notes"];
    var noteLength = parseInt(JSON.stringify(notes.length));
    //console.log("LENGTH OF NOTES: " + noteLength);
    //if the track has notes to be played
    if (noteLength > 0) {
      var currTime = 0;
      for (let note of notes) {
        var number = parseFloat(JSON.stringify(note.midi));
        var time = parseFloat(JSON.stringify(note.time));
        var deltaTime = time - currTime;
        currTime = time;

        // console.log("time " + time);
        // console.log("dtime " + deltaTime);
        // console.log("midi " + number);

        //for buttons that happen 0.3
        //connect - 0.35
        //run - 0.25
        var max = 3;
        var min = -3;
        var rand = Math.random() * (max - min) + min;
        if (deltaTime > 0.7) {
          var b;
          if (number > 0 + rand && number < 66 + rand) {
            b = new Button("A", time);
          } else if (number > 66 + rand && number < 69 + rand) {
            b = new Button("S", time);
          } else if (number > 69 + rand && number < 73 + rand) {
            b = new Button("D", time);
          } else if (number > 73 + rand && number < 77 + rand) {
            b = new Button("F", time);
          } else if (number > 77 + rand && number < 79 + rand) {
            b = new Button("J", time);
          } else if (number > 79 + rand && number < 82 + rand) {
            b = new Button("K", time);
          } else if (number > 82 + rand && number < 85 + rand) {
            b = new Button("L", time);
          } else if (number > 85 + rand && number < 127) {
            b = new Button(";", time);
          }
          buttons.push(b);
        }
      }
    }
  }
  // loadTrackEasy();
}

function loadTrack() {
  console.log("load track");
  //track 
  track = new Track(vec3.fromValues(0, 0, 0));
  if (controls.Difficulty == "easy") {
    //loadInitialPositionsEasy();
    loadTrackEasy();
    //loadOnly10Easy();
  } else if (controls.Difficulty == "hard") {
    loadTrackHard();
    //loadInitialPositionsHard();
    //loadOnly10Hard();
  }
  track.create();
  // console.log("length of track pos: " + track.pos.length);
}

function loadTrackEasy() {
  console.log("load easy track");
  //console.log("buttons: " + buttons.length);
  //since you have a list of buttons, lets create them all at once
  //the user will travel forward on the line
  // console.log("j" + buttons.length);
  var c = 0;
  for (let one of buttons) {
    c++;
    var letter = one.getLetter();
    // console.log("letter " + letter);
    var time = one.getTime();
    // console.log("time " + time);
    var spacing = -7;
    // console.log("parse letters to make into:" + letter);

    let buttonStr = readTextFile('./src/resources/obj/button.obj');
    let button = new Mesh(buttonStr, vec3.fromValues(0, 0, 0));

    var pos = vec3.fromValues(0, 0, 0);

    // console.log(c + " button: " + letter);

    if (letter == 'S') {
      pos = vec3.fromValues(-7, 0, time * spacing);
    } else if (letter == 'D') {
      pos = vec3.fromValues(-4.5, 0, time * spacing);
    } else if (letter == 'F') {
      pos = vec3.fromValues(-2, 0, time * spacing);
    } else if (letter == 'J') {
      pos = vec3.fromValues(2, 0, time * spacing);
    } else if (letter == 'K') {
      pos = vec3.fromValues(4.5, 0, time * spacing);
    } else if (letter == 'L') {
      pos = vec3.fromValues(7, 0, time * spacing);
    }

    button.translateVertices(pos); //translate button mesh
    one.setPosition(pos); //translate the button object
    buttonNum++;
    track.addMesh(button); //add the mesh button to the track
  }
}

function loadTrackHard() {
  console.log("load hard track");
  // console.log("buttons: " + buttons.length);
  //since you have a list of buttons, lets create them all at once
  //the user will travel forward on the line
  for (let one of buttons) {
    var letter = one.getLetter();
    var time = one.getTime();
    var spacing = -7;

    let buttonStr = readTextFile('./src/resources/obj/button.obj');
    let button = new Mesh(buttonStr, vec3.fromValues(0, 0, 0));

    //connect = 
    //bts run = -5
    var pos = vec3.fromValues(0, 0, 0);

    if (letter == 'A') {
      pos = vec3.fromValues(-9.5, 0, time * spacing);
    } else if (letter == 'S') {
      pos = vec3.fromValues(-7, 0, time * spacing);
    } else if (letter == 'D') {
      pos = vec3.fromValues(-4.5, 0, time * spacing);
    } else if (letter == 'F') {
      pos = vec3.fromValues(-2, 0, time * spacing);
    } else if (letter == 'J') {
      pos = vec3.fromValues(2, 0, time * spacing);
    } else if (letter == 'K') {
      pos = vec3.fromValues(4.5, 0, time * spacing);
    } else if (letter == 'L') {
      pos = vec3.fromValues(7, 0, time * spacing);
    } else if (letter == ';') {
      pos = vec3.fromValues(9.5, 0, time * spacing);
    }

    button.translateVertices(pos);
    one.setPosition(pos);
    buttonNum++;
    track.addMesh(button);
  }
}

function loadInitialPositionsEasy() {
  for (let one of buttons) {
    var letter = one.getLetter();
    var time = one.getTime();
    var spacing = -1;
    console.log("parse letters to make into:" + letter);

    let buttonStr = readTextFile('./src/resources/obj/button.obj');
    let button = new Mesh(buttonStr, vec3.fromValues(0, 0, 0));

    var pos = vec3.fromValues(0, 0, 0);
    if (letter == 'S') {
      pos = vec3.fromValues(-7, 0, time * spacing);
    } else if (letter == 'D') {
      pos = vec3.fromValues(-4.5, 0, time * spacing);
    } else if (letter == 'F') {
      pos = vec3.fromValues(-2, 0, time * spacing);
    } else if (letter == 'J') {
      pos = vec3.fromValues(2, 0, time * spacing);
    } else if (letter == 'K') {
      pos = vec3.fromValues(4.5, 0, time * spacing);
    } else if (letter == 'L') {
      pos = vec3.fromValues(7, 0, time * spacing);
    }

    button.translateVertices(pos);
    one.setPosition(pos);

    console.log("set positions initally: " + pos);

    //track.addMesh(button);
  }
}

function loadOnly10Easy() {
  track = new Track(vec3.fromValues(0, 0, 0));
  //from the list of buttons
  //only load 10 onto the track
  //update each time
  for (var i = 0; i < 10; i++) {
    var currButt = buttons[i];
    // var letter = currButt.getLetter();
    //console.log("parse letters to make into:" + letter);

    let buttonStr = readTextFile('./src/resources/obj/button.obj');
    let button = new Mesh(buttonStr, vec3.fromValues(0, 0, 0));

    var pos = currButt.getPosition();
    button.translateVertices(pos);
    buttons[i].setPosition(pos);

    // console.log("get time: " + i + " " + currButt.getTime());
    // console.log("set positions: " + i  + " " + pos);

    track.addMesh(button);
  }
}

function loadInitialPositionsHard() {
  //set the initial position of the buttons
  for (let one of buttons) {
    var letter = one.getLetter();
    var time = one.getTime();
    var spacing = -1;

    let buttonStr = readTextFile('./src/resources/obj/button.obj');
    let button = new Mesh(buttonStr, vec3.fromValues(0, 0, 0));

    var pos = vec3.fromValues(0, 0, 0);

    if (letter == 'A') {
      pos = vec3.fromValues(-9.5, 0, time * spacing);
    } else if (letter == 'S') {
      pos = vec3.fromValues(-7, 0, time * spacing);
    } else if (letter == 'D') {
      pos = vec3.fromValues(-4.5, 0, time * spacing);
    } else if (letter == 'F') {
      pos = vec3.fromValues(-2, 0, time * spacing);
    } else if (letter == 'J') {
      pos = vec3.fromValues(2, 0, time * spacing);
    } else if (letter == 'K') {
      pos = vec3.fromValues(4.5, 0, time * spacing);
    } else if (letter == 'L') {
      pos = vec3.fromValues(7, 0, time * spacing);
    } else if (letter == ';') {
      pos = vec3.fromValues(9.5, 0, time * spacing);
    }

    button.translateVertices(pos);
    one.setPosition(pos);
    // console.log("set positions initally: " + pos);
    // track.addMesh(button);
  }
}

function loadOnly10Hard() {
  track = new Track(vec3.fromValues(0, 0, 0));
  //from the list of buttons
  //only load 10 onto the track
  for (var i = 0; i < 10; i++) {
    var currButt = buttons[i];
    // var letter = currButt.getLetter();
    // console.log("parse letters to make into:" + letter);

    let buttonStr = readTextFile('./src/resources/obj/button.obj');
    let button = new Mesh(buttonStr, vec3.fromValues(0, 0, 0));

    var pos = currButt.getPosition();
    button.translateVertices(pos);

    //console.log("set positions initally: " + pos);
    track.addMesh(button);
  }
}

function main() {
  //debugger;
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.bottom = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, 'Difficulty', ['easy', 'hard']);
  gui.add(controls, 'Song', ['Shooting Stars', 'Merry Go Round of Life', 'Last Surprise', 'Run', 'Running in the 90s', 'Resonance', 'Heartache', 'Again', 'Cheerup', 'Megalovania']);
  gui.add(controls, 'Play/Pause');
  gui.add(controls, 'Load Song');
  gui.add(controls, 'Health', 0, 100).listen();
  gui.add(controls, 'Score').listen();

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement>document.getElementById('canvas');
  const gl = <WebGL2RenderingContext>canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();
  loadVisuals();

  const camera = new Camera(vec3.fromValues(0, 2, 10), vec3.fromValues(0, 0, 0));
  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.4, 0.3, 0.9, 1);

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  //mario
  const lambert = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/lambert-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/lambert-frag.glsl')),
  ]);

  //
  const tip_lambert = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/tip-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/tip-frag.glsl')),
  ]);

  //key buttons
  const button_lambert = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/button-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/button-frag.glsl')),
  ]);

  //the track buttons
  const track_lambert = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/track-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/track-frag.glsl')),
  ]);

  //transparent
  const plate_lambert = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/plate-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/plate-frag.glsl')),
  ]);

  const long_lambert = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/torus-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/torus-frag.glsl')),
  ]);

  //change fov
  //camera.fovy = 1.5;
  // console.log("amp:" + amp);
  // console.log("fft:" + FFT);

  var musicStr = controls.Song;
  var musicPath = './src/resources/music/mp3/' + musicStr + '.mp3';
  count = 0;
  long_lambert.setPressed(0); //for long boi, u_pressed is the bpm

  // This function will be called every frame
  function tick() {
    long_lambert.setTime(count);
    startTick = Date.now();

    var timeRightNow = Date.now();
    var timeSinceStart = timeRightNow - startTime;
    var timeSinceStartSec = timeSinceStart / 1000;
    //console.log("time counting: " + timeSinceStartSec);

    if (!started && controls.Difficulty == "easy") {
      // console.log("load easy mesh buttons");
      //load easy mesh buttons
      loadButtonsEasy();
      loaded = true;
    } else if (!started && controls.Difficulty == "hard") {
      //load 
      //console.log("load hard mesh buttons");
      loadButtonsHard();
      loaded = true;
    }

    //disable rollover controls
    camera.controls.rotationSpeed = 0;
    camera.controls.translationSpeed = 0;
    camera.controls.zoomSpeed = 0;

    camera.update();
    stats.begin();

    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();

    let base_color = vec4.fromValues(200 / 255, 60 / 255, 200 / 255, 1);

    //mario
    // lambert.setGeometryColor(base_color);
    // renderer.render(camera, lambert, [mario]);
    
    let background_col = vec4.fromValues(200 / 255, 60 / 255, 200 / 255, 1);
    
    //background
    lambert.setGeometryColor(background_col);
    renderer.render(camera, lambert, [background]);

    //long boi
    long_lambert.setGeometryColor(base_color);
    renderer.render(camera, long_lambert, [longboi1, longboi2, longboi3, longboi4, longboi5, longboi6, longboi7]);
    //plate
    base_color = vec4.fromValues(150 / 255, 240 / 255, 255 / 255, 1);
    plate_lambert.setGeometryColor(base_color);
    renderer.render(camera, plate_lambert, [square]);

    //buttons
    base_color = vec4.fromValues(255 / 255, 160 / 255, 200 / 255, 1);
    button_lambert.setGeometryColor(base_color);

    //tips
    base_color = vec4.fromValues(255 / 255, 160 / 255, 200 / 255, 1);
    tip_lambert.setGeometryColor(base_color);

    //user has not started game
    if (!started && controls.Difficulty == "easy") {
      button_lambert.setGeometryColor(base_color);
      renderer.render(camera, button_lambert, [buttonS, buttonD, buttonF, buttonK, buttonJ, buttonL]);
    } else if (!started && controls.Difficulty == "hard") {
      button_lambert.setGeometryColor(base_color);
      renderer.render(camera, button_lambert, [buttonA, buttonS, buttonD, buttonF, buttonK, buttonJ, buttonL, buttonP]);
    }

    // function render(input: string, timepressed: number) {
    //   base_color = vec4.fromValues(255 / 255, 255 / 255, 225 / 255, 1);
    //   while (timepressed - timeSinceStartSec < 0.02) {
    //     renderer.render(camera, tip_lambert, [buttonS]);
    //     if (input == 'A') {
    //       renderer.render(camera, tip_lambert, [buttonA]);
    //     } else if (input == 'S') {
    //       renderer.render(camera, tip_lambert, [buttonS]);
    //     } else if (input == 'D') {
    //       renderer.render(camera, tip_lambert, [buttonD]);
    //     } else if (input == 'F') {
    //       renderer.render(camera, tip_lambert, [buttonF]);
    //     } else if (input == 'J') {
    //       renderer.render(camera, tip_lambert, [buttonJ]);

    //     } else if (input == 'K') {
    //       renderer.render(camera, tip_lambert, [buttonK]);

    //     } else if (input == 'L') {
    //       renderer.render(camera, tip_lambert, [buttonL]);

    //     } else if (input == ';') {
    //       renderer.render(camera, tip_lambert, [buttonP]);

    //     }
    //   }
    // }
    //user starts game
    console.log(buttonNum);
    if (started) {
      count++;
      var d = bpm % tickFrame;
      long_lambert.setPressed(d);
      console.log("d" + d);
      //if (started && buttons.length > 50) {
      //render track
      base_color = vec4.fromValues(65 / 255, 105 / 255, 225 / 255, 1);
      track_lambert.setGeometryColor(base_color);
      renderer.render(camera, track_lambert, [track]);

      //calculate the buttons positions as the track moves across
      //with time since start
      var rate = 7.0;
      //rate += 0.0000001;
      var time = timeSinceStartSec;
      var distance = time * rate;

      //calculate distance with dT
      // var rate2 = 0.009;
      // time = tickFrame;
      // var distance2 = time * rate2;
      // console.log("distance: " + distance2 + " " + distance);

      //update the position of all buttons
      // for (let button of buttons) {
      //   var originalPos = button.getPosition();
      //   var newPos = vec3.fromValues(originalPos[0], originalPos[1], originalPos[2] + distance);
      //   button.setPosition(newPos);
      //   //console.log("new Positions: " + newPos);
      // }

      track_lambert.setTime(distance);
      //translate the track
      //track.translateVertices(vec3.fromValues(0, 0, 1));

      //reload the track
      // if(controls.Difficulty == 'easy') {
      //   loadOnly10Easy();
      // } else {
      //   loadOnly10Hard();
      // }

      for (var i = 0; i < 2; i++) {
        var curr = buttons[i];
        var time = curr.getTime();
        // console.log("time Z " + time + " position " + curr.getPosition());
        var checkTime1 = timeSinceStartSec - epsilon;
        var checkTime2 = timeSinceStartSec + epsilon;
        if (time >= checkTime1 && time <= checkTime2) {
          //var position = curr.getPosition();
          //var checkPosZ = position[2];
          //console.log("position Z " + checkPosZ );
          // console.log("check this position mark: " + checkLine1 + " " + checkLine2);
          //console.log("button position: " + position + " button time: " + time + " check this time mark: " + checkTime1 + " " + checkTime2);
          // if (checkPosZ >= checkLine1 && checkPosZ <= checkLine2) {
          // console.log("new: " + position[2]);
          // console.log("a button passed z: " + position + " " + letter);
          var letter = curr.getLetter();
          //console.log("letter that passed: " + letter + " pos: " + position + " time: " + time);
          base_color = vec4.fromValues(260 / 255, 260 / 255, 260 / 255, 1);
          tip_lambert.setGeometryColor(base_color);

          if (letter == 'A') {
            if (downA) {
              points++;
              renderer.render(camera, tip_lambert, [buttonATip]);
              renderer.render(camera, tip_lambert, [buttonA]);
            } else {
              health--;
            }
          }
          if (letter == 'S') {
            if (downS) {
              // render('S', timeSinceStartSec);
              renderer.render(camera, tip_lambert, [buttonSTip]);
              renderer.render(camera, tip_lambert, [buttonS]);
              points++;
            } else {
              health--;
            }
          }
          if (letter == 'D') {
            if (downD) {
              // render('D', timeSinceStartSec);
              renderer.render(camera, tip_lambert, [buttonDTip]);
              renderer.render(camera, tip_lambert, [buttonD]);
              points++;
            } else {
              health--;
            }
          }
          if (letter == 'F') {
            if (downF) {
              // render('F', timeSinceStartSec);
              renderer.render(camera, tip_lambert, [buttonFTip]);
              renderer.render(camera, tip_lambert, [buttonF]);
              points++;
            } else {
              health--;
            }
          }
          if (letter == 'J') {
            if (downJ) {
              renderer.render(camera, tip_lambert, [buttonJTip]);
              renderer.render(camera, tip_lambert, [buttonJ]);

              points++;
            } else {
              health--;
            }
          }
          if (letter == 'K') {
            if (downK) {
              renderer.render(camera, tip_lambert, [buttonKTip]);
              renderer.render(camera, tip_lambert, [buttonK]);
              points++;
            } else {
              health--;
            }
          }
          if (letter == 'L') {
            if (downL) {
              renderer.render(camera, tip_lambert, [buttonLTip]);
              renderer.render(camera, tip_lambert, [buttonL]);
              points++;
            } else {
              health--;
            }
          }
          if (letter == ';') {
            if (downP) {
              renderer.render(camera, tip_lambert, [buttonPTip]);
              renderer.render(camera, tip_lambert, [buttonP]);
              points++;
            } else {
              health--;
            }
          }

          document.getElementById("health").innerHTML = "Health: " + health;
          document.getElementById("points").innerHTML = "Score: " + points;

          if (health <= 0) {
            console.log("health IS zero");
            document.getElementById("game").innerHTML = "YOU LOSE!";
            started = false;
            JukeBox.close();
          }
          buttons.shift();
          var b = new Button("fake", 0);
          buttons.push(b);
        }
        //  }
        if (buttons[0].getLetter() == 'fake') {
          document.getElementById("game").innerHTML = "YOU WIN!";
        }
      }

      //  //current easy buttons
      if (controls.Difficulty == "easy") {
        if (downS) {
          button_lambert.setPressed(1);
          renderer.render(camera, button_lambert, [buttonS]);
          renderer.render(camera, tip_lambert, [buttonSTip]);
        } else {
          button_lambert.setPressed(0);
          renderer.render(camera, button_lambert, [buttonS]);
        }
        if (downD) {
          button_lambert.setPressed(1);
          renderer.render(camera, button_lambert, [buttonD]);
          renderer.render(camera, tip_lambert, [buttonDTip]);
        } else {
          button_lambert.setPressed(0);
          renderer.render(camera, button_lambert, [buttonD]);
        }

        if (downF) {
          button_lambert.setPressed(1);
          renderer.render(camera, button_lambert, [buttonF]);
          renderer.render(camera, tip_lambert, [buttonFTip]);
        } else {
          button_lambert.setPressed(0);
          renderer.render(camera, button_lambert, [buttonF]);
        }

        if (downJ) {
          button_lambert.setPressed(1);
          renderer.render(camera, button_lambert, [buttonJ]);
          renderer.render(camera, tip_lambert, [buttonJTip]);
        } else {
          button_lambert.setPressed(0);
          renderer.render(camera, button_lambert, [buttonJ]);
        }

        if (downK) {
          button_lambert.setPressed(1);
          renderer.render(camera, button_lambert, [buttonK]);
          renderer.render(camera, tip_lambert, [buttonKTip]);
        } else {
          button_lambert.setPressed(0);
          renderer.render(camera, button_lambert, [buttonK]);
        }

        if (downL) {
          button_lambert.setPressed(1);
          renderer.render(camera, button_lambert, [buttonL]);
          renderer.render(camera, tip_lambert, [buttonLTip]);
        } else {
          button_lambert.setPressed(0);
          renderer.render(camera, button_lambert, [buttonL]);
        }
      } else if (controls.Difficulty == "hard") {
        if (downA) {
          button_lambert.setPressed(1);
          renderer.render(camera, button_lambert, [buttonA]);
          renderer.render(camera, tip_lambert, [buttonATip]);
        } else {
          button_lambert.setPressed(0);
          renderer.render(camera, button_lambert, [buttonA]);
        }
        if (downS) {
          button_lambert.setPressed(1);
          renderer.render(camera, button_lambert, [buttonS]);
          renderer.render(camera, tip_lambert, [buttonSTip]);
        } else {
          button_lambert.setPressed(0);
          renderer.render(camera, button_lambert, [buttonS]);
        }
        if (downD) {
          button_lambert.setPressed(1);
          renderer.render(camera, button_lambert, [buttonD]);
          renderer.render(camera, tip_lambert, [buttonDTip]);
        } else {
          button_lambert.setPressed(0);
          renderer.render(camera, button_lambert, [buttonD]);
        }

        if (downF) {
          button_lambert.setPressed(1);
          renderer.render(camera, button_lambert, [buttonF]);
          renderer.render(camera, tip_lambert, [buttonFTip]);
        } else {
          button_lambert.setPressed(0);
          renderer.render(camera, button_lambert, [buttonF]);
        }

        if (downJ) {
          button_lambert.setPressed(1);
          renderer.render(camera, button_lambert, [buttonJ]);
          renderer.render(camera, tip_lambert, [buttonJTip]);
        } else {
          button_lambert.setPressed(0);
          renderer.render(camera, button_lambert, [buttonJ]);
        }

        if (downK) {
          button_lambert.setPressed(1);
          renderer.render(camera, button_lambert, [buttonK]);
          renderer.render(camera, tip_lambert, [buttonKTip]);
        } else {
          button_lambert.setPressed(0);
          renderer.render(camera, button_lambert, [buttonK]);
        }

        if (downL) {
          button_lambert.setPressed(1);
          renderer.render(camera, button_lambert, [buttonL]);
          renderer.render(camera, tip_lambert, [buttonLTip]);
        } else {
          button_lambert.setPressed(0);
          renderer.render(camera, button_lambert, [buttonL]);
        }

        if (downP) {
          button_lambert.setPressed(1);
          renderer.render(camera, button_lambert, [buttonP]);
          renderer.render(camera, tip_lambert, [buttonPTip]);
        } else {
          button_lambert.setPressed(0);
          renderer.render(camera, button_lambert, [buttonP]);
        }
      }
    }

    stats.end();
    endTick = Date.now();
    tickFrame = endTick - startTick;
    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function () {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);

  //listen to key press
  window.addEventListener('keydown', keyPressed, false);
  window.addEventListener('keyup', keyReleased, false);
  
  // //drag and drop
  // window.addEventListener("dragenter", dragenter, false);  
  // window.addEventListener("dragover", dragover, false);
  // window.addEventListener("drop", drop, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  // Start the render loop
  tick();
}

main();

function startGame() {
  if (play == 0) {
    //window.setTimeout(parseJSON(), 100000);
    parseJSON();
    // play_music();
    //loadTrack();
    window.setTimeout(play_music(), 100000);
    // window.setTimeout(loadTrack(), 10000);
    if (controls.Difficulty == "easy") {
      epsilon = .2;
    }
    else if (controls.Difficulty == "hard") {
      epsilon = .4;
    }

    // checkLine1 = 0 - epsilon;
    // checkLine2 = 0 + epsilon;

    var d = Date.now();
    startTime = d;
    playing = true;
    started = true;

    //display status
    document.getElementById("game").innerHTML = "In progress: " + controls.Song;
    document.getElementById("health").innerHTML = "Health: " + health;
    document.getElementById("points").innerHTML = "Score: " + points;
  }

  document.getElementById('visualizerInfo').style.visibility = "hidden";

  play++;

}
// function drop(event: file)
function keyReleased(event: KeyboardEvent) {
  switch (event.keyCode) {
    case 65:
      //A
      downA = false;
      break;
    case 83:
      //S
      downS = false;
      break;
    case 68:
      //D
      downD = false;
      break;
    case 70:
      //F
      downF = false;
      break;
    case 74:
      //J
      downJ = false;
      break;
    case 75:
      //K
      downK = false;
      break;
    case 76:
      //L
      downL = false;
      break;
    case 186:
      //;
      downP = false;
      break;
  }
}

function keyPressed(event: KeyboardEvent) {
  switch (event.keyCode) {
    case 65:
      //A
      downA = true;
      break;
    case 83:
      //S
      downS = true;
      break;
    case 68:
      //D
      downD = true;
      break;
    case 70:
      //F
      downF = true;
      break;
    case 74:
      //J
      downJ = true;
      break;
    case 75:
      //K
      downK = true;
      break;
    case 76:
      //L
      downL = true;
      break;
    case 186:
      //;
      downP = true;
      break;
    case 32:
      // //space bar
      // //pause
      // startGame = false;
      // break;
    case 86:
      //Player starts game for the first time
      startGame();
      break;
  }
  function dragenter(e: Event) {
    e.stopPropagation();
    e.preventDefault();
  }

  function dragover(e: Event) {
    e.stopPropagation();
    e.preventDefault();
  }

  // function drop(e: Event) {
  //   e.stopPropagation();
  //   e.preventDefault();
  //   if (audioFile == undefined) {
  //     setupAudio(e.dataTransfer.files[0]);
  //   } else {
  //     // stop current visualization and load new song
  //     audioSourceBuffer.stop();
  //     setupAudio(e.dataTransfer.files[0]);
  //   }
  // }
}

