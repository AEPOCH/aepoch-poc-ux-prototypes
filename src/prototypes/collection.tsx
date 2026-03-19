import { useState, useEffect, useRef } from "react";

const T = {
  ink:"#1A1612", inkMid:"#4A4440", inkSoft:"#8A8480", inkFaint:"#C4BEB8",
  clay:"#C4835A", ochre:"#A0673A", sand:"#E8C9A0", prism:"#B8A9D9",
  iris:"#8BAFD4", pearl:"#D6E4F0", signal:"#6B5FED", glow:"#9B8FF5",
  moss:"#4CAF82", hearth:"#8B5E2F", ember:"#A03020",
  border:"#E0D8D0", cta:"#2A2520",
  paper:"#FAF8F5", mist:"#F3F0EB", white:"#FFFFFF",
  ff:"'DM Sans',system-ui,-apple-system,sans-serif",
};

const MOOD_TINT={
  "Joyful":[232,195,88],"Trusting":[100,185,155],"Scared":[95,80,155],
  "Amazed":[245,175,48],"Sad":[88,108,175],"Disgusted":[88,128,58],
  "Grateful":[215,148,98],"Angry":[215,48,32],"Hopeful":[148,195,88],
  "Calm":[118,148,195],"In Awe":[148,118,215],"Reflective":[140,120,185],
  "":[200,175,130],
};

// Handle-derived avatar colour — 6-palette, locked
const AVATAR_COLS=["#C4835A","#8BAFD4","#B8A9D9","#4CAF82","#A0673A","rgba(107,95,237,0.85)"];
function avatarCol(h){const s=(h||"").split("").reduce((a,c)=>a+c.charCodeAt(0),0);return AVATAR_COLS[s%AVATAR_COLS.length];}

// Roman numeral helpers
function toRoman(n){
  const v=[1000,900,500,400,100,90,50,40,10,9,5,4,1];
  const s=["M","CM","D","CD","C","XC","L","XL","X","IX","V","IV","I"];
  let r="";v.forEach((val,i)=>{while(n>=val){r+=s[i];n-=val;}});return r;
}
const MONTH_NUM={"Jan":1,"Feb":2,"Mar":3,"Apr":4,"May":5,"Jun":6,"Jul":7,"Aug":8,"Sep":9,"Oct":10,"Nov":11,"Dec":12};
function toRomanDate(dateStr){
  const p=dateStr.split(" ");if(p.length!==3)return dateStr;
  const d=parseInt(p[0]),m=MONTH_NUM[p[1]],y=parseInt(p[2]);
  if(!d||!m||!y)return dateStr;
  return `${toRoman(d)} · ${toRoman(m)} · ${toRoman(y)}`;
}
function todayRoman(){
  const n=new Date();
  return `${toRoman(n.getDate())} · ${toRoman(n.getMonth()+1)} · ${toRoman(n.getFullYear())}`;
}

// Serial format: Æ[EE]-SSSSSSSSSSS
function parseSerial(serial,epoch="01"){return{epochPart:`Æ${epoch}`,serialPart:serial};}

const MEMBERS=["kai","nova","river","sol","eden","mira","fox","sage","dawn","reef"];
const STATS={activated:47,circulating:45,fossils:2,received:14,holding:3};
const STREAK=12;

const WHISPER_CHAIN=[
  {text:"Whoa. @kurzweil — you were right. Some things deserve to be held still.",member:"keanu",date:"Feb 22"},
  {text:"The singularity is near — but so is this moment. Thank you @damodei.",member:"kurzweil",date:"Feb 10"},
  {text:"Intelligence is nothing without humanity. Grateful to @demish.",member:"damodei",date:"Jan 28"},
  {text:"What does it mean to build things that outlast you.",member:"demish",date:"Jan 15"},
  {text:"@elonm passed this with a note. The future is brighter than we think.",member:"pdiamandis",date:"Jan 2"},
  {text:"Received from @sonic at a moment I needed reminding.",member:"mara",date:"Dec 19"},
];

const MY_KAIROS=[
  {id:2,section:"mine",type:"created_holding",serial:"12236201",epoch:"01",activator:"nova",date:"16 Mar 2026",dateShort:"16 Mar",mood:"Calm",origin:"",whispers:[],flow:0,unread:false,newWhisper:false},
  {id:4,section:"mine",type:"created_sent",serial:"12236199",epoch:"01",activator:"nova",date:"14 Mar 2026",dateShort:"14 Mar",mood:"Reflective",origin:"A quiet day. Nothing happened and everything felt significant.",whispers:[{text:"I felt this too.",member:"sol",date:"15 Mar"},{text:"Quiet days matter.",member:"mira",date:"16 Mar"},{text:"Remember this.",member:"fox",date:"17 Mar"}],flow:8,sentTo:"sol",unread:false,newWhisper:true},
  {id:5,section:"mine",type:"created_holding",serial:"12236198",epoch:"01",activator:"nova",date:"13 Mar 2026",dateShort:"13 Mar",mood:"Joyful",origin:"",whispers:[],flow:0,unread:false,newWhisper:false},
  {id:6,section:"mine",type:"created_sent",serial:"12236197",epoch:"01",activator:"nova",date:"12 Mar 2026",dateShort:"12 Mar",mood:"Trusting",origin:"Decided to trust the process today.",whispers:[{text:"Yes.",member:"dawn",date:"13 Mar"}],flow:4,sentTo:"nova",unread:false,newWhisper:false},
  {id:7,section:"mine",type:"created_holding",serial:"12236196",epoch:"01",activator:"nova",date:"11 Mar 2026",dateShort:"11 Mar",mood:"",origin:"",whispers:[],flow:0,unread:false,newWhisper:false},
  {id:8,section:"mine",type:"fossil",serial:"12236172",epoch:"01",activator:"nova",date:"15 Feb 2026",dateShort:"15 Feb",mood:"Sad",origin:"Some days just are what they are.",whispers:[],flow:0,burnDate:"17 Feb 2026",unread:false,newWhisper:false},
];

const RECEIVED_KAIROS=[
  {id:1,section:"received",type:"received",serial:"12236202",epoch:"01",activator:"sonic",from:"sonic",date:"17 Mar 2026",dateShort:"17 Mar",mood:"Grateful",origin:"The one thing I want the future to know about this moment is that I showed up even when it was hard.",whispers:WHISPER_CHAIN,flow:6,unread:true,newWhisper:false},
  {id:3,section:"received",type:"received",serial:"12236200",epoch:"01",activator:"nova",from:"nova",date:"15 Mar 2026",dateShort:"15 Mar",mood:"Hopeful",origin:"Spring is coming. I can feel it in everything.",whispers:[{text:"I needed this today.",member:"eden",date:"16 Mar"},{text:"This is beautiful.",member:"river",date:"15 Mar"}],flow:5,unread:false,newWhisper:true},
];

// ── Canvas backgrounds ────────────────────────────────────
function EarthRiseBG({w,h}){
  const ref=useRef();
  useEffect(()=>{
    function draw(){
      const c=ref.current;if(!c)return;
      const dpr=window.devicePixelRatio||1;c.width=w*dpr;c.height=h*dpr;c.style.width=w+"px";c.style.height=h+"px";
      const ctx=c.getContext("2d");ctx.scale(dpr,dpr);ctx.fillStyle="#FEFCF9";ctx.fillRect(0,0,w,h);
      [{x:.10,y:.70,r:.70,col:[232,201,160],a:.18},{x:.25,y:.85,r:.55,col:[196,131,90],a:.12},
       {x:.05,y:.50,r:.45,col:[196,131,90],a:.08},{x:.88,y:.05,r:.55,col:[214,228,240],a:.16},
       {x:.95,y:.15,r:.38,col:[184,169,217],a:.12}
      ].forEach(({x,y,r,col,a})=>{
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
    const c=ref.current;if(!c)return;c.width=375;c.height=900;
    const ctx=c.getContext("2d");const id=ctx.createImageData(375,900);const d=id.data;
    for(let i=0;i<d.length;i+=4){const v=Math.random()*255|0;d[i]=d[i+1]=d[i+2]=v;d[i+3]=18;}
    ctx.putImageData(id,0,0);
  },[]);
  return <canvas ref={ref} style={{position:"absolute",inset:0,width:"100%",height:"100%",mixBlendMode:"overlay",opacity:.65,pointerEvents:"none"}}/>;
}

function StatusBar(){
  return(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 24px 0",height:44,fontFamily:T.ff,flexShrink:0}}>
      <span style={{fontSize:12,fontWeight:700,color:T.ink,letterSpacing:"-0.02em"}}>9:41</span>
      <div style={{display:"flex",gap:5,alignItems:"center"}}>
        <svg width="15" height="11" viewBox="0 0 15 11">{[0,1,2,3].map(i=><rect key={i} x={i*4} y={10-(i+1)*2.5} width="2.5" height={(i+1)*2.5} rx="0.5" fill={T.ink} opacity={i<3?1:0.3}/>)}</svg>
        <svg width="25" height="11" viewBox="0 0 25 11"><rect x="0" y="1" width="21" height="9" rx="2" fill="none" stroke={T.ink} strokeWidth="1.1"/><rect x="1.2" y="2.2" width="15" height="6.6" rx="1.2" fill={T.ink}/><path d="M22 3.5v4q2-.5 2-2t-2-2z" fill={T.ink} opacity=".4"/></svg>
      </div>
    </div>
  );
}

// Back — chevron only, 44×44px, no label, no screen name
function BackBtn({onTap}){
  return(
    <div onClick={onTap} style={{width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",marginLeft:-10,flexShrink:0}} aria-label="Go back">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M12 5L7 10l5 5" stroke={T.inkSoft} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

// C5 Genie wash
function GenieWash({children}){
  return(
    <div style={{position:"relative",padding:"8px 0",marginBottom:16}}>
      <div style={{position:"absolute",inset:"-6px -4px",background:"radial-gradient(ellipse 70% 70% at 85% 10%, rgba(184,169,217,0.26) 0%, transparent 65%), radial-gradient(ellipse 70% 70% at 15% 90%, rgba(232,201,160,0.20) 0%, transparent 65%)",borderRadius:16,pointerEvents:"none"}}/>
      <div style={{position:"relative",fontSize:14,lineHeight:1.75,color:T.ink,fontFamily:T.ff}}>{children}</div>
    </div>
  );
}

// Member avatar — handle-derived colour, 6-palette
function MemberAvatar({handle,size=36}){
  return(
    <div style={{width:size,height:size,borderRadius:"50%",background:avatarCol(handle),display:"flex",alignItems:"center",justifyContent:"center",fontSize:Math.round(size*0.40),fontWeight:700,color:"white",flexShrink:0,fontFamily:T.ff,userSelect:"none"}}>
      {(handle||"?")[0].toUpperCase()}
    </div>
  );
}

// Sealed envelope — replaces card face for unread received Kairos
function EnvelopeSheen({w,h,senderHandle,senderColor,serial,epoch,style={}}){
  const ref=useRef();
  function hexToRgb(hex){return{r:parseInt(hex.slice(1,3),16),g:parseInt(hex.slice(3,5),16),b:parseInt(hex.slice(5,7),16)};}
  useEffect(()=>{
    const c=ref.current;if(!c)return;
    const dpr=window.devicePixelRatio||1;c.width=w*dpr;c.height=h*dpr;c.style.width=w+"px";c.style.height=h+"px";
    const ctx=c.getContext("2d");ctx.scale(dpr,dpr);
    const W=w,H=h;
    ctx.fillStyle="#F5F0E8";ctx.fillRect(0,0,W,H);
    const sw=hexToRgb(senderColor||"#8BAFD4");
    const swg=ctx.createRadialGradient(W*.5,H*.38,0,W*.5,H*.38,W*.90);
    swg.addColorStop(0,`rgba(${sw.r},${sw.g},${sw.b},0.12)`);
    swg.addColorStop(0.6,`rgba(${sw.r},${sw.g},${sw.b},0.05)`);
    swg.addColorStop(1,`rgba(${sw.r},${sw.g},${sw.b},0)`);
    ctx.fillStyle=swg;ctx.fillRect(0,0,W,H);
    for(let i=0;i<W*H*.06;i++){const v=180+Math.random()*60;ctx.fillStyle=`rgba(${v},${Math.round(v*.94)},${Math.round(v*.86)},${Math.random()*.055})`;ctx.fillRect(Math.random()*W,Math.random()*H,1,1);}
    const vg=ctx.createRadialGradient(W*.5,H*.5,H*.2,W*.5,H*.5,H*.85);vg.addColorStop(0,"rgba(196,160,100,0)");vg.addColorStop(1,"rgba(160,110,50,0.10)");ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
    const PAD=W*.055,EL=PAD,ER=W-PAD,ET=H*.095,EB=H*.825,CX=W*.5,CY=H*.455;
    ctx.beginPath();ctx.moveTo(EL,ET);ctx.lineTo(ER,ET);ctx.lineTo(ER,EB);ctx.lineTo(EL,EB);ctx.closePath();ctx.fillStyle="rgba(242,234,218,0.70)";ctx.fill();
    const corners=[[EL,ET],[ER,ET],[ER,EB],[EL,EB]];
    const flapFills=["rgba(228,218,200,0.55)","rgba(220,210,192,0.45)","rgba(228,218,200,0.55)","rgba(220,210,192,0.45)"];
    [[corners[0],corners[1]],[corners[1],corners[2]],[corners[2],corners[3]],[corners[3],corners[0]]].forEach(([a,b],i)=>{ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.lineTo(CX,CY);ctx.closePath();ctx.fillStyle=flapFills[i];ctx.fill();});
    corners.forEach(([x,y])=>{ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(CX,CY);ctx.strokeStyle="rgba(160,120,70,0.22)";ctx.lineWidth=0.8;ctx.stroke();ctx.save();ctx.translate(-0.5,-0.5);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(CX,CY);ctx.strokeStyle="rgba(255,248,235,0.55)";ctx.lineWidth=0.6;ctx.stroke();ctx.restore();});
    ctx.beginPath();ctx.moveTo(EL,ET);ctx.lineTo(ER,ET);ctx.lineTo(ER,EB);ctx.lineTo(EL,EB);ctx.closePath();ctx.strokeStyle="rgba(160,120,70,0.28)";ctx.lineWidth=0.8;ctx.stroke();
    const notch=W*.022;corners.forEach(([x,y])=>{const nx=x<W/2?1:-1,ny=y<H/2?1:-1;ctx.beginPath();ctx.moveTo(x+nx*notch*2.2,y);ctx.lineTo(x,y);ctx.lineTo(x,y+ny*notch*2.2);ctx.strokeStyle="rgba(160,120,70,0.40)";ctx.lineWidth=0.8;ctx.stroke();});
    const sealR=W*.195;
    ctx.save();ctx.shadowColor="rgba(120,70,20,0.25)";ctx.shadowBlur=6;ctx.shadowOffsetX=1.5;ctx.shadowOffsetY=2;ctx.beginPath();ctx.arc(CX,CY,sealR*.92,0,Math.PI*2);ctx.fillStyle="#A0673A";ctx.fill();ctx.restore();
    ctx.save();ctx.beginPath();for(let i=0;i<=72;i++){const a=(i/72)*Math.PI*2,jitter=1+Math.sin(a*7+1.2)*.055+Math.sin(a*13+.7)*.030+Math.sin(a*3+2.1)*.020,r=sealR*jitter;i===0?ctx.moveTo(CX+Math.cos(a)*r,CY+Math.sin(a)*r):ctx.lineTo(CX+Math.cos(a)*r,CY+Math.sin(a)*r);}ctx.closePath();ctx.fillStyle="rgba(130,75,28,0.45)";ctx.fill();ctx.restore();
    ctx.beginPath();ctx.arc(CX,CY,sealR*.90,0,Math.PI*2);ctx.fillStyle="#B07840";ctx.fill();
    const wg=ctx.createRadialGradient(CX-sealR*.32,CY-sealR*.32,0,CX,CY,sealR*.90);wg.addColorStop(0,"rgba(240,185,105,0.60)");wg.addColorStop(.3,"rgba(196,131,58,0.25)");wg.addColorStop(.7,"rgba(130,80,25,0.20)");wg.addColorStop(1,"rgba(70,35,8,0.45)");ctx.beginPath();ctx.arc(CX,CY,sealR*.90,0,Math.PI*2);ctx.fillStyle=wg;ctx.fill();
    ctx.save();ctx.beginPath();ctx.arc(CX,CY,sealR*.90,0,Math.PI*2);ctx.clip();for(let i=0;i<7;i++){const a=(i/7)*Math.PI*2+.5,len=sealR*(.25+(i%3)*.18);ctx.beginPath();ctx.moveTo(CX,CY);ctx.lineTo(CX+Math.cos(a)*len,CY+Math.sin(a)*len);ctx.strokeStyle="rgba(65,30,5,0.15)";ctx.lineWidth=.5;ctx.stroke();}ctx.restore();
    ctx.beginPath();ctx.arc(CX,CY,sealR*.90,0,Math.PI*2);ctx.strokeStyle="rgba(240,185,105,0.40)";ctx.lineWidth=1.0;ctx.stroke();
    const vR=sealR*.45,vSep=vR*.50,vLx=CX-vSep/2,vRx=CX+vSep/2;
    ctx.save();ctx.translate(1.0,1.2);ctx.beginPath();ctx.arc(vLx,CY,vR,0,Math.PI*2);ctx.strokeStyle="rgba(50,22,4,0.50)";ctx.lineWidth=1.2;ctx.stroke();ctx.beginPath();ctx.arc(vRx,CY,vR,0,Math.PI*2);ctx.strokeStyle="rgba(50,22,4,0.50)";ctx.lineWidth=1.2;ctx.stroke();ctx.restore();
    ctx.beginPath();ctx.arc(vLx,CY,vR,0,Math.PI*2);ctx.strokeStyle="rgba(255,240,210,0.82)";ctx.lineWidth=1.0;ctx.stroke();
    ctx.beginPath();ctx.arc(vRx,CY,vR,0,Math.PI*2);ctx.strokeStyle="rgba(255,240,210,0.82)";ctx.lineWidth=1.0;ctx.stroke();
    ctx.save();ctx.beginPath();ctx.arc(vLx,CY,vR,-Math.PI/3,Math.PI/3);ctx.arc(vRx,CY,vR,Math.PI*2/3,Math.PI*4/3);ctx.closePath();ctx.strokeStyle="rgba(255,245,220,0.95)";ctx.lineWidth=1.4;ctx.stroke();ctx.restore();
    const pmY=ET+W*.085;ctx.textAlign="center";ctx.font=`600 ${W*.050}px monospace`;ctx.fillStyle="rgba(160,103,50,0.42)";ctx.fillText(`Æ${epoch||"01"}  ·  ${serial}`,W*.5,pmY);
    [[EL+W*.04,W*.5-W*.28],[W*.5+W*.28,ER-W*.04]].forEach(([x1,x2])=>{ctx.beginPath();ctx.moveTo(x1,pmY-W*.018);ctx.lineTo(x2,pmY-W*.018);ctx.strokeStyle="rgba(160,103,50,0.20)";ctx.lineWidth=.6;ctx.stroke();});
    ctx.textAlign="center";ctx.font=`500 ${W*.056}px system-ui`;ctx.fillStyle="rgba(100,65,30,0.50)";ctx.fillText(`from @${senderHandle||"?"}`,W*.5,EB-W*.06);
  },[w,h,senderHandle,senderColor,serial,epoch]);
  return <canvas ref={ref} style={{display:"block",...style}}/>;
}

// Card sheen — mood-tinted canvas, no face render (card face handled externally)
function CardSheen({w,h,mood,fossil,style={}}){
  const ref=useRef();
  const [wr,wg,wb]=MOOD_TINT[mood]||MOOD_TINT[""];
  useEffect(()=>{
    const c=ref.current;if(!c)return;
    const dpr=window.devicePixelRatio||1;c.width=w*dpr;c.height=h*dpr;c.style.width=w+"px";c.style.height=h+"px";
    const ctx=c.getContext("2d");ctx.scale(dpr,dpr);
    ctx.fillStyle="#0C0A08";ctx.fillRect(0,0,w,h);
    const g1=ctx.createRadialGradient(w*.38,h*.36,0,w*.38,h*.36,Math.max(w,h)*.75);
    g1.addColorStop(0,`rgba(${wr},${wg},${wb},${fossil?.22:.48})`);
    g1.addColorStop(.55,`rgba(${wr},${wg},${wb},${fossil?.08:.18})`);
    g1.addColorStop(1,`rgba(${wr},${wg},${wb},0)`);
    ctx.fillStyle=g1;ctx.fillRect(0,0,w,h);
    const g2=ctx.createRadialGradient(w*.88,h*.08,0,w*.88,h*.08,Math.max(w,h)*.45);
    g2.addColorStop(0,`rgba(184,169,217,${fossil?.08:.16})`);g2.addColorStop(1,"rgba(184,169,217,0)");
    ctx.fillStyle=g2;ctx.fillRect(0,0,w,h);
    const gB=ctx.createLinearGradient(0,h*.55,0,h);gB.addColorStop(0,"rgba(4,2,1,0)");gB.addColorStop(1,"rgba(4,2,1,.90)");ctx.fillStyle=gB;ctx.fillRect(0,0,w,h);
    const gT=ctx.createLinearGradient(0,0,0,h*.22);gT.addColorStop(0,"rgba(4,2,1,.72)");gT.addColorStop(1,"rgba(4,2,1,0)");ctx.fillStyle=gT;ctx.fillRect(0,0,w,h);
    for(let i=0;i<w*h*.18;i++){ctx.fillStyle=`rgba(255,255,255,${Math.random()*.018})`;ctx.fillRect(Math.random()*w,Math.random()*h,1,1);}
    if(fossil){ctx.strokeStyle="rgba(200,175,130,.28)";ctx.lineWidth=1;ctx.setLineDash([4,4]);ctx.strokeRect(1,1,w-2,h-2);ctx.setLineDash([]);}
  },[w,h,mood,fossil,wr,wg,wb]);
  return <canvas ref={ref} style={{display:"block",...style}}/>;
}

// ── KairosStrip — locked component ───────────────────────
function KairosStrip({k}){
  const [originOpen,setOriginOpen]=useState(false);
  const [wr,wg,wb]=MOOD_TINT[k.mood]||MOOD_TINT[""];
  const {epochPart,serialPart}=parseSerial(k.serial,k.epoch||"01");
  const romanDate=k.isToday?todayRoman():toRomanDate(k.date);
  const hasOrigin=!!k.origin;
  return(
    <div style={{borderRadius:14,background:"rgba(255,255,255,0.55)",border:`1px solid ${T.border}`,overflow:"hidden",boxShadow:"0 1px 8px rgba(26,22,18,0.06)"}}>
      <div style={{height:3,background:`linear-gradient(to right,rgba(${wr},${wg},${wb},0.80),rgba(${wr},${wg},${wb},0.12))`}}/>
      <div style={{padding:"14px 16px"}}>
        <div style={{marginBottom:10}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.06em",color:T.inkFaint,fontFamily:T.ff,marginBottom:5}}>Serial #</div>
          <div style={{display:"flex",alignItems:"baseline",fontFamily:"monospace,system-ui"}}>
            <span style={{fontSize:18,fontWeight:700,color:T.prism,letterSpacing:"0.01em"}}>{epochPart}</span>
            <span style={{fontSize:16,fontWeight:400,color:T.inkFaint,margin:"0 1px"}}>-</span>
            <span style={{fontSize:18,fontWeight:700,color:T.ink,letterSpacing:"0.01em"}}>{serialPart}</span>
          </div>
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center",paddingTop:10,borderTop:`1px solid rgba(224,216,208,0.45)`}}>
          <span style={{fontSize:11,color:T.inkFaint,fontFamily:T.ff}}>by</span>
          <span style={{fontSize:12,fontWeight:700,color:T.inkMid,fontFamily:T.ff}}>@{k.activator||k.from||"nova"}</span>
          <span style={{fontSize:11,color:T.inkFaint}}>·</span>
          <span style={{fontSize:12,color:T.inkSoft,fontFamily:T.ff}}>{romanDate}</span>
          {k.mood&&<><span style={{fontSize:11,color:T.inkFaint}}>·</span><span style={{fontSize:12,color:T.inkSoft,fontFamily:T.ff}}>{k.mood}</span></>}
        </div>
        {hasOrigin&&(
          <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid rgba(224,216,208,0.45)`}}>
            <div onClick={()=>setOriginOpen(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",userSelect:"none"}}>
              <span style={{fontSize:11,fontWeight:700,letterSpacing:"0.06em",color:T.inkFaint,fontFamily:T.ff}}>Origin story</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{transform:originOpen?"rotate(180deg)":"none",transition:"transform 0.2s cubic-bezier(0.4,0,0.2,1)",flexShrink:0}}>
                <path d="M4 6l4 4 4-4" stroke={T.inkFaint} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{overflow:"hidden",maxHeight:originOpen?200:0,opacity:originOpen?1:0,transition:"max-height 0.28s cubic-bezier(0.4,0,0.2,1),opacity 0.22s"}}>
              <div style={{fontSize:13,color:T.inkMid,lineHeight:1.70,fontFamily:T.ff,paddingTop:8}}>"{k.origin}"</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── CTAs ──────────────────────────────────────────────────
function PrimaryCTA({label,onTap,disabled}){
  const [hov,setHov]=useState(false),[prs,setPrs]=useState(false);
  return(
    <div style={{position:"relative",cursor:disabled?"not-allowed":"pointer",userSelect:"none",opacity:disabled?.5:1}}
      onMouseEnter={()=>!disabled&&setHov(true)} onMouseLeave={()=>{setHov(false);setPrs(false);}}
      onMouseDown={()=>!disabled&&setPrs(true)} onMouseUp={()=>{setPrs(false);!disabled&&onTap&&onTap();}}>
      {hov&&!prs&&!disabled&&<div style={{position:"absolute",bottom:-8,left:"8%",right:"8%",height:20,background:"radial-gradient(ellipse,rgba(196,131,90,0.48) 0%,transparent 70%)",filter:"blur(8px)",pointerEvents:"none"}}/>}
      <div style={{position:"relative",zIndex:1,height:52,borderRadius:13,background:prs?"#1E1510":hov?"#342218":T.cta,color:"#FAF8F5",fontSize:14,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.ff,transform:prs?"translateY(1px) scale(.998)":hov?"translateY(-2px)":"none",boxShadow:"0 2px 16px rgba(42,37,32,.17)",transition:"all .26s cubic-bezier(.34,1.56,.64,1)"}}>{label}</div>
    </div>
  );
}
function CeremonyCTA({label,onTap,disabled}){
  const [hov,setHov]=useState(false),[prs,setPrs]=useState(false);
  return(
    <div style={{position:"relative",cursor:disabled?"not-allowed":"pointer",userSelect:"none",opacity:disabled?.5:1}}
      onMouseEnter={()=>!disabled&&setHov(true)} onMouseLeave={()=>{setHov(false);setPrs(false);}}
      onMouseDown={()=>!disabled&&setPrs(true)} onMouseUp={()=>{setPrs(false);!disabled&&onTap&&onTap();}}>
      <div style={{height:52,borderRadius:13,background:prs?"#9A6040":hov?"#D4956A":T.clay,color:"#FAF8F5",fontSize:14,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.ff,transform:prs?"translateY(1px)":hov?"translateY(-2px)":"none",boxShadow:"0 2px 16px rgba(196,131,90,0.35)",transition:"all .26s cubic-bezier(.34,1.56,.64,1)"}}>{label}</div>
    </div>
  );
}
function Ghost({label,onTap}){
  return <div onClick={onTap} style={{textAlign:"center",cursor:"pointer",padding:"12px 0"}}><span style={{fontSize:13,fontWeight:700,color:T.inkSoft,fontFamily:T.ff}}>{label}</span></div>;
}

// ── Section header ────────────────────────────────────────
function SectionHead({label,count}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:8,padding:"14px 22px 8px"}}>
      <span style={{fontSize:10,fontWeight:700,letterSpacing:"0.06em",color:T.inkFaint,fontFamily:T.ff}}>{label}</span>
      <div style={{flex:1,height:1,background:T.border}}/>
      <span style={{fontSize:10,color:T.inkFaint,fontFamily:T.ff}}>{count}</span>
    </div>
  );
}

// Comet arc — orbits the card perimeter for new whisper state
function CometOrbit({w,h}){
  const ref=useRef();
  useEffect(()=>{
    const c=ref.current;if(!c)return;
    const dpr=window.devicePixelRatio||1;
    c.width=w*dpr;c.height=h*dpr;c.style.width=w+"px";c.style.height=h+"px";
    const ctx=c.getContext("2d");ctx.scale(dpr,dpr);
    const W=w,H=h;
    // Perimeter path: rectangle corners, total perimeter length
    const perim=2*(W+H);
    // Duration: ~5s per orbit
    const speed=perim/5000;
    let start=null;
    function ptOnPerim(d){
      // d in [0, perim), returns {x,y}
      d=((d%perim)+perim)%perim;
      if(d<W)          return{x:d,y:0};
      d-=W;if(d<H)     return{x:W,y:d};
      d-=H;if(d<W)     return{x:W-d,y:H};
      d-=W;            return{x:0,y:H-d};
    }
    function draw(ts){
      if(!start)start=ts;
      const elapsed=ts-start;
      ctx.clearRect(0,0,W,H);
      const headD=(elapsed*speed)%perim;
      // Tail length — about 18% of perimeter
      const tailLen=perim*0.18;
      const steps=60;
      for(let i=0;i<steps;i++){
        const t0=i/steps,t1=(i+1)/steps;
        const d0=headD-tailLen*(1-t0);
        const d1=headD-tailLen*(1-t1);
        const p0=ptOnPerim(d0),p1=ptOnPerim(d1);
        // Colour: Prism → white toward head
        const rv=Math.round(184+(255-184)*t0);
        const gv=Math.round(169+(255-169)*t0);
        const bv=Math.round(217+(255-217)*t0);
        ctx.beginPath();
        ctx.moveTo(p0.x,p0.y);ctx.lineTo(p1.x,p1.y);
        ctx.strokeStyle=`rgba(${rv},${gv},${bv},${Math.pow(t0,1.6)*0.95})`;
        ctx.lineWidth=1.5+t0*1.8;
        ctx.lineCap="round";
        ctx.stroke();
      }
      // Head — white-hot point
      const hp=ptOnPerim(headD);
      const hg=ctx.createRadialGradient(hp.x,hp.y,0,hp.x,hp.y,7);
      hg.addColorStop(0,"rgba(255,255,255,1)");
      hg.addColorStop(0.35,"rgba(214,228,240,0.70)");
      hg.addColorStop(1,"rgba(184,169,217,0)");
      ctx.beginPath();ctx.arc(hp.x,hp.y,7,0,Math.PI*2);
      ctx.fillStyle=hg;ctx.fill();
      ctx.beginPath();ctx.arc(hp.x,hp.y,2.2,0,Math.PI*2);
      ctx.fillStyle="rgba(255,255,255,1)";ctx.fill();
      requestAnimationFrame(draw);
    }
    const id=requestAnimationFrame(draw);
    return()=>cancelAnimationFrame(id);
  },[w,h]);
  return <canvas ref={ref} style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:9}}/>;
}

// Grid tile — sharp corners, envelope for unread, comet orbit for new whisper
function KairosGridTile({k,onTap}){
  const [flipped,setFlipped]=useState(false);
  const [animating,setAnimating]=useState(false);
  const isFossil=k.type==="fossil";
  const isNew=k.unread;
  const hasNewWhisper=k.newWhisper&&!isNew;
  const tileW=160,tileH=Math.round(160/0.56);
  function doFlip(e){
    e.stopPropagation();if(animating)return;
    setAnimating(true);setTimeout(()=>{setFlipped(f=>!f);setAnimating(false);},150);
  }
  return(
    <div onClick={()=>onTap(k)}
      style={{aspectRatio:"0.56",overflow:"hidden",cursor:"pointer",
        opacity:isFossil?0.55:1,position:"relative",transition:"transform .15s"}}
      onMouseEnter={e=>{if(!isFossil&&!isNew)e.currentTarget.style.transform="scale(1.02)";}}
      onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";}}>
      {/* Sealed envelope — full card takeover for new */}
      {isNew ? (
        <EnvelopeSheen w={tileW} h={tileH}
          senderHandle={k.from} senderColor={avatarCol(k.from||"")}
          serial={k.serial} epoch={k.epoch||"01"}
          style={{width:"100%",height:"100%"}}/>
      ) : (
        <div style={{position:"absolute",inset:0,opacity:animating?0:1,transition:"opacity 0.13s"}}>
          <CardSheen w={tileW} h={tileH} mood={k.mood} fossil={isFossil} style={{width:"100%",height:"100%"}}/>
        </div>
      )}
      {/* Comet orbit — new whisper state */}
      {hasNewWhisper&&<CometOrbit w={tileW} h={tileH}/>}
      {/* Bottom label — only on normal cards */}
      {!isNew&&!flipped&&(
        <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"18px 8px 8px",pointerEvents:"none"}}>
          <div style={{fontSize:9,fontWeight:700,color:"rgba(250,248,245,0.88)",fontFamily:"monospace,system-ui",lineHeight:1.2,letterSpacing:"0.02em"}}>{`Æ${k.epoch||"01"}`}<span style={{color:"rgba(250,248,245,0.50)"}}>-{k.serial}</span></div>
          {k.mood&&<div style={{fontSize:9,color:"rgba(250,248,245,0.48)",fontFamily:T.ff,marginTop:1}}>{k.mood}</div>}
        </div>
      )}

      {/* Flip control — not shown on sealed envelopes */}
      {!isNew&&(
        <div onClick={doFlip} style={{position:"absolute",bottom:6,right:6,width:22,height:22,borderRadius:"50%",background:"rgba(26,22,18,0.60)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10,cursor:"pointer"}}
          onMouseEnter={e=>{e.currentTarget.style.background="rgba(107,95,237,0.80)";e.stopPropagation();}}
          onMouseLeave={e=>{e.currentTarget.style.background="rgba(26,22,18,0.60)";}}>
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M2 8a6 6 0 0 1 10-4.5" stroke="rgba(250,248,245,0.85)" strokeWidth="1.6" strokeLinecap="round"/><path d="M14 8a6 6 0 0 1-10 4.5" stroke="rgba(250,248,245,0.85)" strokeWidth="1.6" strokeLinecap="round"/><path d="M12 3l2.5 1.5-1.5 2.5" stroke="rgba(250,248,245,0.85)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      )}
    </div>
  );
}

// List row — sharp corners, envelope thumbnail for new, no pills
function KairosListRow({k,onTap}){
  const isFossil=k.type==="fossil";
  const isNew=k.unread;
  return(
    <div onClick={()=>onTap(k)}
      style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",
        background:"rgba(255,255,255,0.50)",
        border:`1.5px solid ${isNew?"rgba(196,131,90,0.35)":k.newWhisper?T.signal:isFossil?"rgba(200,175,130,0.30)":T.border}`,
        cursor:"pointer",opacity:isFossil?.42:1,transition:"background .15s"}}
      onMouseEnter={e=>{if(!isFossil)e.currentTarget.style.background="rgba(255,255,255,0.72)";}}
      onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.50)";}}>
      {/* Thumbnail */}
      <div style={{width:36,height:50,overflow:"hidden",flexShrink:0}}>
        {isNew
          ? <EnvelopeSheen w={36} h={50} senderHandle={k.from} senderColor={avatarCol(k.from||"")} serial={k.serial} epoch={k.epoch||"01"} style={{width:"100%",height:"100%"}}/>
          : <CardSheen w={36} h={50} mood={k.mood} fossil={isFossil} style={{width:"100%",height:"100%"}}/>
        }
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
          <span style={{fontSize:12,fontWeight:700,color:"rgba(184,169,217,0.90)",fontFamily:"monospace,system-ui"}}>Æ{k.epoch||"01"}</span>
          <span style={{fontSize:12,fontWeight:700,color:isFossil?T.inkSoft:T.ink,fontFamily:"monospace,system-ui"}}>-{k.serial}</span>
          {isFossil&&<span style={{fontSize:10,color:T.inkFaint,fontFamily:T.ff,fontWeight:400}}>· Burned</span>}
          {isNew&&<span style={{fontSize:10,color:T.clay,fontFamily:T.ff,fontWeight:700}}>· New</span>}
        </div>
        <div style={{fontSize:11,color:T.inkSoft,fontFamily:T.ff,marginTop:2}}>
          {isNew ? `from @${k.from}` : `${k.mood||"· · ·"}${k.flow>0?` · Flow ${k.flow} Kairos`:""}${k.whispers.length>0?` · ${k.whispers.length} whisper${k.whispers.length>1?"s":""}`:""}`}
        </div>
        {k.newWhisper&&!isNew&&<div style={{fontSize:10,fontWeight:700,color:T.signal,fontFamily:T.ff,marginTop:2}}>New whisper</div>}
      </div>
      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
        {k.newWhisper&&!isNew&&<div style={{width:7,height:7,borderRadius:"50%",background:T.signal}}/>}
        {!isFossil&&<svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke={T.inkFaint} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
    </div>
  );
}

// ── Collection home ───────────────────────────────────────
function CollectionHome({onSelect}){
  const [view,setView]=useState("grid");
  const [filter,setFilter]=useState("mine");
  const [sort,setSort]=useState("newest");
  const [sortOpen,setSortOpen]=useState(false);
  const sortLabels={"newest":"Newest","oldest":"Oldest","newwhispers":"New whispers","whispers":"Most whispers"};
  function applySort(arr){
    if(sort==="oldest")return[...arr].reverse();
    if(sort==="whispers")return[...arr].sort((a,b)=>b.whispers.length-a.whispers.length);
    if(sort==="newwhispers")return[...arr].sort((a,b)=>Number(b.newWhisper)-Number(a.newWhisper));
    return[...arr];
  }
  const showMine=filter==="mine"||filter==="all";
  const showReceived=filter==="received"||filter==="all";
  const myItems=applySort(MY_KAIROS);
  const recItems=applySort(RECEIVED_KAIROS);
  const filters=[{k:"mine",l:"Mine"},{k:"received",l:"Received"},{k:"all",l:"All"}];
  function renderGrid(items){
    return <div style={{padding:"0 12px"}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>{items.map(k=><KairosGridTile key={k.id} k={k} onTap={onSelect}/>)}</div></div>;
  }
  function renderList(items){
    return <div style={{padding:"0 16px",display:"flex",flexDirection:"column",gap:5}}>{items.map(k=><KairosListRow key={k.id} k={k} onTap={onSelect}/>)}</div>;
  }
  return(
    <div style={{flex:1,overflowY:"auto",padding:"10px 0 56px"}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0 22px 0"}}>
        <span style={{fontSize:26,fontWeight:800,letterSpacing:"-0.025em",color:T.ink,fontFamily:T.ff}}>Collection.</span>
        {/* View toggle */}
        <div style={{display:"flex",gap:2,background:"rgba(224,216,208,0.5)",borderRadius:9,padding:3,flexShrink:0}}>
          {[{v:"grid",g:true},{v:"list",g:false}].map(({v,g})=>{
            const act=view===v;
            return(
              <div key={v} onClick={()=>setView(v)} style={{width:30,height:26,borderRadius:6,background:act?T.cta:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"background .15s"}}>
                {g?<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="5.5" height="5.5" rx="1.2" fill={act?"#FAF8F5":"#8A8480"}/><rect x="9.5" y="1" width="5.5" height="5.5" rx="1.2" fill={act?"#FAF8F5":"#8A8480"}/><rect x="1" y="9.5" width="5.5" height="5.5" rx="1.2" fill={act?"#FAF8F5":"#8A8480"}/><rect x="9.5" y="9.5" width="5.5" height="5.5" rx="1.2" fill={act?"#FAF8F5":"#8A8480"}/></svg>
                :<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><line x1="1" y1="4" x2="15" y2="4" stroke={act?"#FAF8F5":"#8A8480"} strokeWidth="1.6" strokeLinecap="round"/><line x1="1" y1="8" x2="15" y2="8" stroke={act?"#FAF8F5":"#8A8480"} strokeWidth="1.6" strokeLinecap="round"/><line x1="1" y1="12" x2="15" y2="12" stroke={act?"#FAF8F5":"#8A8480"} strokeWidth="1.6" strokeLinecap="round"/></svg>}
              </div>
            );
          })}
        </div>
      </div>
      {/* Stats strip */}
      <div style={{display:"flex",alignItems:"flex-start",padding:"10px 22px",gap:0}}>
        {[{v:STATS.activated,l:"activated"},{v:STATS.circulating,l:"circulating"},{v:STATS.fossils,l:"fossils"},{v:STATS.received,l:"received"},{v:STATS.holding,l:"holding"}].map(({v,l},i,arr)=>(
          <div key={l} style={{display:"flex",alignItems:"center",gap:0,flexShrink:0}}>
            <div style={{textAlign:"center",padding:"0 2px"}}>
              <div style={{fontSize:16,fontWeight:800,color:T.ink,fontFamily:T.ff,letterSpacing:"-0.02em",fontVariantNumeric:"tabular-nums",lineHeight:1}}>{v}</div>
              <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",color:T.inkFaint,fontFamily:T.ff,marginTop:2,lineHeight:1}}>{l}</div>
            </div>
            {i<arr.length-1&&<span style={{fontSize:12,color:T.inkFaint,margin:"0 5px",lineHeight:1,marginTop:-4}}>·</span>}
          </div>
        ))}
      </div>
      {/* Filter + sort */}
      <div style={{padding:"0 22px 10px",display:"flex",alignItems:"center",gap:5}}>
        <div style={{display:"flex",gap:4,flex:1,overflowX:"auto"}}>
          {filters.map(({k,l})=>{
            const sel=filter===k;
            return <div key={k} onClick={()=>setFilter(k)} style={{padding:"4px 11px",borderRadius:20,border:`1px solid ${sel?T.signal:T.border}`,background:sel?"rgba(107,95,237,0.08)":"rgba(255,255,255,0.40)",fontSize:11,fontWeight:sel?700:600,color:sel?T.signal:T.inkSoft,cursor:"pointer",transition:"all .15s",fontFamily:T.ff,flexShrink:0,whiteSpace:"nowrap"}}>{l}</div>;
          })}
        </div>
        <div style={{position:"relative",flexShrink:0}}>
          <div onClick={()=>setSortOpen(o=>!o)} style={{display:"flex",alignItems:"center",gap:4,padding:"4px 9px",borderRadius:20,border:`1px solid ${T.border}`,background:"rgba(255,255,255,0.40)",cursor:"pointer"}}>
            <span style={{fontSize:11,color:T.inkSoft,fontFamily:T.ff}}>{sortLabels[sort]}</span>
            <svg width="9" height="9" viewBox="0 0 12 12" fill="none" style={{transform:sortOpen?"rotate(180deg)":"none",transition:"transform .15s"}}><path d="M2 4l4 4 4-4" stroke={T.inkSoft} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          {sortOpen&&(
            <div style={{position:"absolute",top:30,right:0,borderRadius:12,background:"rgba(254,252,249,0.98)",border:`1px solid ${T.border}`,boxShadow:"0 8px 24px rgba(26,22,18,0.14)",zIndex:30,overflow:"hidden",minWidth:130}}>
              {Object.entries(sortLabels).map(([k,l],i,a)=>(
                <div key={k} onClick={()=>{setSort(k);setSortOpen(false);}}
                  style={{padding:"9px 14px",fontSize:12,fontWeight:sort===k?700:400,color:sort===k?T.signal:T.ink,fontFamily:T.ff,cursor:"pointer",borderBottom:i<a.length-1?`1px solid rgba(224,216,208,0.5)`:"none",background:"transparent"}}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(107,95,237,0.04)"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>{l}</div>
              ))}
            </div>
          )}
        </div>
      </div>
      {showReceived&&recItems.length>0&&(<><SectionHead label="Received" count={recItems.length}/>{view==="grid"?renderGrid(recItems):renderList(recItems)}</>)}
      {showMine&&myItems.length>0&&(<><SectionHead label="My Kairos" count={myItems.length}/>{view==="grid"?renderGrid(myItems):renderList(myItems)}</>)}
      {/* Legend */}
      <div style={{display:"flex",gap:14,padding:"12px 22px 0",flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:12,height:16,background:"rgba(242,234,218,0.90)",border:"1px solid rgba(160,120,70,0.28)",flexShrink:0}}/><span style={{fontSize:9,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",color:T.inkFaint,fontFamily:T.ff}}>New</span></div>
        <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:12,height:16,background:"rgba(10,8,6,0.85)",border:"1.5px solid rgba(184,169,217,0.60)",flexShrink:0}}/><span style={{fontSize:9,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",color:T.inkFaint,fontFamily:T.ff}}>New whisper</span></div>
        <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:12,height:16,background:"rgba(138,132,128,0.18)",border:"1px solid rgba(138,132,128,0.28)",flexShrink:0,opacity:0.55}}/><span style={{fontSize:9,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",color:T.inkFaint,fontFamily:T.ff}}>Burned</span></div>
      </div>
    </div>
  );
}

// ── Kairos detail ─────────────────────────────────────────
function KairosDetail({k,onBack,onGive}){
  const isFossil=k.type==="fossil";
  const canGive=(k.type==="received"||k.type==="created_holding")&&!isFossil;
  const whisperSealed=k.whispers.length>=7;
  const heroW=375,heroH=Math.round(375/0.72);
  const [wr,wg,wb]=MOOD_TINT[k.mood]||MOOD_TINT[""];
  return(
    <div style={{flex:1,overflowY:"auto",padding:"0 0 56px"}}>
      {/* Hero card */}
      <div style={{width:"100%",aspectRatio:"0.72",position:"relative",overflow:"hidden",flexShrink:0}}>
        <CardSheen w={heroW} h={heroH} mood={k.mood} fossil={isFossil} style={{width:"100%",height:"100%"}}/>
        {/* Back btn — 44×44px */}
        <div onClick={onBack} style={{position:"absolute",top:14,left:14,width:44,height:44,borderRadius:"50%",background:"rgba(26,22,18,0.55)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",zIndex:10}}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12 5L7 10l5 5" stroke="rgba(250,248,245,0.80)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        {/* Status chips */}
        <div style={{position:"absolute",top:14,right:14,display:"flex",gap:6,zIndex:10}}>
          {isFossil&&<div style={{padding:"3px 10px",borderRadius:20,background:"rgba(160,48,32,0.22)",border:`1px solid rgba(160,48,32,0.38)`}}><span style={{fontSize:10,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",color:T.ember,fontFamily:T.ff}}>Fossil</span></div>}
          {k.type==="received"&&<div style={{padding:"3px 10px",borderRadius:20,background:"rgba(107,95,237,0.22)",border:`1px solid rgba(107,95,237,0.35)`}}><span style={{fontSize:10,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",color:"rgba(184,169,217,0.95)",fontFamily:T.ff}}>From @{k.from}</span></div>}
        </div>
        {/* Overlay serial */}
        <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"24px 22px 16px",background:"linear-gradient(to top,rgba(4,2,1,0.96) 0%,rgba(4,2,1,0) 55%)"}}>
          <div style={{display:"flex",alignItems:"baseline",fontFamily:"monospace,system-ui",marginBottom:4}}>
            <span style={{fontSize:20,fontWeight:700,color:`rgba(${wr},${wg},${wb},0.95)`}}>Æ{k.epoch||"01"}</span>
            <span style={{fontSize:18,fontWeight:400,color:`rgba(${wr},${wg},${wb},0.45)`,margin:"0 2px"}}>-</span>
            <span style={{fontSize:20,fontWeight:700,color:"rgba(250,248,245,0.90)"}}>{k.serial}</span>
          </div>
          <div style={{fontSize:12,color:`rgba(${wr},${wg},${wb},0.52)`,fontFamily:T.ff,display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
            {k.mood&&<><span>{k.mood}</span><span>·</span></>}
            <span>Flow {k.flow}</span>
            <span>·</span>
            <span>{toRomanDate(k.date)}</span>
          </div>
        </div>
      </div>

      <div style={{padding:"16px 22px 0"}}>
        {/* Give CTA — CeremonyCTA for transfer actions */}
        {canGive&&<div style={{marginBottom:20}}><CeremonyCTA label="Give this Kairos" onTap={()=>onGive(k)}/></div>}

        {/* KairosStrip */}
        <div style={{marginBottom:18}}><KairosStrip k={k}/></div>

        {/* Whispers */}
        <div style={{marginBottom:18}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
            <span style={{fontSize:11,fontWeight:700,letterSpacing:"0.06em",color:T.inkFaint,fontFamily:T.ff}}>Whispers</span>
            <span style={{fontSize:11,color:T.inkSoft,fontFamily:T.ff}}>{k.whispers.length} of 7</span>
          </div>
          {k.whispers.length>0
            ?<div style={{display:"flex",flexDirection:"column",gap:6}}>
              {k.whispers.map((w,i)=>(
                <div key={i} style={{padding:"11px 14px",borderRadius:12,background:"rgba(255,255,255,0.50)",border:`1px solid ${T.border}`}}>
                  <div style={{fontSize:13,lineHeight:1.70,color:T.ink,fontFamily:T.ff,marginBottom:8}}>{w.text}</div>
                  <div style={{display:"flex",alignItems:"center",gap:7,paddingTop:7,borderTop:`1px solid rgba(224,216,208,0.50)`}}>
                    <MemberAvatar handle={w.member} size={20}/>
                    <span style={{fontSize:11,fontWeight:700,color:T.inkMid,fontFamily:T.ff}}>@{w.member}</span>
                    <span style={{fontSize:11,color:T.inkFaint}}>·</span>
                    <span style={{fontSize:11,color:T.inkFaint,fontFamily:T.ff}}>{w.date}</span>
                  </div>
                </div>
              ))}
            </div>
            :<div style={{fontSize:13,color:T.inkFaint,fontFamily:T.ff}}>No whispers yet.</div>
          }
          {!isFossil&&whisperSealed&&<div style={{fontSize:12,color:T.inkFaint,fontFamily:T.ff,textAlign:"center",padding:"8px 0"}}>Sealed. No more whispers.</div>}
        </div>

        {isFossil&&<div style={{padding:"12px 14px",borderRadius:12,background:"rgba(160,48,32,0.04)",border:`1px solid rgba(160,48,32,0.16)`}}><div style={{fontSize:12,color:T.inkMid,lineHeight:1.7,fontFamily:T.ff}}>This Kairos burned on {k.burnDate}. Its record is permanent.</div></div>}
      </div>
    </div>
  );
}

// ── Give flow ─────────────────────────────────────────────
function StepRecipient({k,onNext,onBack}){
  const [query,setQuery]=useState("");
  const [recipient,setRecipient]=useState(null);
  const [focus,setFocus]=useState(false);
  const filtered=query.length>1?MEMBERS.filter(m=>m.toLowerCase().includes(query.toLowerCase())):[];
  return(
    <div style={{flex:1,overflowY:"auto",padding:"8px 22px 56px"}}>
      <BackBtn onTap={onBack}/>
      <div style={{marginBottom:16}}><GenieWash>This Kairos moves on. Choose who receives it.</GenieWash></div>
      <div style={{marginBottom:20}}><KairosStrip k={k}/></div>
      <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.06em",color:T.inkFaint,marginBottom:8,fontFamily:T.ff}}>Give to</div>
      <div style={{position:"relative",marginBottom:16}}>
        <input value={query} onChange={e=>{setQuery(e.target.value);setRecipient(null);}}
          onFocus={()=>setFocus(true)} onBlur={()=>setTimeout(()=>setFocus(false),150)}
          placeholder="Search by member name"
          style={{width:"100%",height:52,borderRadius:13,border:`1.5px solid ${focus?"rgba(214,228,240,0.90)":T.border}`,background:focus?"rgba(214,228,240,0.12)":"rgba(255,255,255,0.45)",boxShadow:focus?"0 0 0 3px rgba(184,169,217,0.14)":"none",padding:"0 16px",fontSize:14,color:T.ink,fontFamily:T.ff,outline:"none",caretColor:"rgba(184,169,217,0.85)",transition:"all .18s",boxSizing:"border-box"}}/>
        {focus&&filtered.length>0&&(
          <div style={{position:"absolute",top:56,left:0,right:0,borderRadius:12,background:"rgba(254,252,249,0.98)",border:`1px solid ${T.border}`,boxShadow:"0 8px 28px rgba(26,22,18,0.14)",zIndex:20,overflow:"hidden"}}>
            {filtered.slice(0,5).map((m,i)=>(
              <div key={m} onMouseDown={()=>{setQuery(m);setRecipient(m);setFocus(false);}}
                style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderBottom:i<Math.min(filtered.length,5)-1?`1px solid rgba(224,216,208,0.45)`:"none",cursor:"pointer"}}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(107,95,237,0.05)"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <MemberAvatar handle={m} size={32}/>
                <div><div style={{fontSize:13,fontWeight:700,color:T.ink,fontFamily:T.ff}}>{m}</div><div style={{fontSize:11,color:T.inkSoft,fontFamily:T.ff}}>aepoch.xyz/{m}</div></div>
              </div>
            ))}
          </div>
        )}
      </div>
      {recipient&&(
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",borderRadius:12,background:"rgba(255,255,255,0.55)",border:`1px solid ${T.border}`,marginBottom:20}}>
          <MemberAvatar handle={recipient} size={36}/>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:T.ink,fontFamily:T.ff}}>@{recipient}</div><div style={{fontSize:11,color:T.inkSoft,fontFamily:T.ff}}>aepoch.xyz/{recipient}</div></div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" fill="rgba(184,169,217,0.15)"/><path d="M4 8l2.5 2.5L12 5" stroke={T.prism} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      )}
      <PrimaryCTA label="Next" onTap={()=>recipient&&onNext(recipient)} disabled={!recipient}/>
    </div>
  );
}

function StepWhisper({k,recipient,onNext,onBack}){
  const [whisper,setWhisper]=useState("");
  const WHISPER_MAX=280,remaining=WHISPER_MAX-whisper.length;
  return(
    <div style={{flex:1,overflowY:"auto",padding:"8px 22px 56px"}}>
      <BackBtn onTap={onBack}/>
      <div style={{marginBottom:16}}><GenieWash>Leave a note. It travels with this Kairos forever.</GenieWash></div>
      <div style={{marginBottom:16}}><KairosStrip k={k}/></div>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20,padding:"8px 12px",borderRadius:10,background:"rgba(255,255,255,0.40)",border:`1px solid ${T.border}`}}>
        <MemberAvatar handle={recipient} size={24}/>
        <span style={{fontSize:12,color:T.inkSoft,fontFamily:T.ff}}>To</span>
        <span style={{fontSize:12,fontWeight:700,color:T.ink,fontFamily:T.ff}}>@{recipient}</span>
      </div>
      <div style={{position:"relative",marginBottom:4}}>
        <textarea value={whisper} onChange={e=>setWhisper(e.target.value.slice(0,WHISPER_MAX))}
          placeholder="Say something to whoever holds this next."
          rows={5} aria-label="Whisper message" aria-describedby="whisper-count"
          style={{width:"100%",borderRadius:13,border:`1.5px solid ${T.border}`,background:"rgba(255,255,255,0.55)",padding:"12px 14px",fontSize:14,lineHeight:1.65,color:T.ink,fontFamily:T.ff,resize:"none",outline:"none",caretColor:"rgba(184,169,217,0.85)",transition:"border-color .2s,background .2s,box-shadow .2s",boxSizing:"border-box"}}
          onFocus={e=>{e.target.style.borderColor="rgba(214,228,240,0.90)";e.target.style.background="rgba(214,228,240,0.12)";e.target.style.boxShadow="0 0 0 3px rgba(184,169,217,0.14)";}}
          onBlur={e=>{e.target.style.borderColor=T.border;e.target.style.background="rgba(255,255,255,0.55)";e.target.style.boxShadow="none";}}/>
        <div id="whisper-count" style={{position:"absolute",bottom:10,right:12,fontSize:11,fontFamily:T.ff,color:remaining<40?T.hearth:T.inkFaint,fontWeight:remaining<40?700:400,pointerEvents:"none"}} aria-live="polite">{remaining}</div>
      </div>
      <div style={{fontSize:11,color:T.inkSoft,lineHeight:1.6,marginBottom:24,fontFamily:T.ff}}>Only recorded if the transfer completes.</div>
      <div style={{display:"flex",flexDirection:"column",gap:4}}>
        <CeremonyCTA label="Continue to confirm" onTap={()=>onNext(whisper)}/>
        <Ghost label="Skip whisper" onTap={()=>onNext("")}/>
      </div>
    </div>
  );
}

function StepConfirm({k,recipient,whisper,onConfirm,onBack}){
  const romanDate=toRomanDate(k.date);
  const {epochPart,serialPart}=parseSerial(k.serial,k.epoch||"01");
  const rows=[
    {label:"Serial #",value:`${epochPart}-${serialPart}`},
    {label:"Epoch #",value:epochPart},
    {label:"Activated by",value:`@${k.activator||k.from||"nova"}`},
    {label:"Mood",value:k.mood||"· · ·"},
    {label:"Date",value:romanDate},
    {label:"To",value:`@${recipient}`},
    {label:"Whisper",value:whisper||"None",isWhisper:true},
  ];
  return(
    <div style={{flex:1,overflowY:"auto",padding:"8px 22px 56px"}}>
      <BackBtn onTap={onBack}/>
      <div style={{marginBottom:16}}><GenieWash>Check this. It can't be undone.</GenieWash></div>
      <div style={{marginBottom:20}}><KairosStrip k={k}/></div>
      <div style={{borderRadius:14,background:"rgba(255,255,255,0.55)",border:`1px solid ${T.border}`,overflow:"hidden",marginBottom:12}}>
        {rows.map(({label,value,isWhisper},i,arr)=>(
          <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"11px 16px",borderBottom:i<arr.length-1?`1px solid rgba(224,216,208,0.50)`:"none"}}>
            <span style={{fontSize:12,color:T.inkSoft,fontFamily:T.ff,flexShrink:0,marginRight:16}}>{label}</span>
            <span style={{fontSize:13,fontWeight:isWhisper?400:700,color:value==="None"?T.inkFaint:T.ink,fontFamily:T.ff,fontStyle:isWhisper&&value!=="None"?"italic":"normal",textAlign:"right",wordBreak:"break-word",maxWidth:"65%",lineHeight:1.55}}>{value}</span>
          </div>
        ))}
      </div>
      <div style={{padding:"11px 14px",borderRadius:12,background:"rgba(139,94,47,0.05)",border:`1px solid rgba(139,94,47,0.18)`,marginBottom:24}}>
        <div style={{fontSize:12,color:T.hearth,lineHeight:1.65,fontFamily:T.ff}}>This cannot be undone. The Kairos — and any whisper — transfers permanently.</div>
      </div>
      <CeremonyCTA label="Give this Kairos" onTap={onConfirm}/>
    </div>
  );
}

function StepDone({k,recipient,onReset}){
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 22px 56px",gap:20}}>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none"><circle cx="28" cy="28" r="26" fill="rgba(196,131,90,0.12)" stroke={T.clay} strokeWidth="1.4"/><path d="M16 28l9 9 15-15" stroke={T.clay} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        <span style={{fontSize:34,fontWeight:800,letterSpacing:"-0.03em",color:T.ink,fontFamily:T.ff,lineHeight:1}}>Sent.</span>
      </div>
      <GenieWash>It's on its way to @{recipient}.</GenieWash>
      <div onClick={onReset} style={{fontSize:13,fontWeight:700,color:T.inkSoft,fontFamily:T.ff,cursor:"pointer",padding:"10px 0"}}>Back to Collection</div>
    </div>
  );
}

function GiveFlow({k,onBack,onComplete}){
  const [step,setStep]=useState("recipient");
  const [recipient,setRecipient]=useState(null);
  const [whisper,setWhisper]=useState("");
  return(
    <>
      {step==="recipient"&&<StepRecipient k={k} onBack={onBack} onNext={r=>{setRecipient(r);setStep("whisper");}}/>}
      {step==="whisper"&&<StepWhisper k={k} recipient={recipient} onBack={()=>setStep("recipient")} onNext={w=>{setWhisper(w);setStep("confirm");}}/>}
      {step==="confirm"&&<StepConfirm k={k} recipient={recipient} whisper={whisper} onBack={()=>setStep("whisper")} onConfirm={()=>setStep("done")}/>}
      {step==="done"&&<StepDone k={k} recipient={recipient} onReset={onComplete}/>}
    </>
  );
}

// ── Root app ──────────────────────────────────────────────
export default function App(){
  const [screen,setScreen]=useState("home");
  const [selectedK,setSelectedK]=useState(null);
  const W=375;

  useEffect(()=>{
    const l=document.createElement("link");l.rel="stylesheet";
    l.href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap";
    document.head.appendChild(l);
  },[]);

  return(
    <div style={{background:"#E4E1DC",minHeight:"100vh",padding:"24px 16px 48px",fontFamily:T.ff,display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
      <div style={{width:W}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:".10em",textTransform:"uppercase",color:T.inkSoft,fontFamily:"system-ui"}}>ÆPOCH · Collection</div>
        <div style={{fontSize:20,fontWeight:800,letterSpacing:"-.025em",color:T.ink}}>Collection — v1.4</div>
      </div>

      <div style={{position:"relative",width:W,height:693,flexShrink:0}}>
        <div style={{position:"absolute",top:8,left:10,right:10,bottom:-8,borderRadius:44,background:"rgba(200,192,184,0.55)",border:"1px solid rgba(180,172,164,0.4)"}}/>
        <div style={{position:"absolute",top:4,left:5,right:5,bottom:-4,borderRadius:44,background:"rgba(210,204,196,0.70)",border:"1px solid rgba(190,184,176,0.5)"}}/>
        <div style={{position:"absolute",inset:0,borderRadius:44,overflow:"hidden",background:"#FEFCF9",
          boxShadow:"0 2px 4px rgba(0,0,0,.06),0 24px 72px rgba(0,0,0,.16),inset 0 0 0 1px rgba(0,0,0,.05)",
          display:"flex",flexDirection:"column"}}>
          <EarthRiseBG w={W} h={693}/>
          <Grain/>
          <div style={{position:"relative",zIndex:5,display:"flex",flexDirection:"column",height:"100%",overflow:"hidden"}}>
            <StatusBar/>
            {screen==="home"&&(
              <CollectionHome onSelect={k=>{setSelectedK(k);setScreen("detail");}}/>
            )}
            {screen==="detail"&&selectedK&&(
              <KairosDetail k={selectedK} onBack={()=>setScreen("home")} onGive={k=>{setSelectedK(k);setScreen("give");}}/>
            )}
            {screen==="give"&&selectedK&&(
              <GiveFlow k={selectedK} onBack={()=>setScreen("detail")} onComplete={()=>setScreen("home")}/>
            )}
          </div>
        </div>
      </div>

      <div style={{fontSize:10,color:T.inkSoft,fontFamily:"system-ui",letterSpacing:".05em",width:W}}>
        260318-ÆPOCH-Collection-v1.4-0000 · All critique fixes · KairosStrip · Envelope New state · Comet whisper · Fossil = opacity only
      </div>
    </div>
  );
}
