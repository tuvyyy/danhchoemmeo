import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { BIRTHDAY_DATA } from "@/data/birthdayContent";
import { useSceneExperience } from "@/components/effects/SceneExperience";
import { useScenePreferences } from "@/components/effects/useScenePreferences";
import { useChapterFlow } from "@/chapters/useChapterFlow";
import { useChapterLifecycle } from "@/chapters/useChapterLifecycle";
import { candleWind, type WindPoint } from './candleWind';
import { FinaleButterflies } from './FinaleButterflies';
import "./finale-scene.css";

export default function FinaleSection({ onComplete }: { onComplete?: () => void } = {}) {
  const { celebrate, overlayOpen } = useSceneExperience();
  const { mobile, reducedMotion } = useScenePreferences();
  const { goTo } = useChapterFlow();
  const { isActive, isTransitioning } = useChapterLifecycle(6);
  const [blown, setBlown] = useState(false);
  const [gusting, setGusting] = useState(false);
  const [visible, setVisible] = useState(() => !document.hidden);
  const root=useRef<HTMLElement>(null), flame=useRef<HTMLDivElement>(null);
  const blowButton=useRef<HTMLButtonElement>(null), reigniteButton=useRef<HTMLButtonElement>(null);
  const transferFocus=useRef(false), lit=useRef(true), gustTimer=useRef(0);
  const { finale }=BIRTHDAY_DATA;
  useEffect(()=>{if(!isActive||isTransitioning)setGusting(false);},[isActive,isTransitioning]);
  useEffect(()=>{const update=()=>setVisible(!document.hidden);document.addEventListener('visibilitychange',update);return()=>document.removeEventListener('visibilitychange',update);},[]);

  const extinguish=useCallback(()=>{
    if(!lit.current)return;
    lit.current=false;setBlown(true);celebrate();onComplete?.();
  },[celebrate,onComplete]);
  const blow=useCallback((event:MouseEvent<HTMLButtonElement>)=>{
    transferFocus.current=document.activeElement===event.currentTarget;extinguish();
  },[extinguish]);
  const reignite=()=>{transferFocus.current=document.activeElement===reigniteButton.current;lit.current=true;setBlown(false);setGusting(false);};
  useLayoutEffect(()=>{
    if(!transferFocus.current)return;transferFocus.current=false;
    (blown?reigniteButton:blowButton).current?.focus({preventScroll:true});
  },[blown]);

  useEffect(()=>{
    if(!isActive||isTransitioning||overlayOpen||blown)return;
    let previous:WindPoint|null=null,touchDown=false,frame=0,wind=0,shown=0,lastTime=0;
    const paint=(time:number)=>{
      frame=0;const dt=Math.min(.05,(time-lastTime)/1000||.016);lastTime=time;
      wind*=Math.exp(-7*dt);shown+=(wind-shown)*(1-Math.exp(-20*dt));
      root.current?.style.setProperty('--wind',shown.toFixed(3));
      if(Math.abs(shown)>.002||Math.abs(wind)>.002)frame=requestAnimationFrame(paint);
    };
    const move=(event:PointerEvent)=>{
      if(document.hidden||event.pointerType==='touch'&&!touchDown)return;
      const point={x:event.clientX,y:event.clientY,time:performance.now()};
      if(previous&&flame.current){
        const bounds=flame.current.getBoundingClientRect();
        const gust=candleWind(previous,point,bounds);
        const near=Math.abs(point.x-(bounds.left+bounds.right)/2)<100&&Math.abs(point.y-(bounds.top+bounds.bottom)/2)<75;
        if(near){wind=Math.max(-1,Math.min(1,(point.x-previous.x)/Math.max(12,point.time-previous.time)));if(!frame){lastTime=point.time;frame=requestAnimationFrame(paint);}}
        if(gust&&lit.current){
          wind=gust;root.current?.style.setProperty('--gust-direction',String(Math.sign(gust)));
          setGusting(true);lit.current=false;
          gustTimer.current=window.setTimeout(()=>{lit.current=true;extinguish();},reducedMotion?0:220);
        }
      }
      if(!previous||point.time-previous.time>32||Math.abs(point.x-previous.x)>=12||Math.abs(point.y-previous.y)>24)previous=point;
    };
    const down=(event:PointerEvent)=>{touchDown=true;previous={x:event.clientX,y:event.clientY,time:performance.now()};};
    const reset=()=>{touchDown=false;previous=null;};
    window.addEventListener('pointermove',move,{passive:true});window.addEventListener('pointerdown',down,{passive:true});
    window.addEventListener('pointerup',reset);window.addEventListener('pointercancel',reset);window.addEventListener('blur',reset);
    return()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerdown',down);window.removeEventListener('pointerup',reset);window.removeEventListener('pointercancel',reset);window.removeEventListener('blur',reset);cancelAnimationFrame(frame);clearTimeout(gustTimer.current);if(!blown)lit.current=true;root.current?.style.setProperty('--wind','0');};
  },[isActive,isTransitioning,overlayOpen,blown,reducedMotion,extinguish]);

  return <section ref={root} className="finale-scene celebration-scene" data-blown={blown} data-gusting={gusting} data-animating={isActive&&!isTransitioning&&!overlayOpen&&visible&&!reducedMotion} aria-label={finale.chapter}>
    <header className="finale-header"><span>CHƯƠNG 06 / MỘT ĐIỀU ƯỚC</span><span>10 NOVEMBER</span></header>
    <div className="finale-main">
      <div className="finale-copy" data-mascot-obstacle>
        <span className="finale-kicker">DÀNH RIÊNG EM MÈO</span>
        <h2>{blown?<><span>Thêm một tuổi,</span><em>thêm thương.</em></>:<><span>Ước một điều.</span><em>Để gió gửi đi.</em></>}</h2>
        <p className="finale-body">{blown?'Chúc em một tuổi mới bình an. Phần còn lại, có tui ở đây.':'Nhắm mắt một chút, giữ trong lòng điều em mong nhất.'}</p>
        <div className="finale-controls">
          {!blown?<>
            <span className="wind-invitation"><svg viewBox="0 0 48 20" fill="none" aria-hidden="true"><path d="M1 5h31c11 0 11-7 4-7M8 11h33c8 0 8 8 1 8M1 17h22"/></svg>{mobile?'Vuốt ngang ngọn nến để gửi điều ước.':'Quơ chuột ngang ngọn nến để gửi điều ước.'}</span>
            <button ref={blowButton} className="candle-blow-action" onClick={blow}>Thổi nến <span aria-hidden="true">↗</span></button>
          </>:<div className="blown-actions"><button ref={reigniteButton} className="reignite-btn" onClick={reignite}>Thắp lại nến <span aria-hidden="true">↺</span></button><button className="revisit-btn" onClick={()=>goTo(0)}>Xem lại từ đầu <span aria-hidden="true">↗</span></button></div>}
        </div>
      </div>
      <FinaleButterflies/>
      <div className="finale-centerpiece">
        <div className="cake-altar" data-mascot-obstacle>
          <div className="candle-aura" aria-hidden="true"/>
          <div className="birthday-cake"><img src="/assets/birthday-cake/ivory-noir-cake.webp" alt="Bánh sinh nhật kem ngà, hoa hồng đen trắng và bướm bạc" width="1087" height="1446" decoding="async" draggable={false}/></div>
          <div className="birthday-candle" aria-hidden="true">
            <div ref={flame} className="candle-flame-wrap">
              <svg className="candle-flame" viewBox="0 0 30 52"><defs><radialGradient id="wish-flame"><stop stopColor="#fffef0"/><stop offset=".45" stopColor="#fff2b4"/><stop offset=".75" stopColor="#f1a555"/><stop offset="1" stopColor="#c66b3a"/></radialGradient></defs><path d="M15 2C12 15 4 22 4 34c0 20 22 20 22 0 0-12-8-19-11-32Z" fill="url(#wish-flame)"/><path d="M15 26c-3 5-5 8-5 12 0 9 10 9 10 0 0-4-2-7-5-12Z" fill="#fffcec"/></svg>
              <svg className="smoke-wisp" viewBox="0 0 70 140" fill="none"><path d="M35 138c-26-24 24-35 4-61S15 46 40 15"/><path d="M36 130c16-25-18-39-3-61S53 33 32 4"/></svg>
              <span className="wind-streak wind-streak--one"/><span className="wind-streak wind-streak--two"/>
            </div>
            <span className="candle-wick"/><span className="candle-stick"/>
          </div>
        </div>
      </div>
    </div>
    <footer className="finale-footer"><span>for you, always.</span></footer>
    <p className="sr-only" role="status" aria-live="polite">{blown?'Nến đã tắt. Chúc mừng sinh nhật em mèo!':'Nến đang sáng. Quơ chuột hoặc vuốt ngang nến để thổi. Bạn cũng có thể dùng nút Thổi nến.'}</p>
  </section>;
}
