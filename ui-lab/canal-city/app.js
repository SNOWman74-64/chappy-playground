import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const places=[
  {title:'時計塔広場',category:'01 / THE CLOCK SQUARE',description:'街の時間は、この塔から。運河沿いを走る路面電車を眺めながら、待ち合わせより少し早く着いた午後を楽しもう。',meta:'時計塔のふもと · 街を見渡す場所',target:[-2.4,1.2,-6.5],pin:[-2.4,8,-6.5]},
  {title:'運河マーケット',category:'02 / THE CANAL MARKET',description:'黄色いひさしの下には、焼きたてのパンと季節の果物。いつもより遠回りして、今日のおやつを探しに。',meta:'南岸の市場 · 黄色い屋根が目印',target:[6.3,.7,6.5],pin:[6.3,3.5,6.5]},
  {title:'木陰の庭',category:'03 / THE POCKET GARDEN',description:'街のはしっこに、小さな緑の居場所。木々のそばで深呼吸。次の予定は、もう少しあとで考えよう。',meta:'南岸の小さな庭 · ひと息つける場所',target:[8,.7,9.5],pin:[10,3.8,9.5]}
];
let renderer,scene,camera,controls,water,tram,sun,ambient,city,animation=null,paused=reduced.matches,night=false,ready=false;
let elapsed=0,last=performance.now(),selected=-1; const visited=new Set();
const host=$('#scene');
const diagnostic={ready:false,selected:-1,paused,night:false,frames:0};
window.canalState=diagnostic;
function message(text){$('#load-message').textContent=text;$('#loading').hidden=false;$('#retry').hidden=false;$('#pins').style.visibility='hidden';}
$('#retry').onclick=()=>location.reload();
function box(w,h,d,color,x=0,y=0,z=0){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness:.7}));o.position.set(x,y,z);o.castShadow=true;return o;}
function viewHome(){return innerWidth<=700?new THREE.Vector3(33,31,39):new THREE.Vector3(30,27,34);}
function fly(target,position){animation={start:performance.now(),from:camera.position.clone(),to:position,oldTarget:controls.target.clone(),target};if(reduced.matches){camera.position.copy(position);controls.target.copy(target);animation=null;controls.update();}}
function choose(index){if(!ready)return;selected=index;diagnostic.selected=index;visited.add(index);const p=places[index];$('#place-category').textContent=p.category;$('#place-title').textContent=p.title;$('#place-description').textContent=p.description;$('#place-meta').textContent=p.meta;$('#discovery-count').textContent=`${visited.size} / 3`;$('#progress-fill').style.width=`${visited.size/3*100}%`;$('.story').classList.add('has-selection');$$('[data-place]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.place)===index)));const target=new THREE.Vector3(...p.target);fly(target,target.clone().add(innerWidth<=700?new THREE.Vector3(20,21,26):new THREE.Vector3(20,17,24)));}
$$('[data-place]').forEach(b=>b.onclick=()=>choose(Number(b.dataset.place)));
function reset(){if(!ready)return;selected=-1;diagnostic.selected=-1;$('.story').classList.remove('has-selection');$('#place-category').textContent='YOUR LITTLE DETOUR';$('#place-title').textContent='ようこそ、運河の街へ。';$('#place-description').textContent='時計の音。市場のにぎわい。木陰のベンチ。気になる場所を選んで、この街の日常をのぞいてみよう。';$('#place-meta').textContent='架空の街で、自由なひととき。';$$('[data-place]').forEach(b=>b.setAttribute('aria-pressed','false'));fly(new THREE.Vector3(0,0,0),viewHome());}
$('#overview').onclick=reset;
function zoom(factor){if(!ready)return;animation=null;const offset=camera.position.clone().sub(controls.target);offset.setLength(THREE.MathUtils.clamp(offset.length()*factor,controls.minDistance,controls.maxDistance));camera.position.copy(controls.target).add(offset);controls.update();}
$('#zoom-in').onclick=()=>zoom(.82);$('#zoom-out').onclick=()=>zoom(1.22);
function setPaused(value){paused=value;diagnostic.paused=value;$('#pause').setAttribute('aria-pressed',String(value));$('#pause').textContent=value?'▷ 動きを再開':'Ⅱ 動きを止める';}
$('#pause').onclick=()=>setPaused(!paused);setPaused(paused);
reduced.addEventListener('change',e=>{if(e.matches)setPaused(true);});
function setTime(value){night=value==='night';diagnostic.night=night;document.body.classList.toggle('night',night);$$('[data-time]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.time===value)));$('#weather').innerHTML=night?'☾ <span>20:00</span>　灯りのともる夜':'☀ <span>14:00</span>　穏やかな午後';if(!scene)return;scene.background.set(night?0x152b2c:0xf3f2ec);scene.fog.color.copy(scene.background);ambient.intensity=night?1.1:2.4;sun.intensity=night?.7:3.0;sun.color.set(night?0x92bfd8:0xffecd2);water.material.color.set(night?0x204e56:0x75b8aa);city?.traverse(o=>{if(o.isMesh&&o.material.name==='windowGlow'){o.material.emissive.set(0xffcb65);o.material.emissiveIntensity=night?2.6:0;}if(o.isMesh&&o.material.name==='glass'){o.material.emissive.set(0xeaae54);o.material.emissiveIntensity=night?.8:0;}});}
$$('[data-time]').forEach(b=>b.onclick=()=>setTime(b.dataset.time));
async function init(){
 try{
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;
  host.append(renderer.domElement);renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','3Dの街。矢印キーで回転、プラスとマイナスで拡大縮小、Homeで全体表示。');renderer.domElement.setAttribute('role','img');
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();ready=false;diagnostic.ready=false;message('3Dの表示が中断されました。再読み込みで街に戻れます。');});
  scene=new THREE.Scene();scene.background=new THREE.Color(0xf3f2ec);scene.fog=new THREE.Fog(0xf3f2ec,95,180);
  camera=new THREE.PerspectiveCamera(37,1,.1,200);camera.position.copy(viewHome());
  controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.07;controls.enablePan=false;controls.minDistance=20;controls.maxDistance=72;controls.minPolarAngle=.3;controls.maxPolarAngle=1.22;controls.target.set(0,0,0);controls.update();controls.addEventListener('start',()=>animation=null);
  renderer.domElement.addEventListener('keydown',e=>{const keys=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','Home'];if(!keys.includes(e.key))return;e.preventDefault();animation=null;if(e.key==='Home')return reset();if(['+','=','-'].includes(e.key))return zoom(e.key==='-'?1.15:.87);const offset=camera.position.clone().sub(controls.target),spherical=new THREE.Spherical().setFromVector3(offset);spherical.theta+=e.key==='ArrowLeft'?.12:e.key==='ArrowRight'?-.12:0;spherical.phi=THREE.MathUtils.clamp(spherical.phi+(e.key==='ArrowUp'?-.08:e.key==='ArrowDown'?.08:0),.3,1.22);camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));controls.update();});
  ambient=new THREE.HemisphereLight(0xf9f5e5,0x8c9a8e,2.4);scene.add(ambient);sun=new THREE.DirectionalLight(0xffecd2,3);sun.position.set(-18,35,20);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-23,right:23,top:23,bottom:-23,near:1,far:90});sun.shadow.bias=-.0006;sun.shadow.normalBias=.035;scene.add(sun);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.12}));floor.rotation.x=-Math.PI/2;floor.position.y=-.51;floor.receiveShadow=true;scene.add(floor);
  water=new THREE.Mesh(new THREE.BoxGeometry(27.6,.12,4.6),new THREE.MeshStandardMaterial({color:0x75b8aa,roughness:.28,metalness:.12}));water.position.y=.44;water.receiveShadow=true;scene.add(water);
  const rippleGroup=new THREE.Group();for(let i=0;i<24;i++){const ripple=box(.22+(i%4)*.19,.009,.025,0xc6ded0,-13+i*1.1,.505,Math.sin(i*4)*1.7);ripple.castShadow=false;rippleGroup.add(ripple);}scene.add(rippleGroup);
  tram=new THREE.Group();tram.add(box(2.5,.8,.88,0xd7af42,0,1.10,0),box(2.6,.13,.96,0xf3e5be,0,1.58,0));for(let i=-1;i<=1;i++){for(const z of [-.45,.45])tram.add(box(.53,.36,.02,0x254a43,i*.7,1.25,z));}for(const x of [-.8,.8])tram.add(box(.23,.25,1,0x30413a,x,.65,0));tram.position.set(-9,0,-3.65);scene.add(tram);
  const gltf=await new GLTFLoader().loadAsync('./assets/canal-city.glb');city=gltf.scene;city.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});scene.add(city);setTime(night?'night':'day');
  function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}new ResizeObserver(resize).observe(host);resize();
  ready=true;diagnostic.ready=true;$('#loading').hidden=true;$('#pins').style.visibility='visible';
  const positions=places.map(p=>new THREE.Vector3(...p.pin)),pins=$$('.pin');
  function frame(now){if(!ready)return;const delta=Math.min((now-last)/1000,.05);last=now;if(!paused&&!document.hidden){elapsed+=delta;tram.position.x=((elapsed*.75+4)%26)-13;rippleGroup.position.x=Math.sin(elapsed*.5)*.14;}if(animation){let t=Math.min((now-animation.start)/1000,1);t=t*t*(3-2*t);camera.position.lerpVectors(animation.from,animation.to,t);controls.target.lerpVectors(animation.oldTarget,animation.target,t);if(t===1)animation=null;}controls.update();positions.forEach((p,i)=>{const v=p.clone().project(camera),x=(v.x*.5+.5)*host.clientWidth,y=(-v.y*.5+.5)*host.clientHeight;pins[i].style.transform=`translate(${x-18}px,${y-18}px)`;pins[i].style.visibility=v.z<1&&Math.abs(v.x)<.93&&Math.abs(v.y)<.91?'visible':'hidden';});renderer.render(scene,camera);diagnostic.frames++;diagnostic.camera=camera.position.toArray();diagnostic.tramX=tram.position.x;diagnostic.drawCalls=renderer.info.render.calls;}
  renderer.setAnimationLoop(frame);
 }catch(error){console.error('Canal city could not load',error);message('街を読み込めませんでした。WebGL が使えるブラウザーで、もう一度お試しください。');}
}
init();
