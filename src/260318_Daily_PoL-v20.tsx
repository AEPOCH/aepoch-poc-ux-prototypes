import { useState, useEffect, useRef } from "react";

const T = {
  ink:"#1A1612", inkMid:"#4A4440", inkSoft:"#8A8480", inkFaint:"#C4BEB8",
  clay:"#C4835A", sand:"#E8C9A0", prism:"#B8A9D9",
  pearl:"#D6E4F0", signal:"#6B5FED", glow:"#9B8FF5", moss:"#4CAF82",
  hearth:"#8B5E2F", ember:"#A03020", border:"#E0D8D0", cta:"#2A2520",
  ff:"'DM Sans',system-ui,-apple-system,sans-serif",
};

const STAGES=["pol","approve","origin","minted","give","amount","confirm","sent","kept","hearth","ember"];
const PROGRESS={pol:20,approve:35,origin:50,minted:65,give:75,amount:83,confirm:92,sent:100,kept:65,hearth:20,ember:20};
const STREAK=12, DAY=48, POL_BALANCE=1.0, FREE_BALANCE=3.0, TOTAL_BALANCE=4.0;
const MEMBERS=["kai","nova","river","sol","eden","mira","fox","sage","dawn","reef"];
const MOODS=["Amazed","Angry","Calm","Disgusted","Grateful","Hopeful","In Awe","Joyful","Sad","Scared","Trusting"];
const MOOD_TINT={"Joyful":[232,195,88],"Trusting":[100,185,155],"Scared":[95,80,155],"Amazed":[245,175,48],"Sad":[88,108,175],"Disgusted":[88,128,58],"Grateful":[215,148,98],"Angry":[215,48,32],"Hopeful":[148,195,88],"Calm":[118,148,195],"In Awe":[148,118,215],"":[200,175,130]};
const MOOD_GREEK={"Joyful":"Χαρούμενος","Trusting":"Εμπιστοσύνη","Scared":"Φοβισμένος","Amazed":"Έκθαμβος","Sad":"Λυπημένος","Disgusted":"Αηδιασμένος","Grateful":"Ευγνώμων","Angry":"Θυμωμένος","Hopeful":"Ελπιδοφόρος","Calm":"Γαλήνιος","In Awe":"Δέος"};

const AVATAR_COLS=["#C4835A","#8BAFD4","#B8A9D9","#4CAF82","#A0673A","rgba(107,95,237,0.85)"];
function avatarCol(h){const s=(h||"?").split("").reduce((a,c)=>a+c.charCodeAt(0),0);return AVATAR_COLS[s%AVATAR_COLS.length];}
function Avatar({handle,size=36}){
  return <div style={{width:size,height:size,borderRadius:"50%",background:avatarCol(handle),display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.38,fontWeight:700,color:"white",flexShrink:0,fontFamily:T.ff,userSelect:"none"}}>{(handle||"?")[0].toUpperCase()}</div>;
}

function drawFOL(ctx,cx,cy,radius,opacity){
  const r=radius*0.195;
  const pos=[[0,0],[1,0],[-1,0],[0.5,0.866],[-0.5,0.866],[0.5,-0.866],[-0.5,-0.866],[2,0],[-2,0],[1,1.732],[-1,1.732],[1,-1.732],[-1,-1.732],[0,1.732],[0,-1.732],[1.5,0.866],[-1.5,0.866],[1.5,-0.866],[-1.5,-0.866],[2.5,0.866],[-2.5,0.866],[2.5,-0.866],[-2.5,-0.866],[2,1.732],[-2,1.732],[2,-1.732],[-2,-1.732],[3,0],[-3,0],[0.5,2.598],[-0.5,2.598],[0.5,-2.598],[-0.5,-2.598]];
  ctx.save();
  pos.forEach(([gx,gy])=>{
    const x=cx+gx*r,y=cy+gy*r,d=Math.sqrt((x-cx)**2+(y-cy)**2);
    if(d>radius*1.02)return;
    const fade=Math.max(0,1-d/(radius*0.90));
    ctx.globalAlpha=(opacity||0.10)*(0.3+0.7*fade);
    ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);
    ctx.strokeStyle="rgba(184,169,217,0.8)";ctx.lineWidth=0.55;ctx.stroke();
  });
  ctx.globalAlpha=1;ctx.restore();
}

function faceDensity(nx,ny){
  const oval=Math.max(0,1-Math.sqrt((nx*1.35)**2+(ny*0.82)**2));
  const eyeL=Math.max(0,1-Math.sqrt(((nx+0.28)/0.20)**2+((ny+0.20)/0.09)**2));
  const eyeR=Math.max(0,1-Math.sqrt(((nx-0.28)/0.20)**2+((ny+0.20)/0.09)**2));
  const browL=(ny>-0.36&&ny<-0.25)?Math.max(0,0.8-Math.sqrt(((nx+0.26)/0.22)**2+((ny+0.305)/0.055)**2)):0;
  const browR=(ny>-0.36&&ny<-0.25)?Math.max(0,0.8-Math.sqrt(((nx-0.26)/0.22)**2+((ny+0.305)/0.055)**2)):0;
  const nose=Math.max(0,1-Math.sqrt((nx/0.14)**2+((ny-0.22)/0.08)**2));
  const upLip=Math.max(0,1-Math.sqrt((nx/0.26)**2+((ny-0.41)/0.07)**2));
  const loLip=Math.max(0,1-Math.sqrt((nx/0.24)**2+((ny-0.52)/0.10)**2));
  const chin=Math.max(0,0.8-Math.sqrt((nx/0.16)**2+((ny-0.64)/0.09)**2));
  const jawL=Math.max(0,0.5-Math.sqrt(((nx+0.38)/0.10)**2+((ny-0.18)/0.24)**2));
  const jawR=Math.max(0,0.5-Math.sqrt(((nx-0.38)/0.10)**2+((ny-0.18)/0.24)**2));
  return Math.min(1,oval*0.45+(eyeL*2+eyeR*2+browL*1.6+browR*1.6+nose*1.4+upLip*1.6+loLip*1.6+chin*0.8+jawL*0.6+jawR*0.6)*0.65);
}

function EarthRiseBG({w,h}){
  const ref=useRef();
  useEffect(()=>{
    function draw(){
      const c=ref.current;if(!c)return;
      const dpr=window.devicePixelRatio||1;
      c.width=w*dpr;c.height=h*dpr;c.style.width=w+"px";c.style.height=h+"px";
      const ctx=c.getContext("2d");ctx.scale(dpr,dpr);
      ctx.fillStyle="#FEFCF9";ctx.fillRect(0,0,w,h);
      [{x:.10,y:.70,r:.70,col:[232,201,160],a:.18},{x:.25,y:.85,r:.55,col:[196,131,90],a:.12},{x:.05,y:.50,r:.45,col:[196,131,90],a:.08},{x:.55,y:.60,r:.50,col:[232,201,160],a:.10},{x:.88,y:.05,r:.55,col:[214,228,240],a:.16},{x:.95,y:.15,r:.38,col:[184,169,217],a:.12},{x:.50,y:1.05,r:.50,col:[232,201,160],a:.12}].forEach(({x,y,r,col,a})=>{
        const cx=x*w,cy=y*h,rad=r*Math.min(w,h);
        const g=ctx.createRadialGradient(cx,cy,0,cx,cy,rad);
        g.addColorStop(0,`rgba(${col},${a})`);g.addColorStop(0.45,`rgba(${col},${a*.55})`);g.addColorStop(1,`rgba(${col},0)`);
        ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
      });
    }
    draw();const t=setTimeout(draw,80);return()=>clearTimeout(t);
  },[w,h]);
  return <canvas ref={ref} style={{position:"absolute",inset:0}}/>;
}

function Grain(){
  const ref=useRef();
  useEffect(()=>{
    const c=ref.current;if(!c)return;
    c.width=375;c.height=900;
    const ctx=c.getContext("2d");
    const id=ctx.createImageData(375,900);const d=id.data;
    for(let i=0;i<d.length;i+=4){const v=Math.random()*255|0;d[i]=d[i+1]=d[i+2]=v;d[i+3]=18;}
    ctx.putImageData(id,0,0);
  },[]);
  return <canvas ref={ref} style={{position:"absolute",inset:0,width:"100%",height:"100%",mixBlendMode:"overlay",opacity:0.65,pointerEvents:"none"}}/>;
}

function StatusBar(){
  return(
    <div style={{position:"relative",zIndex:10,display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 28px 0",height:44,fontFamily:T.ff}}>
      <span style={{fontSize:12,fontWeight:700,color:T.ink,letterSpacing:"-0.02em"}}>9:41</span>
      <div style={{display:"flex",gap:5,alignItems:"center"}}>
        <svg width="15" height="11" viewBox="0 0 15 11">{[0,1,2,3].map(i=><rect key={i} x={i*4} y={10-(i+1)*2.5} width="2.5" height={(i+1)*2.5} rx="0.5" fill={T.ink} opacity={i<3?1:0.3}/>)}</svg>
        <svg width="25" height="11" viewBox="0 0 25 11"><rect x="0" y="1" width="21" height="9" rx="2" fill="none" stroke={T.ink} strokeWidth="1.1"/><rect x="1.2" y="2.2" width="15" height="6.6" rx="1.2" fill={T.ink}/><path d="M22 3.5v4q2-.5 2-2t-2-2z" fill={T.ink} opacity=".4"/></svg>
      </div>
    </div>
  );
}

function ProgressBar({stage}){
  const pct=PROGRESS[stage]||0;
  const col=stage==="ember"?`linear-gradient(90deg,${T.ember},rgba(160,48,32,0.5))`:stage==="hearth"?`linear-gradient(90deg,${T.hearth},rgba(139,94,47,0.5))`:stage==="minted"?`linear-gradient(90deg,${T.moss},rgba(76,175,130,0.6))`:`linear-gradient(90deg,${T.signal},${T.prism})`;
  return(
    <div style={{height:2,margin:"8px 0 0",background:"rgba(224,216,208,0.45)"}}>
      <div style={{height:2,width:`${pct}%`,background:col,transition:"width .6s cubic-bezier(.4,0,.2,1),background 0.4s",borderRadius:1}}/>
    </div>
  );
}

// Camera Active pill — always below camera canvas, centre-justified
function CamPill(){
  return(
    <div style={{display:"flex",justifyContent:"center",marginTop:14}}>
      <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(26,22,18,0.62)",borderRadius:20,padding:"4px 10px 4px 8px",border:"0.5px solid rgba(255,255,255,0.10)"}}>
        <div style={{width:7,height:7,borderRadius:"50%",background:T.moss,boxShadow:"0 0 6px rgba(76,175,130,0.80)",flexShrink:0}}/>
        <span style={{fontSize:10,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",color:"rgba(250,248,245,0.92)",fontFamily:T.ff}}>Camera active — on device only</span>
      </div>
    </div>
  );
}

// Genie C5 dual-source wash
function Guide({text}){
  return(
    <div style={{position:"relative",padding:"8px 0",marginBottom:16}}>
      <div style={{position:"absolute",inset:"-6px -4px",background:"radial-gradient(ellipse 70% 70% at 85% 10%, rgba(184,169,217,0.26) 0%, transparent 65%), radial-gradient(ellipse 70% 70% at 15% 90%, rgba(232,201,160,0.20) 0%, transparent 65%)",borderRadius:16,pointerEvents:"none"}}/>
      <div style={{position:"relative",fontSize:14,lineHeight:1.75,color:T.ink,fontFamily:T.ff}}>{text}</div>
    </div>
  );
}

// Back chevron — icon only, 44×44px touch target, no label ever
function BackChevron({onTap}){
  return(
    <div onClick={onTap} style={{width:44,height:44,display:"flex",alignItems:"center",justifyContent:"flex-start",cursor:"pointer",flexShrink:0,marginLeft:-8,marginBottom:4}}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M12 5L7 10l5 5" stroke={T.inkSoft} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

// Streak pill — Clay/Earth family, not Signal
function StreakPill({streak}){
  return(
    <div style={{display:"inline-flex",alignItems:"center",gap:9,padding:"8px 16px",borderRadius:20,background:"rgba(196,131,90,0.14)",border:"1.5px solid rgba(196,131,90,0.35)"}}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2C8 4.5 5 7 5 11a5 5 0 0010 0c0-2.2-1.2-4.2-2.2-5.2C12 7.5 11.2 9 10 9.8 10 8.5 9.6 5.5 10 2z" fill={T.clay} opacity="0.9"/>
        <path d="M10 13a1.5 1.5 0 010 3 1.5 1.5 0 010-3z" fill="rgba(255,255,255,0.6)"/>
      </svg>
      <span style={{fontSize:15,fontWeight:800,color:T.clay,fontFamily:T.ff,letterSpacing:"-0.02em"}}>{streak}</span>
      <span style={{fontSize:13,fontWeight:500,color:T.inkMid,fontFamily:T.ff}}>days in a row.</span>
    </div>
  );
}

function PrimaryCTA({label,onTap,disabled}){
  const [hov,setHov]=useState(false),[prs,setPrs]=useState(false);
  return(
    <div style={{position:"relative",cursor:disabled?"not-allowed":"pointer",userSelect:"none",opacity:disabled?0.5:1}}
      onMouseEnter={()=>!disabled&&setHov(true)} onMouseLeave={()=>{setHov(false);setPrs(false);}}
      onMouseDown={()=>!disabled&&setPrs(true)} onMouseUp={()=>{setPrs(false);!disabled&&onTap&&onTap();}}>
      {hov&&!prs&&!disabled&&<div style={{position:"absolute",bottom:-8,left:"8%",right:"8%",height:24,background:"radial-gradient(ellipse,rgba(196,131,90,0.48) 0%,transparent 70%)",filter:"blur(8px)",pointerEvents:"none"}}/>}
      <div style={{position:"relative",zIndex:1,height:52,borderRadius:13,background:prs?"#1E1510":hov?"#342218":T.cta,color:"#FAF8F5",fontSize:14,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.ff,transform:prs?"translateY(1px) scale(.998)":hov?"translateY(-2px)":"none",boxShadow:"0 2px 16px rgba(42,37,32,.17)",transition:"all .26s cubic-bezier(.34,1.56,.64,1)"}}>{label}</div>
    </div>
  );
}

function CeremonyCTA({label,onTap,disabled}){
  const [hov,setHov]=useState(false),[prs,setPrs]=useState(false);
  return(
    <div style={{position:"relative",cursor:disabled?"not-allowed":"pointer",userSelect:"none",opacity:disabled?0.5:1}}
      onMouseEnter={()=>!disabled&&setHov(true)} onMouseLeave={()=>{setHov(false);setPrs(false);}}
      onMouseDown={()=>!disabled&&setPrs(true)} onMouseUp={()=>{setPrs(false);!disabled&&onTap&&onTap();}}>
      {hov&&!disabled&&<div style={{position:"absolute",bottom:-8,left:"8%",right:"8%",height:24,background:"radial-gradient(ellipse,rgba(196,131,90,0.55) 0%,transparent 70%)",filter:"blur(10px)",pointerEvents:"none"}}/>}
      <div style={{position:"relative",zIndex:1,height:52,borderRadius:13,background:prs?"#9A6040":hov?"#D4956A":T.clay,color:"#FAF8F5",fontSize:14,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.ff,transform:prs?"translateY(1px) scale(.998)":hov?"translateY(-2px)":"none",boxShadow:"0 2px 16px rgba(196,131,90,0.35)",transition:"all .26s cubic-bezier(.34,1.56,.64,1)"}}>{label}</div>
    </div>
  );
}

function WarnCTA({label,onTap}){
  const [hov,setHov]=useState(false),[prs,setPrs]=useState(false);
  return(
    <div style={{cursor:"pointer",userSelect:"none"}}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>{setHov(false);setPrs(false);}}
      onMouseDown={()=>setPrs(true)} onMouseUp={()=>{setPrs(false);onTap&&onTap();}}>
      <div style={{height:52,borderRadius:13,background:prs?"#5A3A18":hov?"#A0702A":T.hearth,color:"#FAF8F5",fontSize:14,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.ff,transform:prs?"translateY(1px)":hov?"translateY(-1px)":"none",boxShadow:"0 2px 12px rgba(139,94,47,0.30)",transition:"all .22s cubic-bezier(.34,1.56,.64,1)"}}>{label}</div>
    </div>
  );
}

function Ghost({label,onTap}){
  return(
    <div onClick={onTap} style={{textAlign:"center",cursor:"pointer",padding:"10px 0"}}>
      <span style={{fontSize:13,fontWeight:700,color:T.inkSoft,fontFamily:T.ff}}>{label}</span>
    </div>
  );
}

function HomeLink({onTap}){
  const [hov,setHov]=useState(false);
  return(
    <div style={{textAlign:"center",marginTop:10}} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={onTap}>
      <span style={{fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:T.ff,transition:"color .15s",color:hov?T.signal:T.inkSoft,borderBottom:`1px solid ${hov?"rgba(107,95,237,0.35)":"rgba(138,132,128,0.25)"}`,paddingBottom:1}}>Return to home</span>
    </div>
  );
}

function Numpad({value,onChange}){
  function press(k){
    if(k==="del"){onChange(value.slice(0,-1)||"");return;}
    if(k==="."){if(value.includes("."))return;onChange((value||"0")+".");return;}
    if(value==="0"&&k!==".")onChange(k);
    else if(value.length<8){const di=value.indexOf(".");if(di!==-1&&value.length-di>5)return;onChange((value||"")+k);}
  }
  const keys=[["1","2","3"],["4","5","6"],["7","8","9"],[".", "0","del"]];
  return(
    <div style={{display:"grid",gridTemplateRows:"repeat(4,1fr)",gap:6,padding:"0 8px"}}>
      {keys.map((row,ri)=>(
        <div key={ri} style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
          {row.map(k=>{
            const isDel=k==="del";
            return(
              <div key={k} onMouseDown={()=>press(k)}
                style={{height:46,borderRadius:12,background:isDel?"transparent":"rgba(255,255,255,0.55)",border:`1px solid ${isDel?"transparent":T.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",userSelect:"none",fontFamily:T.ff,fontSize:isDel?14:18,fontWeight:isDel?400:700,color:isDel?T.inkSoft:T.ink}}
                onMouseEnter={e=>{if(!isDel)e.currentTarget.style.background="rgba(255,255,255,0.80)";}}
                onMouseLeave={e=>{e.currentTarget.style.background=isDel?"transparent":"rgba(255,255,255,0.55)";}}>
                {isDel?<svg width="18" height="14" viewBox="0 0 24 18" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1H21a2 2 0 012 2v12a2 2 0 01-2 2H9L2 9z" stroke={T.inkSoft} strokeWidth="1.6"/><path d="M13 6l6 6M19 6l-6 6" stroke={T.inkSoft} strokeWidth="1.6"/></svg>:k}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function ObversePanel({mood,w,h}){
  const ref=useRef();
  const [wr,wg,wb]=MOOD_TINT[mood]||MOOD_TINT[""];
  useEffect(()=>{
    const c=ref.current;if(!c)return;
    const dpr=window.devicePixelRatio||1;c.width=w*dpr;c.height=h*dpr;c.style.width=w+"px";c.style.height=h+"px";
    const ctx=c.getContext("2d");ctx.scale(dpr,dpr);
    ctx.fillStyle="#080604";ctx.fillRect(0,0,w,h);
    const bg=ctx.createRadialGradient(w*0.35,h*0.38,0,w*0.5,h*0.5,Math.max(w,h)*0.9);bg.addColorStop(0,`rgba(${wr},${wg},${wb},0.22)`);bg.addColorStop(1,`rgba(${wr},${wg},${wb},0)`);ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
    const pR=Math.max(w,h)*0.044;ctx.strokeStyle=`rgba(${wr},${wg},${wb},0.13)`;ctx.lineWidth=0.55;
    const seen=new Set();
    for(let q=-12;q<=12;q++){for(let s=-12;s<=12;s++){const px=w*0.5+pR*2*(q+s*0.5),py=h*0.5+pR*Math.sqrt(3)*s;const key=`${Math.round(px)},${Math.round(py)}`;if(seen.has(key))continue;seen.add(key);ctx.beginPath();ctx.arc(px,py,pR*2,0,Math.PI*2);ctx.stroke();}}
    const FCX=w*0.5,FCY=h*0.455,FW=w*0.90,FH=h*0.88;const ROWS=72,COLS=50,dSX=w/COLS,dSY=(h*0.85)/ROWS,startY=h*0.07;
    for(let row=0;row<ROWS;row++){for(let col=0;col<COLS;col++){const px=(col+0.5)*dSX,py=startY+(row+0.5)*dSY;const nx=(px-FCX)/(FW*0.48),ny=(py-FCY)/(FH*0.46);const density=faceDensity(nx,ny);const depth=Math.sqrt(Math.max(0,1-(nx*1.2)**2-(ny*0.9)**2));const edgeFade=Math.max(0,1-Math.max(0,Math.sqrt((nx*0.85)**2+(ny*0.72)**2)-0.5)*1.8);if(density<0.04&&Math.random()>density*10)continue;const dotR=Math.max(0.5,(density>0.5?3.2:density>0.25?2.2:1.2)*(0.4+depth*0.6));const bright=Math.max(0.35,depth*Math.min(1,Math.max(0.20,1-((nx+0.38)*0.25+(ny+0.28)*0.17))+0.3));ctx.beginPath();ctx.arc(px,py,dotR,0,Math.PI*2);ctx.fillStyle=`rgba(${Math.round(Math.max(40,wr*bright))},${Math.round(Math.max(28,wg*bright))},${Math.round(Math.max(18,wb*bright))},${Math.min(0.95,Math.max(0.28,density*1.1+depth*0.3)*edgeFade)})`;ctx.fill();}}
    for(let i=0;i<500;i++){const t2=Math.random()*Math.PI,ri=0.46+Math.random()*0.56;const hx=FCX+Math.cos(t2)*FW*0.42*ri,hy=FCY-FH*0.47-Math.random()*FH*0.15;if(hy>FCY-FH*0.04||Math.abs(hx-FCX)>FW*0.46)continue;ctx.beginPath();ctx.arc(hx,hy,0.7+Math.random()*1.8,0,Math.PI*2);ctx.fillStyle=`rgba(18,12,7,${0.65+Math.random()*0.30})`;ctx.fill();}
    const tg=ctx.createLinearGradient(0,0,0,h*0.24);tg.addColorStop(0,"rgba(4,2,1,0.95)");tg.addColorStop(1,"rgba(4,2,1,0)");ctx.fillStyle=tg;ctx.fillRect(0,0,w,h);
    const bg2=ctx.createLinearGradient(0,h*0.70,0,h);bg2.addColorStop(0,"rgba(4,2,1,0)");bg2.addColorStop(1,"rgba(4,2,1,0.97)");ctx.fillStyle=bg2;ctx.fillRect(0,0,w,h);
    const hi=`rgba(${wr},${wg},${wb},0.94)`,mid=`rgba(${Math.round(wr*0.78)},${Math.round(wg*0.76)},${Math.round(wb*0.74)},0.68)`,lo=`rgba(${Math.round(wr*0.58)},${Math.round(wg*0.56)},${Math.round(wb*0.54)},0.46)`;
    ctx.textAlign="center";ctx.font=`800 ${w*0.046}px 'DM Sans',sans-serif`;ctx.fillStyle=lo;ctx.fillText("ÆPOCH",w*0.5,h*0.055);
    ctx.font=`700 ${w*0.036}px 'DM Sans',sans-serif`;ctx.fillStyle=lo;ctx.textAlign="left";ctx.fillText("ACTIVATED BY",w*0.058,h*0.098);
    ctx.font=`800 ${w*0.054}px 'DM Sans',sans-serif`;ctx.fillStyle=hi;ctx.fillText("@nova",w*0.058,h*0.126);
    ctx.font=`700 ${w*0.048}px 'DM Sans',sans-serif`;ctx.fillStyle=mid;ctx.textAlign="right";ctx.fillText("XV·III·MMXXVI",w*0.942,h*0.122);
    const vsR=w*0.055,vsCX=w*0.5,vsCY=h*0.845,vsSep=vsR;
    ctx.strokeStyle=hi;ctx.lineWidth=w*0.009;ctx.beginPath();ctx.arc(vsCX-vsSep/2,vsCY,vsR,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(vsCX+vsSep/2,vsCY,vsR,0,Math.PI*2);ctx.stroke();
    ctx.font=`800 ${w*0.112}px 'DM Sans',sans-serif`;ctx.fillStyle=hi;ctx.textAlign="center";ctx.fillText("One Kairos",w*0.5,h*0.890);
    ctx.beginPath();ctx.moveTo(w*0.08,h*0.904);ctx.lineTo(w*0.92,h*0.904);ctx.strokeStyle=`rgba(${wr},${wg},${wb},0.22)`;ctx.lineWidth=0.5;ctx.stroke();
    ctx.font=`700 ${w*0.058}px monospace`;ctx.fillStyle=mid;ctx.fillText("12236202",w*0.5,h*0.930);
    ctx.font=`400 ${w*0.038}px monospace`;ctx.fillStyle="rgba(155,170,215,0.55)";ctx.fillText("Æ[01]",w*0.5,h*0.954);
    if(mood){ctx.font=`700 ${w*0.040}px 'DM Sans',sans-serif`;ctx.fillStyle=mid;ctx.textAlign="right";ctx.fillText(MOOD_GREEK[mood]||mood,w*0.942,h*0.976);}
    ctx.font=`700 ${w*0.032}px 'DM Sans',sans-serif`;ctx.fillStyle=lo;ctx.textAlign="left";if(mood)ctx.fillText(mood.toUpperCase(),w*0.058,h*0.976);
    for(let i=0;i<6000;i++){ctx.fillStyle=`rgba(255,255,255,${Math.random()*0.012})`;ctx.fillRect(Math.random()*w,Math.random()*h,1,1);}
  },[mood,w,h,wr,wg,wb]);
  return <canvas ref={ref} style={{width:"100%",height:"100%",display:"block"}}/>;
}

function ReversePanel({w,h}){
  const ref=useRef();
  useEffect(()=>{
    const c=ref.current;if(!c)return;
    const dpr=window.devicePixelRatio||1;c.width=w*dpr;c.height=h*dpr;c.style.width=w+"px";c.style.height=h+"px";
    const ctx=c.getContext("2d");ctx.scale(dpr,dpr);
    const bg=ctx.createRadialGradient(w*1.08,h*0.03,0,w*0.5,h*0.5,Math.max(w,h)*0.94);bg.addColorStop(0,"#EDF4FB");bg.addColorStop(0.16,"#C4D8EE");bg.addColorStop(0.34,"#A696DC");bg.addColorStop(0.52,"#7E6EC8");bg.addColorStop(0.70,"#5C50B4");bg.addColorStop(0.86,"#3E329E");bg.addColorStop(1,"#22187C");ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
    const gold=ctx.createRadialGradient(w*0.92,h*0.04,0,w*0.78,h*0.16,w*0.70);gold.addColorStop(0,"rgba(242,210,140,0.40)");gold.addColorStop(1,"rgba(242,210,140,0)");ctx.fillStyle=gold;ctx.fillRect(0,0,w,h);
    const eb=ctx.createRadialGradient(w*0.03,h*0.94,0,w*0.15,h*0.82,w*0.50);eb.addColorStop(0,"rgba(196,131,90,0.26)");eb.addColorStop(1,"rgba(196,131,90,0)");ctx.fillStyle=eb;ctx.fillRect(0,0,w,h);
    const pR=Math.max(w,h)*0.044;ctx.strokeStyle="rgba(255,255,255,0.18)";ctx.lineWidth=0.72;
    const seen=new Set();
    for(let q=-20;q<=20;q++){for(let s=-20;s<=20;s++){const px=w*0.5+pR*2*(q+s*0.5),py=h*0.48+pR*Math.sqrt(3)*s;const key=`${Math.round(px)},${Math.round(py)}`;if(seen.has(key))continue;seen.add(key);ctx.beginPath();ctx.arc(px,py,pR*2,0,Math.PI*2);ctx.stroke();}}
    const mR=Math.min(w,h)*0.22,mCX=w*0.5,mCY=h*0.48;const mN=[[mCX,mCY]];
    for(let i=0;i<6;i++){const a=(i/6)*Math.PI*2-Math.PI/6;mN.push([mCX+mR*Math.cos(a),mCY+mR*Math.sin(a)]);}
    for(let i=0;i<6;i++){const a=(i/6)*Math.PI*2;mN.push([mCX+mR*2*Math.cos(a),mCY+mR*2*Math.sin(a)]);}
    ctx.strokeStyle="rgba(255,255,255,0.09)";ctx.lineWidth=0.55;
    for(let i=0;i<mN.length;i++){for(let j=i+1;j<mN.length;j++){ctx.beginPath();ctx.moveTo(mN[i][0],mN[i][1]);ctx.lineTo(mN[j][0],mN[j][1]);ctx.stroke();}}
    const vR=Math.min(w,h)*0.258,sep=vR*0.52,vLx=w*0.5-sep/2,vRx=w*0.5+sep/2,vCy=h*0.48;
    ctx.save();ctx.beginPath();ctx.arc(vLx,vCy,vR,-Math.PI/3,Math.PI/3);ctx.arc(vRx,vCy,vR,Math.PI*2/3,Math.PI*4/3);ctx.closePath();ctx.fillStyle="rgba(12,6,38,0.42)";ctx.fill();ctx.restore();
    ctx.lineWidth=1.8;ctx.strokeStyle="rgba(255,255,255,0.62)";ctx.beginPath();ctx.arc(vLx,vCy,vR,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(vRx,vCy,vR,0,Math.PI*2);ctx.stroke();
    ctx.save();ctx.beginPath();ctx.arc(vLx,vCy,vR,-Math.PI/3,Math.PI/3);ctx.arc(vRx,vCy,vR,Math.PI*2/3,Math.PI*4/3);ctx.closePath();ctx.strokeStyle="rgba(255,255,255,0.90)";ctx.lineWidth=2.4;ctx.stroke();ctx.restore();
    const aeSize=Math.round(vR*1.08);ctx.font=`800 ${aeSize}px 'DM Sans',sans-serif`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillStyle="rgba(12,6,38,0.68)";ctx.fillText("Æ",w*0.5+1.5,vCy+2.5);ctx.fillStyle="rgba(255,255,255,0.96)";ctx.fillText("Æ",w*0.5,vCy);
    const tg=ctx.createLinearGradient(0,0,0,h*0.20);tg.addColorStop(0,"rgba(16,8,46,0.88)");tg.addColorStop(1,"rgba(16,8,46,0)");ctx.fillStyle=tg;ctx.fillRect(0,0,w,h);
    const bg2=ctx.createLinearGradient(0,h*0.80,0,h);bg2.addColorStop(0,"rgba(16,8,46,0)");bg2.addColorStop(1,"rgba(16,8,46,0.92)");ctx.fillStyle=bg2;ctx.fillRect(0,0,w,h);
    ctx.textBaseline="alphabetic";ctx.font=`800 ${w*0.046}px 'DM Sans',sans-serif`;ctx.fillStyle="rgba(220,228,255,0.88)";ctx.textAlign="center";ctx.fillText("ÆPOCH",w*0.5,h*0.055);
    const arcR=Math.min(w,h)*0.440,arcCY=h*0.48;const trustText="IN WE WE TRUST";ctx.font=`700 ${w*0.038}px 'DM Sans',sans-serif`;
    const chars=trustText.split(""),totalW=chars.reduce((s,ch)=>s+ctx.measureText(ch).width+3,0);let ang=Math.PI/2+totalW/arcR/2;
    chars.forEach(ch=>{const cw=(ctx.measureText(ch).width+3)/arcR;ctx.save();ctx.translate(w/2,arcCY);ctx.rotate(ang-cw/2);ctx.translate(0,arcR);ctx.rotate(Math.PI);ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillStyle="rgba(188,202,245,0.80)";ctx.fillText(ch,0,0);ctx.restore();ang-=cw;});
    ctx.save();ctx.globalAlpha=0.18;ctx.font=`700 ${w*0.036}px 'DM Sans',sans-serif`;ctx.fillStyle="rgba(185,198,240,0.80)";ctx.textAlign="center";ctx.fillText("· artwork unlocks here ·",w*0.5,h*0.78);ctx.restore();
    for(let i=0;i<5000;i++){ctx.fillStyle=`rgba(255,255,255,${Math.random()*0.012})`;ctx.fillRect(Math.random()*w,Math.random()*h,1,1);}
  },[w,h]);
  return <canvas ref={ref} style={{width:"100%",height:"100%",display:"block"}}/>;
}

function KairosCardMini({size=72,mood=""}){
  const ref=useRef();const [wr,wg,wb]=MOOD_TINT[mood]||MOOD_TINT[""];
  useEffect(()=>{
    const c=ref.current;if(!c)return;const dpr=window.devicePixelRatio||1;c.width=size*dpr;c.height=size*dpr;c.style.width=size+"px";c.style.height=size+"px";
    const ctx=c.getContext("2d");ctx.scale(dpr,dpr);ctx.fillStyle="#080604";ctx.fillRect(0,0,size,size);
    const bg=ctx.createRadialGradient(size*0.35,size*0.38,0,size*0.5,size*0.5,size*0.75);bg.addColorStop(0,`rgba(${wr},${wg},${wb},0.28)`);bg.addColorStop(1,`rgba(${wr},${wg},${wb},0)`);ctx.fillStyle=bg;ctx.fillRect(0,0,size,size);
    const FCX=size*0.5,FCY=size*0.44,FW=size*0.88,FH=size*0.86;const ROWS=28,COLS=20,dSX=size/COLS,dSY=(size*0.85)/ROWS,startY=size*0.05;
    for(let row=0;row<ROWS;row++){for(let col=0;col<COLS;col++){const px=(col+0.5)*dSX,py=startY+(row+0.5)*dSY;const nx=(px-FCX)/(FW*0.48),ny=(py-FCY)/(FH*0.46);const density=faceDensity(nx,ny);const depth=Math.sqrt(Math.max(0,1-(nx*1.2)**2-(ny*0.9)**2));if(density<0.06&&Math.random()>density*6)continue;const bright=Math.max(0.3,depth*0.9);ctx.beginPath();ctx.arc(px,py,Math.max(0.4,density*1.8),0,Math.PI*2);ctx.fillStyle=`rgba(${Math.round(Math.max(30,wr*bright))},${Math.round(Math.max(20,wg*bright))},${Math.round(Math.max(12,wb*bright))},${Math.min(0.9,density*1.2)})`;ctx.fill();}}
    const tg=ctx.createLinearGradient(0,0,0,size*0.25);tg.addColorStop(0,"rgba(4,2,1,0.9)");tg.addColorStop(1,"rgba(4,2,1,0)");ctx.fillStyle=tg;ctx.fillRect(0,0,size,size);
    const bg2=ctx.createLinearGradient(0,size*0.70,0,size);bg2.addColorStop(0,"rgba(4,2,1,0)");bg2.addColorStop(1,"rgba(4,2,1,0.95)");ctx.fillStyle=bg2;ctx.fillRect(0,0,size,size);
    ctx.textAlign="center";ctx.font=`700 ${size*0.14}px 'DM Sans',sans-serif`;ctx.fillStyle=`rgba(${wr},${wg},${wb},0.85)`;ctx.fillText("One",size*0.5,size*0.75);ctx.font=`700 ${size*0.12}px 'DM Sans',sans-serif`;ctx.fillStyle=`rgba(${wr},${wg},${wb},0.65)`;ctx.fillText("Kairos",size*0.5,size*0.90);
  },[size,mood,wr,wg,wb]);
  return <canvas ref={ref} style={{borderRadius:8,display:"block",flexShrink:0,boxShadow:`0 4px 16px rgba(${wr},${wg},${wb},0.22),0 2px 8px rgba(0,0,0,0.45)`}}/>;
}

function CardViewer({mood,onClose}){
  const [side,setSide]=useState("obverse");const [flip,setFlip]=useState(false);
  function doFlip(){if(flip)return;setFlip(true);setTimeout(()=>{setSide(s=>s==="obverse"?"reverse":"obverse");setFlip(false);},320);}
  return(
    <div style={{position:"fixed",inset:0,zIndex:100,background:"rgba(8,6,4,0.96)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 16px"}}>
      <div onClick={onClose} style={{position:"absolute",top:20,right:20,width:40,height:40,borderRadius:"50%",background:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="rgba(255,255,255,0.60)" strokeWidth="1.6" strokeLinecap="round"/></svg>
      </div>
      <div style={{fontSize:9,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:"rgba(255,255,255,0.28)",fontFamily:T.ff,marginBottom:16}}>{side==="obverse"?"Obverse · The Face":"Reverse · The Mark"} — tap to flip</div>
      <div onClick={doFlip} style={{width:327,height:588,overflow:"hidden",cursor:"pointer",flexShrink:0,transform:flip?"perspective(1200px) rotateY(90deg) scale(0.96)":"perspective(1200px) rotateY(0deg) scale(1)",transition:"transform 0.32s cubic-bezier(0.4,0,0.2,1)",boxShadow:side==="obverse"?"0 32px 80px rgba(196,131,90,0.28),0 8px 24px rgba(0,0,0,0.65)":"0 32px 80px rgba(107,95,237,0.35),0 8px 24px rgba(0,0,0,0.65)"}}>
        {side==="obverse"?<ObversePanel mood={mood} w={327} h={588}/>:<ReversePanel w={327} h={588}/>}
      </div>
      <div style={{display:"flex",gap:8,marginTop:20}}>
        {["obverse","reverse"].map(s=>(<div key={s} onClick={()=>{if(s!==side)doFlip();}} style={{width:s===side?20:6,height:6,borderRadius:3,background:s===side?"rgba(255,255,255,0.60)":"rgba(255,255,255,0.20)",transition:"width 0.3s",cursor:"pointer"}}/>))}
      </div>
    </div>
  );
}

// ── SCREENS ──────────────────────────────────────────────

function PolScreen({onNext}){
  const [phase,setPhase]=useState("idle");
  const ref=useRef(),rafRef=useRef(null),startRef=useRef(null),convRef=useRef(null);
  const sz=260,TOTAL=3.0;
  useEffect(()=>{
    const c=ref.current;if(!c)return;
    const dpr=window.devicePixelRatio||1;c.width=sz*dpr;c.height=sz*dpr;c.style.width=sz+"px";c.style.height=sz+"px";
    const ctx=c.getContext("2d");ctx.setTransform(dpr,0,0,dpr,0,0);const cx=sz/2,cy=sz/2,r=sz/2-3;
    function draw(ts){
      if(phase==="running"&&!startRef.current)startRef.current=ts;
      const elapsed=phase==="running"?(ts-startRef.current)/1000:0;const progress=Math.min(elapsed/TOTAL,1);
      ctx.clearRect(0,0,sz,sz);ctx.save();ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.clip();
      const bg=ctx.createRadialGradient(cx,cy,0,cx,cy,r*1.1);bg.addColorStop(0,"rgba(14,10,7,0.93)");bg.addColorStop(1,"rgba(4,3,2,0.98)");ctx.fillStyle=bg;ctx.fillRect(0,0,sz,sz);
      if(phase==="converging"){
        if(!convRef.current)convRef.current=ts;const cp=Math.min((ts-convRef.current)/1000,1);
        drawFOL(ctx,cx,cy,r,Math.max(0,0.10*(1-(1-Math.pow(1-cp,3)))));
        if(cp>0.3){const cp2=Math.min((cp-0.3)/0.7,1);const eg=ctx.createRadialGradient(cx,cy,0,cx,cy,r*(0.2+cp2*0.8));eg.addColorStop(0,`rgba(210,165,80,${cp2*0.22})`);eg.addColorStop(0.5,`rgba(196,131,90,${cp2*0.12})`);eg.addColorStop(1,"rgba(196,131,90,0)");ctx.fillStyle=eg;ctx.fillRect(0,0,sz,sz);ctx.beginPath();ctx.arc(cx,cy,r*(0.15+cp2*0.82),0,Math.PI*2);ctx.strokeStyle=`rgba(210,175,100,${cp2*0.7})`;ctx.lineWidth=2+cp2*5;ctx.stroke();}
        ctx.restore();if(cp>=1)setTimeout(()=>onNext(),300);
      } else if(phase==="running"){
        drawFOL(ctx,cx,cy,r,0.09+progress*0.05);const cg=ctx.createRadialGradient(cx,cy,r*0.65,cx,cy,r);cg.addColorStop(0,"rgba(107,95,237,0)");cg.addColorStop(1,`rgba(107,95,237,${0.10+0.03*Math.sin(ts/2000)})`);ctx.fillStyle=cg;ctx.fillRect(0,0,sz,sz);ctx.restore();
      } else {
        drawFOL(ctx,cx,cy,r,0.11+0.03*Math.sin(ts/1900));ctx.setLineDash([4,5]);ctx.globalAlpha=0.22;ctx.strokeStyle="rgba(184,169,217,0.65)";ctx.lineWidth=1.6;ctx.beginPath();ctx.ellipse(cx,cy*0.92,sz*0.22,sz*0.28,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;const cg=ctx.createRadialGradient(cx,cy,r*0.65,cx,cy,r);cg.addColorStop(0,"rgba(107,95,237,0)");cg.addColorStop(1,`rgba(107,95,237,${0.08+0.03*Math.sin(ts/2100)})`);ctx.fillStyle=cg;ctx.fillRect(0,0,sz,sz);ctx.restore();
      }
      ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.strokeStyle="rgba(224,216,208,0.12)";ctx.lineWidth=1.5;ctx.stroke();
      if(phase==="running"){
        const angle=-Math.PI/2+progress*Math.PI*2;const tailLen=Math.PI*0.50,steps=52;
        for(let i=0;i<steps;i++){const t0=i/steps,a0=angle-tailLen*(1-t0),a1=angle-tailLen*(1-(i+1)/steps);const rv=Math.round(184+(255-184)*t0),gv=Math.round(169+(255-169)*t0),bv=Math.round(217+(255-217)*t0);ctx.beginPath();ctx.arc(cx,cy,r,a0,a1);ctx.strokeStyle=`rgba(${rv},${gv},${bv},${Math.pow(t0,1.6)*0.95})`;ctx.lineWidth=1.8+t0*2.2;ctx.lineCap="round";ctx.stroke();}
        const hx=cx+r*Math.cos(angle),hy=cy+r*Math.sin(angle);const hg=ctx.createRadialGradient(hx,hy,0,hx,hy,10);hg.addColorStop(0,"rgba(255,255,255,1)");hg.addColorStop(0.35,"rgba(214,228,240,0.75)");hg.addColorStop(1,"rgba(184,169,217,0)");ctx.beginPath();ctx.arc(hx,hy,10,0,Math.PI*2);ctx.fillStyle=hg;ctx.fill();ctx.beginPath();ctx.arc(hx,hy,3,0,Math.PI*2);ctx.fillStyle="rgba(255,255,255,1)";ctx.fill();
        if(progress>=1)setPhase("converging");
      }
      if(phase!=="done")rafRef.current=requestAnimationFrame(draw);
    }
    cancelAnimationFrame(rafRef.current);startRef.current=null;convRef.current=null;rafRef.current=requestAnimationFrame(draw);return()=>cancelAnimationFrame(rafRef.current);
  },[phase]);
  return(
    <div style={{padding:"18px 24px 36px"}}>
      <div style={{fontSize:26,fontWeight:800,letterSpacing:"-0.025em",color:T.ink,lineHeight:1.15,marginBottom:14,fontFamily:T.ff}}>Time to Activate.</div>
      <Guide text="Two things happen here. I confirm it's you — the living human being who owns this account. Then I'll capture your portrait. You can skip the portrait after if you'd prefer."/>
      <div style={{position:"relative",width:sz,height:sz,borderRadius:"50%",margin:"0 auto",overflow:"hidden",boxShadow:"0 16px 48px rgba(0,0,0,0.44),0 0 0 1px rgba(255,255,255,0.05)"}}>
        <canvas ref={ref} style={{position:"absolute",inset:0,borderRadius:"50%"}}/>
      </div>
      <CamPill/>
      <div style={{marginTop:22}}>
        {phase==="idle"&&<PrimaryCTA label="Begin" onTap={()=>setPhase("running")}/>}
        {(phase==="running"||phase==="converging")&&(
          <div style={{height:52,borderRadius:13,background:"rgba(255,255,255,0.22)",border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontSize:13,color:T.inkSoft,fontFamily:T.ff}}>{phase==="running"?"I see you. Stay still…":"Forming now."}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ApproveScreen({onApprove,onRetake,onSkip}){
  const [vis,setVis]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>setVis(true),250);return()=>clearTimeout(t);},[]);
  return(
    <div style={{padding:"24px 24px 36px"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(6px)",transition:"opacity 0.45s,transform 0.45s cubic-bezier(.34,1.56,.64,1)"}}>
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" style={{flexShrink:0}}><circle cx="13" cy="13" r="12" fill="rgba(76,175,130,0.12)" stroke={T.moss} strokeWidth="1.3"/><path d="M8 13l3.5 3.5 6.5-6.5" stroke={T.moss} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        <span style={{fontSize:22,fontWeight:800,letterSpacing:"-0.025em",color:T.ink,fontFamily:T.ff,lineHeight:1}}>You're here.</span>
      </div>
      <div style={{opacity:vis?1:0,transition:"opacity 0.4s 0.08s",marginBottom:20}}>
        <Guide text={`Day ${DAY}. ${STREAK} days without missing a beat!`}/>
      </div>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:24,opacity:vis?1:0,transform:vis?"scale(1)":"scale(0.92)",transition:"opacity 0.55s 0.18s,transform 0.55s 0.18s cubic-bezier(.34,1.56,.64,1)"}}>
        <div style={{width:220,height:220,borderRadius:"50%",background:"linear-gradient(145deg,rgba(232,201,160,0.22) 0%,rgba(184,169,217,0.18) 100%)",border:"2px solid rgba(224,216,208,0.8)",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden",boxShadow:"0 12px 36px rgba(26,22,18,0.14),0 2px 8px rgba(196,131,90,0.12)"}}>
          <svg width="130" height="130" viewBox="0 0 130 130" fill="none" opacity="0.28">{[[65,65],[48,65],[82,65],[56.5,51],[73.5,51],[56.5,79],[73.5,79],[40,65],[90,65],[48,37],[82,37],[48,93],[82,93]].map(([x,y],i)=>(<circle key={i} cx={x} cy={y} r="17" stroke="rgba(184,169,217,0.85)" strokeWidth="0.8" fill="none"/>))}</svg>
          <div style={{position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(to top,rgba(26,22,18,0.50),transparent)",borderRadius:"0 0 50% 50%",padding:"28px 0 18px",textAlign:"center"}}>
            <span style={{fontSize:10,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:"rgba(250,248,245,0.80)",fontFamily:T.ff}}>Portrait captured</span>
          </div>
        </div>
        <CamPill/>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:4,opacity:vis?1:0,transition:"opacity 0.4s 0.30s"}}>
        <PrimaryCTA label="Approve" onTap={onApprove}/>
        <Ghost label="Retake" onTap={onRetake}/>
        <Ghost label="Skip portrait" onTap={onSkip}/>
      </div>
    </div>
  );
}

function OriginScreen({onDone,onMoodChange}){
  const [text,setText]=useState("");const [mood,setMood]=useState("");const [dropOpen,setDropOpen]=useState(false);
  const max=280;
  return(
    <div style={{padding:"24px 24px 48px"}}>
      <div style={{fontSize:24,fontWeight:800,letterSpacing:"-0.025em",color:T.ink,lineHeight:1.15,marginBottom:14,fontFamily:T.ff}}>Sign your Presence.</div>
      <Guide text="What's your story right now? Your words and mood travel with this Kairos permanently. They can't be changed."/>
      <textarea value={text} onChange={e=>setText(e.target.value.slice(0,max))} placeholder="The one thing I want the future to know about this moment is..." rows={4}
        style={{width:"100%",borderRadius:13,border:`1.5px solid ${T.border}`,background:"rgba(255,255,255,0.55)",padding:"12px 14px",fontSize:13,lineHeight:1.65,color:T.ink,fontFamily:T.ff,resize:"none",outline:"none",caretColor:"rgba(184,169,217,0.85)",marginBottom:4,transition:"border-color .2s,background .2s,box-shadow .2s"}}
        onFocus={e=>{e.target.style.borderColor="rgba(214,228,240,0.90)";e.target.style.background="rgba(214,228,240,0.12)";e.target.style.boxShadow="0 0 0 3px rgba(184,169,217,0.14)";}}
        onBlur={e=>{e.target.style.borderColor=T.border;e.target.style.background="rgba(255,255,255,0.55)";e.target.style.boxShadow="none";}}/>
      <div style={{fontSize:11,color:max-text.length<40?T.hearth:T.inkFaint,textAlign:"right",fontFamily:T.ff,fontWeight:max-text.length<40?700:400,marginBottom:18}}>{max-text.length}</div>
      <div style={{marginBottom:8}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:T.inkSoft,marginBottom:6,fontFamily:T.ff}}>Mood — optional</div>
        <div style={{position:"relative"}}>
          <div onClick={()=>setDropOpen(o=>!o)} style={{height:48,borderRadius:13,border:`1.5px solid ${dropOpen?"rgba(214,228,240,0.90)":T.border}`,background:dropOpen?"rgba(214,228,240,0.12)":"rgba(255,255,255,0.45)",boxShadow:dropOpen?"0 0 0 3px rgba(184,169,217,0.14)":"none",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 14px",cursor:"pointer",fontFamily:T.ff}}>
            <span style={{fontSize:14,color:mood?T.ink:T.inkFaint,fontWeight:mood?700:400}}>{mood||"Choose a mood…"}</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{transform:dropOpen?"rotate(180deg)":"none",transition:"transform .2s",flexShrink:0}}><path d="M4 6l4 4 4-4" stroke={T.inkSoft} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          {dropOpen&&(
            <div style={{position:"absolute",top:52,left:0,right:0,borderRadius:12,background:"rgba(254,252,249,0.98)",border:`1px solid ${T.border}`,boxShadow:"0 8px 28px rgba(26,22,18,0.14)",zIndex:20,overflow:"hidden",maxHeight:220,overflowY:"auto"}}>
              <div onClick={()=>{setMood("");onMoodChange&&onMoodChange("");setDropOpen(false);}} style={{padding:"10px 14px",borderBottom:`1px solid rgba(224,216,208,0.45)`,cursor:"pointer",fontSize:13,color:T.inkFaint,fontFamily:T.ff,fontStyle:"italic"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(107,95,237,0.04)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>No mood</div>
              {MOODS.map((m,i)=>(
                <div key={m} onClick={()=>{setMood(m);onMoodChange&&onMoodChange(m);setDropOpen(false);}} style={{padding:"10px 14px",borderBottom:i<MOODS.length-1?`1px solid rgba(224,216,208,0.45)`:"none",cursor:"pointer",fontSize:13,fontWeight:mood===m?700:400,color:mood===m?T.signal:T.ink,fontFamily:T.ff,background:mood===m?"rgba(107,95,237,0.05)":"transparent",display:"flex",alignItems:"center",justifyContent:"space-between"}}
                  onMouseEnter={e=>{if(mood!==m)e.currentTarget.style.background="rgba(107,95,237,0.04)";}} onMouseLeave={e=>{if(mood!==m)e.currentTarget.style.background="transparent";}}>
                  {m}{mood===m&&<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" fill="rgba(107,95,237,0.12)"/><path d="M3.5 7l2.5 2.5L10.5 4" stroke={T.signal} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:12,border:`1px dashed ${T.border}`,background:"rgba(255,255,255,0.30)",marginBottom:24,marginTop:16,opacity:0.6}}>
        <div style={{width:36,height:36,borderRadius:"50%",background:"rgba(224,216,208,0.50)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke={T.inkFaint} strokeWidth="1.2"/><path d="M6.5 5.5l5 2.5-5 2.5V5.5z" fill={T.inkFaint}/></svg>
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:700,color:T.inkSoft,fontFamily:T.ff}}>Add a video moment</div>
          <div style={{fontSize:11,color:T.inkFaint,fontFamily:T.ff,marginTop:1}}>Record a message for whoever receives this — coming soon</div>
        </div>
        <div style={{fontSize:9,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:T.inkFaint,fontFamily:T.ff,flexShrink:0}}>Soon</div>
      </div>
      <CeremonyCTA label="Seal Your Kairos" onTap={onDone}/>
    </div>
  );
}

function MintedScreen({mood,onGive,onKeep}){
  const [phase,setPhase]=useState("forming");const [cardVisible,setCardVisible]=useState(false);const [viewerOpen,setViewerOpen]=useState(false);
  const cardH=Math.round(160*(700/390));
  useEffect(()=>{const t1=setTimeout(()=>setCardVisible(true),300);const t2=setTimeout(()=>setPhase("holding"),1800);const t3=setTimeout(()=>setPhase("ready"),2800);return()=>{clearTimeout(t1);clearTimeout(t2);clearTimeout(t3);};},[]);
  return(
    <>
      {viewerOpen&&<CardViewer mood={mood} onClose={()=>setViewerOpen(false)}/>}
      <div style={{padding:"28px 24px 48px",display:"flex",flexDirection:"column",alignItems:"center"}}>
        {/* 1. Headline */}
        <div style={{width:"100%",marginBottom:10,opacity:phase==="forming"?0:1,transform:phase==="forming"?"translateY(6px)":"none",transition:"opacity 0.6s 0.4s,transform 0.6s 0.4s cubic-bezier(.34,1.56,.64,1)"}}>
          <div style={{fontSize:26,fontWeight:800,letterSpacing:"-0.025em",color:T.ink,lineHeight:1.15,fontFamily:T.ff}}>Signed and Sealed.</div>
        </div>
        {/* 2. Genie copy — above card */}
        <div style={{width:"100%",opacity:phase==="forming"?0:1,transition:"opacity 0.5s 0.65s",marginBottom:20}}>
          <Guide text="Your Kairos for today is created. Give it to someone — that's what makes it real."/>
          {STREAK>1&&<StreakPill streak={STREAK}/>}
        </div>
        {/* 3. Card display */}
        <div style={{marginBottom:16,width:"100%",opacity:cardVisible?1:0,transform:cardVisible?"translateY(0)":"translateY(14px)",transition:"opacity 0.7s cubic-bezier(.34,1.56,.64,1),transform 0.7s cubic-bezier(.34,1.56,.64,1)"}}>
          <div style={{display:"flex",gap:6,marginBottom:6}}>
            {["Obverse","Reverse"].map(l=>(<div key={l} style={{flex:1,textAlign:"center",fontSize:8,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:T.inkSoft,fontFamily:T.ff}}>{l}</div>))}
          </div>
          <div style={{display:"flex",gap:6,boxShadow:"0 12px 40px rgba(0,0,0,0.32)"}}>
            <div onClick={()=>phase==="ready"&&setViewerOpen(true)} style={{flex:1,height:cardH,overflow:"hidden",cursor:phase==="ready"?"pointer":"default",position:"relative"}}>
              <ObversePanel mood={mood} w={160} h={cardH}/>
              {phase==="ready"&&<div style={{position:"absolute",bottom:0,left:0,right:0,padding:"16px 8px 8px",background:"linear-gradient(to top,rgba(4,2,1,0.65),rgba(4,2,1,0))",textAlign:"center"}}><span style={{fontSize:8,fontWeight:700,letterSpacing:".10em",textTransform:"uppercase",color:"rgba(255,255,255,0.35)",fontFamily:T.ff}}>Full view ↗</span></div>}
            </div>
            <div onClick={()=>phase==="ready"&&setViewerOpen(true)} style={{flex:1,height:cardH,overflow:"hidden",cursor:phase==="ready"?"pointer":"default",position:"relative"}}>
              <ReversePanel w={160} h={cardH}/>
              {phase==="ready"&&<div style={{position:"absolute",bottom:0,left:0,right:0,padding:"16px 8px 8px",background:"linear-gradient(to top,rgba(16,8,46,0.65),rgba(16,8,46,0))",textAlign:"center"}}><span style={{fontSize:8,fontWeight:700,letterSpacing:".10em",textTransform:"uppercase",color:"rgba(255,255,255,0.35)",fontFamily:T.ff}}>Full view ↗</span></div>}
            </div>
          </div>
          {phase==="ready"&&<div style={{textAlign:"center",marginTop:6,fontSize:9,fontWeight:700,letterSpacing:".10em",textTransform:"uppercase",color:T.inkFaint,fontFamily:T.ff}}>Tap either side to view full screen</div>}
        </div>
        {/* 4. Metadata */}
        <div style={{width:"100%",borderRadius:12,background:"rgba(255,255,255,0.52)",border:`1px solid ${T.border}`,overflow:"hidden",marginBottom:24,opacity:phase==="ready"?1:0,transition:"opacity 0.5s 0.2s"}}>
          {[["Serial #","12236202"],["Epoch #","Æ[01]"],["Mood",mood||"· · ·"],["Date","XV · III · MMXXVI"]].map(([k,v],i,arr)=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 16px",borderBottom:i<arr.length-1?`1px solid rgba(224,216,208,0.55)`:"none"}}>
              <span style={{fontSize:12,color:T.inkSoft,fontFamily:T.ff}}>{k}</span>
              <span style={{fontSize:13,fontWeight:700,color:T.ink,fontFamily:T.ff}}>{v}</span>
            </div>
          ))}
        </div>
        {/* 5. CTAs */}
        <div style={{width:"100%",display:"flex",flexDirection:"column",gap:8,opacity:phase==="ready"?1:0,transform:phase==="ready"?"translateY(0)":"translateY(8px)",transition:"opacity 0.5s 0.3s,transform 0.5s 0.3s"}}>
          <PrimaryCTA label="Send it to someone" onTap={onGive}/>
          <Ghost label="Keep it in my wallet" onTap={onKeep}/>
        </div>
      </div>
    </>
  );
}

function GiveScreen({mood,onNext,onSkip,onBack}){
  const [query,setQuery]=useState("");
  const [selected,setSelected]=useState(null);
  const [showDrop,setShowDrop]=useState(false);
  const filtered=query.length>0?MEMBERS.filter(m=>m.toLowerCase().includes(query.toLowerCase())):[];
  function pick(m){setSelected(m);setQuery(m);setShowDrop(false);}
  return(
    <div style={{padding:"4px 24px 44px"}}>
      {/* 1. Back */}
      <BackChevron onTap={onBack}/>
      {/* 2. Headline */}
      <div style={{fontSize:26,fontWeight:800,letterSpacing:"-0.025em",color:T.ink,lineHeight:1.15,marginBottom:12,fontFamily:T.ff}}>Send it to someone.</div>
      {/* 3. Genie — above card */}
      <Guide text="It only becomes real when it reaches someone else."/>
      {/* 4. Card */}
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20,padding:"12px 14px",borderRadius:13,background:"rgba(255,255,255,0.52)",border:`1px solid ${T.border}`}}>
        <KairosCardMini size={72} mood={mood}/>
        <div>
          <div style={{fontSize:13,fontWeight:700,color:T.ink,fontFamily:T.ff,marginBottom:3}}>Today's Kairos</div>
          <div style={{fontSize:11,color:T.inkSoft,fontFamily:T.ff,lineHeight:1.5}}>Day {DAY} · Æ[01] · 12236202</div>
          {mood&&<div style={{fontSize:11,color:T.inkSoft,fontFamily:T.ff,marginTop:2}}>{mood}</div>}
        </div>
      </div>
      {/* 5. Input */}
      <div style={{position:"relative",marginBottom:16}}>
        <input value={query} onChange={e=>{setQuery(e.target.value);setSelected(null);setShowDrop(true);}} onFocus={()=>query.length>0&&setShowDrop(true)} placeholder="Member name or handle"
          style={{width:"100%",height:52,borderRadius:13,border:`1.5px solid ${selected?"rgba(184,169,217,0.90)":T.border}`,background:selected?"rgba(214,228,240,0.12)":"rgba(255,255,255,0.40)",padding:"0 16px",fontSize:14,color:T.ink,fontFamily:T.ff,outline:"none",boxShadow:selected?"0 0 0 3px rgba(184,169,217,0.14)":"none",caretColor:"rgba(184,169,217,0.85)",transition:"all .2s"}}/>
        {showDrop&&filtered.length>0&&(
          <div style={{position:"absolute",top:56,left:0,right:0,borderRadius:12,background:"rgba(254,252,249,0.97)",border:`1px solid ${T.border}`,boxShadow:"0 8px 28px rgba(26,22,18,0.14)",zIndex:20,overflow:"hidden"}}>
            {filtered.slice(0,6).map((m,i)=>(
              <div key={m} onClick={()=>pick(m)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderBottom:i<Math.min(filtered.length,6)-1?`1px solid rgba(224,216,208,0.45)`:"none",cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(107,95,237,0.05)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <Avatar handle={m} size={32}/>
                <div><div style={{fontSize:13,fontWeight:700,color:T.ink,fontFamily:T.ff}}>{m.charAt(0).toUpperCase()+m.slice(1)}</div><div style={{fontSize:11,color:T.inkSoft,fontFamily:T.ff}}>aepoch.xyz/{m}</div></div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* 6. Selected member */}
      {selected&&(
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:12,background:"rgba(255,255,255,0.55)",border:`1px solid ${T.border}`,marginBottom:18}}>
          <Avatar handle={selected} size={36}/>
          <div><div style={{fontSize:13,fontWeight:700,color:T.ink,fontFamily:T.ff}}>{selected.charAt(0).toUpperCase()+selected.slice(1)}</div><div style={{fontSize:11,color:T.inkSoft,fontFamily:T.ff}}>aepoch.xyz/{selected}</div></div>
          <div style={{marginLeft:"auto"}}><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" fill="rgba(184,169,217,0.15)"/><path d="M4 8l2.5 2.5L12 5" stroke={T.prism} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
        </div>
      )}
      {/* 7. CTAs */}
      <div style={{marginBottom:8}}><PrimaryCTA label="Next" onTap={()=>selected&&onNext(selected)} disabled={!selected}/></div>
      <Ghost label="Keep it in my wallet" onTap={onSkip}/>
    </div>
  );
}

function AmountScreen({recipient,onNext,onHome,onBack}){
  const [amount,setAmount]=useState("");
  const num=parseFloat(amount)||0;const overBalance=num>TOTAL_BALANCE&&amount!=="";const overPolOnly=num>POL_BALANCE&&num<=TOTAL_BALANCE;const valid=num>0&&!overBalance;const pulses=Math.round(num*100000);const displayAmount=amount===""?"0":amount;
  return(
    <div style={{display:"flex",flexDirection:"column",padding:"20px 0 0",minHeight:560}}>
      <div style={{padding:"0 24px 10px"}}>
        <BackChevron onTap={onBack}/>
        <div style={{fontSize:22,fontWeight:800,letterSpacing:"-0.025em",color:T.ink,fontFamily:T.ff,marginBottom:12}}>How much?</div>
        <Guide text={`What would you like to send to @${recipient}?`}/>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 24px"}}>
        <div style={{fontSize:overBalance?36:displayAmount.length>6?32:displayAmount==="0"?48:44,fontWeight:800,letterSpacing:"-0.04em",color:overBalance?T.ember:displayAmount==="0"?T.inkFaint:T.ink,fontFamily:T.ff,fontVariantNumeric:"tabular-nums",lineHeight:1,marginBottom:6,transition:"color .2s"}}>{displayAmount}</div>
        <div style={{fontSize:12,color:T.inkSoft,fontFamily:T.ff,marginBottom:4}}>Kairos</div>
        {num>0&&<div style={{fontSize:11,color:overBalance?T.ember:T.inkFaint,fontFamily:T.ff,fontVariantNumeric:"tabular-nums"}}>{pulses.toLocaleString()} Pulses</div>}
        {overBalance&&<div style={{fontSize:11,color:T.ember,fontFamily:T.ff,marginTop:4,fontWeight:700}}>Max {TOTAL_BALANCE} Kairos available</div>}
        <div style={{display:"flex",gap:6,marginTop:14}}>
          {[{l:"Use or Lose",v:POL_BALANCE.toFixed(1),c:T.hearth},{l:"Yours",v:FREE_BALANCE.toFixed(1),c:T.inkSoft},{l:"Total",v:TOTAL_BALANCE.toFixed(1),c:T.signal}].map(({l,v,c})=>(
            <div key={l} style={{padding:"4px 10px",borderRadius:20,background:"rgba(255,255,255,0.55)",border:`1px solid ${T.border}`,display:"flex",gap:5,alignItems:"center"}}>
              <span style={{fontSize:10,color:c,fontWeight:700,fontFamily:T.ff}}>{v}</span>
              <span style={{fontSize:9,color:T.inkFaint,fontFamily:T.ff}}>{l}</span>
            </div>
          ))}
        </div>
        {overBalance&&<div style={{display:"flex",alignItems:"center",gap:6,padding:"7px 12px",marginTop:10,borderRadius:10,background:"rgba(160,48,32,0.06)",border:`1px solid rgba(160,48,32,0.18)`,width:"100%"}}><div style={{width:5,height:5,borderRadius:"50%",background:T.ember,flexShrink:0}}/><span style={{fontSize:12,color:T.ember,fontFamily:T.ff}}>You only have {TOTAL_BALANCE} Kairos available.</span></div>}
        {overPolOnly&&!overBalance&&<div style={{display:"flex",alignItems:"center",gap:6,padding:"7px 12px",marginTop:10,borderRadius:10,background:"rgba(139,94,47,0.06)",border:`1px solid rgba(139,94,47,0.18)`,width:"100%"}}><div style={{width:5,height:5,borderRadius:"50%",background:T.hearth,flexShrink:0}}/><span style={{fontSize:12,color:T.hearth,fontFamily:T.ff}}>This draws from both balances. Use or Lose first.</span></div>}
      </div>
      <div style={{padding:"4px 16px 8px",flexShrink:0}}><Numpad value={amount} onChange={setAmount}/></div>
      <div style={{padding:"8px 24px 16px",flexShrink:0,display:"flex",flexDirection:"column",gap:8}}>
        <PrimaryCTA label="Review" onTap={()=>valid&&onNext(num)} disabled={!valid}/>
        <HomeLink onTap={onHome}/>
      </div>
    </div>
  );
}

function ConfirmScreen({recipient,amount,onConfirm,onBack,onHome}){
  const pulses=Math.round(amount*100000);const decimal=amount%1!==0?amount.toFixed(5):amount.toFixed(1);function fmt(n){return n.toLocaleString("en-GB");}
  return(
    <div style={{padding:"8px 24px 52px"}}>
      <BackChevron onTap={onBack}/>
      <div style={{fontSize:26,fontWeight:800,letterSpacing:"-0.025em",color:T.ink,lineHeight:1.15,marginBottom:12,fontFamily:T.ff}}>Confirm.</div>
      <Guide text="Check the details. Once sent, this cannot be undone."/>
      <div style={{borderRadius:14,background:"rgba(255,255,255,0.55)",border:`1px solid ${T.border}`,overflow:"hidden",marginBottom:20}}>
        {[["To",`@${recipient}`],["Amount (Kairos)",decimal],["Pulses",fmt(pulses)]].map(([label,value],i,arr)=>(
          <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"13px 16px",borderBottom:i<arr.length-1?`1px solid rgba(224,216,208,0.55)`:"none"}}>
            <span style={{fontSize:12,color:T.inkSoft,fontFamily:T.ff}}>{label}</span>
            <span style={{fontSize:13,fontWeight:700,color:T.ink,fontFamily:T.ff}}>{value}</span>
          </div>
        ))}
      </div>
      <div style={{padding:"12px 14px",borderRadius:12,background:"rgba(139,94,47,0.06)",border:`1px solid rgba(139,94,47,0.20)`,marginBottom:10}}>
        <div style={{fontSize:12,color:T.hearth,lineHeight:1.65,fontFamily:T.ff}}>This cannot be undone. The Kairos moves permanently to {recipient.charAt(0).toUpperCase()+recipient.slice(1)}.</div>
      </div>
      <HomeLink onTap={onHome}/>
      <div style={{marginTop:14}}><CeremonyCTA label="Send" onTap={onConfirm}/></div>
    </div>
  );
}

function SentScreen({recipient,amount}){
  const [vis,setVis]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>setVis(true),200);return()=>clearTimeout(t);},[]);
  const pulses=Math.round(amount*100000);const decimal=amount%1!==0?amount.toFixed(5):amount.toFixed(1);function fmt(n){return n.toLocaleString("en-GB");}
  return(
    <div style={{padding:"40px 28px 48px",display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",justifyContent:"center",minHeight:440}}>
      <div style={{opacity:vis?1:0,transform:vis?"scale(1)":"scale(0.85)",transition:"opacity 0.6s,transform 0.6s cubic-bezier(.34,1.56,.64,1)",marginBottom:20}}>
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none"><circle cx="36" cy="36" r="34" fill="rgba(107,95,237,0.10)" stroke={T.signal} strokeWidth="1.4"/><path d="M22 36l11 11 17-17" stroke={T.signal} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <div style={{fontSize:34,fontWeight:800,letterSpacing:"-0.03em",color:T.ink,lineHeight:1.1,marginBottom:8,fontFamily:T.ff,opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(8px)",transition:"opacity 0.5s 0.15s,transform 0.5s 0.15s"}}>That's how the economy breathes.</div>
      <div style={{fontSize:16,color:T.inkMid,lineHeight:1.4,fontFamily:T.ff,marginBottom:24,opacity:vis?1:0,transition:"opacity 0.5s 0.26s"}}>Sent.</div>
      <div style={{width:"100%",borderRadius:14,background:"rgba(255,255,255,0.52)",border:`1px solid ${T.border}`,overflow:"hidden",marginBottom:24,opacity:vis?1:0,transition:"opacity 0.5s 0.40s"}}>
        {[["To",`@${recipient}`],["Amount (Kairos)",decimal],["Pulses",fmt(pulses)]].map(([label,value],i,arr)=>(
          <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",borderBottom:i<arr.length-1?`1px solid rgba(224,216,208,0.55)`:"none"}}>
            <span style={{fontSize:12,color:T.inkSoft,fontFamily:T.ff}}>{label}</span>
            <span style={{fontSize:13,fontWeight:700,color:T.ink,fontFamily:T.ff}}>{value}</span>
          </div>
        ))}
      </div>
      <div style={{opacity:vis?1:0,transition:"opacity 0.5s 0.54s",width:"100%",display:"flex",flexDirection:"column",gap:8}}>
        <PrimaryCTA label="View in Collection"/>
        <Ghost label="View transactions"/>
        <Ghost label="Back to home"/>
      </div>
    </div>
  );
}

function HomeScreen(){
  const [vis,setVis]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>setVis(true),200);return()=>clearTimeout(t);},[]);
  return(
    <div style={{padding:"40px 28px 48px",display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",minHeight:400,justifyContent:"center"}}>
      <div style={{opacity:vis?1:0,transform:vis?"scale(1)":"scale(0.88)",transition:"opacity 0.5s,transform 0.5s cubic-bezier(.34,1.56,.64,1)",marginBottom:20}}>
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="30" fill="rgba(76,175,130,0.10)" stroke={T.moss} strokeWidth="1.3"/><path d="M20 32l9 9 15-15" stroke={T.moss} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <div style={{fontSize:28,fontWeight:800,letterSpacing:"-0.028em",color:T.ink,lineHeight:1.1,marginBottom:8,fontFamily:T.ff,opacity:vis?1:0,transition:"opacity 0.45s 0.12s"}}>Your Kairos is sealed.</div>
      <div style={{fontSize:15,color:T.inkMid,lineHeight:1.65,fontFamily:T.ff,maxWidth:260,marginBottom:8,opacity:vis?1:0,transition:"opacity 0.45s 0.22s"}}>It lives in your wallet. Give it when you're ready.</div>
      <div style={{fontSize:12,color:T.inkSoft,fontFamily:T.ff,marginBottom:32,opacity:vis?1:0,transition:"opacity 0.45s 0.30s"}}>Day {DAY} · Æ[01] · 12236202</div>
      <div style={{width:"100%",opacity:vis?1:0,transition:"opacity 0.45s 0.40s"}}><Ghost label="Back to home"/></div>
    </div>
  );
}

function HearthScreen({onRedo}){
  const [vis,setVis]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>setVis(true),200);return()=>clearTimeout(t);},[]);
  return(
    <div style={{padding:"36px 28px 48px"}}>
      <div style={{display:"flex",justifyContent:"center",marginBottom:28,opacity:vis?1:0,transition:"opacity 0.4s"}}>
        <div style={{width:64,height:64,borderRadius:"50%",background:"rgba(139,94,47,0.10)",border:"1.5px solid rgba(139,94,47,0.25)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 8v5M12 16v.5" stroke={T.hearth} strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="12" r="10" stroke={T.hearth} strokeWidth="1.6"/></svg>
        </div>
      </div>
      <div style={{fontSize:22,fontWeight:800,color:T.ink,lineHeight:1.2,marginBottom:12,fontFamily:T.ff,opacity:vis?1:0}}>Something didn't come through.</div>
      <Guide text="The signal wasn't clear. Find good light and try again."/>
      <div style={{borderRadius:13,border:"1px solid rgba(139,94,47,0.20)",background:"rgba(139,94,47,0.04)",overflow:"hidden",marginBottom:24,opacity:vis?1:0}}>
        {["Good light on your face — nothing behind you.","Hold steady at eye level."].map((tip,i)=>(<div key={i} style={{display:"flex",gap:10,padding:"11px 14px",borderBottom:i<1?"1px solid rgba(139,94,47,0.12)":"none"}}><div style={{width:5,height:5,borderRadius:"50%",background:T.hearth,flexShrink:0,marginTop:6}}/><div style={{fontSize:12,color:T.inkMid,lineHeight:1.6,fontFamily:T.ff}}>{tip}</div></div>))}
      </div>
      <div style={{fontSize:11,color:T.hearth,fontWeight:700,textAlign:"center",marginBottom:14,fontFamily:T.ff,opacity:vis?1:0}}>2 attempts remaining today</div>
      <div style={{opacity:vis?1:0}}><WarnCTA label="Try again" onTap={onRedo}/></div>
    </div>
  );
}

function EmberScreen(){
  const [vis,setVis]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>setVis(true),200);return()=>clearTimeout(t);},[]);
  return(
    <div style={{padding:"36px 28px 48px"}}>
      <div style={{display:"flex",justifyContent:"center",marginBottom:28,opacity:vis?1:0,transition:"opacity 0.4s"}}>
        <div style={{width:64,height:64,borderRadius:"50%",background:"rgba(160,48,32,0.10)",border:"1.5px solid rgba(160,48,32,0.25)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={T.ember} strokeWidth="1.6"/><path d="M8 8l8 8M16 8l-8 8" stroke={T.ember} strokeWidth="2" strokeLinecap="round"/></svg>
        </div>
      </div>
      <div style={{fontSize:22,fontWeight:800,color:T.ink,lineHeight:1.2,marginBottom:12,fontFamily:T.ff,opacity:vis?1:0}}>We weren't able to validate a live human being.</div>
      <Guide text="After three failed attempts this activation session has ended. Try again tomorrow."/>
      <div style={{padding:"14px 16px",borderRadius:13,background:"rgba(160,48,32,0.05)",border:"1px solid rgba(160,48,32,0.18)",marginBottom:26,opacity:vis?1:0}}>
        <div style={{fontSize:12,color:T.inkMid,lineHeight:1.7,fontFamily:T.ff}}>If you believe this is an error, contact the ÆPOCH team.</div>
      </div>
      <div style={{textAlign:"center",marginBottom:18,opacity:vis?1:0}}>
        <span style={{fontSize:13,fontWeight:700,color:T.signal,fontFamily:T.ff,borderBottom:`1px solid rgba(107,95,237,0.25)`,paddingBottom:1,cursor:"pointer"}}>Contact support</span>
      </div>
      <Ghost label="I'll try again tomorrow"/>
    </div>
  );
}

export default function App(){
  const [stage,setStage]=useState("pol");
  const [recipient,setRecipient]=useState("sol");
  const [amount,setAmount]=useState(1.0);
  const [mood,setMood]=useState("");
  const W=375;
  useEffect(()=>{const l=document.createElement("link");l.rel="stylesheet";l.href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap";document.head.appendChild(l);},[]);
  const labels={pol:"PoL",approve:"Approve",origin:"Sign",minted:"Minted",give:"Give",amount:"Amount",confirm:"Confirm",sent:"Sent",kept:"Kept",hearth:"✕H",ember:"✕E"};
  return(
    <div style={{background:"#E4E1DC",minHeight:"100vh",padding:"24px 16px 48px",fontFamily:T.ff,display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
      <div style={{width:W}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:".10em",textTransform:"uppercase",color:T.inkSoft,fontFamily:"system-ui"}}>ÆPOCH · Kairos Activation</div>
        <div style={{fontSize:20,fontWeight:800,letterSpacing:"-.025em",color:T.ink}}>Daily Activation — v2.0</div>
      </div>
      <div style={{display:"flex",gap:3,flexWrap:"wrap",width:W}}>
        {STAGES.map(s=>(
          <button key={s} onClick={()=>setStage(s)} style={{padding:"5px 10px",borderRadius:6,border:`1px solid ${stage===s?(s==="hearth"?T.hearth:s==="ember"?T.ember:s==="minted"?"rgba(196,131,90,0.70)":T.signal):T.border}`,background:stage===s?(s==="hearth"?"rgba(139,94,47,0.10)":s==="ember"?"rgba(160,48,32,0.10)":s==="minted"?"rgba(196,131,90,0.12)":"rgba(107,95,237,0.10)"):"rgba(255,255,255,0.45)",color:stage===s?(s==="hearth"?T.hearth:s==="ember"?T.ember:s==="minted"?T.clay:T.signal):T.inkSoft,fontWeight:stage===s?700:500,fontSize:11,fontFamily:"system-ui",cursor:"pointer",transition:"all .15s"}}>{labels[s]}</button>
        ))}
      </div>
      <div style={{width:W,borderRadius:44,overflow:"hidden",background:"#FEFCF9",position:"relative",flexShrink:0,boxShadow:"0 2px 4px rgba(0,0,0,.06),0 24px 72px rgba(0,0,0,.14),inset 0 0 0 1px rgba(0,0,0,.05)"}}>
        <EarthRiseBG w={W} h={900}/>
        <Grain/>
        <div style={{position:"relative",zIndex:5}}>
          <StatusBar/>
          <ProgressBar stage={stage}/>
          {stage==="pol"     && <PolScreen key="pol" onNext={()=>setStage("approve")}/>}
          {stage==="approve" && <ApproveScreen onApprove={()=>setStage("origin")} onRetake={()=>setStage("pol")} onSkip={()=>setStage("origin")}/>}
          {stage==="origin"  && <OriginScreen onDone={()=>setStage("minted")} onMoodChange={setMood}/>}
          {stage==="minted"  && <MintedScreen key="minted" mood={mood} onGive={()=>setStage("give")} onKeep={()=>setStage("kept")}/>}
          {stage==="give"    && <GiveScreen mood={mood} onNext={r=>{setRecipient(r);setStage("amount");}} onSkip={()=>setStage("kept")} onBack={()=>setStage("minted")}/>}
          {stage==="amount"  && <AmountScreen recipient={recipient} onNext={a=>{setAmount(a);setStage("confirm");}} onHome={()=>setStage("kept")} onBack={()=>setStage("give")}/>}
          {stage==="confirm" && <ConfirmScreen recipient={recipient} amount={amount} onConfirm={()=>setStage("sent")} onBack={()=>setStage("amount")} onHome={()=>setStage("kept")}/>}
          {stage==="sent"    && <SentScreen recipient={recipient} amount={amount}/>}
          {stage==="kept"    && <HomeScreen/>}
          {stage==="hearth"  && <HearthScreen onRedo={()=>setStage("pol")}/>}
          {stage==="ember"   && <EmberScreen/>}
        </div>
      </div>
      <div style={{fontSize:10,color:T.inkSoft,fontFamily:"system-ui",letterSpacing:".05em",width:W}}>
        260318-ÆPOCH-KairosActivation-v2.0-0000 · Clean rewrite · Give: back → headline → Genie → card → input
      </div>
    </div>
  );
}
