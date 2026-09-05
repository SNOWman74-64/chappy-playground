'use strict';
(() => {
  const scene = document.querySelector('#scene');
  const sceneTools = document.querySelector('.scene-tools');
  if (!scene || !sceneTools || scene.querySelector('#walk-cafe')) return;

  const style = document.createElement('style');
  style.textContent = `
  .walk-enter{margin-left:8px;border:1px solid var(--line);border-radius:999px;padding:0 14px;min-height:36px;font-size:9px;background:var(--paper)}
  .walk-canvas{position:absolute;inset:0;width:100%;height:100%;z-index:7;opacity:0;pointer-events:none;transition:opacity .35s;background:linear-gradient(#dce5d5,#efe5ce)}
  .walk-ui{position:absolute;inset:0;z-index:8;pointer-events:none;opacity:0;transition:opacity .25s}
  .scene.walking .walk-canvas,.scene.walking .walk-ui{opacity:1}
  .scene.walking .walk-canvas{pointer-events:auto}
  .scene.walking .explore-layer,.scene.walking .hotspots{opacity:0;pointer-events:none}
  .walk-top{position:absolute;left:12px;right:12px;top:10px;display:flex;align-items:center;justify-content:space-between;gap:8px}
  .walk-pill,.walk-exit{pointer-events:auto;min-height:40px;border-radius:999px;padding:0 14px;background:#f7f2e8e8;border:1px solid #ffffff88;color:#31453b;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);font-size:9px;letter-spacing:.05em}
  .walk-pill{display:flex;align-items:center;gap:7px}.walk-pill i{width:6px;height:6px;border-radius:50%;background:#688568}
  .walk-help{position:absolute;top:57px;left:50%;transform:translateX(-50%);width:max-content;max-width:90%;padding:7px 11px;border-radius:999px;background:#f7f2e8d9;color:#536358;font-size:8px;letter-spacing:.03em}
  .walk-stick{position:absolute;left:18px;bottom:18px;width:112px;height:112px;border-radius:50%;border:1px solid #ffffff99;background:#24352b24;pointer-events:auto;touch-action:none;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
  .walk-stick:before{content:"移動";position:absolute;top:-19px;left:50%;transform:translateX(-50%);font-size:8px;color:#f7f2e8;text-shadow:0 1px 4px #0007;letter-spacing:.12em}
  .walk-knob{position:absolute;left:50%;top:50%;width:48px;height:48px;margin:-24px;border-radius:50%;background:#f6f0e2e8;border:1px solid #fff;box-shadow:0 4px 18px #0002;transform:translate(0,0)}
  .walk-look{position:absolute;right:18px;bottom:20px;width:96px;height:48px;border-radius:999px;border:1px solid #ffffff77;background:#24352b24;color:white;display:grid;place-items:center;font-size:8px;letter-spacing:.06em;pointer-events:none;text-shadow:0 1px 4px #0008}
  .walk-crosshair{position:absolute;left:50%;top:50%;width:18px;height:18px;transform:translate(-50%,-50%);opacity:.7}.walk-crosshair:before,.walk-crosshair:after{content:"";position:absolute;background:#fff;box-shadow:0 1px 3px #0006}.walk-crosshair:before{width:18px;height:1px;top:8px}.walk-crosshair:after{width:1px;height:18px;left:8px}
  .walk-near{position:absolute;left:50%;bottom:21px;transform:translateX(-50%);min-width:150px;text-align:center;padding:9px 12px;border-radius:999px;background:#f7f2e8e8;color:#33483b;font-size:9px;opacity:0;transition:opacity .2s;pointer-events:none}
  .walk-near.visible{opacity:1}
  @media(max-width:699px){.scene.walking{min-height:360px}.scene.walking+.scene-caption{opacity:.45}.walk-look{display:grid}}
  @media(min-width:700px){.scene.walking{min-height:520px}.walk-stick{width:126px;height:126px}.walk-look{width:120px}}
  @media(prefers-reduced-motion:reduce){.walk-canvas,.walk-ui,.walk-near{transition:none}}
  `;
  document.head.appendChild(style);

  const enter = document.createElement('button');
  enter.type = 'button';
  enter.className = 'walk-enter';
  enter.textContent = '店内を歩く ↗';
  enter.setAttribute('aria-label','一人称の店内散策モードに入る');
  sceneTools.appendChild(enter);

  const canvas = document.createElement('canvas');
  canvas.id = 'walk-cafe';
  canvas.className = 'walk-canvas';
  canvas.setAttribute('aria-hidden','true');
  scene.appendChild(canvas);

  const ui = document.createElement('div');
  ui.className = 'walk-ui';
  ui.innerHTML = `
    <div class="walk-top">
      <div class="walk-pill"><i></i> INSIDE PAPER MOON</div>
      <button type="button" class="walk-exit">模型にもどる</button>
    </div>
    <div class="walk-help">右側をドラッグして見回す · 左下で歩く</div>
    <div class="walk-stick" aria-label="移動スティック"><div class="walk-knob"></div></div>
    <div class="walk-look">ドラッグで見回す</div>
    <div class="walk-crosshair" aria-hidden="true"></div>
    <div class="walk-near" aria-live="polite"></div>
  `;
  scene.appendChild(ui);

  const gl = canvas.getContext('webgl',{alpha:false,antialias:true,powerPreference:'low-power'});
  if (!gl) {
    enter.disabled = true;
    enter.textContent = '店内散策はこの端末では利用できません';
    return;
  }

  const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
  const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255);
  function perspective(fovy,aspect,near,far){
    const f=1/Math.tan(fovy/2),nf=1/(near-far);
    return new Float32Array([f/aspect,0,0,0, 0,f,0,0, 0,0,(far+near)*nf,-1, 0,0,2*far*near*nf,0]);
  }
  function mul(a,b){
    const o=new Float32Array(16);
    for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)o[c*4+r]+=a[k*4+r]*b[c*4+k];
    return o;
  }
  function lookAt(eye,target){
    const norm=v=>{const l=Math.hypot(...v)||1;return v.map(n=>n/l)};
    const sub=(a,b)=>a.map((v,i)=>v-b[i]);
    const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
    const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
    const z=norm(sub(eye,target)),x=norm(cross([0,1,0],z)),y=cross(z,x);
    return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1]);
  }
  class Mesh{
    constructor(){this.a=[]}
    tri(a,b,c,color){const co=rgb(color);[a,b,c].forEach(p=>this.a.push(...p,...co))}
    quad(a,b,c,d,color){this.tri(a,b,c,color);this.tri(a,c,d,color)}
    box(x,y,z,w,h,d,color){
      const p=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]].map(([a,b,c])=>[x+a*w/2,y+b*h/2,z+c*d/2]);
      [[4,5,6,7],[1,0,3,2],[0,4,7,3],[5,1,2,6],[7,6,2,3],[0,1,5,4]].forEach(f=>this.quad(...f.map(i=>p[i]),color));
    }
    cylinder(x,y,z,r,h,color,seg=18){
      for(let i=0;i<seg;i++){
        const a=i/seg*Math.PI*2,b=(i+1)/seg*Math.PI*2;
        const p=t=>[x+Math.cos(t)*r,y-h/2,z+Math.sin(t)*r],q=t=>[x+Math.cos(t)*r,y+h/2,z+Math.sin(t)*r];
        this.quad(p(a),p(b),q(b),q(a),color);this.tri([x,y+h/2,z],q(a),q(b),color);
      }
    }
  }
  const m=new Mesh();
  m.box(0,.05,0,6.2,.10,4.5,'#e9dfc8');
  for(let x=-2.75;x<=2.75;x+=.68)for(let z=-1.9;z<=1.9;z+=.68)m.box(x,.115,z,.64,.02,.64,((Math.round((x+3)*10)+Math.round((z+2)*10))%2)?'#eee5d2':'#ddd2b9');
  m.box(0,1.85,-2.18,6.2,3.4,.12,'#edd8b8');
  m.box(-3.06,1.85,0,.12,3.4,4.4,'#d4dcc0');
  m.box(1.1,.80,-1.15,3.15,1.18,1.05,'#bd8770');m.box(1.1,1.43,-1.15,3.3,.10,1.15,'#e6d4ad');
  m.box(.25,1.75,-1.34,1.0,.55,.55,'#789784');m.box(.25,2.04,-1.34,1.08,.05,.62,'#a9b79c');
  m.cylinder(-1.02,1.04,.54,.86,.11,'#789777',26);m.cylinder(-1.02,.60,.54,.075,.86,'#9d7e5e',12);
  m.box(-2.13,.64,.08,.70,.12,.65,'#c4a57a');m.box(-2.13,1.05,-.18,.70,.55,.10,'#789777');
  m.box(-.77,.64,1.76,.70,.12,.65,'#c4a57a');m.box(-.77,1.05,1.99,.70,.55,.10,'#789777');
  m.box(2.09,1.53,-1.22,1.0,.08,.76,'#9f7e5f');m.box(2.09,2.07,-1.22,1.0,.05,.76,'#d8c39c');
  m.box(1.84,1.67,-1.16,.30,.16,.36,'#c79760');m.box(2.28,1.67,-1.16,.30,.16,.36,'#c79760');
  m.cylinder(2.10,.48,1.31,.34,.60,'#bd866b',16);m.cylinder(2.10,.79,1.31,.28,.05,'#5d6846',16);
  for(let i=0;i<8;i++){const a=i*Math.PI*.76,r=.30+(i%2)*.15;m.box(2.10+Math.cos(a)*r,1.18+(i%3)*.14,1.31+Math.sin(a)*r,.28,.08,.48,['#76925c','#8fa76a','#648354'][i%3]);}
  m.box(.9,2.65,-2.08,1.3,1.0,.05,'#a88b67');m.box(.9,2.65,-2.045,1.17,.87,.02,'#f2e8ce');
  m.box(-1.55,1.80,-2.03,1.65,2.0,.05,'#88a496');
  m.cylinder(.28,2.74,-.23,.28,.30,'#d0a96f',18);m.box(.28,3.18,-.23,.03,.80,.03,'#6f654f');

  const data=new Float32Array(m.a),stride=24;
  const vs=`attribute vec3 aPosition;attribute vec3 aColor;uniform mat4 uVP;varying vec3 vColor;varying float vHeight;void main(){vColor=aColor;vHeight=aPosition.y;gl_Position=uVP*vec4(aPosition,1.);}`;
  const fs=`precision mediump float;varying vec3 vColor;varying float vHeight;uniform vec3 uTint;void main(){float shade=.86+clamp(vHeight/8.,0.,.14);gl_FragColor=vec4(vColor*uTint*shade,1.);}`;
  function program(vsSrc,fsSrc){
    const p=gl.createProgram();
    for(const [type,src] of [[gl.VERTEX_SHADER,vsSrc],[gl.FRAGMENT_SHADER,fsSrc]]){
      const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);
      if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));
      gl.attachShader(p,s);gl.deleteShader(s);
    }
    gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));return p;
  }
  let prog;
  try{prog=program(vs,fs)}catch(err){console.warn('PAPER MOON walk shader:',err);enter.disabled=true;return}
  const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
  gl.enable(gl.DEPTH_TEST);
  const aPos=gl.getAttribLocation(prog,'aPosition'),aColor=gl.getAttribLocation(prog,'aColor'),uVP=gl.getUniformLocation(prog,'uVP'),uTint=gl.getUniformLocation(prog,'uTint');

  const player={x:-1.75,z:1.55,yaw:-.72,pitch:-.03,height:1.48,active:false};
  const collisions=[
    {x:1.1,z:-1.15,w:3.35,d:1.28},{x:-1.02,z:.54,w:1.95,d:1.95},{x:-2.13,z:.08,w:.9,d:.9},
    {x:-.77,z:1.76,w:.9,d:.9},{x:2.09,z:-1.22,w:1.25,d:1.0},{x:2.10,z:1.31,w:1.0,d:1.0}
  ];
  function blocked(x,z){
    const r=.22;
    if(x<-2.75+r||x>2.85-r||z<-1.90+r||z>1.95-r)return true;
    return collisions.some(o=>Math.abs(x-o.x)<o.w/2+r&&Math.abs(z-o.z)<o.d/2+r);
  }
  function move(dx,dz){const nx=player.x+dx,nz=player.z+dz;if(!blocked(nx,player.z))player.x=nx;if(!blocked(player.x,nz))player.z=nz;}
  function moodTint(){const mood=document.documentElement.dataset.mood;return mood==='night'?[.53,.58,.72]:mood==='dusk'?[.94,.78,.67]:[1,1,1];}
  function resize(){const r=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2),w=Math.max(1,Math.round(r.width*dpr)),h=Math.max(1,Math.round(r.height*dpr));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h)}}
  function draw(){
    if(!player.active)return;resize();gl.clearColor(.88,.88,.80,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    const cp=Math.cos(player.pitch),dir=[Math.sin(player.yaw)*cp,Math.sin(player.pitch),-Math.cos(player.yaw)*cp];
    const eye=[player.x,player.height,player.z],target=[eye[0]+dir[0],eye[1]+dir[1],eye[2]+dir[2]];
    const vp=mul(perspective(Math.PI/3,canvas.width/canvas.height,.05,30),lookAt(eye,target));
    gl.useProgram(prog);gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.enableVertexAttribArray(aPos);gl.vertexAttribPointer(aPos,3,gl.FLOAT,false,stride,0);gl.enableVertexAttribArray(aColor);gl.vertexAttribPointer(aColor,3,gl.FLOAT,false,stride,12);gl.uniformMatrix4fv(uVP,false,vp);gl.uniform3fv(uTint,moodTint());gl.drawArrays(gl.TRIANGLES,0,data.length/6);updateNear();
  }

  let raf=0,last=performance.now(),look=null,stick=null,keys=new Set();
  const stickEl=ui.querySelector('.walk-stick'),knob=ui.querySelector('.walk-knob'),near=ui.querySelector('.walk-near');
  function updateNear(){const places=[['カウンター',1.0,-1.15],['テーブル',-1.02,.54],['植物',2.1,1.31],['窓辺',-1.75,-1.72]];let best=null,dist=9;for(const p of places){const d=Math.hypot(player.x-p[1],player.z-p[2]);if(d<dist){best=p;dist=d}}if(best&&dist<1.35){near.textContent=`${best[0]}の近くです`;near.classList.add('visible')}else near.classList.remove('visible');}
  function tick(now){
    raf=0;if(!player.active)return;const dt=clamp((now-last)/1000,.001,.04);last=now;let sx=stick?.x||0,sy=stick?.y||0;
    if(keys.has('w')||keys.has('ArrowUp'))sy=-1;if(keys.has('s')||keys.has('ArrowDown'))sy=1;if(keys.has('a'))sx=-1;if(keys.has('d'))sx=1;
    if(sx||sy){const speed=1.45*dt,forward=-sy*speed,right=sx*speed;move(Math.sin(player.yaw)*forward+Math.cos(player.yaw)*right,-Math.cos(player.yaw)*forward+Math.sin(player.yaw)*right)}
    draw();raf=requestAnimationFrame(tick);
  }
  function start(){if(raf)return;last=performance.now();raf=requestAnimationFrame(tick)}
  function stop(){cancelAnimationFrame(raf);raf=0;stick=null;look=null;knob.style.transform='translate(0,0)'}
  function enterWalk(){if(player.active)return;player.active=true;scene.classList.add('walking');enter.setAttribute('aria-pressed','true');document.querySelector('#hint').textContent='店内散策中 · 左下で移動 / 右側ドラッグで見回す';start()}
  function exitWalk(){if(!player.active)return;player.active=false;stop();scene.classList.remove('walking');enter.setAttribute('aria-pressed','false');document.querySelector('#hint').textContent='1本指で回転 · 2本指で拡大'}
  enter.addEventListener('click',enterWalk);ui.querySelector('.walk-exit').addEventListener('click',exitWalk);
  canvas.addEventListener('pointerdown',e=>{if(!player.active||e.button!==0)return;look={id:e.pointerId,x:e.clientX,y:e.clientY,yaw:player.yaw,pitch:player.pitch};try{canvas.setPointerCapture(e.pointerId)}catch{}});
  canvas.addEventListener('pointermove',e=>{if(!look||e.pointerId!==look.id)return;player.yaw=look.yaw-(e.clientX-look.x)*.0052;player.pitch=clamp(look.pitch-(e.clientY-look.y)*.0038,-.72,.52)});
  const endLook=e=>{if(look&&(!e||e.pointerId===look.id))look=null};['pointerup','pointercancel','lostpointercapture'].forEach(t=>canvas.addEventListener(t,endLook));
  stickEl.addEventListener('pointerdown',e=>{e.preventDefault();const r=stickEl.getBoundingClientRect();stick={id:e.pointerId,cx:r.left+r.width/2,cy:r.top+r.height/2,x:0,y:0};try{stickEl.setPointerCapture(e.pointerId)}catch{}});
  stickEl.addEventListener('pointermove',e=>{if(!stick||e.pointerId!==stick.id)return;const dx=e.clientX-stick.cx,dy=e.clientY-stick.cy,max=32,l=Math.hypot(dx,dy)||1,k=Math.min(1,max/l),px=dx*k,py=dy*k;stick.x=px/max;stick.y=py/max;knob.style.transform=`translate(${px}px,${py}px)`});
  const endStick=e=>{if(stick&&(!e||e.pointerId===stick.id)){stick=null;knob.style.transform='translate(0,0)'}};['pointerup','pointercancel','lostpointercapture'].forEach(t=>stickEl.addEventListener(t,endStick));
  window.addEventListener('keydown',e=>{if(!player.active)return;const k=e.key.length===1?e.key.toLowerCase():e.key;if(['w','a','s','d','ArrowUp','ArrowDown'].includes(k)){keys.add(k);e.preventDefault()}if(e.key==='Escape'){exitWalk();e.preventDefault()}});
  window.addEventListener('keyup',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;keys.delete(k)});window.addEventListener('blur',()=>{keys.clear();endLook();endStick()});document.addEventListener('visibilitychange',()=>{if(document.hidden)exitWalk()});new ResizeObserver(()=>{if(player.active)draw()}).observe(scene);
  window.PaperMoonWalk=Object.freeze({enter:enterWalk,exit:exitWalk,diagnostics:()=>({version:'3.0',mode:player.active?'walk':'model',position:[+player.x.toFixed(2),+player.height.toFixed(2),+player.z.toFixed(2)],yaw:+player.yaw.toFixed(2),pitch:+player.pitch.toFixed(2)})});
})();