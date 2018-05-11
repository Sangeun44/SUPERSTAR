import { vec3 } from 'gl-matrix';

export default class Button {
    letter: string;
    time: number;
    position: vec3;
    
    constructor(letter: string, time: number) {
      // if we want to access these later, we need to bind them to 'this'
      this.letter = letter;
      this.time = time;
      this.position = vec3.fromValues(0,0,0);
    }

    getTime() {
      return this.time;
    }

    setTime(time: number) {
      this.time = time;
    }

    getLetter() {
      return this.letter;
    }

    setLetter(letter : string) {
        this.letter = letter;
    }

    getPosition() {
        return this.position;    
    }

    setPosition(position:vec3) {
        this.position = position;
    }

  }
  // Usage:
//   var person = new Person("Austin", "555-555-5555");
//   console.log(person.name)              // Austin
//   person.setName("Austin Eng")
//   console.log(person.getName())         // Austin Eng