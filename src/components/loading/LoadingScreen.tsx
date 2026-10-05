import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BIRTHDAY_DATA } from '@/data/birthdayContent';

export default function LoadingScreen({onFinish}:{onFinish:()=>void}) {
 const [progress,setProgress]=useState(0);
 useEffect(()=>{
  let disposed=false,ready=false,finishTimer=0;
  const started=performance.now();
  const image=(src:string)=>new Promise<void>(resolve=>{const img=new Image();img.onload=()=>resolve();img.onerror=()=>resolve();img.src=src;});
  // The opening artwork comes first; later chapter photographs warm their cache independently.
  BIRTHDAY_DATA.moments.items.forEach(item=>void image(item.src));
  Promise.all([document.fonts.ready,image('/assets/garden-gate/estate-sunset.webp'),image('/assets/hero-gallery/ivory-relief.webp'),image('/assets/hero-gallery/night-botanical.webp')]).then(()=>{ready=true;});
  const timer=window.setInterval(()=>{
   if(disposed)return;
   const elapsed=performance.now()-started;
   const done=(ready&&elapsed>=1200)||elapsed>6500;
   setProgress(done?100:Math.min(94,Math.round(elapsed/1200*88)));
   if(done){clearInterval(timer);finishTimer=window.setTimeout(()=>{if(!disposed)onFinish();},180);}
  },40);
  return()=>{disposed=true;clearInterval(timer);clearTimeout(finishTimer);};
 },[onFinish]);
 return <motion.div className="gallery-loader" role="status" aria-label="Đang mở khu vườn" initial={{opacity:1}} exit={{opacity:0,transition:{duration:.55}}}>
  <span className="gallery-loader__brand">DÀNH CHO EM MEO</span>
  <span className="gallery-loader__line">Một chút thương,<em>đang thành hình.</em></span>
  <span className="gallery-loader__count" aria-hidden="true">{String(progress).padStart(3,'0')}</span>
  <span className="gallery-loader__track" aria-hidden="true"><i style={{transform:`scaleX(${progress/100})`}}/></span>
 </motion.div>;
}
