'use strict';
// One canonical drawing per direction. Only boots change during the walk cycle;
// the face, hat, hair and silhouette never switch to a different source drawing.
async function loadWalkerFrames() {
  const image = new Image();
  image.src = 'assets/walker.jpg';
  await image.decode();
  const result = [];
  const palette = ['#20283d','#34425c','#52647d','#7488a1','#99afc6',
    '#becddd','#dbe4ed','#f9faf7','#407198','#5999c7','#85bdeb',
    '#aed5ef','#f9dfc9','#efbca9','#d98e87','#ed8d42','#bd5733']
    .map(hex => [1,3,5].map(offset => parseInt(hex.slice(offset,offset+2),16)));
  for (let direction = 0; direction < 4; direction++) {
    const source = document.createElement('canvas');
    source.width = source.height = 300;
    const g = source.getContext('2d', {willReadFrequently:true});
    g.drawImage(image,308,direction*300+22,300,300,0,0,300,300);
    const pixels = g.getImageData(0,0,300,300), p = pixels.data;
    const visited = new Uint8Array(90000), queue = new Int32Array(90000);
    let head=0, tail=0;
    function visit(i) {
      if(i<0 || i>=90000 || visited[i]) return;
      visited[i]=1;
      const j=i*4;
      if(p[j]>225 && p[j+1]>225 && p[j+2]>225) queue[tail++]=i;
    }
    for(let i=0;i<300;i++){visit(i);visit(89700+i);visit(i*300);visit(i*300+299);}
    while(head<tail){
      const i=queue[head++];p[i*4+3]=0;
      if(i%300)visit(i-1);if(i%300<299)visit(i+1);
      visit(i-300);visit(i+300);
    }
    let left=300,top=300,right=0,bottom=0;
    for(let i=0;i<90000;i++) if(p[i*4+3]) {
      const x=i%300,y=Math.floor(i/300);
      left=Math.min(left,x);right=Math.max(right,x);
      top=Math.min(top,y);bottom=Math.max(bottom,y);
    }
    g.putImageData(pixels,0,0);
    const base=document.createElement('canvas');base.width=40;base.height=50;
    const b=base.getContext('2d',{willReadFrequently:true});
    const targetWidth=Math.min(38,Math.round((right-left+1)*48/(bottom-top+1)));
    b.imageSmoothingEnabled=true;b.imageSmoothingQuality='high';
    b.drawImage(source,left,top,right-left+1,bottom-top+1,Math.floor((40-targetWidth)/2),1,targetWidth,48);
    // Bake a shared small palette onto a fixed pixel grid once, not every frame.
    const small=b.getImageData(0,0,40,50), a=small.data;
    for(let i=0;i<a.length;i+=4){
      if(a[i+3]<160){a[i+3]=0;continue;}
      let best=palette[0],score=Infinity;
      for(const color of palette){
        const d=(a[i]-color[0])**2+(a[i+1]-color[1])**2+(a[i+2]-color[2])**2;
        if(d<score){score=d;best=color;}
      }
      a[i]=best[0];a[i+1]=best[1];a[i+2]=best[2];a[i+3]=255;
    }
    b.putImageData(small,0,0);
    for(const shift of [0,-1,0,1]){
      const frame=document.createElement('canvas');frame.width=40;frame.height=50;
      const f=frame.getContext('2d');f.imageSmoothingEnabled=false;
      f.drawImage(base,0,40,20,10,0,40+shift,20,10);
      f.drawImage(base,20,40,20,10,20,40-shift,20,10);
      f.drawImage(base,0,0,40,41,0,0,40,41);
      result.push(frame);
    }
  }
  return result;
}

function walkingDirection(dx,dy,current) {
  // Hysteresis prevents a thumb near the diagonal from rapidly flipping views.
  const horizontal=current===1 || current===2;
  if(horizontal ? Math.abs(dy)>Math.abs(dx)*1.35 : Math.abs(dx)>Math.abs(dy)*1.35)
    return horizontal ? (dy>0?0:3) : (dx>0?2:1);
  return horizontal ? (dx===0?current:dx>0?2:1) : (dy===0?current:dy>0?0:3);
}
