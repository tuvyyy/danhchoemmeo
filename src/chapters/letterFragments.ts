type Sprite = { image: HTMLCanvasElement | null };
type Fragment = {
  sprite: Sprite; polygon: { x: number; y: number }[];
  left: number; top: number; width: number; height: number; x: number; y: number;
  start: number; dx: number; dy: number; turn: number; flutter: number; atlasX: number; atlasY: number;
};

const random = (seed: number) => {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
};

// Only appearance/layout properties belong in a raster snapshot. Copying every
// computed property on every descendant stalled the first scroll frame.
const snapshotProperties = (`display position top right bottom left width height min-width min-height max-width max-height
 box-sizing margin padding border border-radius outline background color opacity visibility transform transform-origin rotate
 filter box-shadow overflow object-fit object-position font font-family font-size font-weight font-style line-height
 letter-spacing text-align text-transform text-decoration white-space vertical-align word-break text-wrap
 flex flex-direction flex-wrap flex-grow flex-shrink flex-basis align-items align-self justify-content gap
 grid-template-columns grid-template-rows grid-column grid-row perspective backface-visibility
 mask-image mask-size mask-position -webkit-mask-image`).trim().split(/\s+/);
function copyAppearance(source: Element, target: HTMLElement) {
  const style = getComputedStyle(source);
  for (const property of snapshotProperties) target.style.setProperty(property, style.getPropertyValue(property));
}

export function letterFragmentSources(letter: HTMLElement) {
  return [...letter.querySelectorAll<HTMLElement>(
    '.letter-keepsake,.letter-atelier__header,.letter-atelier__footer,.letter-desk__annotation,.letter-desk__controls,.letter-bloom-garden__flowers > *',
  )];
}
type Snapshot = { key: string; bitmap: Promise<HTMLCanvasElement> };
const snapshots = new WeakMap<HTMLElement, Snapshot>();
const embeddedAssets = new Map<string, Promise<string>>();
function snapshotKey(source: HTMLElement) {
  const canvases=[...source.querySelectorAll('canvas')].map(c=>`${c.dataset.bloomFrame}:${c.dataset.bloomStage}`).join(',');
  return `${source.offsetWidth}:${source.offsetHeight}:${source.closest('.letter-atelier')?.getAttribute('data-open')}:${source.querySelector('[data-page]')?.getAttribute('data-page')}:${canvases}`;
}

/** Prepare one object per idle task while reading, before the scroll handler needs it. */
export function prepareLetterFragments(letter: HTMLElement) {
  let cancelled=false, task=0;
  const sources=letterFragmentSources(letter);
  const next=()=>{
    if(cancelled)return;
    const source=sources.shift();if(!source)return;
    if(!Object.keys(document.documentElement.dataset).some(key=>key.endsWith('Handoff')))void snapshot(source).catch(()=>{});
    schedule();
  };
  const schedule=()=>{task=typeof window.requestIdleCallback==='function'?window.requestIdleCallback(next,{timeout:1000}):Number(globalThis.setTimeout(next,32));};
  schedule();
  return()=>{cancelled=true;if('cancelIdleCallback' in window)window.cancelIdleCallback(task);else clearTimeout(task);};
}

/** Freeze the actual rendered content once, including the current flower canvas frames. */
function freeze(source: HTMLElement): HTMLElement {
  const clone = source.cloneNode(false) as HTMLElement;
  copyAppearance(source, clone);
  clone.style.animation = "none";
  clone.style.transition = "none";
  clone.removeAttribute("id");
  clone.removeAttribute("autofocus");
  for (const child of source.childNodes) {
    if (child instanceof HTMLElement) {
      const childStyle = getComputedStyle(child);
      if (childStyle.display === "none" || childStyle.visibility === "hidden" || childStyle.opacity === "0" || child.classList.contains("sr-only")) continue;
    }
    if (child instanceof HTMLCanvasElement) {
      const image = document.createElement("img");
      image.src = child.toDataURL();
      image.alt = "";
      copyAppearance(child, image);
      clone.append(image);
    } else if (child instanceof HTMLElement) clone.append(freeze(child));
    else clone.append(child.cloneNode(true));
  }
  return clone;
}

/** Inline assets so the SVG is self-contained when rasterized by the browser. */
async function rasterize(template: HTMLElement, width: number, height: number) {
  await Promise.all([...template.querySelectorAll<HTMLImageElement>('img')].map(async image => {
    if (image.src.startsWith('data:')) return;
    if(!embeddedAssets.has(image.src))embeddedAssets.set(image.src,(async()=>{
      const response=await fetch(image.src);if(!response.ok)throw new Error('Letter snapshot asset unavailable');
      const blob=await response.blob();
      return new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result as string);reader.onerror=reject;reader.readAsDataURL(blob);});
    })());
    image.src=await embeddedAssets.get(image.src)!;
    image.removeAttribute('srcset');
  }));
  const wrapper = document.createElement('div');
  wrapper.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
  Object.assign(wrapper.style, { position: 'relative', width: `${width}px`, height: `${height}px`, overflow: 'hidden' });
  wrapper.append(template);
  const content = new XMLSerializer().serializeToString(wrapper);
  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><foreignObject width="100%" height="100%">${content}</foreignObject></svg>`)}`;
  await image.decode();
  const bitmap = document.createElement('canvas');
  bitmap.width = Math.ceil(width); bitmap.height = Math.ceil(height);
  bitmap.getContext('2d')!.drawImage(image, 0, 0);
  return bitmap;
}

function snapshot(source: HTMLElement, defer = false): Promise<HTMLCanvasElement> {
  const key=snapshotKey(source), cached=snapshots.get(source);
  if(cached?.key===key)return cached.bitmap;
  // A cold cache must not serialize all flower canvases inside the wheel handler.
  // Separate tasks let the browser process input between uncached objects.
  if(defer)return new Promise((resolve,reject)=>window.setTimeout(()=>{snapshot(source).then(resolve,reject);},0));
  const rect=source.getBoundingClientRect(), computed=getComputedStyle(source);
  const width=source.offsetWidth,height=source.offsetHeight;
  const matrix=new DOMMatrix(computed.transform==='none'?undefined:computed.transform);
  if(computed.rotate!=='none')matrix.rotateSelf(parseFloat(computed.rotate));
  const origin=computed.transformOrigin.split(' ').map(parseFloat);
  const corners=[[0,0],[width,0],[width,height],[0,height]].map(([x,y])=>new DOMPoint(x-origin[0],y-origin[1]).matrixTransform(matrix));
  const minX=Math.min(...corners.map(p=>p.x))+origin[0],minY=Math.min(...corners.map(p=>p.y))+origin[1];
  const template=freeze(source);
  Object.assign(template.style,{position:'absolute',margin:'0',width:`${width}px`,height:`${height}px`,minHeight:'0',maxWidth:'none',boxSizing:'border-box',left:`${-minX}px`,top:`${-minY}px`,right:'auto',bottom:'auto',visibility:'visible'});
  const bitmap=rasterize(template,Math.ceil(rect.width),Math.ceil(rect.height));
  const item={key,bitmap};snapshots.set(source,item);
  void bitmap.catch(()=>{if(snapshots.get(source)===item)snapshots.delete(source);});
  return bitmap;
}

/** One canvas draws real source pixels, avoiding thousands of duplicated/composited DOM trees. */
export function letterFragments(sources: HTMLElement[]) {
  const started = performance.now();
  const layer = document.createElement('canvas');
  layer.className = 'letter-fragments';
  layer.setAttribute('aria-hidden', 'true');
  Object.assign(layer.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', zIndex: '55', pointerEvents: 'none' });
  const ratio = Math.min(devicePixelRatio, 1.5);
  layer.width = Math.round(innerWidth * ratio); layer.height = Math.round(innerHeight * ratio);
  const context = layer.getContext('2d')!;
  const atlas = document.createElement('canvas');
  const fragments: Fragment[] = [];
  const loading: Promise<void>[] = [];
  let seed = 0, ready = false, disposed = false, progress = 0;
  for (const source of sources) {
    const rect = source.getBoundingClientRect();
    const computed = getComputedStyle(source);
    if (rect.width < 2 || rect.height < 2 || rect.bottom < 0 || rect.top > innerHeight || computed.display === 'none') continue;
    const sprite: Sprite = { image: null };
    loading.push(snapshot(source,true).then(image => { sprite.image = image; }));
    const mobile = innerWidth < 600;
    const inGarden = !!source.closest('.letter-bloom-garden');
    const isPaper = source.classList.contains('letter-keepsake');
    const size = isPaper ? (mobile ? 16 : 20) : inGarden ? (mobile ? 26 : 32) : (mobile ? 24 : 28);
    const columns = Math.max(1, Math.ceil(rect.width / size)), rows = Math.max(1, Math.ceil(rect.height / size));
    const cellW = rect.width / columns, cellH = rect.height / rows;
    const points = Array.from({ length: rows + 1 }, (_, y) => Array.from({ length: columns + 1 }, (_, x) => ({
      x: x * cellW + (x === 0 || x === columns ? 0 : (random(++seed) - .5) * cellW * .55),
      y: y * cellH + (y === 0 || y === rows ? 0 : (random(++seed) - .5) * cellH * .55),
    })));
    for (let y = 0; y < rows; y++) for (let x = 0; x < columns; x++) {
      const polygon = [points[y][x], points[y][x + 1], points[y + 1][x + 1], points[y + 1][x]];
      const left = Math.min(...polygon.map(p => p.x)), top = Math.min(...polygon.map(p => p.y));
      const right = Math.max(...polygon.map(p => p.x)), bottom = Math.max(...polygon.map(p => p.y));
      if (rect.top + bottom < -20 || rect.top + top > innerHeight + 20) continue;
      const noise = random(++seed);
      fragments.push({ sprite, polygon, left, top, width: right - left, height: bottom - top,
        x: rect.left + (left + right) * .5, y: rect.top + (top + bottom) * .5,
        start: .035 + Math.max(0, Math.min(1, (rect.top + top) / innerHeight)) * .36 + noise * .065,
        dx: (random(++seed) - .5) * Math.min(innerWidth * .3, 280),
        dy: innerHeight * (.24 + random(++seed) * .5),
        turn: (random(++seed) - .5) * 170, flutter: random(++seed) * Math.PI * 2, atlasX: 0, atlasY: 0,
      });
    }
  }
  layer.dataset.count = String(fragments.length);
  layer.dataset.setupMs = (performance.now() - started).toFixed(1);
  document.body.append(layer);
  function paint(value: number) {
    if (disposed) return;
    progress = value;
    sources.forEach(source => { source.style.visibility = !ready || value <= .001 ? 'visible' : 'hidden'; });
    layer.style.visibility = ready && value > .001 && value < .999 ? 'visible' : 'hidden';
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, innerWidth, innerHeight);
    let flying = 0;
    if (ready) for (const part of fragments) {
      const t = Math.max(0, Math.min(1, (value - part.start) / .45));
      if (t > 0 && t < 1) flying++;
      if (t === 1 || !part.sprite.image) continue;
      const travel = Math.pow(t, 1.1), flutter = Math.sin(t * 8 + part.flutter) * t;
      const size = Math.pow(1 - t, 1.65);
      context.globalAlpha = 1 - Math.max(0, (t - .2) / .8);
      const angle=part.turn*travel*Math.PI/180, sx=size*ratio, sy=size*(1-Math.abs(flutter)*.4)*ratio;
      const x=part.x+part.dx*travel+flutter*10, y=part.y-part.dy*travel;
      if(y+part.height<0||x+part.width<0||x-part.width>innerWidth)continue;
      context.setTransform(Math.cos(angle)*sx,Math.sin(angle)*sx,-Math.sin(angle)*sy,Math.cos(angle)*sy,x*ratio,y*ratio);
      context.drawImage(atlas,part.atlasX,part.atlasY,part.width,part.height,-part.width*.5,-part.height*.5,part.width,part.height);
    }
    layer.dataset.flying = String(flying);
    layer.dataset.progress = value.toFixed(4);
  }
  Promise.all(loading).then(async () => {
    if (disposed) return;
    // Bake the irregular edge once; each scrolling frame only transforms a small bitmap.
    const unit=Math.ceil(Math.max(1,...fragments.map(p=>Math.max(p.width,p.height))))+2;
    const columns=Math.max(1,Math.floor(2048/unit));
    atlas.width=columns*unit;atlas.height=Math.ceil(fragments.length/columns)*unit;
    const ink=atlas.getContext('2d')!;
    for(let index=0;index<fragments.length;index++){
      // Give input and the spring a turn between batches instead of blocking
      // the first scroll frame while thousands of irregular pieces are baked.
      if(index>0&&index%128===0){await new Promise<void>(resolve=>window.setTimeout(resolve,0));if(disposed)return;}
      const part=fragments[index];
      part.atlasX=(index%columns)*unit+1;part.atlasY=Math.floor(index/columns)*unit+1;
      ink.save();ink.translate(part.atlasX,part.atlasY);ink.beginPath();
      part.polygon.forEach((p,i)=>{if(i===0)ink.moveTo(p.x-part.left,p.y-part.top);else ink.lineTo(p.x-part.left,p.y-part.top);});
      ink.closePath();ink.clip();
      if(part.sprite.image)ink.drawImage(part.sprite.image,part.left,part.top,part.width,part.height,0,0,part.width,part.height);
      ink.restore();
    }
    ready = true; layer.dataset.ready = 'true';
    layer.dataset.rasterMs = (performance.now() - started).toFixed(1);
    paint(progress);
  }).catch(() => {
    // Keep native content intact if browser snapshotting is unavailable.
    if (!disposed) { layer.dataset.ready = 'false'; paint(progress); }
  });
  return { paint, dispose() { disposed = true; layer.remove();atlas.width=atlas.height=0; fragments.length = 0; } };
}
