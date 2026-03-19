import { useState, useEffect, useRef } from "react";

const T = {
  ink:"#1A1612", inkMid:"#4A4440", inkSoft:"#8A8480", inkFaint:"#C4BEB8",
  clay:"#C4835A", ochre:"#A0673A", sand:"#E8C9A0", prism:"#B8A9D9",
  signal:"#6B5FED", glow:"#9B8FF5", moss:"#4CAF82",
  hearth:"#8B5E2F", ember:"#A03020",
  border:"#E0D8D0", cta:"#2A2520",
  ff:"'DM Sans',system-ui,-apple-system,sans-serif",
};

const PROMPTS = [
  "What's one thing that's true about today?",
  "Say the name of somewhere you've been. Anywhere at all.",
  "What would you want someone to know about why you're here?",
  "Say something only you would say right now.",
  "What does showing up every day mean to you?",
];

const STAGES = ["threshold","permission","lineup","turnleft","turnright","gaze","voice","confirmation","bound","hearth","ember"];
const PROGRESS = {threshold:8,permission:16,lineup:28,turnleft:40,turnright:52,gaze:62,voice:74,confirmation:88,bound:100,hearth:50,ember:50};

function EarthRiseBG({ w, h }) {
  const ref = useRef();
  useEffect(() => {
    function draw() {
      const c = ref.current; if (!c) return;
      const dpr = window.devicePixelRatio||1;
      c.width=w*dpr; c.height=h*dpr; c.style.width=w+"px"; c.style.height=h+"px";
      const ctx=c.getContext("2d"); ctx.scale(dpr,dpr);
      ctx.fillStyle="#FEFCF9"; ctx.fillRect(0,0,w,h);
      [{x:.10,y:.70,r:.70,col:[232,201,160],a:.18},{x:.25,y:.85,r:.55,col:[196,131,90],a:.12},
       {x:.05,y:.50,r:.45,col:[196,131,90],a:.08},{x:.55,y:.60,r:.50,col:[232,201,160],a:.10},
       {x:.88,y:.05,r:.55,col:[214,228,240],a:.16},{x:.95,y:.15,r:.38,col:[184,169,217],a:.12},
       {x:.50,y:1.05,r:.50,col:[232,201,160],a:.12},
      ].forEach(({x,y,r,col,a})=>{
        const cx=x*w,cy=y*h,rad=r*Math.min(w,h);
        const g=ctx.createRadialGradient(cx,cy,0,cx,cy,rad);
        g.addColorStop(0,`rgba(${col},${a})`);
        g.addColorStop(0.45,`rgba(${col},${a*.55})`);
        g.addColorStop(1,`rgba(${col},0)`);
        ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
      });
    }
    draw(); const t=setTimeout(draw,80); return()=>clearTimeout(t);
  },[w,h]);
  return <canvas ref={ref} style={{position:"absolute",inset:0}}/>;
}

function Grain() {
  const ref=useRef();
  useEffect(()=>{
    const c=ref.current; if(!c) return;
    c.width=375; c.height=900;
    const ctx=c.getContext("2d");
    const id=ctx.createImageData(375,900); const d=id.data;
    for(let i=0;i<d.length;i+=4){const v=Math.random()*255|0;d[i]=d[i+1]=d[i+2]=v;d[i+3]=18;}
    ctx.putImageData(id,0,0);
  },[]);
  return <canvas ref={ref} style={{position:"absolute",inset:0,width:"100%",height:"100%",mixBlendMode:"overlay",opacity:0.65,pointerEvents:"none"}}/>;
}

function StatusBar() {
  return (
    <div style={{position:"relative",zIndex:10,display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 28px 0",height:44,fontFamily:T.ff}}>
      <span style={{fontSize:12,fontWeight:700,color:T.ink,letterSpacing:"-0.02em"}}>9:41</span>
      <div style={{display:"flex",gap:5,alignItems:"center"}}>
        <svg width="15" height="11" viewBox="0 0 15 11">{[0,1,2,3].map(i=><rect key={i} x={i*4} y={10-(i+1)*2.5} width="2.5" height={(i+1)*2.5} rx="0.5" fill={T.ink} opacity={i<3?1:0.3}/>)}</svg>
        <svg width="25" height="11" viewBox="0 0 25 11"><rect x="0" y="1" width="21" height="9" rx="2" fill="none" stroke={T.ink} strokeWidth="1.1"/><rect x="1.2" y="2.2" width="15" height="6.6" rx="1.2" fill={T.ink}/><path d="M22 3.5v4q2-.5 2-2t-2-2z" fill={T.ink} opacity=".4"/></svg>
      </div>
    </div>
  );
}

function ProgressBar({ stage }) {
  const pct = PROGRESS[stage]||0;
  const col = stage==="ember"?`linear-gradient(90deg,${T.ember},rgba(160,48,32,0.5))`:stage==="hearth"?`linear-gradient(90deg,${T.hearth},rgba(139,94,47,0.5))`:`linear-gradient(90deg,${T.signal},${T.prism})`;
  return (
    <div style={{height:2,margin:"8px 0 0",background:"rgba(224,216,208,0.45)"}}>
      <div style={{height:2,width:`${pct}%`,background:col,transition:"width .6s cubic-bezier(.4,0,.2,1)",borderRadius:1}}/>
    </div>
  );
}

function CameraIndicator() {
  return (
    <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(26,22,18,0.62)",borderRadius:20,padding:"4px 10px 4px 8px",border:"0.5px solid rgba(255,255,255,0.10)"}}>
      <div style={{width:7,height:7,borderRadius:"50%",background:T.moss,boxShadow:"0 0 6px rgba(76,175,130,0.80)",flexShrink:0}}/>
      <span style={{fontSize:10,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",color:"rgba(250,248,245,0.92)",fontFamily:T.ff}}>Camera active — on device only</span>
    </div>
  );
}

function Guide({ text }) {
  return (
    <div style={{position:"relative",padding:"8px 0",marginBottom:16}}>
      <div style={{position:"absolute",inset:"-6px -4px",background:"radial-gradient(ellipse 70% 70% at 85% 10%, rgba(184,169,217,0.22) 0%, transparent 65%), radial-gradient(ellipse 70% 70% at 15% 90%, rgba(232,201,160,0.18) 0%, transparent 65%)",borderRadius:16,pointerEvents:"none"}}/>
      <div style={{position:"relative",fontSize:15,lineHeight:1.7,color:T.ink,fontFamily:T.ff,fontWeight:400}}>{text}</div>
    </div>
  );
}

function VesicaMark({ size=20, color=T.prism, opacity=0.8 }) {
  const r=size*.5,off=r*.48,pad=r*.22,vw=size+off*2+pad*2,vh=size+pad*2,cx=vw/2,cy=vh/2;
  return (
    <svg width={vw} height={vh} viewBox={`0 0 ${vw} ${vh}`} fill="none" style={{opacity,flexShrink:0,display:"block"}}>
      <circle cx={cx-off} cy={cy} r={r} stroke={color} strokeWidth={1.5} fill={color} fillOpacity={0.08}/>
      <circle cx={cx+off} cy={cy} r={r} stroke={color} strokeWidth={1.5} fill={color} fillOpacity={0.08}/>
    </svg>
  );
}

function PrimaryCTA({ label, onTap }) {
  const [hov,setHov]=useState(false),[prs,setPrs]=useState(false);
  return (
    <div style={{position:"relative",cursor:"pointer",userSelect:"none"}} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>{setHov(false);setPrs(false);}} onMouseDown={()=>setPrs(true)} onMouseUp={()=>{setPrs(false);onTap&&onTap();}}>
      {hov&&!prs&&<div style={{position:"absolute",bottom:-8,left:"8%",right:"8%",height:24,background:"radial-gradient(ellipse,rgba(196,131,90,0.48) 0%,transparent 70%)",filter:"blur(8px)",pointerEvents:"none",zIndex:0}}/>}
      <div style={{position:"relative",zIndex:1,height:52,borderRadius:13,background:prs?"#1E1510":hov?"#342218":T.cta,color:"#FAF8F5",fontSize:14,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.ff,letterSpacing:".01em",transform:prs?"translateY(1px) scale(.998)":hov?"translateY(-2px)":"translateY(0)",boxShadow:"0 2px 16px rgba(42,37,32,.17)",transition:"all .26s cubic-bezier(.34,1.56,.64,1)"}}>{label}</div>
    </div>
  );
}

function CeremonyCTA({ label, onTap }) {
  const [hov,setHov]=useState(false),[prs,setPrs]=useState(false);
  return (
    <div style={{position:"relative",cursor:"pointer",userSelect:"none"}} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>{setHov(false);setPrs(false);}} onMouseDown={()=>setPrs(true)} onMouseUp={()=>{setPrs(false);onTap&&onTap();}}>
      {hov&&<div style={{position:"absolute",bottom:-8,left:"8%",right:"8%",height:24,background:"radial-gradient(ellipse,rgba(196,131,90,0.55) 0%,transparent 70%)",filter:"blur(10px)",pointerEvents:"none",zIndex:0}}/>}
      <div style={{position:"relative",zIndex:1,height:52,borderRadius:13,background:prs?"#9A6040":hov?"#D4956A":T.clay,color:"#FAF8F5",fontSize:14,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.ff,letterSpacing:".01em",transform:prs?"translateY(1px) scale(.998)":hov?"translateY(-2px)":"translateY(0)",boxShadow:"0 2px 16px rgba(196,131,90,0.35)",transition:"all .26s cubic-bezier(.34,1.56,.64,1)"}}>{label}</div>
    </div>
  );
}

function MossTick() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{flexShrink:0}}>
      <circle cx="10" cy="10" r="9" fill="rgba(76,175,130,0.12)" stroke={T.moss} strokeWidth="1.2"/>
      <path d="M6 10l3 3 5-5" stroke={T.moss} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CometRing({ size, totalSecs, running, resolveState, onComplete }) {
  const ref=useRef(),startRef=useRef(null),rafRef=useRef(null);
  const dpr=window.devicePixelRatio||1;
  useEffect(()=>{
    const c=ref.current; if(!c) return;
    c.width=size*dpr; c.height=size*dpr; c.style.width=size+"px"; c.style.height=size+"px";
    const ctx=c.getContext("2d"); ctx.setTransform(dpr,0,0,dpr,0,0);
    const cx=size/2,cy=size/2,r=size/2-3;
    function draw(ts){
      if(!running&&!resolveState){cancelAnimationFrame(rafRef.current);return;}
      ctx.clearRect(0,0,size,size);
      if(resolveState==="moss"){
        ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.strokeStyle=T.moss;ctx.lineWidth=3;ctx.stroke();
        const gw=ctx.createRadialGradient(cx,cy,0,cx,cy,r);gw.addColorStop(0,"rgba(76,175,130,0.10)");gw.addColorStop(1,"rgba(76,175,130,0)");
        ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fillStyle=gw;ctx.fill();
        cancelAnimationFrame(rafRef.current);return;
      }
      if(!running){cancelAnimationFrame(rafRef.current);return;}
      if(!startRef.current)startRef.current=ts;
      const elapsed=(ts-startRef.current)/1000,progress=Math.min(elapsed/totalSecs,1);
      const angle=-Math.PI/2+progress*Math.PI*2;
      ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.strokeStyle="rgba(224,216,208,0.25)";ctx.lineWidth=2;ctx.stroke();
      const tailLen=Math.PI*0.55,steps=48;
      for(let i=0;i<steps;i++){
        const t0=i/steps,a0=angle-tailLen*(1-t0),a1=angle-tailLen*(1-(i+1)/steps);
        const op=Math.pow(t0,1.8)*0.9;
        const rv=Math.round(184+(255-184)*t0),gv=Math.round(169+(255-169)*t0),bv=Math.round(217+(255-217)*t0);
        ctx.beginPath();ctx.arc(cx,cy,r,a0,a1);ctx.strokeStyle=`rgba(${rv},${gv},${bv},${op})`;ctx.lineWidth=2+t0*1.5;ctx.lineCap="round";ctx.stroke();
      }
      const hx=cx+r*Math.cos(angle),hy=cy+r*Math.sin(angle);
      const hg=ctx.createRadialGradient(hx,hy,0,hx,hy,8);
      hg.addColorStop(0,"rgba(255,255,255,0.95)");hg.addColorStop(0.4,"rgba(214,228,240,0.60)");hg.addColorStop(1,"rgba(184,169,217,0)");
      ctx.beginPath();ctx.arc(hx,hy,8,0,Math.PI*2);ctx.fillStyle=hg;ctx.fill();
      ctx.beginPath();ctx.arc(hx,hy,2.5,0,Math.PI*2);ctx.fillStyle="rgba(255,255,255,0.98)";ctx.fill();
      if(progress>=1){onComplete&&onComplete();return;}
      rafRef.current=requestAnimationFrame(draw);
    }
    startRef.current=null;cancelAnimationFrame(rafRef.current);rafRef.current=requestAnimationFrame(draw);
    return()=>cancelAnimationFrame(rafRef.current);
  },[running,resolveState,size,totalSecs]);
  return <canvas ref={ref} style={{position:"absolute",inset:0,borderRadius:"50%",pointerEvents:"none",zIndex:10}}/>;
}

function AlignStep({ guideText, instruction, hint, onDone }) {
  const [resolved,setResolved]=useState(false),[running,setRunning]=useState(false);
  useEffect(()=>{ const t=setTimeout(()=>setRunning(true),600); return()=>clearTimeout(t); },[]);
  useEffect(()=>{
    if(!running||resolved) return;
    const t=setTimeout(()=>{ setResolved(true); setTimeout(onDone,900); },4000+Math.random()*4000);
    return()=>clearTimeout(t);
  },[running,resolved]);
  const sz=288;
  return (
    <div style={{padding:"16px 24px 40px"}}>
      <div style={{marginBottom:14}}><CameraIndicator/></div>
      <Guide text={guideText}/>
      <div style={{position:"relative",width:sz,height:sz,borderRadius:"50%",border:`2px solid ${resolved?"rgba(76,175,130,0.5)":"rgba(255,255,255,0.22)"}`,background:resolved?"rgba(76,175,130,0.04)":"rgba(26,22,18,0.04)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto",transition:"border-color 0.4s,background 0.4s"}}>
        <div style={{opacity:0.18,position:"absolute"}}><svg width="90" height="110" viewBox="0 0 90 110" fill="none"><ellipse cx="45" cy="38" rx="29" ry="34" stroke={T.inkFaint} strokeWidth="1.2"/><path d="M16 72 Q13 98 45 104 Q77 98 74 72" stroke={T.inkFaint} strokeWidth="1.2"/></svg></div>
        {instruction==="left"&&<svg width="36" height="36" viewBox="0 0 36 36" fill="none" style={{position:"absolute",left:8,opacity:0.45}}><path d="M22 8l-10 10 10 10" stroke={T.prism} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        {instruction==="right"&&<svg width="36" height="36" viewBox="0 0 36 36" fill="none" style={{position:"absolute",right:8,opacity:0.45}}><path d="M14 8l10 10-10 10" stroke={T.prism} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        {resolved&&<div style={{position:"absolute",zIndex:6}}><svg width="52" height="52" viewBox="0 0 52 52" fill="none"><circle cx="26" cy="26" r="25" fill="rgba(76,175,130,0.14)" stroke={T.moss} strokeWidth="1.5"/><path d="M16 26l8 8 12-12" stroke={T.moss} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>}
        <CometRing size={sz} totalSecs={20} running={running&&!resolved} resolveState={resolved?"moss":null} onComplete={()=>{if(!resolved){setResolved(true);setTimeout(onDone,900);}}}/>
      </div>
      <div style={{marginTop:14,fontSize:12,color:resolved?T.moss:T.inkSoft,textAlign:"center",fontFamily:T.ff,fontWeight:resolved?700:400,transition:"color .4s"}}>
        {resolved?"Got it.":hint}
      </div>
    </div>
  );
}

// ── GAZE STAGE — 4s read → 3,2,1 countdown → logo moves ─
function GazeStage({ onDone }) {
  // phase: "ready" | "countdown" | "running" | "done"
  const [phase, setPhase] = useState("ready");
  const [countdown, setCountdown] = useState(null);
  const [resolved, setResolved] = useState(false);
  const [cometRunning, setCometRunning] = useState(false);
  const [pos, setPos] = useState({x:187, y:160});
  const rafRef = useRef(null), startRef = useRef(null);
  const seeds = useRef(Array.from({length:8},()=>Math.random()*Math.PI*2));
  const areaW=375, areaH=320, CAM=100;

  // Step 1 — 4s read time then start countdown
  useEffect(()=>{
    const t = setTimeout(()=>{ setPhase("countdown"); setCountdown(3); }, 4000);
    return()=>clearTimeout(t);
  },[]);

  // Step 2 — countdown 3→2→1→0 then launch
  useEffect(()=>{
    if(phase!=="countdown"||countdown===null) return;
    if(countdown===0){
      const t = setTimeout(()=>{ setPhase("running"); setCometRunning(true); setCountdown(null); }, 600);
      return()=>clearTimeout(t);
    }
    const t = setTimeout(()=>setCountdown(c=>c-1), 1000);
    return()=>clearTimeout(t);
  },[phase,countdown]);

  // Step 3 — logo moves
  useEffect(()=>{
    if(phase!=="running"||resolved) return;
    const s=seeds.current; let lastTs=null;
    function tick(ts){
      if(!startRef.current)startRef.current=ts;
      lastTs=ts;
      const t=(ts-startRef.current)/1000;
      if(t>=14){ setResolved(true); setCometRunning(false); setPhase("done"); setTimeout(onDone,1200); return; }
      const px=(Math.sin(t*1.3+s[0])*0.38+Math.sin(t*2.1+s[1])*0.12)*areaW+areaW/2;
      const py=(Math.sin(t*1.7+s[2])*0.38+Math.sin(t*2.9+s[3])*0.10)*areaH+areaH/2;
      const jx=Math.sin(t*5.3+s[4])*0.09*areaW, jy=Math.cos(t*4.7+s[5])*0.09*areaH;
      const dx=Math.sin(t*0.4+s[6])*0.18*areaW, dy=Math.cos(t*0.3+s[7])*0.18*areaH;
      setPos({x:Math.max(28,Math.min(areaW-28,px+jx+dx)), y:Math.max(28,Math.min(areaH-28,py+jy+dy))});
      rafRef.current=requestAnimationFrame(tick);
    }
    rafRef.current=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(rafRef.current);
  },[phase,resolved]);

  const vsz=32,r=vsz*.5,off=r*.48,pad=r*.22,vw=vsz+off*2+pad*2,vh=vsz+pad*2,vcx=vw/2,vcy=vh/2;

  return (
    <div style={{padding:"16px 24px 0"}}>
      <style>{`@keyframes cdpulse{0%{opacity:0;transform:scale(1.5)}30%{opacity:1;transform:scale(1.05)}75%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(0.85)}}`}</style>
      <div style={{marginBottom:12}}><CameraIndicator/></div>
      <Guide text={resolved ? "Perfect. Eyes confirmed." : "Get ready. When the logo starts to move, follow it with your eyes. Don't move your head."}/>

      <div style={{position:"relative",width:areaW,height:areaH,overflow:"hidden",background:"rgba(255,255,255,0.06)",borderTop:"1px solid rgba(224,216,208,0.30)",borderBottom:"1px solid rgba(224,216,208,0.30)",marginLeft:-24}}>

        {/* Countdown — big Signal number pulses in centre */}
        {phase==="countdown" && countdown!==null && countdown>0 && (
          <div key={countdown} style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",zIndex:9,pointerEvents:"none"}}>
            <span style={{fontSize:108,fontWeight:800,color:T.signal,fontFamily:T.ff,letterSpacing:"-0.04em",lineHeight:1,animation:"cdpulse 0.95s ease-out forwards"}}>{countdown}</span>
          </div>
        )}

        {/* Vesica — static faint at centre during ready+countdown */}
        {(phase==="ready"||phase==="countdown")&&!resolved&&(
          <div style={{position:"absolute",left:areaW/2-vw/2,top:areaH/2-vh/2,pointerEvents:"none",zIndex:6,opacity:0.28}}>
            <svg width={vw} height={vh} viewBox={`0 0 ${vw} ${vh}`} fill="none">
              <circle cx={vcx-off} cy={vcy} r={r} stroke={T.signal} strokeWidth={2} fill={T.signal} fillOpacity={0.08}/>
              <circle cx={vcx+off} cy={vcy} r={r} stroke={T.signal} strokeWidth={2} fill={T.signal} fillOpacity={0.08}/>
            </svg>
          </div>
        )}

        {/* Vesica — moving during running */}
        {phase==="running"&&!resolved&&(
          <div style={{position:"absolute",left:pos.x-vw/2,top:pos.y-vh/2,pointerEvents:"none",zIndex:6}}>
            <div style={{position:"absolute",inset:-16,borderRadius:"50%",background:"radial-gradient(circle,rgba(107,95,237,0.18) 0%,transparent 65%)",pointerEvents:"none"}}/>
            <div style={{position:"absolute",left:2,top:2,opacity:0.18,filter:"blur(2px)"}}>
              <svg width={vw} height={vh} viewBox={`0 0 ${vw} ${vh}`} fill="none"><circle cx={vcx-off} cy={vcy} r={r} stroke={T.glow} strokeWidth={1.4} fill={T.glow} fillOpacity={0.06}/><circle cx={vcx+off} cy={vcy} r={r} stroke={T.glow} strokeWidth={1.4} fill={T.glow} fillOpacity={0.06}/></svg>
            </div>
            <svg width={vw} height={vh} viewBox={`0 0 ${vw} ${vh}`} fill="none" style={{position:"relative",zIndex:1}}>
              <circle cx={vcx-off} cy={vcy} r={r} stroke={T.signal} strokeWidth={2} fill={T.signal} fillOpacity={0.12}/>
              <circle cx={vcx+off} cy={vcy} r={r} stroke={T.signal} strokeWidth={2} fill={T.signal} fillOpacity={0.12}/>
            </svg>
          </div>
        )}

        {/* Moss resolution */}
        {resolved&&(
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(76,175,130,0.05)"}}>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="30" fill="rgba(76,175,130,0.12)" stroke={T.moss} strokeWidth="1.5"/><path d="M20 32l10 10 14-14" stroke={T.moss} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        )}

        {/* Mini camera ring */}
        <div style={{position:"absolute",bottom:14,right:14,width:CAM,height:CAM,borderRadius:"50%",border:`2px solid ${resolved?"rgba(76,175,130,0.5)":"rgba(255,255,255,0.25)"}`,background:"rgba(26,22,18,0.08)",overflow:"hidden"}}>
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",opacity:0.18}}>
            <svg width="38" height="46" viewBox="0 0 38 46" fill="none"><ellipse cx="19" cy="16" rx="12" ry="14" stroke={T.inkFaint} strokeWidth="1"/><path d="M7 30 Q6 41 19 43 Q32 41 31 30" stroke={T.inkFaint} strokeWidth="1"/></svg>
          </div>
          <CometRing size={CAM} totalSecs={20} running={cometRunning&&!resolved} resolveState={resolved?"moss":null}/>
        </div>
      </div>

      <div style={{padding:"14px 0 0",textAlign:"center",fontSize:12,color:resolved?T.moss:T.inkSoft,fontWeight:resolved?700:400,fontFamily:T.ff,transition:"color .4s",minHeight:20}}>
        {resolved?"Eyes confirmed.":""}
      </div>

      <div style={{height:32}}/>
    </div>
  );
}

// ── VOICE ─────────────────────────────────────────────────
const RIBBONS=[[0.72,18,3.1,0.38,196,131,90,0.55,1.8],[0.78,12,4.7,0.52,160,103,58,0.45,1.4],[0.82,22,2.8,0.31,184,169,217,0.60,2.0],[0.68,14,5.3,0.61,107,95,237,0.50,1.5],[0.86,10,6.1,0.44,232,201,160,0.40,1.2],[0.75,16,3.8,0.55,155,143,245,0.45,1.6]];
function VoiceCircle({ size, prompt, phase, resolved, onComplete }) {
  const canvasRef=useRef(),rafRef=useRef(null),startRef=useRef(null),resolveStartRef=useRef(null);
  const dpr=window.devicePixelRatio||1,TOTAL=20,cx=size/2,cy=size/2,r=size/2-6;
  const speaking=phase==="speaking";
  const phaseOffsets=useRef(RIBBONS.map(()=>Math.random()*Math.PI*2));
  useEffect(()=>{
    const c=canvasRef.current; if(!c) return;
    c.width=size*dpr; c.height=size*dpr; c.style.width=size+"px"; c.style.height=size+"px";
    const ctx=c.getContext("2d"); ctx.setTransform(dpr,0,0,dpr,0,0);
    function drawRibbons(t,ampScale,resolveBlend){
      const NPOINTS=180;
      RIBBONS.forEach(([baseRf,amp,freq,spd,rv,gv,bv,baseOp,lw],ri)=>{
        const baseR=r*baseRf,phase0=phaseOffsets.current[ri];
        const mr=76,mg=175,mb=130;
        const fr=Math.round(rv+(mr-rv)*resolveBlend),fg=Math.round(gv+(mg-gv)*resolveBlend),fb=Math.round(bv+(mb-bv)*resolveBlend);
        const fo=baseOp*(0.4+0.6*ampScale)*(1-resolveBlend*0.3)+resolveBlend*0.6;
        ctx.beginPath();
        for(let i=0;i<=NPOINTS;i++){
          const angle=(i/NPOINTS)*Math.PI*2,disp=amp*ampScale*Math.sin(freq*angle+t*spd+phase0),rad=baseR+disp;
          const x=cx+Math.cos(angle)*rad,y=cy+Math.sin(angle)*rad;
          i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
        }
        ctx.closePath();ctx.strokeStyle=`rgba(${fr},${fg},${fb},${fo})`;ctx.lineWidth=lw*(0.6+0.8*ampScale);ctx.stroke();
      });
    }
    function draw(ts){
      if(!startRef.current)startRef.current=ts;
      const t=(ts-startRef.current)/1000;
      ctx.clearRect(0,0,size,size);
      let ampScale=0.15,resolveBlend=0;
      if(speaking)ampScale=0.85+0.15*Math.sin(t*2.1);
      if(resolved){
        if(!resolveStartRef.current)resolveStartRef.current=ts;
        const rd=(ts-resolveStartRef.current)/1000;
        ampScale=Math.max(0,0.85-rd*0.6);resolveBlend=Math.min(1,rd*0.8);
      }
      const bgG=ctx.createRadialGradient(cx,cy,0,cx,cy,r);
      bgG.addColorStop(0,"rgba(255,255,255,0.60)");bgG.addColorStop(1,"rgba(255,255,255,0.28)");
      ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fillStyle=bgG;ctx.fill();
      ctx.save();ctx.beginPath();ctx.arc(cx,cy,r-1,0,Math.PI*2);ctx.clip();
      drawRibbons(t,ampScale,resolveBlend);
      ctx.restore();
      ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);
      if(resolved){const rd=(ts-resolveStartRef.current)/1000,gb=Math.min(1,rd*1.2);ctx.strokeStyle=`rgba(76,175,130,${0.3+gb*0.5})`;ctx.lineWidth=1.5+gb;}
      else{ctx.strokeStyle=speaking?"rgba(107,95,237,0.25)":"rgba(224,216,208,0.65)";ctx.lineWidth=1.5;}
      ctx.stroke();
      if(!resolved&&speaking){
        const elapsed=(ts-startRef.current)/1000,progress=Math.min(elapsed/TOTAL,1);
        const angle=-Math.PI/2+progress*Math.PI*2,cr=r+5;
        ctx.beginPath();ctx.arc(cx,cy,cr,0,Math.PI*2);ctx.strokeStyle="rgba(224,216,208,0.18)";ctx.lineWidth=2;ctx.stroke();
        const tailLen=Math.PI*0.48,steps=44;
        for(let i=0;i<steps;i++){
          const t0=i/steps,a0=angle-tailLen*(1-t0),a1=angle-tailLen*(1-(i+1)/steps);
          const op=Math.pow(t0,1.8)*0.88;
          const trv=Math.round(184+(255-184)*t0),tgv=Math.round(169+(255-169)*t0),tbv=Math.round(217+(255-217)*t0);
          ctx.beginPath();ctx.arc(cx,cy,cr,a0,a1);ctx.strokeStyle=`rgba(${trv},${tgv},${tbv},${op})`;ctx.lineWidth=1.5+t0*2;ctx.lineCap="round";ctx.stroke();
        }
        const hx=cx+cr*Math.cos(angle),hy=cy+cr*Math.sin(angle);
        const hg=ctx.createRadialGradient(hx,hy,0,hx,hy,10);
        hg.addColorStop(0,"rgba(255,255,255,0.95)");hg.addColorStop(0.4,"rgba(214,228,240,0.55)");hg.addColorStop(1,"rgba(184,169,217,0)");
        ctx.beginPath();ctx.arc(hx,hy,10,0,Math.PI*2);ctx.fillStyle=hg;ctx.fill();
        ctx.beginPath();ctx.arc(hx,hy,2.8,0,Math.PI*2);ctx.fillStyle="rgba(255,255,255,0.98)";ctx.fill();
        if(progress>=1){onComplete&&onComplete();}
      } else if(resolved){
        const rd=(ts-resolveStartRef.current)/1000,gb=Math.min(1,rd*1.2);
        ctx.beginPath();ctx.arc(cx,cy,r+5,0,Math.PI*2);ctx.strokeStyle=`rgba(76,175,130,${gb*0.6})`;ctx.lineWidth=2.5;ctx.stroke();
      }
      rafRef.current=requestAnimationFrame(draw);
    }
    cancelAnimationFrame(rafRef.current);rafRef.current=requestAnimationFrame(draw);
    return()=>cancelAnimationFrame(rafRef.current);
  },[speaking,resolved,size,phase]);
  return (
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <canvas ref={canvasRef} style={{position:"absolute",inset:0}}/>
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 36px",zIndex:5,pointerEvents:"none"}}>
        {resolved
          ? <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="17" fill="rgba(76,175,130,0.12)" stroke={T.moss} strokeWidth="1.4"/><path d="M11 18l5 5 9-9" stroke={T.moss} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <div style={{fontSize:17,fontWeight:700,color:T.moss,textAlign:"center",fontFamily:T.ff}}>Heard.</div>
            </div>
          : <div style={{fontSize:18,fontWeight:700,color:T.ink,lineHeight:1.45,letterSpacing:"-0.015em",fontFamily:T.ff,textAlign:"center",opacity:phase==="idle"?0:1,transform:phase==="idle"?"translateY(8px)":"translateY(0)",transition:"opacity 0.5s,transform 0.5s"}}>{prompt}</div>
        }
      </div>
    </div>
  );
}

function VoiceStage({ onDone }) {
  const [phase,setPhase]=useState("idle"),[resolved,setResolved]=useState(false);
  const prompt=useRef(PROMPTS[Math.floor(Math.random()*PROMPTS.length)]).current;
  useEffect(()=>{ const t=setTimeout(()=>setPhase("reading"),800); return()=>clearTimeout(t); },[]);
  useEffect(()=>{ if(phase!=="reading") return; const t=setTimeout(()=>setPhase("speaking"),3200); return()=>clearTimeout(t); },[phase]);
  useEffect(()=>{ if(phase!=="speaking") return; const t=setTimeout(()=>{setResolved(true);setPhase("done");setTimeout(onDone,1400);},7000+Math.random()*3000); return()=>clearTimeout(t); },[phase]);
  const guideText=phase==="done"?"Heard.":phase==="speaking"?"Say your answer out loud.":"Read this. Then say your answer out loud.";
  return (
    <div style={{padding:"16px 24px 0"}}>
      <div style={{marginBottom:12}}><CameraIndicator/></div>
      <Guide text={guideText}/>
      <div style={{display:"flex",justifyContent:"center",paddingBottom:40}}>
        <VoiceCircle size={310} prompt={prompt} phase={phase} resolved={resolved} onComplete={()=>{if(!resolved){setResolved(true);setPhase("done");setTimeout(onDone,1400);}}}/>
      </div>
    </div>
  );
}

// ── STAGE SCREENS ─────────────────────────────────────────
function ThresholdScreen({ onNext }) {
  const [open,setOpen]=useState(false);
  return (
    <div style={{padding:"28px 24px 48px"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20}}>
        <VesicaMark size={20} color={T.prism} opacity={0.8}/>
        <span style={{fontSize:10,fontWeight:700,letterSpacing:"0.09em",textTransform:"uppercase",color:T.inkSoft,fontFamily:T.ff}}>Proof of Life</span>
      </div>
      <div style={{fontSize:26,fontWeight:800,letterSpacing:"-0.025em",color:T.ink,lineHeight:1.15,marginBottom:10,fontFamily:T.ff}}>One moment.<br/>Then you're permanent.</div>
      <div style={{fontSize:14,color:T.inkMid,lineHeight:1.65,marginBottom:24,fontFamily:T.ff}}>Before you activate your first Kairos, we will use your camera, microphone and movement to create a permanent digital signature — unique to you and bound to your account.</div>
      <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:T.inkSoft,marginBottom:8,fontFamily:T.ff}}>What to expect</div>
      <div style={{borderRadius:14,border:`1px solid ${T.border}`,overflow:"hidden",background:"rgba(255,255,255,0.50)",marginBottom:16}}>
        {[["1","rgba(196,131,90,0.12)","Camera and microphone","We will ask for access. Nothing is stored."],["2","rgba(184,169,217,0.16)","Eye movement","Follow an object as it moves."],["3","rgba(196,131,90,0.12)","Say something out loud","Read and answer a question."],["4","rgba(184,169,217,0.16)","Your account is bound","Your new digital signature is tied to your account."]].map(([n,bg,title,sub],i,arr)=>(
          <div key={n} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"12px 14px",borderBottom:i<arr.length-1?`1px solid rgba(224,216,208,0.6)`:"none"}}>
            <div style={{width:24,height:24,minWidth:24,borderRadius:12,background:bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}><span style={{fontSize:10,fontWeight:700,color:T.inkMid,fontFamily:T.ff}}>{n}</span></div>
            <div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:T.ink,fontFamily:T.ff}}>{title}</div><div style={{fontSize:11,color:T.inkSoft,marginTop:2,lineHeight:1.5,fontFamily:T.ff}}>{sub}</div></div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:0,marginBottom:16,borderRadius:13,border:`1px solid ${T.border}`,overflow:"hidden",background:"rgba(255,255,255,0.50)"}}>
        <div style={{padding:"11px 16px",borderBottom:`1px solid rgba(224,216,208,0.6)`}}><div style={{fontSize:12,fontWeight:700,color:T.ink,marginBottom:2,fontFamily:T.ff}}>Stays on this phone</div><div style={{fontSize:11,color:T.inkSoft,lineHeight:1.55,fontFamily:T.ff}}>Only a number leaves. Never your face, voice, or any recording.</div></div>
        <div style={{padding:"11px 16px"}}><div style={{fontSize:12,fontWeight:700,color:T.ink,marginBottom:2,fontFamily:T.ff}}>Humans only</div><div style={{fontSize:11,color:T.inkSoft,lineHeight:1.55,fontFamily:T.ff}}>No duplicate, fake, bot or AI accounts. One living human being, one account.</div></div>
      </div>
      <div onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",padding:"6px 0",width:"fit-content",marginBottom:open?10:24}}>
        <span style={{fontSize:13,fontWeight:700,color:T.signal,fontFamily:T.ff,borderBottom:"1px solid rgba(107,95,237,0.25)",paddingBottom:1}}>How does this work?</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{transform:open?"rotate(180deg)":"rotate(0deg)",transition:"transform .2s",flexShrink:0}}><path d="M2 4l4 4 4-4" stroke={T.signal} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      {open&&(
        <div style={{marginBottom:20,borderRadius:13,border:`1px solid ${T.border}`,overflow:"hidden",background:"rgba(255,255,255,0.55)"}}>
          {[["Why does ÆPOCH need to validate me at all?","Every member can activate one new Kairos per day. That only means something if every account belongs to a real, unique, living human being — not a bot or AI, not a duplicate, not someone pretending to be someone else. Email addresses and passwords can be faked or shared. So we validate something that cannot be: you, live, right now."],["What exactly are you reading?","Four things at once: how your face looks, how your eyes follow something moving, how your voice sounds, and the habits that are unique to you in how you use your device. Real, live human beings do all of these things in ways that cannot be replicated by a photo, a video, or a mask."],["What happens to that information?","It is turned into a single unique number on this device. The moment that number is created, the original data — your face, your voice, your eye movement — is deleted. The unique number leaves your phone. Your biometric data never does."],["How does a number protect my privacy?","The number works in one direction only. It confirms this is the same human being as before. It cannot be used to recreate your face, voice, or anything about you. It simply confirms you are who you say you are, each time you show up."]].map(([q,a],i,arr)=>(
            <div key={i} style={{padding:"13px 16px",borderBottom:i<arr.length-1?`1px solid ${T.border}`:"none"}}><div style={{fontSize:12,fontWeight:700,color:T.ink,marginBottom:4,fontFamily:T.ff}}>{q}</div><div style={{fontSize:12,color:T.inkMid,lineHeight:1.65,fontFamily:T.ff}}>{a}</div></div>
          ))}
        </div>
      )}
      <PrimaryCTA label="Begin" onTap={onNext}/>
      <div style={{fontSize:11,color:T.inkFaint,textAlign:"center",lineHeight:1.6,fontFamily:T.ff,padding:"12px 4px 0"}}>No biometric data is ever stored or transmitted. Only a derived number leaves this device.</div>
    </div>
  );
}

function PermissionScreen({ onNext }) {
  return (
    <div style={{padding:"28px 24px 48px"}}>
      <Guide text="Before we begin, we need access to your camera and microphone. This is the only way to confirm you're a real, unique, living human being."/>
      <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:24}}>
        <div style={{display:"flex",gap:12,alignItems:"flex-start",padding:"12px 14px",background:"rgba(255,255,255,0.50)",borderRadius:13,border:`1px solid ${T.border}`}}>
          <div style={{width:32,height:32,minWidth:32,borderRadius:9,background:"rgba(196,131,90,0.10)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke={T.clay} strokeWidth="1.6"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={T.clay} strokeWidth="1.6" strokeLinecap="round"/></svg></div>
          <div><div style={{fontSize:12,fontWeight:700,color:T.ink,marginBottom:2,fontFamily:T.ff}}>Camera</div><div style={{fontSize:11,color:T.inkSoft,lineHeight:1.5,fontFamily:T.ff}}>Your face and eye movement, read live on this device.</div></div>
        </div>
        <div style={{display:"flex",gap:12,alignItems:"flex-start",padding:"12px 14px",background:"rgba(255,255,255,0.50)",borderRadius:13,border:`1px solid ${T.border}`}}>
          <div style={{width:32,height:32,minWidth:32,borderRadius:9,background:"rgba(196,131,90,0.10)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 1a3 3 0 0 1 3 3v8a3 3 0 0 1-6 0V4a3 3 0 0 1 3-3z" stroke={T.clay} strokeWidth="1.6" strokeLinecap="round"/><path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke={T.clay} strokeWidth="1.6" strokeLinecap="round"/><line x1="12" y1="19" x2="12" y2="23" stroke={T.clay} strokeWidth="1.6" strokeLinecap="round"/></svg></div>
          <div><div style={{fontSize:12,fontWeight:700,color:T.ink,marginBottom:2,fontFamily:T.ff}}>Microphone</div><div style={{fontSize:11,color:T.inkSoft,lineHeight:1.5,fontFamily:T.ff}}>Your voice pattern, processed here and nowhere else.</div></div>
        </div>
      </div>
      <div style={{fontSize:12,color:T.inkSoft,lineHeight:1.65,marginBottom:28,fontFamily:T.ff}}>Your device will ask for permission. Tap Allow — without it, we cannot validate you as a real, unique, living human being.</div>
      <PrimaryCTA label="Allow access and continue" onTap={onNext}/>
      <div style={{fontSize:11,color:T.inkFaint,textAlign:"center",lineHeight:1.6,fontFamily:T.ff,padding:"12px 4px 0"}}>Nothing is stored. Your data never leaves this device.</div>
    </div>
  );
}

function ConfirmationScreen({ onNext }) {
  const [revealed,setRevealed]=useState(false);
  useEffect(()=>{ const t=setTimeout(()=>setRevealed(true),400); return()=>clearTimeout(t); },[]);
  const stmts=["Your signature is yours alone.","Nothing about your face was stored anywhere.","No one can see what your camera saw — not even us.","Your account is now permanently bound to you."];
  return (
    <div style={{padding:"32px 28px 48px"}}>
      <div style={{fontSize:26,fontWeight:800,letterSpacing:"-0.025em",color:T.ink,lineHeight:1.15,marginBottom:10,fontFamily:T.ff,opacity:revealed?1:0,transform:revealed?"translateY(0)":"translateY(8px)",transition:"opacity 0.5s,transform 0.5s"}}>Here's what just happened.</div>
      <div style={{fontSize:14,color:T.inkMid,lineHeight:1.65,marginBottom:28,fontFamily:T.ff,opacity:revealed?1:0,transition:"opacity 0.5s 0.1s"}}>Take a moment. Then confirm and bind.</div>
      <div style={{display:"flex",flexDirection:"column",gap:0,borderRadius:14,border:`1px solid ${T.border}`,overflow:"hidden",background:"rgba(255,255,255,0.52)",marginBottom:24}}>
        {stmts.map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"14px 16px",borderBottom:i<stmts.length-1?`1px solid rgba(224,216,208,0.6)`:"none",opacity:revealed?1:0,transform:revealed?"translateY(0)":"translateY(8px)",transition:`opacity 0.45s ${0.2+i*0.12}s,transform 0.45s ${0.2+i*0.12}s`}}>
            <div style={{paddingTop:1}}><MossTick/></div>
            <div style={{fontSize:13,color:T.ink,lineHeight:1.6,fontFamily:T.ff,fontWeight:500}}>{s}</div>
          </div>
        ))}
      </div>
      <div style={{fontSize:12,color:T.inkSoft,lineHeight:1.65,marginBottom:24,fontFamily:T.ff,padding:"12px 14px",background:"rgba(196,131,90,0.06)",borderRadius:10,border:"1px solid rgba(196,131,90,0.14)",opacity:revealed?1:0,transition:"opacity 0.4s 0.7s"}}>Tapping below is permanent. Your biometric signature will be bound to this account and cannot be changed.</div>
      <div style={{opacity:revealed?1:0,transition:"opacity 0.4s 0.85s"}}><CeremonyCTA label="Confirm and bind" onTap={onNext}/></div>
    </div>
  );
}

function BoundScreen() {
  const [revealed,setRevealed]=useState(false);
  useEffect(()=>{ const t=setTimeout(()=>setRevealed(true),300); return()=>clearTimeout(t); },[]);
  return (
    <div style={{padding:"32px 28px 48px",display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",minHeight:400,justifyContent:"center"}}>
      <div style={{opacity:revealed?1:0,transform:revealed?"scale(1)":"scale(0.85)",transition:"opacity 0.6s,transform 0.6s cubic-bezier(.34,1.56,.64,1)",marginBottom:24}}>
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none"><circle cx="40" cy="40" r="38" fill="rgba(76,175,130,0.12)" stroke={T.moss} strokeWidth="1.5"/><path d="M25 40l12 12 18-18" stroke={T.moss} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <div style={{fontSize:34,fontWeight:800,letterSpacing:"-0.03em",color:T.ink,lineHeight:1.1,marginBottom:12,fontFamily:T.ff,opacity:revealed?1:0,transform:revealed?"translateY(0)":"translateY(8px)",transition:"opacity 0.5s 0.15s,transform 0.5s 0.15s"}}>Bound.</div>
      <div style={{fontSize:16,color:T.inkMid,lineHeight:1.65,fontFamily:T.ff,maxWidth:260,marginBottom:32,opacity:revealed?1:0,transition:"opacity 0.5s 0.25s"}}>Your account is yours. No one else can claim it.</div>
      <div style={{opacity:revealed?1:0,transition:"opacity 0.5s 0.45s",width:"100%"}}><CeremonyCTA label="Activate your first Kairos"/></div>
    </div>
  );
}

function HearthScreen({ onRedo }) {
  const [revealed,setRevealed]=useState(false);
  useEffect(()=>{ const t=setTimeout(()=>setRevealed(true),300); return()=>clearTimeout(t); },[]);
  return (
    <div style={{padding:"32px 28px 40px"}}>
      <div style={{display:"flex",justifyContent:"center",marginBottom:24,opacity:revealed?1:0,transform:revealed?"translateY(0)":"translateY(8px)",transition:"opacity 0.4s,transform 0.4s"}}>
        <div style={{width:64,height:64,borderRadius:"50%",background:"rgba(139,94,47,0.10)",border:"1.5px solid rgba(139,94,47,0.25)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 8v5M12 16v.5" stroke={T.hearth} strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="12" r="10" stroke={T.hearth} strokeWidth="1.6"/></svg>
        </div>
      </div>
      <div style={{fontSize:24,fontWeight:800,letterSpacing:"-0.025em",color:T.ink,lineHeight:1.15,marginBottom:10,fontFamily:T.ff,opacity:revealed?1:0,transition:"opacity 0.4s 0.08s"}}>Something didn't come through.</div>
      <div style={{fontSize:14,color:T.inkMid,lineHeight:1.65,marginBottom:24,fontFamily:T.ff,opacity:revealed?1:0,transition:"opacity 0.4s 0.14s"}}>It's not you — the system had trouble reading the signal. Find good light, somewhere quiet, and try again.</div>
      <div style={{display:"flex",flexDirection:"column",gap:0,borderRadius:13,border:"1px solid rgba(139,94,47,0.20)",background:"rgba(139,94,47,0.04)",overflow:"hidden",marginBottom:24,opacity:revealed?1:0,transition:"opacity 0.4s 0.20s"}}>
        {["Good light on your face — no strong light behind you.","Hold your phone at eye level and stay still.","Somewhere quiet enough to speak clearly."].map((tip,i)=>(
          <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"12px 14px",borderBottom:i<2?"1px solid rgba(139,94,47,0.12)":"none"}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:T.hearth,flexShrink:0,marginTop:6}}/>
            <div style={{fontSize:12,color:T.inkMid,lineHeight:1.6,fontFamily:T.ff}}>{tip}</div>
          </div>
        ))}
      </div>
      <div style={{fontSize:11,color:T.hearth,fontWeight:700,textAlign:"center",marginBottom:16,fontFamily:T.ff,opacity:revealed?1:0,transition:"opacity 0.4s 0.26s"}}>2 attempts remaining today</div>
      <div style={{opacity:revealed?1:0,transition:"opacity 0.4s 0.32s"}}>
        <div style={{height:52,borderRadius:13,background:T.hearth,color:"#FAF8F5",fontSize:14,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.ff,cursor:"pointer"}} onClick={onRedo}>Redo</div>
      </div>
    </div>
  );
}

function EmberScreen() {
  const [revealed,setRevealed]=useState(false);
  useEffect(()=>{ const t=setTimeout(()=>setRevealed(true),300); return()=>clearTimeout(t); },[]);
  return (
    <div style={{padding:"32px 28px 40px"}}>
      <div style={{display:"flex",justifyContent:"center",marginBottom:24,opacity:revealed?1:0,transform:revealed?"translateY(0)":"translateY(8px)",transition:"opacity 0.4s,transform 0.4s"}}>
        <div style={{width:64,height:64,borderRadius:"50%",background:"rgba(160,48,32,0.10)",border:"1.5px solid rgba(160,48,32,0.25)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={T.ember} strokeWidth="1.6"/><path d="M8 8l8 8M16 8l-8 8" stroke={T.ember} strokeWidth="2" strokeLinecap="round"/></svg>
        </div>
      </div>
      <div style={{fontSize:24,fontWeight:800,letterSpacing:"-0.025em",color:T.ink,lineHeight:1.15,marginBottom:10,fontFamily:T.ff,opacity:revealed?1:0,transition:"opacity 0.4s 0.08s"}}>We weren't able to validate a live human being.</div>
      <div style={{fontSize:14,color:T.inkMid,lineHeight:1.65,marginBottom:24,fontFamily:T.ff,opacity:revealed?1:0,transition:"opacity 0.4s 0.14s"}}>Our system detected something it couldn't validate. This session has ended and has been recorded.</div>
      <div style={{padding:"14px 16px",borderRadius:13,background:"rgba(160,48,32,0.05)",border:"1px solid rgba(160,48,32,0.18)",marginBottom:24,opacity:revealed?1:0,transition:"opacity 0.4s 0.20s"}}>
        <div style={{fontSize:12,color:T.inkMid,lineHeight:1.7,fontFamily:T.ff}}>You can try again tomorrow. If you believe this is an error, contact the ÆPOCH team and we'll look into it.</div>
      </div>
      <div style={{textAlign:"center",marginBottom:20,opacity:revealed?1:0,transition:"opacity 0.4s 0.26s"}}>
        <span style={{fontSize:13,fontWeight:700,color:T.signal,fontFamily:T.ff,borderBottom:"1px solid rgba(107,95,237,0.25)",paddingBottom:1,cursor:"pointer"}}>Contact support</span>
      </div>
      <div style={{height:52,borderRadius:13,background:"rgba(255,255,255,0.45)",border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",opacity:revealed?1:0,transition:"opacity 0.4s 0.32s"}}>
        <span style={{fontSize:14,fontWeight:700,color:T.inkMid,fontFamily:T.ff}}>I'll try again tomorrow</span>
      </div>
    </div>
  );
}

// ── MAIN ─────────────────────────────────────────────────
export default function App() {
  const [stage,setStage]=useState("threshold");
  const W=375;
  useEffect(()=>{ const l=document.createElement("link");l.rel="stylesheet";l.href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap";document.head.appendChild(l); },[]);
  function go(s){setStage(s);}
  const stageLabels={threshold:"1",permission:"2",lineup:"3",turnleft:"4",turnright:"5",gaze:"6",voice:"7",confirmation:"8",bound:"9",hearth:"✕H",ember:"✕E"};
  return (
    <div style={{background:"#E4E1DC",minHeight:"100vh",padding:"24px 16px 48px",fontFamily:T.ff,display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
      <div style={{width:W}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:".10em",textTransform:"uppercase",color:T.inkSoft,fontFamily:"system-ui"}}>ÆPOCH · PoL Flow · Track A</div>
        <div style={{fontSize:20,fontWeight:800,letterSpacing:"-.025em",color:T.ink}}>Proof of Life — Full Flow v1.1</div>
      </div>
      <div style={{display:"flex",gap:3,flexWrap:"wrap",width:W}}>
        {STAGES.map(s=>(
          <button key={s} onClick={()=>go(s)} style={{padding:"5px 10px",borderRadius:6,border:`1px solid ${stage===s?(s==="hearth"?T.hearth:s==="ember"?T.ember:T.signal):T.border}`,background:stage===s?(s==="hearth"?"rgba(139,94,47,0.10)":s==="ember"?"rgba(160,48,32,0.10)":"rgba(107,95,237,0.10)"):"rgba(255,255,255,0.45)",color:stage===s?(s==="hearth"?T.hearth:s==="ember"?T.ember:T.signal):T.inkSoft,fontWeight:stage===s?700:500,fontSize:11,fontFamily:"system-ui",cursor:"pointer",transition:"all .15s"}}>
            {stageLabels[s]}
          </button>
        ))}
      </div>
      <div style={{width:W,borderRadius:44,overflow:"hidden",background:"#FEFCF9",position:"relative",flexShrink:0,boxShadow:"0 2px 4px rgba(0,0,0,.06),0 24px 72px rgba(0,0,0,.14),inset 0 0 0 1px rgba(0,0,0,.05)"}}>
        <EarthRiseBG w={W} h={900}/>
        <Grain/>
        <div style={{position:"relative",zIndex:5}}>
          <StatusBar/>
          <ProgressBar stage={stage}/>
          {stage==="threshold"   && <ThresholdScreen    onNext={()=>go("permission")}/>}
          {stage==="permission"  && <PermissionScreen   onNext={()=>go("lineup")}/>}
          {stage==="lineup"      && <AlignStep key="lineup"    guideText="Line yourself up. Centre your face in the circle."  instruction="center" hint="Hold still — reading you now."       onDone={()=>go("turnleft")}/>}
          {stage==="turnleft"    && <AlignStep key="turnleft"  guideText="Good. Now turn your head slowly to the left."        instruction="left"   hint="Turning left — keep going slowly." onDone={()=>go("turnright")}/>}
          {stage==="turnright"   && <AlignStep key="turnright" guideText="Now turn slowly to the right. Same pace."            instruction="right"  hint="Turning right — almost there."     onDone={()=>go("gaze")}/>}
          {stage==="gaze"        && <GazeStage   key="gaze"   onDone={()=>go("voice")}/>}
          {stage==="voice"       && <VoiceStage  key="voice"  onDone={()=>go("confirmation")}/>}
          {stage==="confirmation"&& <ConfirmationScreen        onNext={()=>go("bound")}/>}
          {stage==="bound"       && <BoundScreen/>}
          {stage==="hearth"      && <HearthScreen              onRedo={()=>go("lineup")}/>}
          {stage==="ember"       && <EmberScreen/>}
        </div>
      </div>
      <div style={{fontSize:10,color:T.inkSoft,fontFamily:"system-ui",letterSpacing:".05em",width:W}}>260315-ÆPOCH-PoL-Full-v1.1 · 9 screens + 2 failure states · Track A · No Genie</div>
    </div>
  );
}
