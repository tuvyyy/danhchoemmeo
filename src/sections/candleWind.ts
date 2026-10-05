export type WindPoint = { x:number; y:number; time:number };
export type FlameBounds = { left:number; top:number; right:number; bottom:number };

/** A horizontal, recent sweep has to cross the flame; hovering elsewhere is harmless. */
export function candleWind(previous:WindPoint, current:WindPoint, flame:FlameBounds) {
  const dx=current.x-previous.x,dy=current.y-previous.y,dt=current.time-previous.time;
  if(dt<=0||dt>180||Math.abs(dx)<12||Math.abs(dx)<Math.abs(dy)*1.35)return 0;
  const speed=Math.abs(dx)/Math.max(8,dt);
  if(speed<.18)return 0;
  const left=flame.left-25,right=flame.right+25,top=flame.top-24,bottom=flame.bottom+24;
  const enter=Math.max(0,Math.min((left-previous.x)/dx,(right-previous.x)/dx));
  const leave=Math.min(1,Math.max((left-previous.x)/dx,(right-previous.x)/dx));
  if(enter>leave)return 0;
  const y1=previous.y+dy*enter,y2=previous.y+dy*leave;
  if(Math.max(y1,y2)<top||Math.min(y1,y2)>bottom)return 0;
  return Math.sign(dx)*Math.min(1,speed/1.1);
}
