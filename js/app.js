import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
	import {  } from 'three/examples/jsm/shaders/PixelShader.js';

import fragment from "./shader/fragment.glsl";
import fragment1 from "./shader/fragment1.glsl";

import vertex from "./shader/vertex.glsl";
import * as dat from "dat.gui";
 import landscape from "../3.jpg";

export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();

    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x11111, 1); 
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );

    // var frustumSize = 10;
    // var aspect = window.innerWidth / window.innerHeight;
    // this.camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );
    this.camera.position.set(0, 0, 2);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.time = 0;

    this.isPlaying = true;
    
    this.addObjects();
    this.resize();
    this.render();
    this.setupResize();
    // this.settings();
  }

  settings() {
    let that = this;
    this.settings = {
      progress: 0,
    };
    this.gui = new dat.GUI();
    this.gui.add(this.settings, "progress", 0, 1, 0.01);
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    //image covert
    this.imageAspect = 853 / 1200;
    let a1; let a2;
    if (this.height / this.width > this.imageAspect) {
      a1 = (this.width/this.height) * this.imageAspect;
      a2 = 1;

    } else {
      a1 = 1;
      a2 = (this.height/this.width) / this.imageAspect;
    }
    this.material.uniforms.resolution.value.x = this.width;
    this.material.uniforms.resolution.value.y = this.height;
    this.material.uniforms.resolution.value.z = a1;
    this.material.uniforms.resolution.value.w = a2;

  }


  addObjects() {
    let that = this;
    let t = new THREE.TextureLoader().load(landscape) ;
    t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping;
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { type: "f", value: 0 },
        landscape: { value: t},
        resolution: { type: "v4", value: new THREE.Vector4() },
        uvRate1: {
          value: new THREE.Vector2(1, 1)
        }
      },
      // wireframe: true,
      // transparent: true,
      vertexShader: vertex,
      fragmentShader: fragment
    });
    this.material1 = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { type: "f", value: 0 },
        landscape: { value: t},
        resolution: { type: "v4", value: new THREE.Vector4() },
        uvRate1: {
          value: new THREE.Vector2(1, 1)
        }
      },
      // wireframe: true,
      // transparent: true,
      vertexShader: vertex,
      fragmentShader: fragment1
    });
    this.geometry = new THREE.IcosahedronGeometry(1, 1);
    this.geometry1 = new THREE.IcosahedronBufferGeometry(1.0001, 1);
    
    let length = this.geometry1.attributes.position.array.length;
    // alert(length); 

    let lazy = [];
    for (let index = 0; index < length; index++) {
     lazy.push(0,0,1,  0,1,0,  1,0,0);
      
    }

    let alazy = new Float32Array(lazy);

    this.geometry1.setAttribute('alazy', new THREE.BufferAttribute(alazy, 3));
    this.icon = new THREE.Mesh(this.geometry1, this.material);
    this.iconLines = new THREE.Mesh(this.geometry1, this.material1);

    this.scene.add(this.icon);
    this.scene.add(this.iconLines);
  }

  stop() {
    this.isPlaying = false;
  }

  play() {
    if(!this.isPlaying){
      this.render()
      this.isPlaying = true;
    }
  }

  render() {
    if (!this.isPlaying) return;
    this.time += 0.001;
    this.scene.rotation.x = this.time;
    this.scene.rotation.y = this.time;
    this.material.uniforms.time.value = this.time;
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
}

new Sketch({
  dom: document.getElementById("container")
});
