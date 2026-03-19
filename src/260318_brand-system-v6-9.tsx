import { useState, useEffect, useRef, Fragment } from "react";

const T = {
  Clay:"#C4835A", Ochre:"#A0673A", Loam:"#7A5230", Sand:"#E8C9A0",
  Pearl:"#D6E4F0", Iris:"#8BAFD4", Prism:"#B8A9D9",
  Signal:"#6B5FED", Glow:"#9B8FF5", Pulse:"#C4B8FF",
  Moss:"#4CAF82",
  Hearth:"#8B5E2F", Ember:"#A03020",
  Paper:"#FAF8F5", White:"#FFFFFF", Mist:"#F3F0EB",
  Ink:"#1A1612", InkMid:"#4A4440", InkSoft:"#8A8480",
  InkFaint:"#C4BEB8", Border:"#E0D8D0",
  Void:"#0C0B0A", Depth:"#141210", Dusk:"#1E1B18", Slate:"#2E2A26",
  SnowFull:"#F3F0EB", SnowMid:"#B0A89E", SnowSoft:"#6A6460",
  DeepInk:"#2A2520",
};

const LAMP_PATH = "M363.183,140.661c-85.913,23.041-109.339,13.599-133.812,2.597c-2.822-13.106-26.66-23.626-57.081-25.428c0.367-1.429,0.577-2.961,0.577-4.564c0-0.096-0.009-0.188-0.01-0.284c2.499-2.512,4.043-5.972,4.043-9.795c0-7.667-6.219-13.887-13.893-13.887c-7.664,0-13.879,6.22-13.879,13.887c0,3.818,1.541,7.275,4.032,9.787c-0.001,0.098-0.011,0.194-0.011,0.293c0,1.604,0.211,3.135,0.578,4.564c-32.412,1.92-57.363,13.739-57.363,28.038c0,0.558,0.048,1.111,0.123,1.661c-0.024-0.013-0.05-0.025-0.074-0.038c0,0-2.876,3.007-6.214,6.542c-2.099,1.937-4.05,3.962-5.852,6.062c-7.141-11.477-11.122-25.315-22.562-34.951C19,90.727-29.463,160.778,22.603,185.041c7.399,3.521,17.728,9.009,26.595,15.518c-5.281,2.648-8.967,7.977-9.287,14.206c-0.239,1.815,0,3.715,0.633,5.57c2.037,7.03,8.512,12.176,16.196,12.176c0.622,0,1.234-0.039,1.838-0.104c5.806-0.467,12.106-4.17,17.57-13.123c9.453,18.464,29.7,33.102,55.159,39.847c-4.895,2.508-9.012,5.576-12.062,9.058c-10.756,4.56-17.379,10.793-17.379,17.669c0,13.976,27.375,25.305,61.141,25.305c33.779,0,61.152-11.329,61.152-25.305c0-6.876-6.633-13.109-17.385-17.669c-2.36-2.697-5.374-5.14-8.88-7.275c90.357-12.563,105.183-74.425,201.134-106.432C406.32,150.355,384.445,135.98,363.183,140.661zM71.029,187.523c-15.962-12.769-45.612-19.846-46.192-36.544c-0.368-14.304,20.224-16.983,30.73-9.805c10.475,6.442,16.079,17.24,23.878,25.392C75.165,173.045,72.269,180.099,71.029,187.523zM212.551,168.292c-14.002,5.949-32.82,9.226-52.986,9.226c-31.716,0-54.717-7.012-64.628-15.095c1.201-1.278,2.405-2.552,3.505-3.713c16.218,7.102,38.017,11.103,61.124,11.103c28.398,0,54.262-5.942,70.704-16.069c0.005,0.003,0.01,0.004,0.016,0.007C229.392,158.42,222.631,164.009,212.551,168.292z";

const LANGUAGES = [
  {key:"en_gb",abbr:"EN",label:"English",sublabel:"UK"},
  {key:"en_us",abbr:"EN",label:"English",sublabel:"US"},
  {key:"pt_br",abbr:"PT",label:"Português",sublabel:"BR"},
  {key:"es_419",abbr:"ES",label:"Español",sublabel:"Latinoamérica"},
  {key:"fr",abbr:"FR",label:"Français",sublabel:"France"},
  {key:"ar",abbr:"ع",label:"العربية",sublabel:"Arabic"},
  {key:"zh_cn",abbr:"文",label:"中文",sublabel:"Simplified"},
  {key:"hi",abbr:"हि",label:"हिन्दी",sublabel:"Hindi"},
  {key:"sw",abbr:"SW",label:"Kiswahili",sublabel:"Swahili"},
];

const MOOD_TINT = {
  "Joyful":[232,195,88],"Trusting":[100,185,155],"Scared":[95,80,155],
  "Amazed":[245,175,48],"Sad":[88,108,175],"Disgusted":[88,128,58],
  "Grateful":[215,148,98],"Angry":[215,48,32],"Hopeful":[148,195,88],
  "Calm":[118,148,195],"In Awe":[148,118,215],"Reflective":[140,120,185],
  "":[200,175,130],
};

const ff = "'DM Sans',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif";
const SECTIONS = ["Colour","Typography","Voice","Buttons","Links","Chat","Motion","Icons","Navigation","Genie Presence","Form Fields","Home Screen","Ceremonial","Wallet Components","Collection","Pending"];

const AVATAR_COLS = ["#C4835A","#8BAFD4","#B8A9D9","#4CAF82","#A0673A","rgba(107,95,237,0.85)"];
function avatarCol(h){const s=(h||"").split("").reduce((a,c)=>a+c.charCodeAt(0),0);return AVATAR_COLS[s%AVATAR_COLS.length];}

function toRoman(n){const v=[1000,900,500,400,100,90,50,40,10,9,5,4,1];const s=["M","CM","D","CD","C","XC","L","XL","X","IX","V","IV","I"];let r="";v.forEach((val,i)=>{while(n>=val){r+=s[i];n-=val;}});return r;}
const MONTH_NUM={"Jan":1,"Feb":2,"Mar":3,"Apr":4,"May":5,"Jun":6,"Jul":7,"Aug":8,"Sep":9,"Oct":10,"Nov":11,"Dec":12};
function toRomanDate(d){const p=d.split(" ");if(p.length!==3)return d;const dd=parseInt(p[0]),m=MONTH_NUM[p[1]],y=parseInt(p[2]);if(!dd||!m||!y)return d;return`${toRoman(dd)} · ${toRoman(m)} · ${toRoman(y)}`;}

function LangRowSingleLine({ lang, dark }) {
  const [sel,setSel]=useState(false);
  return(
    <button onClick={()=>setSel(s=>!s)} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"9px 12px",background:sel?"rgba(107,95,237,0.05)":"transparent",border:`1px solid ${sel?T.Signal:T.Border}`,borderRadius:10,cursor:"pointer",transition:"all 0.15s",textAlign:"left"}}>
      <div style={{width:42,height:28,borderRadius:8,border:`1.5px solid ${sel?T.Signal:T.Border}`,background:sel?"rgba(107,95,237,0.07)":T.Mist,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <span style={{fontSize:11,fontWeight:800,color:sel?T.Signal:T.InkSoft,fontFamily:ff,direction:lang.key==="ar"?"rtl":"ltr"}}>{lang.abbr}</span>
      </div>
      <span style={{fontSize:12,fontWeight:400,color:sel?T.Signal:T.InkMid,flex:1,fontFamily:ff}}>{lang.label}</span>
      <span style={{fontSize:12,color:T.InkFaint,fontFamily:ff,flexShrink:0}}>· {lang.sublabel}</span>
      {sel&&<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" fill={T.Signal} opacity={0.12}/><polyline points="3.5,7 6,9.5 10.5,4.5" stroke={T.Signal} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
    </button>
  );
}

function DrawerDemo({ dark }) {
  const [open,setOpen]=useState(false);
  const [active,setActive]=useState("home");
  const primaryNav=[
    {key:"home",label:"Home",Icon:IconHome},
    {key:"collection",label:"Collection",Icon:({size,color})=><IconCollectionDotGrid size={size} color={color}/>},
    {key:"wallet",label:"Wallet",Icon:IconWallet},
  ];
  const secondaryNav=[
    {key:"support",label:"Support",Icon:IconSupport},
    {key:"findmembers",label:"Find Members",Icon:IconFindMembers},
  ];
  return(
    <div style={{position:"relative",width:"100%",maxWidth:360,height:500,background:"#FEFCF9",borderRadius:16,overflow:"hidden",border:`1px solid ${T.Border}`,marginBottom:16}}>
      {open&&<div onClick={()=>setOpen(false)} style={{position:"absolute",inset:0,background:"rgba(26,22,18,0.36)",zIndex:10,transition:"opacity 0.3s"}}/>}
      <div style={{padding:24}}>
        <div style={{fontSize:12,fontWeight:700,color:T.InkSoft,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8,fontFamily:ff}}>Home</div>
        <div style={{height:80,borderRadius:12,background:T.Mist,marginBottom:12}}/>
        <div style={{height:48,borderRadius:10,background:T.Mist,marginBottom:8}}/>
        <div style={{height:48,borderRadius:10,background:T.Mist}}/>
      </div>
      <div onClick={()=>setOpen(true)} style={{position:"absolute",bottom:20,right:20,width:44,height:44,borderRadius:"50%",background:T.White,border:`1px solid ${T.Border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",zIndex:5,boxShadow:"0 2px 8px rgba(26,22,18,0.12)"}}>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",justifyContent:"center",gap:5,width:20,height:16}}>
          <i style={{display:"block",width:20,height:2,background:T.InkMid,borderRadius:2,fontStyle:"normal"}}/>
          <i style={{display:"block",width:20,height:2,background:T.InkMid,borderRadius:2,fontStyle:"normal"}}/>
          <i style={{display:"block",width:20,height:2,background:T.InkMid,borderRadius:2,fontStyle:"normal"}}/>
        </div>
      </div>
      <div style={{position:"absolute",top:0,left:0,bottom:0,width:260,background:"#FEFCF9",zIndex:20,transform:open?"translateX(0)":"translateX(-100%)",transition:"transform 0.30s cubic-bezier(0.4,0,0.2,1)",boxShadow:open?"4px 0 24px rgba(26,22,18,0.12)":"none",display:"flex",flexDirection:"column"}}>
        <div style={{position:"relative",flex:1,display:"flex",flexDirection:"column",padding:"24px 0"}}>
          <div style={{padding:"0 20px 20px",borderBottom:`1px solid ${T.Border}`}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:T.InkFaint,fontFamily:ff}}>ÆPOCH</div>
          </div>
          <div style={{padding:"16px 16px 8px"}}>
            <button style={{width:"100%",height:44,borderRadius:12,background:T.DeepInk,color:"#FAF8F5",fontSize:13,fontWeight:700,border:"none",cursor:"pointer",fontFamily:ff}}>Activate Kairos</button>
          </div>
          <div style={{padding:"8px 12px"}}>
            {primaryNav.map(({key,label,Icon})=>{
              const isSel=active===key;
              return(
                <button key={key} onClick={()=>setActive(key)} style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"8px",borderRadius:10,background:"none",border:"none",cursor:"pointer"}}>
                  <div style={{width:44,height:44,borderRadius:"50%",background:isSel?"rgba(107,95,237,0.10)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"background 0.15s"}}>
                    <Icon size={22} color={isSel?T.Signal:T.InkSoft}/>
                  </div>
                  <span style={{fontSize:14,fontWeight:isSel?700:400,color:isSel?T.Signal:T.InkMid,fontFamily:ff}}>{label}</span>
                </button>
              );
            })}
          </div>
          <div style={{height:1,background:T.Border,margin:"4px 20px"}}/>
          <div style={{padding:"4px 12px"}}>
            {secondaryNav.map(({key,label,Icon})=>{
              const isSel=active===key;
              return(
                <button key={key} onClick={()=>setActive(key)} style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"8px",borderRadius:10,background:"none",border:"none",cursor:"pointer"}}>
                  <div style={{width:44,height:44,borderRadius:"50%",background:isSel?"rgba(107,95,237,0.10)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <Icon size={20} color={isSel?T.Signal:T.InkSoft}/>
                  </div>
                  <span style={{fontSize:13,fontWeight:isSel?700:400,color:isSel?T.Signal:T.InkMid,fontFamily:ff}}>{label}</span>
                </button>
              );
            })}
          </div>
          <div style={{flex:1}}/>
          <div style={{padding:"12px 20px",borderTop:`1px solid ${T.Border}`,display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:40,height:40,borderRadius:"50%",background:"rgba(107,95,237,0.08)",border:"1.5px solid rgba(107,95,237,0.20)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer"}}>
              <IconProfile size={22} color={T.Signal}/>
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:T.Ink,fontFamily:ff}}>@nova</div>
              <div style={{fontSize:11,color:T.InkSoft,fontFamily:ff}}>Tap to open Profile</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconSearch({ size=24, color }) {
  const c=color||T.InkSoft,lR=size*0.28,lCX=size*0.38,lCY=size*0.38;
  const angle=Math.PI*0.75;const hx1=lCX+Math.cos(angle)*lR,hy1=lCY+Math.sin(angle)*lR;
  const hx2=lCX+Math.cos(angle)*(lR+size*0.28),hy2=lCY+Math.sin(angle)*(lR+size*0.28);
  const vH=lR*0.7,vW=lR*0.28;
  const vesica=`M ${lCX} ${lCY-vH/2} C ${lCX+vW} ${lCY-vH/2} ${lCX+vW} ${lCY+vH/2} ${lCX} ${lCY+vH/2} C ${lCX-vW} ${lCY+vH/2} ${lCX-vW} ${lCY-vH/2} ${lCX} ${lCY-vH/2} Z`;
  return(<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx={lCX} cy={lCY} r={lR} stroke={c} strokeWidth={1.7} fill={c} fillOpacity={0.05}/><path d={vesica} stroke={c} strokeWidth={1.1} opacity={0.5}/><line x1={hx1} y1={hy1} x2={hx2} y2={hy2} stroke={c} strokeWidth={1.8}/></svg>);
}
function IconSettings({ size=24, color }) {
  const c=color||T.InkSoft;
  const rows=[{y:size*0.25,hx:size*0.32},{y:size*0.50,hx:size*0.62},{y:size*0.75,hx:size*0.44}];
  return(<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" strokeLinecap="round">{rows.map((row,i)=>(<g key={i}><line x1={size*0.08} y1={row.y} x2={size*0.92} y2={row.y} stroke={c} strokeWidth={1.4} opacity={0.45}/><circle cx={row.hx} cy={row.y} r={size*0.09} stroke={c} strokeWidth={1.5} fill={c} fillOpacity={0.12}/></g>))}</svg>);
}

function SectionLabel({ children, dark }) {
  return <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.09em",textTransform:"uppercase",color:dark?T.SnowSoft:T.Signal,marginBottom:14,marginTop:32}}>{children}</div>;
}
function SubLabel({ children, dark }) {
  return <div style={{fontSize:12,color:dark?T.SnowSoft:T.InkFaint,margin:"-8px 0 16px",lineHeight:1.6}}>{children}</div>;
}
function SpecTable({ rows, dark }) {
  const surf=dark?T.Depth:T.White,brd=dark?T.Slate:T.Border,txt=dark?T.SnowFull:T.Ink,sub=dark?T.SnowMid:T.InkSoft;
  return(
    <div style={{background:surf,border:`1px solid ${brd}`,borderRadius:14,padding:20,marginBottom:16}}>
      {rows.map(([k,v])=>(
        <div key={k} style={{display:"flex",gap:16,borderBottom:`1px solid ${brd}`,padding:"8px 0",fontSize:12}}>
          <span style={{minWidth:160,fontWeight:600,color:txt,flexShrink:0,fontFamily:ff}}>{k}</span>
          <span style={{color:sub,lineHeight:1.6,fontFamily:ff}}>{v}</span>
        </div>
      ))}
    </div>
  );
}

function MicWaveform({ size=54, active=false }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas=ref.current;const dpr=window.devicePixelRatio||1,W=size*dpr,H=size*dpr;
    canvas.width=W;canvas.height=H;canvas.style.width=size+"px";canvas.style.height=size+"px";
    const ctx=canvas.getContext("2d");
    const bW=W*0.055,gap=W*0.06,n=5;const sx=(W-(n*bW+(n-1)*gap))/2,cy=H/2;
    const bc=[{t:T.Clay,b:T.Sand},{t:T.Glow,b:T.Pulse},{t:T.Signal,b:T.Prism},{t:T.Glow,b:T.Pulse},{t:T.Clay,b:T.Sand}];
    const ih=[0.22,0.36,0.48,0.36,0.22],ab=[0.38,0.62,0.85,0.62,0.38];
    const ph=[0,1.2,2.4,3.6,4.8],sp=[1.1,1.4,1.7,1.4,1.1];
    const unavail=active==="unavailable",isActive=active===true;
    function draw(t){
      ctx.clearRect(0,0,W,H);
      for(let i=0;i<n;i++){
        const x=sx+i*(bW+gap);let h,fs,alpha;
        if(unavail){h=bW;fs=T.InkFaint;alpha=1;}
        else if(isActive){h=Math.max(0.08,ab[i]+Math.sin(t*sp[i]*3.5+ph[i])*0.35)*H;const g=ctx.createLinearGradient(x,cy-h/2,x,cy+h/2);g.addColorStop(0,bc[i].t);g.addColorStop(1,bc[i].b);fs=g;alpha=1;}
        else{h=(ih[i]+Math.sin(t*0.9+ph[i]*0.5)*0.06)*H;const g=ctx.createLinearGradient(x,cy-h/2,x,cy+h/2);g.addColorStop(0,bc[i].t);g.addColorStop(1,bc[i].b);fs=g;alpha=0.55;}
        ctx.beginPath();ctx.roundRect(x,cy-h/2,bW,h,bW/2);ctx.fillStyle=fs;ctx.globalAlpha=alpha;ctx.fill();ctx.globalAlpha=1;
      }
    }
    let id;function loop(ts){draw(ts/1000);id=requestAnimationFrame(loop);}id=requestAnimationFrame(loop);
    return()=>cancelAnimationFrame(id);
  },[active,size]);
  return <canvas ref={ref} style={{display:"block",borderRadius:size/2}}/>;
}

function IconGenieLamp({ size=28, color, sw=1.6 }) {
  const c=color||T.Ink,sw2=sw*(400.461/size);
  return(<svg width={size} height={size} viewBox="0 0 400.461 400.461" fill="none" strokeLinecap="round" strokeLinejoin="round" stroke={c} strokeWidth={sw2}><g transform="translate(400.461,0) scale(-1,1)"><path d={LAMP_PATH}/></g></svg>);
}
function SummoningLamp({ size=56 }) {
  const ref=useRef(null);
  useEffect(()=>{
    const canvas=ref.current;const dpr=window.devicePixelRatio||1;const W=size*dpr,H=size*dpr;canvas.width=W;canvas.height=H;canvas.style.width=size+"px";canvas.style.height=size+"px";
    const ctx=canvas.getContext("2d");const sx=W*0.093,sy=H*0.352;
    const wc=[[107,95,237],[196,131,90],[184,169,217]];const CC=[[107,95,237],[155,143,245],[184,169,217],[196,131,90],[232,201,160]];
    function draw(t){
      ctx.clearRect(0,0,W,H);const cx=W*0.48,cy=H*0.52,r=W*0.22;
      wc.forEach((c,wi)=>{ctx.beginPath();for(let i=0;i<=180;i++){const a=(i/180)*Math.PI*2;const d=Math.sin(1.2*a*5+t*(0.9+wi*0.4)+wi*1.4)*Math.cos(1.2*a*2.5)*0.1;const rad=r*(1+d);i===0?ctx.moveTo(cx+Math.cos(a)*rad,cy+Math.sin(a)*rad):ctx.lineTo(cx+Math.cos(a)*rad,cy+Math.sin(a)*rad);}ctx.closePath();ctx.strokeStyle=`rgba(${c[0]},${c[1]},${c[2]},${0.15+0.07*Math.sin(t+wi)})`;ctx.lineWidth=0.7*dpr;ctx.stroke();});
      for(let s=0;s<5;s++){const phase=(t*0.6+s*0.2)%1;const rgb=CC[s%5];for(let i=0;i<20;i++){const p0=i/20,p1=(i+1)/20;const x0=sx+Math.sin((p0+phase)*Math.PI*3+s*1.2)*W*0.07-p0*W*0.04;const y0=sy-p0*H*0.65;const x1=sx+Math.sin((p1+phase)*Math.PI*3+s*1.2)*W*0.07-p1*W*0.04;const y1=sy-p1*H*0.65;ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.strokeStyle=`rgba(${rgb[0]},${rgb[1]},${rgb[2]},${(1-p0)*0.75})`;ctx.lineWidth=Math.max(0.5,(1-p0)*W*0.05);ctx.lineCap="round";ctx.stroke();}}
    }
    let id;function loop(ts){draw(ts/1000);id=requestAnimationFrame(loop);}id=requestAnimationFrame(loop);
    return()=>cancelAnimationFrame(id);
  },[size]);
  return(<div style={{position:"relative",width:size,height:size,display:"flex",alignItems:"center",justifyContent:"center"}}><canvas ref={ref} style={{position:"absolute",inset:0,borderRadius:"50%"}}/><div style={{position:"relative",zIndex:1}}><IconGenieLamp size={size*0.7} color="rgba(107,95,237,0.85)" sw={1.4}/></div></div>);
}

function IconHome({ size=24, color }) {
  const c=color||T.InkSoft;
  return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx={9.5} cy={12} r={6.5} stroke={c} strokeWidth={1.6}/><circle cx={14.5} cy={12} r={6.5} stroke={c} strokeWidth={1.6}/></svg>);
}
function IconWallet({ size=24, color }) {
  const c=color||T.InkSoft;
  return(<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x={size*0.18} y={size*0.16} width={size*0.68} height={size*0.38} rx={size*0.08} stroke={c} strokeWidth={1.3} opacity={0.35}/><rect x={size*0.13} y={size*0.27} width={size*0.74} height={size*0.40} rx={size*0.08} stroke={c} strokeWidth={1.4} opacity={0.60}/><rect x={size*0.10} y={size*0.38} width={size*0.80} height={size*0.50} rx={size*0.08} stroke={c} strokeWidth={1.6} fill={c} fillOpacity={0.06}/></svg>);
}
function IconCollectionDotGrid({ size=20, color }) {
  const c=color||T.InkSoft;const isSignal=color===T.Signal;const dotR=size*0.075;const dots=[];
  for(let row=0;row<3;row++){for(let col=0;col<3;col++){const idx=row*3+col;const baseOp=0.18+(idx/8)*0.82;const cx2=size*0.18+col*(size*0.32);const cy2=size*0.18+row*(size*0.32);dots.push({cx:cx2,cy:cy2,op:baseOp,isLast:idx===8});}}
  return(<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">{dots.map((d,i)=>(<circle key={i} cx={d.cx} cy={d.cy} r={dotR} fill={d.isLast&&isSignal?T.Signal:c} opacity={d.op}/>))}</svg>);
}
function IconFindMembers({ size=24, color }) {
  const c=color||T.InkSoft;const cx=size*0.42,headCY=size*0.36,headR=size*0.17;const shoulderR=size*0.24,shoulderY=size*0.72;const pX=size*0.76,pY=size*0.24,pArm=size*0.12;
  return(<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx={cx} cy={headCY} r={headR} stroke={c} strokeWidth={1.6}/><path d={`M ${cx-shoulderR} ${shoulderY} Q ${cx} ${shoulderY-size*0.08} ${cx+shoulderR} ${shoulderY}`} stroke={c} strokeWidth={1.6}/><line x1={pX} y1={pY-pArm} x2={pX} y2={pY+pArm} stroke={c} strokeWidth={1.8}/><line x1={pX-pArm} y1={pY} x2={pX+pArm} y2={pY} stroke={c} strokeWidth={1.8}/></svg>);
}
function IconSupport({ size=24, color }) {
  const c=color||T.InkSoft;const cx=size/2,cy=size/2,r=size*0.44;const qArcR=size*0.10;
  return(<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx={cx} cy={cy} r={r} stroke={c} strokeWidth={1.6}/><path d={`M ${cx-qArcR} ${cy-size*0.14} Q ${cx-qArcR} ${cy-size*0.27} ${cx} ${cy-size*0.27} Q ${cx+qArcR} ${cy-size*0.27} ${cx+qArcR} ${cy-size*0.14} Q ${cx+qArcR} ${cy+size*0.02-size*0.02} ${cx} ${cy+size*0.02}`} stroke={c} strokeWidth={1.5}/><circle cx={cx} cy={cy+size*0.20} r={size*0.045} fill={c}/></svg>);
}
function IconSpeaker({ size=24, active=true }) {
  const ref=useRef(null);
  useEffect(()=>{
    if(!active)return;
    let id;const el=ref.current;if(!el)return;
    function loop(ts){const t=ts/1000;const o=el.querySelector(".arc-outer");const i=el.querySelector(".arc-inner");if(o)o.style.opacity=0.55+0.45*Math.sin(t*1.4);if(i)i.style.opacity=0.75+0.25*Math.sin(t*1.4+0.8);id=requestAnimationFrame(loop);}
    id=requestAnimationFrame(loop);return()=>cancelAnimationFrame(id);
  },[active]);
  const c=active?T.Signal:T.Ink;
  return(<svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9.5v5h3.5L12 19V5L7.5 9.5H4z" stroke={c} strokeWidth={1.6}/><path className="arc-inner" d="M15.5 8.5a4.5 4.5 0 0 1 0 7" stroke={c} strokeWidth={1.6}/><path className="arc-outer" d="M18.5 5.5a8.5 8.5 0 0 1 0 13" stroke={c} strokeWidth={1.6}/></svg>);
}
function IconSpeakerOff({ size=24 }) {
  return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9.5v5h3.5L12 19V5L7.5 9.5H4z" stroke={T.InkSoft} strokeWidth={1.6}/><line x1={16} y1={9} x2={22} y2={15} stroke={T.InkSoft} strokeWidth={1.6}/><line x1={22} y1={9} x2={16} y2={15} stroke={T.InkSoft} strokeWidth={1.6}/></svg>);
}
function IconKeyboard({ size=24, color, dismiss=false }) {
  const c=color||T.Ink;
  if(dismiss)return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1={12} y1={5} x2={12} y2={17} stroke={c} strokeWidth={1.8}/><polyline points="7,13 12,18 17,13" stroke={c} strokeWidth={1.8}/></svg>);
  return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x={2} y={6} width={20} height={12} rx={2} stroke={c} strokeWidth={1.7}/>{[5,8,11,14,17].map(x=><line key={x} x1={x+0.5} y1={10.5} x2={x+0.5} y2={12.5} stroke={c} strokeWidth={1.5}/>)}<line x1={8} y1={15.5} x2={16} y2={15.5} stroke={c} strokeWidth={1.7}/></svg>);
}
function IconActivateKairos({ size=48, animated=true }) {
  const ref=useRef(null);const isSmall=size<=28;
  useEffect(()=>{
    if(!animated)return;let id;const el=ref.current;if(!el)return;
    function loop(ts){const t=ts/1000;if(!isSmall){el.querySelectorAll(".ray").forEach((r,i)=>{r.style.opacity=0.25+0.45*Math.sin(t*1.5+i*0.7);});}const lens=el.querySelector(".lens");if(lens)lens.style.opacity=0.82+0.18*Math.sin(t*2.0);const dot=el.querySelector(".centre-dot");if(dot)dot.style.opacity=0.8+0.2*Math.sin(t*2.6+0.5);id=requestAnimationFrame(loop);}
    id=requestAnimationFrame(loop);return()=>cancelAnimationFrame(id);
  },[animated,isSmall]);
  const cx=size/2,cy=size/2,lH=size*0.44,lW=size*0.20;
  const lensPath=`M ${cx} ${cy-lH/2} C ${cx+lW} ${cy-lH/2} ${cx+lW} ${cy+lH/2} ${cx} ${cy+lH/2} C ${cx-lW} ${cy+lH/2} ${cx-lW} ${cy-lH/2} ${cx} ${cy-lH/2} Z`;
  const rayAngles=[30,60,90,120,150,210,240,270,300,330];const rIn=size*0.28,rOut=size*0.44;
  return(<svg ref={ref} width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" strokeLinecap="round"><defs><linearGradient id={`vg${size}`} x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor={T.Glow}/><stop offset="100%" stopColor={T.Clay}/></linearGradient></defs>{!isSmall&&rayAngles.map((deg,i)=>{const rad=(deg*Math.PI)/180;return<line key={i} className="ray" x1={cx+Math.cos(rad)*rIn} y1={cy+Math.sin(rad)*rIn} x2={cx+Math.cos(rad)*rOut} y2={cy+Math.sin(rad)*rOut} stroke={T.Signal} strokeWidth={1.1} opacity={0.35}/>;})}<path className="lens" d={lensPath} stroke={`url(#vg${size})`} strokeWidth={isSmall?1.6:1.8} fill={T.Signal} fillOpacity={0.1}/><circle className="centre-dot" cx={cx} cy={cy} r={isSmall?size*0.07:size*0.06} fill={`url(#vg${size})`}/></svg>);
}
function IconCollectionMark({ size=48 }) {
  const dotR=size*0.075,pad=size*0.18,step=(size-pad*2)/2,dots=[];
  for(let row=0;row<3;row++){for(let col=0;col<3;col++){const idx=row*3+col;const op=0.18+(idx/8)*0.82;dots.push({cx:pad+col*step,cy:pad+row*step,op,last:idx===8});}}
  return(<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">{dots.map((d,i)=>(<circle key={i} cx={d.cx} cy={d.cy} r={dotR} fill={T.Signal} opacity={d.op}/>))}</svg>);
}
function ManifestLamp({ size=56 }) {
  const ref=useRef(null);
  useEffect(()=>{
    const canvas=ref.current;const dpr=window.devicePixelRatio||1;const W=size*dpr,H=size*dpr;canvas.width=W;canvas.height=H;canvas.style.width=size+"px";canvas.style.height=size+"px";
    const ctx=canvas.getContext("2d");const cx=W/2,cy=H/2,r=W*0.36;
    const waves=[{freq:1.0,amp:0.22,phase:0,speed:0.016,color:[107,95,237],w:1.2},{freq:1.6,amp:0.17,phase:2.0,speed:0.023,color:[196,131,90],w:1.0},{freq:2.4,amp:0.13,phase:4.1,speed:0.030,color:[184,169,217],w:0.9},{freq:0.7,amp:0.20,phase:1.0,speed:0.013,color:[232,201,160],w:0.8}];
    function draw(t){ctx.clearRect(0,0,W,H);const g=ctx.createRadialGradient(cx,cy,0,cx,cy,r*1.4);g.addColorStop(0,"rgba(107,95,237,0.15)");g.addColorStop(1,"rgba(107,95,237,0)");ctx.beginPath();ctx.arc(cx,cy,r*1.4,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();waves.forEach(w=>{ctx.beginPath();for(let i=0;i<=256;i++){const a=(i/256)*Math.PI*2;const d=Math.sin(w.freq*a*7+t*w.speed*60+w.phase)*w.amp;const rad=r*(1+d);i===0?ctx.moveTo(cx+Math.cos(a)*rad,cy+Math.sin(a)*rad):ctx.lineTo(cx+Math.cos(a)*rad,cy+Math.sin(a)*rad);}ctx.closePath();ctx.strokeStyle=`rgba(${w.color[0]},${w.color[1]},${w.color[2]},${0.3+0.25*Math.sin(t*w.speed*70+w.phase)})`;ctx.lineWidth=w.w;ctx.stroke();});}
    let id;function loop(ts){draw(ts/1000);id=requestAnimationFrame(loop);}id=requestAnimationFrame(loop);return()=>cancelAnimationFrame(id);
  },[size]);
  return(<div style={{position:"relative",width:size,height:size,display:"flex",alignItems:"center",justifyContent:"center"}}><canvas ref={ref} style={{position:"absolute",inset:0,borderRadius:"50%"}}/><div style={{position:"relative",zIndex:1}}><svg width={size*0.45} height={size*0.45} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1={12} y1={5} x2={12} y2={17} stroke="rgba(107,95,237,0.95)" strokeWidth={2}/><polyline points="7,13 12,18 17,13" stroke="rgba(107,95,237,0.95)" strokeWidth={2}/></svg></div></div>);
}
function IconProfile({ size=24, color }) {
  const c=color||T.InkSoft,cx=size/2,headCY=size*0.34,headR=size*0.18,shoulderR=size*0.26,shoulderY=size*0.72,ringR=size*0.44;
  return(<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx={cx} cy={cx} r={ringR} stroke={c} strokeWidth={1.3} opacity={0.4}/><circle cx={cx} cy={headCY} r={headR} stroke={c} strokeWidth={1.6}/><path d={`M ${cx-shoulderR} ${shoulderY} Q ${cx} ${shoulderY-size*0.08} ${cx+shoulderR} ${shoulderY}`} stroke={c} strokeWidth={1.6}/></svg>);
}

function ColourSwatch({ name, hex, usage, dark }) {
  const isLight=["Paper","White","Mist","Sand","Pearl","Pulse","Deep Ink"].includes(name);
  return(
    <div style={{display:"flex",flexDirection:"column",borderRadius:10,overflow:"hidden",border:`1px solid ${dark?T.Slate:T.Border}`,minWidth:130,flex:"0 0 auto"}}>
      <div style={{height:56,background:hex,position:"relative"}}><span style={{position:"absolute",bottom:6,left:8,fontSize:10,fontWeight:700,color:name==="Deep Ink"?"rgba(250,248,245,0.7)":isLight?"rgba(26,22,18,0.5)":"rgba(250,248,245,0.7)",fontFamily:ff}}>{hex}</span></div>
      <div style={{padding:"8px 10px",background:dark?T.Depth:T.White}}>
        <div style={{fontSize:12,fontWeight:700,color:dark?T.SnowFull:T.Ink,marginBottom:2}}>{name}</div>
        <div style={{fontSize:10,color:dark?T.SnowSoft:T.InkSoft,lineHeight:1.5}}>{usage}</div>
      </div>
    </div>
  );
}
function ColourGroup({ label, swatches, dark }) {
  return(
    <div style={{marginBottom:24}}>
      <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:dark?T.SnowSoft:T.InkFaint,marginBottom:10}}>{label}</div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{swatches.map(s=><ColourSwatch key={s.name} {...s} dark={dark}/>)}</div>
    </div>
  );
}

function IconTile({ label, desc, inactive, selected, single, bgActive, off, dark }) {
  const bgAct=dark?T.Dusk:"#F5F3FF";const bgOff=dark?T.Dusk:T.Mist;const bg=dark?T.Depth:T.Paper;
  if(single){return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,minWidth:110,padding:"14px 10px",background:bgActive?bgAct:off?bgOff:bg,borderRadius:12,border:`1px solid ${bgActive?T.Signal:off?T.InkFaint:T.Border}`,flex:"0 0 auto"}}><div style={{width:48,height:48,borderRadius:"50%",background:bgActive?"rgba(107,95,237,0.07)":off?"rgba(196,186,255,0.05)":(dark?T.Dusk:T.Mist),display:"flex",alignItems:"center",justifyContent:"center"}}>{single}</div><div style={{textAlign:"center"}}><div style={{fontSize:11,fontWeight:700,color:bgActive?T.Signal:off?T.InkSoft:(dark?T.SnowFull:T.Ink)}}>{label}</div>{desc&&<div style={{fontSize:10,color:dark?T.SnowSoft:T.InkSoft,lineHeight:1.5,marginTop:2}}>{desc}</div>}</div></div>);}
  return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,minWidth:130,padding:"14px 12px",background:dark?T.Depth:T.White,borderRadius:12,border:`1px solid ${T.Border}`,flex:"0 0 auto"}}><div style={{display:"flex",gap:12,alignItems:"flex-end"}}><div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}><div style={{width:40,height:40,borderRadius:"50%",background:dark?T.Dusk:T.Mist,display:"flex",alignItems:"center",justifyContent:"center"}}>{inactive}</div><span style={{fontSize:9,color:T.InkFaint,fontWeight:600,letterSpacing:"0.04em"}}>DEFAULT</span></div><div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}><div style={{width:40,height:40,borderRadius:"50%",background:"rgba(107,95,237,0.07)",display:"flex",alignItems:"center",justifyContent:"center"}}>{selected}</div><span style={{fontSize:9,color:T.Signal,fontWeight:600,letterSpacing:"0.04em"}}>SELECTED</span></div></div><div style={{textAlign:"center"}}><div style={{fontSize:11,fontWeight:700,color:dark?T.SnowFull:T.Ink}}>{label}</div>{desc&&<div style={{fontSize:10,color:dark?T.SnowSoft:T.InkSoft,lineHeight:1.5,marginTop:1}}>{desc}</div>}</div></div>);
}

function TypeSample({ role, size, weight, tracking, lh, sample, dark }) {
  const brd=dark?T.Slate:T.Border;
  return(<div style={{display:"flex",alignItems:"baseline",gap:16,padding:"10px 0",borderBottom:`1px solid ${brd}`}}><div style={{minWidth:90,fontSize:10,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:dark?T.SnowSoft:T.InkSoft,flexShrink:0}}>{role}</div><div style={{flex:1,fontSize:size,fontWeight:weight,letterSpacing:tracking,lineHeight:lh,color:dark?T.SnowFull:T.Ink,fontFamily:ff}}>{sample}</div><div style={{fontSize:10,color:dark?T.SnowSoft:T.InkFaint,flexShrink:0,textAlign:"right"}}>{size}px / {weight} / {tracking}</div></div>);
}

function MotionRow({ name, ms, usage, dark }) {
  const [go,setGo]=useState(false);
  return(<div style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:`1px solid ${dark?T.Slate:T.Border}`}}><div style={{minWidth:100,fontSize:12,fontWeight:700,color:dark?T.SnowFull:T.Ink}}>{name}</div><div style={{minWidth:60,fontSize:12,color:dark?T.SnowSoft:T.InkSoft}}>{ms}</div><div style={{flex:1,fontSize:11,color:dark?T.SnowSoft:T.InkSoft}}>{usage}</div><button onClick={()=>{setGo(true);setTimeout(()=>setGo(false),parseInt(ms)+200);}} style={{width:32,height:32,borderRadius:"50%",background:go?"rgba(107,95,237,0.15)":"transparent",border:`1px solid ${T.Signal}`,cursor:"pointer",transition:`all ${ms} cubic-bezier(0.4,0,0.2,1)`,transform:go?"scale(1.2)":"scale(1)"}}><span style={{fontSize:9,fontWeight:700,color:T.Signal}}>▶</span></button></div>);
}

// Kairos card sheen preview
function CardSheenPreview({ w, h, mood }) {
  const ref=useRef();
  const [wr,wg,wb]=MOOD_TINT[mood]||MOOD_TINT[""];
  useEffect(()=>{
    const c=ref.current;if(!c)return;
    const dpr=window.devicePixelRatio||1;c.width=w*dpr;c.height=h*dpr;c.style.width=w+"px";c.style.height=h+"px";
    const ctx=c.getContext("2d");ctx.scale(dpr,dpr);
    ctx.fillStyle="#0C0A08";ctx.fillRect(0,0,w,h);
    const g1=ctx.createRadialGradient(w*.38,h*.36,0,w*.38,h*.36,Math.max(w,h)*.75);g1.addColorStop(0,`rgba(${wr},${wg},${wb},0.48)`);g1.addColorStop(.55,`rgba(${wr},${wg},${wb},0.18)`);g1.addColorStop(1,`rgba(${wr},${wg},${wb},0)`);ctx.fillStyle=g1;ctx.fillRect(0,0,w,h);
    const g2=ctx.createRadialGradient(w*.88,h*.08,0,w*.88,h*.08,Math.max(w,h)*.45);g2.addColorStop(0,"rgba(184,169,217,0.16)");g2.addColorStop(1,"rgba(184,169,217,0)");ctx.fillStyle=g2;ctx.fillRect(0,0,w,h);
    const gB=ctx.createLinearGradient(0,h*.55,0,h);gB.addColorStop(0,"rgba(4,2,1,0)");gB.addColorStop(1,"rgba(4,2,1,.90)");ctx.fillStyle=gB;ctx.fillRect(0,0,w,h);
    const gT=ctx.createLinearGradient(0,0,0,h*.22);gT.addColorStop(0,"rgba(4,2,1,.72)");gT.addColorStop(1,"rgba(4,2,1,0)");ctx.fillStyle=gT;ctx.fillRect(0,0,w,h);
    for(let i=0;i<w*h*.18;i++){ctx.fillStyle=`rgba(255,255,255,${Math.random()*.018})`;ctx.fillRect(Math.random()*w,Math.random()*h,1,1);}
    // Serial label
    ctx.textAlign="center";ctx.font=`700 ${w*.055}px monospace`;ctx.fillStyle=`rgba(184,169,217,0.85)`;ctx.fillText("Æ01",w*.5,h-.46*h*.22);
    ctx.fillStyle=`rgba(250,248,245,0.55)`;ctx.fillText("-12236199",w*.5,h-.28*h*.22);
    if(mood){ctx.font=`500 ${w*.048}px 'DM Sans',sans-serif`;ctx.fillStyle=`rgba(${wr},${wg},${wb},0.60)`;ctx.fillText(mood,w*.5,h-.10*h*.22);}
  },[w,h,mood,wr,wg,wb]);
  return <canvas ref={ref} style={{display:"block"}}/>;
}

// Envelope preview
function EnvelopePreview({ w, h, handle="nova" }) {
  const ref=useRef();
  function hexToRgb(hex){return{r:parseInt(hex.slice(1,3),16),g:parseInt(hex.slice(3,5),16),b:parseInt(hex.slice(5,7),16)};}
  useEffect(()=>{
    const c=ref.current;if(!c)return;
    const dpr=window.devicePixelRatio||1;c.width=w*dpr;c.height=h*dpr;c.style.width=w+"px";c.style.height=h+"px";
    const ctx=c.getContext("2d");ctx.scale(dpr,dpr);
    const W=w,H=h;const sw=hexToRgb(avatarCol(handle));
    ctx.fillStyle="#F5F0E8";ctx.fillRect(0,0,W,H);
    const swg=ctx.createRadialGradient(W*.5,H*.38,0,W*.5,H*.38,W*.90);swg.addColorStop(0,`rgba(${sw.r},${sw.g},${sw.b},0.12)`);swg.addColorStop(1,`rgba(${sw.r},${sw.g},${sw.b},0)`);ctx.fillStyle=swg;ctx.fillRect(0,0,W,H);
    for(let i=0;i<W*H*.06;i++){const v=180+Math.random()*60;ctx.fillStyle=`rgba(${v},${Math.round(v*.94)},${Math.round(v*.86)},${Math.random()*.055})`;ctx.fillRect(Math.random()*W,Math.random()*H,1,1);}
    const PAD=W*.055,EL=PAD,ER=W-PAD,ET=H*.095,EB=H*.825,CX=W*.5,CY=H*.455;
    ctx.beginPath();ctx.moveTo(EL,ET);ctx.lineTo(ER,ET);ctx.lineTo(ER,EB);ctx.lineTo(EL,EB);ctx.closePath();ctx.fillStyle="rgba(242,234,218,0.70)";ctx.fill();
    const corners=[[EL,ET],[ER,ET],[ER,EB],[EL,EB]];
    const flapFills=["rgba(228,218,200,0.55)","rgba(220,210,192,0.45)","rgba(228,218,200,0.55)","rgba(220,210,192,0.45)"];
    [[corners[0],corners[1]],[corners[1],corners[2]],[corners[2],corners[3]],[corners[3],corners[0]]].forEach(([a,b],i)=>{ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.lineTo(CX,CY);ctx.closePath();ctx.fillStyle=flapFills[i];ctx.fill();});
    corners.forEach(([x,y])=>{ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(CX,CY);ctx.strokeStyle="rgba(160,120,70,0.22)";ctx.lineWidth=0.8;ctx.stroke();});
    ctx.beginPath();ctx.moveTo(EL,ET);ctx.lineTo(ER,ET);ctx.lineTo(ER,EB);ctx.lineTo(EL,EB);ctx.closePath();ctx.strokeStyle="rgba(160,120,70,0.28)";ctx.lineWidth=0.8;ctx.stroke();
    const notch=W*.022;corners.forEach(([x,y])=>{const nx=x<W/2?1:-1,ny=y<H/2?1:-1;ctx.beginPath();ctx.moveTo(x+nx*notch*2.2,y);ctx.lineTo(x,y);ctx.lineTo(x,y+ny*notch*2.2);ctx.strokeStyle="rgba(160,120,70,0.40)";ctx.lineWidth=0.8;ctx.stroke();});
    const sealR=W*.195;
    ctx.save();ctx.shadowColor="rgba(120,70,20,0.25)";ctx.shadowBlur=6;ctx.shadowOffsetX=1.5;ctx.shadowOffsetY=2;ctx.beginPath();ctx.arc(CX,CY,sealR*.92,0,Math.PI*2);ctx.fillStyle="#A0673A";ctx.fill();ctx.restore();
    ctx.beginPath();ctx.arc(CX,CY,sealR*.90,0,Math.PI*2);ctx.fillStyle="#B07840";ctx.fill();
    const wg=ctx.createRadialGradient(CX-sealR*.32,CY-sealR*.32,0,CX,CY,sealR*.90);wg.addColorStop(0,"rgba(240,185,105,0.60)");wg.addColorStop(.3,"rgba(196,131,58,0.25)");wg.addColorStop(.7,"rgba(130,80,25,0.20)");wg.addColorStop(1,"rgba(70,35,8,0.45)");ctx.beginPath();ctx.arc(CX,CY,sealR*.90,0,Math.PI*2);ctx.fillStyle=wg;ctx.fill();
    ctx.beginPath();ctx.arc(CX,CY,sealR*.90,0,Math.PI*2);ctx.strokeStyle="rgba(240,185,105,0.40)";ctx.lineWidth=1.0;ctx.stroke();
    const vR=sealR*.45,vSep=vR*.50,vLx=CX-vSep/2,vRx=CX+vSep/2;
    ctx.save();ctx.translate(1.0,1.2);ctx.beginPath();ctx.arc(vLx,CY,vR,0,Math.PI*2);ctx.strokeStyle="rgba(50,22,4,0.50)";ctx.lineWidth=1.2;ctx.stroke();ctx.beginPath();ctx.arc(vRx,CY,vR,0,Math.PI*2);ctx.strokeStyle="rgba(50,22,4,0.50)";ctx.lineWidth=1.2;ctx.stroke();ctx.restore();
    ctx.beginPath();ctx.arc(vLx,CY,vR,0,Math.PI*2);ctx.strokeStyle="rgba(255,240,210,0.82)";ctx.lineWidth=1.0;ctx.stroke();
    ctx.beginPath();ctx.arc(vRx,CY,vR,0,Math.PI*2);ctx.strokeStyle="rgba(255,240,210,0.82)";ctx.lineWidth=1.0;ctx.stroke();
    ctx.save();ctx.beginPath();ctx.arc(vLx,CY,vR,-Math.PI/3,Math.PI/3);ctx.arc(vRx,CY,vR,Math.PI*2/3,Math.PI*4/3);ctx.closePath();ctx.strokeStyle="rgba(255,245,220,0.95)";ctx.lineWidth=1.4;ctx.stroke();ctx.restore();
    const pmY=ET+W*.085;ctx.textAlign="center";ctx.font=`600 ${W*.050}px monospace`;ctx.fillStyle="rgba(160,103,50,0.42)";ctx.fillText("Æ01  ·  12236199",W*.5,pmY);
    ctx.textAlign="center";ctx.font=`500 ${W*.056}px system-ui`;ctx.fillStyle="rgba(100,65,30,0.50)";ctx.fillText(`from @${handle}`,W*.5,EB-W*.06);
  },[w,h,handle]);
  return <canvas ref={ref} style={{display:"block"}}/>;
}

// Comet orbit preview
function CometOrbitPreview({ w, h }) {
  const ref=useRef();
  useEffect(()=>{
    const c=ref.current;if(!c)return;
    const dpr=window.devicePixelRatio||1;c.width=w*dpr;c.height=h*dpr;c.style.width=w+"px";c.style.height=h+"px";
    const ctx=c.getContext("2d");ctx.scale(dpr,dpr);
    const W=w,H=h;const perim=2*(W+H);const speed=perim/5000;let start=null;
    function ptOnPerim(d){d=((d%perim)+perim)%perim;if(d<W)return{x:d,y:0};d-=W;if(d<H)return{x:W,y:d};d-=H;if(d<W)return{x:W-d,y:H};d-=W;return{x:0,y:H-d};}
    // Draw card sheen underneath
    const [wr,wg,wb]=[118,148,195]; // Calm mood
    ctx.fillStyle="#0C0A08";ctx.fillRect(0,0,W,H);
    const g1=ctx.createRadialGradient(W*.38,H*.36,0,W*.38,H*.36,Math.max(W,H)*.75);g1.addColorStop(0,`rgba(${wr},${wg},${wb},0.48)`);g1.addColorStop(.55,`rgba(${wr},${wg},${wb},0.18)`);g1.addColorStop(1,`rgba(${wr},${wg},${wb},0)`);ctx.fillStyle=g1;ctx.fillRect(0,0,W,H);
    const gB=ctx.createLinearGradient(0,H*.55,0,H);gB.addColorStop(0,"rgba(4,2,1,0)");gB.addColorStop(1,"rgba(4,2,1,.90)");ctx.fillStyle=gB;ctx.fillRect(0,0,W,H);
    for(let i=0;i<W*H*.18;i++){ctx.fillStyle=`rgba(255,255,255,${Math.random()*.018})`;ctx.fillRect(Math.random()*W,Math.random()*H,1,1);}
    ctx.textAlign="center";ctx.font=`700 ${W*.055}px monospace`;ctx.fillStyle="rgba(184,169,217,0.85)";ctx.fillText("Æ01",W*.5,H*.82);
    ctx.fillStyle="rgba(250,248,245,0.45)";ctx.fillText("-12236200",W*.5,H*.92);

    function draw(ts){
      if(!start)start=ts;const elapsed=ts-start;
      // Re-draw sheen (just the comet layer on top)
      const headD=(elapsed*speed)%perim;const tailLen=perim*0.18;const steps=60;
      // Clear just the border area
      ctx.clearRect(0,0,W,4);ctx.clearRect(0,H-4,W,4);ctx.clearRect(0,0,4,H);ctx.clearRect(W-4,0,4,H);
      for(let i=0;i<steps;i++){
        const t0=i/steps,t1=(i+1)/steps;const d0=headD-tailLen*(1-t0);const d1=headD-tailLen*(1-t1);
        const p0=ptOnPerim(d0),p1=ptOnPerim(d1);
        const rv=Math.round(184+(255-184)*t0),gv=Math.round(169+(255-169)*t0),bv=Math.round(217+(255-217)*t0);
        ctx.beginPath();ctx.moveTo(p0.x,p0.y);ctx.lineTo(p1.x,p1.y);ctx.strokeStyle=`rgba(${rv},${gv},${bv},${Math.pow(t0,1.6)*0.95})`;ctx.lineWidth=1.5+t0*1.8;ctx.lineCap="round";ctx.stroke();
      }
      const hp=ptOnPerim(headD);const hg=ctx.createRadialGradient(hp.x,hp.y,0,hp.x,hp.y,7);hg.addColorStop(0,"rgba(255,255,255,1)");hg.addColorStop(0.35,"rgba(214,228,240,0.70)");hg.addColorStop(1,"rgba(184,169,217,0)");ctx.beginPath();ctx.arc(hp.x,hp.y,7,0,Math.PI*2);ctx.fillStyle=hg;ctx.fill();ctx.beginPath();ctx.arc(hp.x,hp.y,2.2,0,Math.PI*2);ctx.fillStyle="rgba(255,255,255,1)";ctx.fill();
      requestAnimationFrame(draw);
    }
    const id=requestAnimationFrame(draw);return()=>cancelAnimationFrame(id);
  },[w,h]);
  return <canvas ref={ref} style={{display:"block"}}/>;
}

// KairosStrip preview
function KairosStripDemo({ dark }) {
  const [open,setOpen]=useState(false);
  const [wr,wg,wb]=MOOD_TINT["Calm"];
  const surf=dark?"rgba(30,27,24,0.55)":"rgba(255,255,255,0.55)";
  const brd=dark?T.Slate:T.Border;
  return(
    <div style={{borderRadius:14,background:surf,border:`1px solid ${brd}`,overflow:"hidden",boxShadow:"0 1px 8px rgba(26,22,18,0.06)"}}>
      <div style={{height:3,background:`linear-gradient(to right,rgba(${wr},${wg},${wb},0.80),rgba(${wr},${wg},${wb},0.12))`}}/>
      <div style={{padding:"14px 16px"}}>
        <div style={{marginBottom:10}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.06em",color:T.InkFaint,fontFamily:ff,marginBottom:5}}>Serial #</div>
          <div style={{display:"flex",alignItems:"baseline",fontFamily:"monospace,system-ui"}}>
            <span style={{fontSize:18,fontWeight:700,color:T.Prism,letterSpacing:"0.01em"}}>Æ01</span>
            <span style={{fontSize:16,fontWeight:400,color:T.InkFaint,margin:"0 1px"}}>-</span>
            <span style={{fontSize:18,fontWeight:700,color:dark?T.SnowFull:T.Ink,letterSpacing:"0.01em"}}>12236199</span>
          </div>
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center",paddingTop:10,borderTop:`1px solid rgba(224,216,208,0.45)`}}>
          <span style={{fontSize:11,color:T.InkFaint,fontFamily:ff}}>by</span>
          <span style={{fontSize:12,fontWeight:700,color:dark?T.SnowMid:T.InkMid,fontFamily:ff}}>@nova</span>
          <span style={{fontSize:11,color:T.InkFaint}}>·</span>
          <span style={{fontSize:12,color:dark?T.SnowSoft:T.InkSoft,fontFamily:ff}}>{toRomanDate("14 Mar 2026")}</span>
          <span style={{fontSize:11,color:T.InkFaint}}>·</span>
          <span style={{fontSize:12,color:dark?T.SnowSoft:T.InkSoft,fontFamily:ff}}>Calm</span>
        </div>
        <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid rgba(224,216,208,0.45)`}}>
          <div onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",userSelect:"none"}}>
            <span style={{fontSize:11,fontWeight:700,letterSpacing:"0.06em",color:T.InkFaint,fontFamily:ff}}>Origin story</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{transform:open?"rotate(180deg)":"none",transition:"transform 0.2s",flexShrink:0}}><path d="M4 6l4 4 4-4" stroke={T.InkFaint} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div style={{overflow:"hidden",maxHeight:open?200:0,opacity:open?1:0,transition:"max-height 0.28s cubic-bezier(0.4,0,0.2,1),opacity 0.22s"}}>
            <div style={{fontSize:13,color:dark?T.SnowMid:T.InkMid,lineHeight:1.70,fontFamily:ff,paddingTop:8}}>"A quiet day. Nothing happened and everything felt significant."</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Collection section
function CollectionSection({ dark }) {
  const [senderIdx,setSenderIdx]=useState(0);
  const senders=[{h:"nova"},{h:"kai"},{h:"river"},{h:"sol"}];
  const tileW=110,tileH=Math.round(110/0.56);
  return(
    <div>
      <SectionLabel dark={dark}>KairosStrip — Locked Component</SectionLabel>
      <SubLabel dark={dark}>Tap origin story chevron to expand. This is the canonical reduced Kairos representation.</SubLabel>
      <div style={{marginBottom:16}}><KairosStripDemo dark={dark}/></div>
      <SpecTable dark={dark} rows={[
        ["Primary field","Serial # — always. Never the date."],
        ["Serial format","Æ01-12236199 · epoch Prism #B8A9D9 · separator Ink Faint · digits Ink #1A1612 · monospace 18px/700"],
        ["Secondary row","by @{handle} · Roman date · mood text only · 11–12px Ink Soft"],
        ["Mood in strip","Text only. No colour pill. No colour dot. Pill is a grid scanning affordance only."],
        ["Date format","Always Roman numerals · XIV · III · MMXXVI"],
        ["Day number","Not a Kairos property. Never shown."],
        ["Origin story","Collapsed accordion by default. 'Origin story' label + chevron. Plain weight 13px/400 Ink Mid when open."],
        ["Origin story — empty","Nothing shown. No empty state message."],
        ["Background","rgba(255,255,255,0.55) · border 1px #E0D8D0 · radius 14px"],
        ["Mood accent bar","3px full-width top · linear-gradient mood colour 80% → 12%"],
      ]}/>

      <SectionLabel dark={dark}>Serial Number Format — System-Wide</SectionLabel>
      <SpecTable dark={dark} rows={[
        ["Format","Æ[EE]-SSSSSSSSSSS"],
        ["Epoch","Zero-padded 2 digits. Epoch 1 = 01."],
        ["Serial","Unpadded sequence number. Starts at 1."],
        ["First ever","Æ01-1"],
        ["Example","Æ01-12236199"],
        ["Colour split","Epoch Æ01: Prism #B8A9D9 · Separator -: Ink Faint · Digits: Ink #1A1612"],
        ["Applies to","KairosStrip, Minted metadata, grid tile label, list row, detail hero overlay, confirm tables — everywhere"],
      ]}/>

      <SectionLabel dark={dark}>Metadata / Confirm Table — Locked Spec</SectionLabel>
      <SpecTable dark={dark} rows={[
        ["Label","12px · Ink Soft #8A8480 · weight 400 · sentence case · left column"],
        ["Value","13px · Ink #1A1612 · weight 700 · right-aligned · text only"],
        ["Never","Inline colour dots · inline avatars · any decorative elements inside rows"],
        ["Required rows","Serial # · Epoch # · Activated by · Mood · Date · To (Give context) · Whisper (Give context)"],
        ["Mood","Text only · '· · ·' fallback when absent"],
        ["Date","Roman numerals always · XIV · III · MMXXVI"],
        ["Whisper","Italic when present · 'None' in Ink Faint when absent"],
        ["Label convention","Sentence case everywhere. Never textTransform: uppercase on metadata labels."],
      ]}/>

      <SectionLabel dark={dark}>Card Corners — Locked Rule</SectionLabel>
      <SpecTable dark={dark} rows={[
        ["Rule","border-radius: 0 on all Kairos card images at every size and in every context"],
        ["Applies to","Grid tiles · list thumbnails · detail hero · Give flow preview (KairosStrip replaces thumbnail)"],
        ["Rationale","The Kairos is an artefact, not a UI card. Sharp corners give it physical object quality."],
        ["Never","border-radius on the card image itself. The container may have radius; the image does not."],
      ]}/>

      <SectionLabel dark={dark}>Card States — New (Unread Received)</SectionLabel>
      <SubLabel dark={dark}>Full card face takeover. Sealed envelope replaces card face entirely. Tap sender to cycle.</SubLabel>
      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
        {senders.map((s,i)=>(
          <div key={s.h} onClick={()=>setSenderIdx(i)} style={{cursor:"pointer",outline:senderIdx===i?`2px solid ${T.Signal}`:"none"}}>
            <EnvelopePreview w={tileW} h={tileH} handle={s.h}/>
          </div>
        ))}
      </div>
      <SpecTable dark={dark} rows={[
        ["Paper base","#F5F0E8 warm linen"],
        ["Sender tint","Handle-derived avatar colour at 12% opacity radial wash over paper"],
        ["Fold lines","Diamond — 4 flaps meeting at centre · shadow + highlight offset for emboss effect"],
        ["Wax seal","Clay/Ochre family #B07840 · irregular drip edge · aged cracks · surface depth gradient"],
        ["Vesica in seal","Pressed-in appearance (shadow offset) · cream circles · bright lens highlight"],
        ["Postmark","Serial Æ01 · 12236199 at top · monospace 600 · rgba(160,103,50,0.42)"],
        ["Address","from @{handle} · bottom · rgba(100,65,30,0.50)"],
        ["Behaviour","Tapping goes directly to detail. Reveal happens in detail, not on grid. No flip control while sealed."],
        ["Terminology","'New' — never 'unread' in member-facing copy"],
      ]}/>

      <SectionLabel dark={dark}>Card States — New Whisper</SectionLabel>
      <SubLabel dark={dark}>Card face visible. Comet Arc orbits card perimeter. Loops while unread.</SubLabel>
      <div style={{marginBottom:16,display:"inline-block"}}>
        <CometOrbitPreview w={tileW} h={tileH}/>
      </div>
      <SpecTable dark={dark} rows={[
        ["Component","CometOrbit canvas — position absolute, inset 0, pointer-events none, z-index 9"],
        ["Path","Rectangle perimeter of card"],
        ["Tail","Prism→white gradient · 18% of perimeter · 60 segments"],
        ["Head","White-hot point · radial glow halo"],
        ["Speed","~5 seconds per full orbit"],
        ["Loop","Continuous while whisper is unread"],
        ["prefers-reduced-motion","Freeze at current position"],
        ["Motion language","Same named component as Daily Activation PoL arc and DID binding arc — shared system"],
      ]}/>

      <SectionLabel dark={dark}>Card States — Fossil (Burned)</SectionLabel>
      <div style={{display:"flex",gap:10,marginBottom:16}}>
        <div style={{opacity:0.55}}>
          <CardSheenPreview w={tileW} h={tileH} mood="Sad"/>
        </div>
        <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",padding:"0 8px"}}>
          <div style={{fontSize:13,color:dark?T.SnowFull:T.Ink,fontFamily:ff,lineHeight:1.7}}>opacity: 0.55 only. No pill. No label on card face. No Ember colour. In list view: <span style={{color:T.InkFaint,fontWeight:400}}>· Burned</span> inline in Ink Faint 400.</div>
        </div>
      </div>
      <SpecTable dark={dark} rows={[
        ["Treatment","opacity: 0.55 on outer container. Nothing else."],
        ["Card face","No pill. No label. No border treatment."],
        ["List view only","· Burned · Ink Faint #C4BEB8 · weight 400 · inline after serial"],
        ["Rationale","A fossil is an absence. It should recede, not be labelled."],
        ["Protocol rule","A fossil never circulated. It has no whispers, no flow count, no recipient, no sentTo field."],
        ["Member-facing term","'Burned' — never 'Fossil' (engineering-internal term)"],
      ]}/>

      <SectionLabel dark={dark}>Give Flow — Transfer Action Button Rule</SectionLabel>
      <SpecTable dark={dark} rows={[
        ["Transfer actions","CeremonyCTA (Clay #C4835A) — Give this Kairos, Send (Wallet)"],
        ["Navigation steps","PrimaryCTA (Deep Ink #2A2520) — Next, Continue to confirm"],
        ["Rationale","Giving is one-time and irreversible. Belongs to ceremony register, not navigational register."],
        ["Applies to","Collection Give flow · Wallet Send flow · Daily Activation 'Send it to someone' (pending verification)"],
      ]}/>

      <SectionLabel dark={dark}>Collection Terminology</SectionLabel>
      <SpecTable dark={dark} rows={[
        ["New","Received Kairos not yet opened. Replaces 'unread' everywhere member-facing."],
        ["New whisper","Whisper on a Kairos not yet read by the current holder."],
        ["Burned","Member-facing term for a fossil — never circulated, pulse window expired."],
        ["Fossil","Engineering/internal term only. Never member-facing."],
        ["· · ·","Mood fallback when no mood selected. Never 'No mood', never 'Not recorded'."],
      ]}/>

      <SectionLabel dark={dark}>Origin Story — Display Rules</SectionLabel>
      <SpecTable dark={dark} rows={[
        ["KairosStrip","Collapsed accordion. Expands on tap."],
        ["Collection detail","Always visible, full text. No collapse."],
        ["Confirm table","Not shown — handled by strip accordion above."],
        ["Fossil detail","Always visible. The only remaining voice of a burned Kairos."],
        ["Empty state","Nothing shown. No 'No origin story' message anywhere."],
        ["Typography","13px · weight 400 · Ink Mid #4A4440 · line-height 1.70 · plain weight, not italic"],
      ]}/>
    </div>
  );
}

// Pending section
function PendingSection({ dark }) {
  const surf=dark?T.Depth:T.White,brd=dark?T.Slate:T.Border;
  const items=[
    {id:"2.3",title:"Search — Nav Placement",status:"DECIDE WHEN SEARCH IS SCOPED",detail:"If Search becomes a major surface it may warrant promotion to primary nav.",options:["Keep Search in secondary nav","Promote to primary alongside Home, Collection, Wallet"],block:"No change until Search surface is scoped."},
    {id:"2.4",title:"Dark Mode Drawer Surface",status:"PENDING — DARK MODE PASS",detail:"Light mode drawer confirmed: #FEFCF9 + grain. Dark mode equivalent not yet specced.",options:["Candidate: #1E1B18 (Dusk) + grain at same opacity (0.35, overlay)"],block:"Address during dark mode nav pass."},
  ];
  return(
    <div>
      <SectionLabel dark={dark}>Open Decisions — Not Yet Locked</SectionLabel>
      <SubLabel dark={dark}>These items require a decision before they can be added to the brand system as locked spec.</SubLabel>
      {items.map(item=>(
        <div key={item.id} style={{background:surf,border:`1px solid ${brd}`,borderRadius:14,padding:20,marginBottom:16}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,marginBottom:10}}>
            <div><span style={{fontSize:10,fontWeight:700,color:T.InkFaint,letterSpacing:"0.06em",fontFamily:ff}}>{item.id} · </span><span style={{fontSize:15,fontWeight:700,color:dark?T.SnowFull:T.Ink,fontFamily:ff}}>{item.title}</span></div>
            <span style={{fontSize:9,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:T.Hearth,background:"rgba(139,94,47,0.08)",padding:"3px 8px",borderRadius:4,flexShrink:0,fontFamily:ff}}>{item.status}</span>
          </div>
          <p style={{fontSize:12,color:dark?T.SnowMid:T.InkMid,lineHeight:1.6,margin:"0 0 10px",fontFamily:ff}}>{item.detail}</p>
          <div style={{marginBottom:10}}>{item.options.map((opt,i)=>(<div key={i} style={{display:"flex",gap:8,padding:"3px 0",fontSize:12,color:dark?T.SnowFull:T.Ink,fontFamily:ff}}><span style={{color:T.Prism,flexShrink:0}}>→</span>{opt}</div>))}</div>
          <div style={{background:"rgba(160,48,32,0.05)",border:"1px solid rgba(160,48,32,0.15)",borderRadius:8,padding:"8px 12px",fontSize:11,color:T.Ember,fontFamily:ff}}>⚠ {item.block}</div>
        </div>
      ))}
    </div>
  );
}

export default function BrandSystem() {
  const [dark,setDark]=useState(false);
  const [activeSection,setActiveSection]=useState("Colour");

  const bg=dark?T.Void:T.Paper,surf=dark?T.Depth:T.White,txt=dark?T.SnowFull:T.Ink,sub=dark?T.SnowMid:T.InkSoft,brd=dark?T.Slate:T.Border;

  useEffect(()=>{const l=document.createElement("link");l.rel="stylesheet";l.href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,800&display=swap";document.head.appendChild(l);},[]);

  const weAreRows=[["Warm without being sentimental","Saccharine or performative"],["Direct without being cold","Brusque or terse"],["Certain without being arrogant","Preachy or self-righteous"],["Poetic without being obscure","Cryptic or exclusionary"],["Present-tense, active voice","Passive, hedging, corporate"]];
  const copyRows=[
    ["You're here. And there's only one of you.","Verification complete. Unique human confirmed."],
    ["This is permanent. Once bound, this account belongs to you and only you.","Immutable DID binding will now be executed."],
    ["Today's Kairos is created.","Token minting transaction successful."],
    ["You're right on time. I'm Genie. I keep the beat around here.","Welcome to ÆPOCH. I am your onboarding assistant."],
    ["The signal wasn't quite clear. Find good light and try again.","Error: PoL validation failed. Retry attempt 1 of 3."],
  ];

  return(
    <div style={{minHeight:"100vh",background:bg,fontFamily:ff,color:txt,transition:"background 0.3s"}}>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}} *{box-sizing:border-box;} button{font-family:inherit;} ::-webkit-scrollbar{width:4px;height:4px;} ::-webkit-scrollbar-thumb{background:${T.InkFaint};border-radius:2px;}`}</style>

      {/* Header */}
      <div style={{background:dark?T.Depth:T.White,borderBottom:`1px solid ${brd}`,padding:"16px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
        <div>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:sub}}>ÆPOCH</div>
          <div style={{fontSize:18,fontWeight:800,letterSpacing:"-0.025em",color:txt,lineHeight:1.1}}>Brand System v6.9</div>
          <div style={{fontSize:10,color:sub,marginTop:2}}>260318-ÆPOCH-Brand-System-v6.9 · Session 12 · March 18 2026</div>
        </div>
        <button onClick={()=>setDark(d=>!d)} style={{padding:"6px 14px",borderRadius:20,border:`1.5px solid ${brd}`,background:"transparent",color:sub,fontSize:12,fontWeight:700,cursor:"pointer"}}>{dark?"☀ Light":"◑ Dark"}</button>
      </div>

      {/* Nav */}
      <div style={{padding:"12px 24px",background:dark?T.Dusk:T.Mist,borderBottom:`1px solid ${brd}`,display:"flex",gap:6,flexWrap:"wrap"}}>
        {SECTIONS.map(s=>(
          <button key={s} onClick={()=>setActiveSection(s)} style={{padding:"5px 14px",borderRadius:20,border:`1px solid ${activeSection===s?T.Signal:brd}`,background:activeSection===s?"rgba(107,95,237,0.1)":"transparent",color:activeSection===s?T.Signal:sub,fontSize:12,fontWeight:activeSection===s?700:400,cursor:"pointer",transition:"all 0.15s"}}>{s}</button>
        ))}
      </div>

      <div style={{maxWidth:900,margin:"0 auto",padding:"0 24px 80px"}}>

        {activeSection==="Colour"&&(
          <div>
            <SectionLabel dark={dark}>Colour System</SectionLabel>
            <ColourGroup dark={dark} label="Earth Pole" swatches={[{name:"Clay",hex:T.Clay,usage:"Kairos ceremony, warmth, Ceremony CTA, streak pill"},{name:"Ochre",hex:T.Ochre,usage:"Deep earth. Secondary warm accent"},{name:"Loam",hex:T.Loam,usage:"Dark soil. Tertiary warm accent"},{name:"Sand",hex:T.Sand,usage:"Pale highlight. Warm surface tints"}]}/>
            <ColourGroup dark={dark} label="Cosmos Pole" swatches={[{name:"Pearl",hex:T.Pearl,usage:"Iridescent cool. Genie ambient, form field focus"},{name:"Iris",hex:T.Iris,usage:"Sky-water blue. Metadata, system info"},{name:"Prism",hex:T.Prism,usage:"Kairos epoch identifier · Earth/Cosmos transition · Comet Arc tail · availability confirmed"}]}/>
            <ColourGroup dark={dark} label="Vesica — Interactive" swatches={[{name:"Signal",hex:T.Signal,usage:"Nav selected, active icons, in-product action links. Never CTA bg."},{name:"Glow",hex:T.Glow,usage:"Hover states, progress, soft highlights"},{name:"Pulse",hex:T.Pulse,usage:"Disabled states, background washes"}]}/>
            <ColourGroup dark={dark} label="Confirm — ONE USE ONLY" swatches={[{name:"Moss",hex:T.Moss,usage:"PoL biometric success ONLY. Never: availability, OTP, input validation, transactions, or any other purpose."}]}/>
            <ColourGroup dark={dark} label="Error / Warning" swatches={[{name:"Hearth",hex:T.Hearth,usage:"Recoverable: name taken, wrong OTP, field errors, burn warning 4+ days. WarnCTA bg."},{name:"Ember",hex:T.Ember,usage:"Destructive/final: PoL failure all retries, irreversible states, burn warning 0–3 days. NEVER on OTP."}]}/>
            <ColourGroup dark={dark} label="CTA" swatches={[{name:"Deep Ink",hex:T.DeepInk,usage:"Primary CTA. Warm near-black. Never body text."}]}/>
            <ColourGroup dark={dark} label="Light Surfaces" swatches={[{name:"Paper",hex:T.Paper,usage:"App bg"},{name:"White",hex:T.White,usage:"Card/surface"},{name:"Mist",hex:T.Mist,usage:"Subtle fills"},{name:"Ink",hex:T.Ink,usage:"Primary text"},{name:"Ink Mid",hex:T.InkMid,usage:"Secondary text"},{name:"Ink Soft",hex:T.InkSoft,usage:"Tertiary/captions"},{name:"Ink Faint",hex:T.InkFaint,usage:"Disabled/placeholders"},{name:"Border",hex:T.Border,usage:"Dividers, outlines"}]}/>
            <ColourGroup dark={dark} label="Dark Surfaces" swatches={[{name:"Void",hex:T.Void,usage:"App bg"},{name:"Depth",hex:T.Depth,usage:"Card/surface"},{name:"Dusk",hex:T.Dusk,usage:"Subtle fills"},{name:"Slate",hex:T.Slate,usage:"Borders"}]}/>
          </div>
        )}

        {activeSection==="Typography"&&(
          <div>
            <SectionLabel dark={dark}>Typography</SectionLabel>
            <div style={{background:surf,border:`1px solid ${brd}`,borderRadius:14,padding:"4px 20px 20px"}}>
              {[{role:"Display",size:34,weight:800,tracking:"-0.03em",lh:"1.1",sample:"Presence made permanent."},{role:"H1",size:26,weight:800,tracking:"-0.025em",lh:"1.15",sample:"One human. One Kairos."},{role:"H2",size:20,weight:700,tracking:"-0.015em",lh:"1.2",sample:"Every day. Activated."},{role:"H3",size:17,weight:700,tracking:"-0.01em",lh:"1.25",sample:"Your pulse on today."},{role:"Body Lg",size:16,weight:400,tracking:"0",lh:"1.65",sample:"The Kairos is permanent the moment it's activated."},{role:"Body",size:14,weight:400,tracking:"0",lh:"1.6",sample:"One Kairos per person, per day."},{role:"Caption",size:12,weight:400,tracking:"0",lh:"1.55",sample:"XIV · III · MMXXVI · Activated"},{role:"Label",size:14,weight:700,tracking:"0",lh:"1",sample:"Activate"},{role:"Micro",size:10,weight:700,tracking:"+0.06em",lh:"1",sample:"Serial #"}].map(r=><TypeSample key={r.role} {...r} dark={dark}/>)}
            </div>
            <SectionLabel dark={dark}>Metadata Label Convention</SectionLabel>
            <SpecTable dark={dark} rows={[
              ["Convention","Sentence case everywhere. No textTransform: uppercase on metadata labels."],
              ["Correct","Serial # · Epoch # · Activated by · Origin story · Mood · Date"],
              ["Wrong","SERIAL # · EPOCH # · ACTIVATED BY · ORIGIN STORY"],
              ["Tracking","0.06em on secondary labels"],
              ["Weight","700 on labels · 400 on values (except 700 for key data)"],
            ]}/>
          </div>
        )}

        {activeSection==="Voice"&&(
          <div>
            <SectionLabel dark={dark}>Voice & Tone</SectionLabel>
            <div style={{background:surf,border:`1px solid ${brd}`,borderRadius:14,overflow:"hidden",marginBottom:24}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr"}}>
                <div style={{padding:"10px 14px",background:"rgba(107,95,237,0.06)",fontSize:10,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:T.Signal}}>WE ARE</div>
                <div style={{padding:"10px 14px",background:"rgba(196,131,90,0.06)",fontSize:10,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:T.Clay}}>WE ARE NOT</div>
                {weAreRows.map(([is,not],i)=>(<Fragment key={i}><div style={{padding:"8px 14px",borderTop:`1px solid ${brd}`,fontSize:12,color:txt,lineHeight:1.5}}>{is}</div><div style={{padding:"8px 14px",borderTop:`1px solid ${brd}`,fontSize:12,color:sub,lineHeight:1.5,borderLeft:`1px solid ${brd}`}}>{not}</div></Fragment>))}
              </div>
            </div>
            <SectionLabel dark={dark}>Copy Examples</SectionLabel>
            <div style={{background:surf,border:`1px solid ${brd}`,borderRadius:14,overflow:"hidden",marginBottom:24}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr"}}>
                <div style={{padding:"10px 14px",background:"rgba(76,175,130,0.06)",fontSize:10,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:T.Moss}}>CORRECT</div>
                <div style={{padding:"10px 14px",background:"rgba(160,48,32,0.05)",fontSize:10,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:T.Ember}}>AVOID</div>
                {copyRows.map(([c,a],i)=>(<Fragment key={i}><div style={{padding:"8px 14px",borderTop:`1px solid ${brd}`,fontSize:12,color:txt,lineHeight:1.5}}>{c}</div><div style={{padding:"8px 14px",borderTop:`1px solid ${brd}`,fontSize:12,color:sub,lineHeight:1.5,borderLeft:`1px solid ${brd}`}}>{a}</div></Fragment>))}
              </div>
            </div>
            <SectionLabel dark={dark}>Genie — Voice Rules</SectionLabel>
            <div style={{background:dark?T.Dusk:"rgba(232,201,160,0.10)",borderRadius:14,padding:"16px 20px"}}>
              {["Always first-person. Never third-person self-reference.","Present tense always.","Short sentences. Two clauses max before a full stop.","Contractions encouraged: 'you're', not 'you are'.","Never says: 'please', 'kindly', 'simply', or 'just'.","No hyphens in copy. Ever.","No negative conjunctions. Reframe as a positive statement.","No emojis.","Notices the environment or the moment. Never the member's appearance.","When something is permanent, says so plainly. No softening.","Absent on Splash and OTP. Emerges at Screen 3a onward."].map((rule,i)=>(<div key={i} style={{display:"flex",gap:10,padding:"4px 0",fontSize:13,color:txt,lineHeight:1.6}}><span style={{color:T.Signal,flexShrink:0,fontWeight:700}}>—</span>{rule}</div>))}
            </div>
            <SectionLabel dark={dark}>Validate vs Verify</SectionLabel>
            <SpecTable dark={dark} rows={[["Validate","What ÆPOCH does for human beings. Member-facing copy always."],["Verify","What the system does to signals. Technical only. Never used to describe a person."],["Never swap","'You are now verified.' is wrong. 'You've been validated.' is correct."]]}/>
          </div>
        )}

        {activeSection==="Buttons"&&(
          <div>
            <SectionLabel dark={dark}>Button System</SectionLabel>
            <div style={{background:surf,border:`1px solid ${brd}`,borderRadius:14,padding:24,marginBottom:16}}>
              <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
                <div style={{height:52,borderRadius:13,background:T.DeepInk,color:"#FAF8F5",fontSize:14,fontWeight:700,padding:"0 24px",display:"flex",alignItems:"center",fontFamily:ff}}>Activate</div>
                <div style={{height:52,display:"flex",alignItems:"center",padding:"0 8px",fontSize:14,fontWeight:700,color:T.InkMid,fontFamily:ff}}>Remind me later</div>
                <div style={{height:52,display:"flex",alignItems:"center",padding:"0 8px",fontSize:14,fontWeight:700,color:T.InkSoft,fontFamily:ff}}>I'll decide later</div>
                <div style={{height:52,borderRadius:13,background:T.Clay,color:"white",fontSize:14,fontWeight:700,padding:"0 24px",display:"flex",alignItems:"center",fontFamily:ff}}>Give this Kairos</div>
                <div style={{height:52,borderRadius:13,background:T.Hearth,color:"#FAF8F5",fontSize:14,fontWeight:700,padding:"0 24px",display:"flex",alignItems:"center",fontFamily:ff}}>Try again</div>
              </div>
            </div>
            <SpecTable dark={dark} rows={[
              ["Primary","bg Deep Ink #2A2520 · color #FAF8F5 · radius 13px · height 52px · weight 700 14px · hover: translateY(-2px), bg #342218, Clay underglow"],
              ["Secondary","Text only. No border. No background. color Ink Mid #4A4440 · weight 700 14px"],
              ["Ghost","Text only. No border. No background. color Ink Soft #8A8480 · weight 700 14px · lower emphasis than Secondary"],
              ["Ceremony","bg Clay #C4835A · color #FAF8F5 · radius 13px · height 52px · Kairos transfers, Origin Story commit, irreversible one-time actions"],
              ["Warn / Recovery","bg Hearth #8B5E2F · color #FAF8F5 · radius 13px · height 52px · retry/recovery after failure. Not irreversible."],
              ["Signal — NEVER","Signal is never a CTA background colour"],
              ["Border on CTAs — NEVER","Secondary and Ghost have no border"],
              ["Transfer action rule","Give this Kairos / Send = CeremonyCTA. Navigation steps = PrimaryCTA."],
            ]}/>
          </div>
        )}

        {activeSection==="Links"&&(
          <div>
            <SectionLabel dark={dark}>Link Styles</SectionLabel>
            <SpecTable dark={dark} rows={[["Contextual / legal","color Ink Mid #4A4440 · underline · hover Ink. Never Signal on legal copy."],["In-product action","color Signal #6B5FED · no underline at rest · hover Glow + underline"],["HomeLink (abandon flow)","Signal colour · underline always · 12px"],["Never","Signal on legal copy. Ink Mid underline on actions."]]}/>
          </div>
        )}

        {activeSection==="Chat"&&(
          <div>
            <SectionLabel dark={dark}>Genie Communication — C5 Dual Source</SectionLabel>
            <div style={{background:"#FEFCF9",borderRadius:12,padding:"18px 18px",position:"relative",overflow:"hidden",marginBottom:24}}>
              <div style={{position:"relative",padding:"10px 0"}}>
                <div style={{position:"absolute",inset:"-6px -4px",background:"radial-gradient(ellipse 70% 70% at 85% 10%, rgba(184,169,217,0.26) 0%, transparent 65%), radial-gradient(ellipse 70% 70% at 15% 90%, rgba(232,201,160,0.20) 0%, transparent 65%)",borderRadius:16,pointerEvents:"none"}}/>
                <div style={{position:"relative",fontSize:14,lineHeight:1.75,color:T.Ink,fontFamily:ff}}>Your Kairos for today is made. Day 48.</div>
              </div>
              <div style={{display:"flex",justifyContent:"flex-end",marginTop:10}}>
                <div style={{background:"rgba(42,37,32,0.86)",borderRadius:"13px 13px 3px 13px",padding:"10px 14px",maxWidth:"70%"}}><div style={{fontSize:13,lineHeight:1.65,color:"#FAF8F5",fontFamily:ff}}>What happens if I miss a day?</div></div>
              </div>
            </div>
            <SpecTable dark={dark} rows={[["Genie → Member","C5 dual-source wash. No border. No bubble. Post-login only."],["Member → Genie","rgba(42,37,32,0.86) · radius 13px 13px 3px 13px · #FAF8F5 text · right-aligned"],["Member → Member","Deferred. Earth tones reserved."],["Cosmos source","radial-gradient ellipse 70% at 85% 10% · rgba(184,169,217,0.26)"],["Earth source","radial-gradient ellipse 70% at 15% 90% · rgba(232,201,160,0.20)"]]}/>
          </div>
        )}

        {activeSection==="Motion"&&(
          <div>
            <SectionLabel dark={dark}>Motion — Timing Scale</SectionLabel>
            <div style={{background:surf,border:`1px solid ${brd}`,borderRadius:14,padding:"4px 16px 16px"}}>
              {[{name:"Instant",ms:"0ms",usage:"State changes — toggles, selection highlights"},{name:"Quick",ms:"150ms",usage:"Micro-interactions — button presses, icon swaps"},{name:"Smooth",ms:"300ms",usage:"Standard transitions — screen slides, panel reveals"},{name:"Deliberate",ms:"600ms",usage:"Ceremony — activation confirm, certificate reveal"},{name:"Breath",ms:"1800ms",usage:"Idle pulses — mic listening ring"},{name:"Slow Reveal",ms:"18ms/ch",usage:"Typewriter — Genie speech only"}].map(r=><MotionRow key={r.name} {...r} dark={dark}/>)}
            </div>
            <SectionLabel dark={dark}>Comet Arc — Named Motion Component</SectionLabel>
            <SpecTable dark={dark} rows={[
              ["Name","Comet Arc"],
              ["PoL activation","3 seconds · circular path"],
              ["Initial DID binding","20 seconds · circular path"],
              ["New whisper (Collection)","~5 seconds per orbit · rectangle card perimeter path"],
              ["Head","White-hot point · radial gradient white → Pearl → Prism → transparent"],
              ["Tail","Prism→white gradient · 18% of path length · 60 segments"],
              ["Resolution — PoL success","Moss full-circle ring"],
              ["prefers-reduced-motion","Freeze arc at current position. Static Prism arc segment."],
            ]}/>
          </div>
        )}

        {activeSection==="Icons"&&(
          <div>
            <SectionLabel dark={dark}>Input Bar — All Icons</SectionLabel>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <IconTile dark={dark} label="Mic — Idle" single={<MicWaveform size={38} active={false}/>}/>
              <IconTile dark={dark} label="Mic — Listening" single={<MicWaveform size={38} active={true}/>} bgActive/>
              <IconTile dark={dark} label="Mic — Unavail." single={<MicWaveform size={38} active="unavailable"/>} off/>
              <IconTile dark={dark} label="Speaker — On" single={<IconSpeaker size={22} active/>} bgActive/>
              <IconTile dark={dark} label="Speaker — Off" single={<IconSpeakerOff size={22}/>} off/>
              <IconTile dark={dark} label="Keyboard" single={<IconKeyboard size={22}/>}/>
              <IconTile dark={dark} label="Keyboard — Active" single={<IconKeyboard size={22} color={T.Signal} dismiss/>} bgActive/>
            </div>
            <SectionLabel dark={dark}>Genie Lamp — 3 States</SectionLabel>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <IconTile dark={dark} label="Off" desc="Static outline" single={<IconGenieLamp size={32} color={T.InkSoft} sw={1.3}/>} off/>
              <IconTile dark={dark} label="Summoning" desc="Smoke + waveforms" single={<SummoningLamp size={48}/>} bgActive/>
              <IconTile dark={dark} label="Manifested" desc="Waveforms + dismiss" single={<ManifestLamp size={48}/>} bgActive/>
            </div>
            <SectionLabel dark={dark}>Navigation Icons</SectionLabel>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <IconTile dark={dark} label="Home" desc="Vesica piscis" inactive={<IconHome size={22}/>} selected={<IconHome size={22} color={T.Signal}/>}/>
              <IconTile dark={dark} label="Collection" desc="3×3 dot grid" inactive={<IconCollectionDotGrid size={22}/>} selected={<IconCollectionDotGrid size={22} color={T.Signal}/>}/>
              <IconTile dark={dark} label="Wallet" desc="Stacked cards" inactive={<IconWallet size={22}/>} selected={<IconWallet size={22} color={T.Signal}/>}/>
              <IconTile dark={dark} label="Find Members" desc="Head + plus" inactive={<IconFindMembers size={22}/>} selected={<IconFindMembers size={22} color={T.Signal}/>}/>
              <IconTile dark={dark} label="Support" desc="Question circle" inactive={<IconSupport size={22}/>} selected={<IconSupport size={22} color={T.Signal}/>}/>
              <IconTile dark={dark} label="Profile" desc="Head + ring" inactive={<IconProfile size={22}/>} selected={<IconProfile size={22} color={T.Signal}/>}/>
            </div>
            <SectionLabel dark={dark}>Icon Rules</SectionLabel>
            <SpecTable dark={dark} rows={[
              ["Style","Outline · 1.6px stroke · round caps and joins · 24×24 viewbox"],
              ["Active state","Signal colour + animation = alive. Ink Soft + static = off/unavailable. No exceptions."],
              ["Input bar order","Speaker · Mic (56px centre) · Keyboard · [divider] · Genie lamp (40px)"],
              ["Mic","5-bar animated waveform canvas. Auric gradient per bar. Locked."],
              ["Speaker","On: Signal arcs, animated opacity breath. Off: Ink Soft, static × mark."],
              ["Keyboard","Default: outline rect + keys. Active: down arrow dismiss icon, Signal colour."],
              ["Touch targets","Minimum 44×44px for all interactive elements. Mic 56×56px."],
              ["Four-pointed stars ✦","Banned. Overused in AI/tech as of 2025–26."],
            ]}/>
          </div>
        )}

        {activeSection==="Navigation"&&(
          <div>
            <SectionLabel dark={dark}>Drawer — Live Demo</SectionLabel>
            <SubLabel dark={dark}>Left-side slide-in. Triggered by hamburger fixed bottom-right. No persistent bottom tab bar.</SubLabel>
            <DrawerDemo dark={dark}/>

            <SectionLabel dark={dark}>Drawer — Spec</SectionLabel>
            <SpecTable dark={dark} rows={[
              ["Pattern","Left-side slide-in drawer. No persistent bottom tab bar."],
              ["Trigger","Hamburger div · fixed bottom-right · 44×44px touch target"],
              ["Surface","#FEFCF9 · canvas grain overlay opacity:0.35 · mix-blend-mode:overlay · no colour pools"],
              ["Scrim","rgba(26,22,18,0.36) — Ink-family warm dark. Not neutral black."],
              ["Transition","0.30s cubic-bezier(0.4,0,0.2,1)"],
              ["Selected state","44×44px circle · background rgba(107,95,237,0.10) · border-radius 50% · Signal on icon + label · weight 700"],
              ["Unselected state","Ink Soft #8A8480 · weight 400 · no circle"],
              ["Activate Kairos","Primary CTA (Deep Ink spec). Conditional — collapses to absence once activated. No disabled state."],
              ["Profile entry","Member avatar in drawer footer only. Tapping avatar opens Profile. Never a primary nav item."],
              ["Primary divider","1px solid Border between primary and secondary nav groups. Structural, not decorative."],
            ]}/>

            <SectionLabel dark={dark}>Primary Nav Icons (Destinations)</SectionLabel>
            <SubLabel dark={dark}>Home · Collection · Wallet — places a member travels to.</SubLabel>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
              <IconTile dark={dark} label="Home" desc="Vesica piscis — two circles" inactive={<IconHome size={22}/>} selected={<IconHome size={22} color={T.Signal}/>}/>
              <IconTile dark={dark} label="Collection" desc="3×3 dot grid (nav)" inactive={<IconCollectionDotGrid size={22}/>} selected={<IconCollectionDotGrid size={22} color={T.Signal}/>}/>
              <IconTile dark={dark} label="Wallet" desc="Stacked cards" inactive={<IconWallet size={22}/>} selected={<IconWallet size={22} color={T.Signal}/>}/>
            </div>

            <SectionLabel dark={dark}>Secondary Nav Icons (Utilities)</SectionLabel>
            <SubLabel dark={dark}>Search · Settings · Language · Support — tools and configuration.</SubLabel>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
              <IconTile dark={dark} label="Find Members" desc="Head + plus — deferred" inactive={<IconFindMembers size={22}/>} selected={<IconFindMembers size={22} color={T.Signal}/>}/>
              <IconTile dark={dark} label="Support" desc="Question circle" inactive={<IconSupport size={22}/>} selected={<IconSupport size={22} color={T.Signal}/>}/>
              <IconTile dark={dark} label="Profile" desc="Head + ring" inactive={<IconProfile size={22}/>} selected={<IconProfile size={22} color={T.Signal}/>}/>
            </div>

            <SectionLabel dark={dark}>Collection Icon — Spec</SectionLabel>
            <SpecTable dark={dark} rows={[
              ["Form","3×3 dot grid. One icon at all sizes."],
              ["Opacity graduation","Top-left dot: 18% (oldest) → bottom-right dot: 100% (today/Signal). Linear across 9 dots."],
              ["Fill","Signal #6B5FED at all opacities. No stroke."],
              ["Rationale","One icon, one idea: accumulation over time."],
              ["Retired","Spine + irregular ticks — not used at any size."],
            ]}/>

            <SectionLabel dark={dark}>Language Entry — Single-Line Format</SectionLabel>
            <SubLabel dark={dark}>Abbr pill + language name + faint variant inline. All on one row.</SubLabel>
            <div style={{background:dark?T.Depth:T.White,border:`1px solid ${dark?T.Slate:T.Border}`,borderRadius:14,padding:8,display:"flex",flexDirection:"column",gap:2,maxWidth:380,marginBottom:16}}>
              {LANGUAGES.map(lang=>(
                <LangRowSingleLine key={lang.key} lang={lang} dark={dark}/>
              ))}
            </div>
            <SpecTable dark={dark} rows={[
              ["Abbr pill","42×28px · 8px border-radius · 1.5px solid #E0D8D0 · #F3F0EB background"],
              ["Language name","12px/400 · Ink Mid #4A4440"],
              ["Variant inline","· UK · BR etc. · Ink Faint #C4BEB8 · same row · no sublabel below"],
              ["Selected","Signal border + Signal abbr + Signal name · checkmark right"],
            ]}/>

            <SectionLabel dark={dark}>Primary vs Secondary Nav — Structural Rule</SectionLabel>
            <SpecTable dark={dark} rows={[
              ["Primary","Home · Collection · Wallet — destinations. Places a member travels to."],
              ["Secondary","Search · Settings · Language · Support — utilities. Tools and configuration."],
              ["Divider","Structural separator between groups. Never decorative. Required."],
              ["Profile","Not a primary nav item. Entry point is the member avatar in drawer footer only."],
            ]}/>

            <SectionLabel dark={dark}>Back Navigation — Locked Rule</SectionLabel>
            <SpecTable dark={dark} rows={[
              ["Form","Chevron icon only. Never icon + label. Never label only."],
              ["SVG","path d='M12 5L7 10l5 5' · stroke Ink Soft #8A8480 · strokeWidth 1.6 · round caps/joins · 20×20 viewbox"],
              ["Touch target","44×44px · achieved via padding on the container · marginLeft -8px to align visually"],
              ["Never","The word 'Back'. A screen name. Text-only back navigation."],
              ["Rationale","The chevron is universally understood. Adding a label creates inconsistency at every screen."],
            ]}/>

            <SectionLabel dark={dark}>Camera Active Pill — Locked Placement Rule</SectionLabel>
            <SpecTable dark={dark} rows={[
              ["Component","Dark pill: rgba(26,22,18,0.62) bg · Moss live dot (6px, glow) · uppercase label · border rgba(255,255,255,0.10)"],
              ["Text","CAMERA ACTIVE — ON DEVICE ONLY · 10px/700 · tracking 0.05em · rgba(250,248,245,0.92)"],
              ["Placement","Always immediately below the camera canvas/viewfinder. Centre-justified. Never above. Never floating."],
              ["Contexts","PoL Daily Activation · Initial Account Binding · Any other camera context"],
            ]}/>
          </div>
        )}

        {activeSection==="Genie Presence"&&(
          <div>
            <SectionLabel dark={dark}>Genie Presence — C5 Dual Source</SectionLabel>
            <SpecTable dark={dark} rows={[["Rule","Absent on Splash and OTP. Emerges at Screen 3a. Present on all post-login screens."],["Never","On any unauthenticated surface."],["Cosmos source","radial-gradient ellipse 70% 70% at 85% 10% · rgba(184,169,217,0.26) → transparent 65%"],["Earth source","radial-gradient ellipse 70% 70% at 15% 90% · rgba(232,201,160,0.20) → transparent 65%"],["Genie copy placement","Always above visual content (cards, images, forms). Voice leads, visual follows."]]}/>
          </div>
        )}

        {activeSection==="Form Fields"&&(
          <div>
            <SectionLabel dark={dark}>Form Field States</SectionLabel>
            <SpecTable dark={dark} rows={[["Rest","border 1.5px #E0D8D0 · bg rgba(255,255,255,0.40) · radius 13px"],["Focus","border 1.5px rgba(214,228,240,0.90) · bg rgba(214,228,240,0.12) · ring 0 0 0 3px rgba(184,169,217,0.14)"],["Filled","border 1.5px #E0D8D0 · bg rgba(255,255,255,0.70)"],["Hearth","border 1.5px #8B5E2F · ring rgba(139,94,47,0.08) · 5.8:1 AA ✓"],["Ember","border 1.5px #A03020 · ring rgba(160,48,32,0.08) · 6.2:1 AA ✓"],["Cursor","rgba(184,169,217,0.85) — Prism-toned. Never Signal."],["Moss — never here","Moss is PoL biometric success ONLY. Never on input validation."]]}/>
          </div>
        )}

        {activeSection==="Home Screen"&&(
          <div>
            <SectionLabel dark={dark}>Activate Card — Copy</SectionLabel>
            <SpecTable dark={dark} rows={[["Headline","Create today's Kairos."],["Subline","Add your pulse to a new economy."],["Button","Activate · Deep Ink · height 42px · radius 12px · weight 700 13px"],["Activation behaviour","CTA collapses to absence once activated. No disabled state. Absence IS the feedback."]]}/>
            <SectionLabel dark={dark}>Burn Urgency</SectionLabel>
            <SpecTable dark={dark} rows={[["0–3 days","Ember #A03020"],["4+ days","Hearth #8B5E2F"],["Streak pill","Clay #C4835A family. Never Signal. Human achievement = Earth palette."]]}/>
          </div>
        )}

        {activeSection==="Ceremonial"&&(
          <div>
            <SectionLabel dark={dark}>Streak Pill</SectionLabel>
            <div style={{marginBottom:16}}>
              <div style={{display:"inline-flex",alignItems:"center",gap:7,padding:"6px 14px",borderRadius:20,background:"rgba(196,131,90,0.10)",border:"1px solid rgba(196,131,90,0.28)"}}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1.5C5 3 3 4.5 3 7a3.5 3.5 0 007 0c0-1.5-.8-2.8-1.5-3.5C8 5 7.5 6 6.5 6.5 6.5 5.5 6.2 4 6.5 1.5z" fill={T.Clay} opacity="0.85"/></svg>
                <span style={{fontSize:12,fontWeight:700,color:T.Clay,fontFamily:ff}}>12</span>
                <span style={{fontSize:12,fontWeight:400,color:T.InkMid,fontFamily:ff}}>days in a row.</span>
              </div>
            </div>
            <SpecTable dark={dark} rows={[["Background","rgba(196,131,90,0.10) · border rgba(196,131,90,0.28) · radius 20px"],["Icon","Flame SVG · Clay fill · opacity 0.85 · 13×13px"],["Number","12px/700 · Clay #C4835A"],["Label","days in a row. · 12px/400 · Ink Mid · always with full stop"],["Never","Signal. Streak is a human achievement — Earth palette only."]]}/>
            <SectionLabel dark={dark}>Ceremony Words</SectionLabel>
            <SpecTable dark={dark} rows={[["Form","One word. Full stop. Display weight 800. Ink. Never a colour word."],["Size","34px · weight 800 · tracking -0.03em"],["Icon — biometric","Moss circle tick. PoL/biometric only."],["Icon — transaction","Signal circle tick. In-product transactions."],["Icon — ceremony","Clay circle tick. Kairos activation, Origin Story."],["Examples","Heard. · Bound. · Here. · Sent."]]}/>
            <SectionLabel dark={dark}>URL Convention</SectionLabel>
            <SpecTable dark={dark} rows={[["Display","ÆPOCH — always uppercase Æ ligature"],["Domain","aepoch.xyz — ae lowercase is technical URL convention only"],["Member handle URL","aepoch.xyz/mara — lowercase ae in URL. Correct as-is."]]}/>
          </div>
        )}

        {activeSection==="Wallet Components"&&(
          <div>
            <SectionLabel dark={dark}>Member Avatar</SectionLabel>
            <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
              {["kai","nova","river","sol","eden","mira"].map(h=>(
                <div key={h} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                  <div style={{width:44,height:44,borderRadius:"50%",background:avatarCol(h),display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,fontWeight:700,color:"white",fontFamily:ff}}>{h[0].toUpperCase()}</div>
                  <span style={{fontSize:10,color:dark?T.SnowSoft:T.InkSoft,fontFamily:ff}}>@{h}</span>
                </div>
              ))}
            </div>
            <SpecTable dark={dark} rows={[["Colour derivation","Sum of handle char codes mod 6. Maps to 6 fixed palette colours."],["Palette","Clay · Iris · Prism · Moss · Ochre · Signal (rgba 0.85)"],["Initial","Uppercase first char · white · weight 700 · ~38% of diameter"],["Sizes","28px autocomplete · 36px selected · 40px transaction row · 48px profile"],["Never","Same hardcoded gradient for all members."]]}/>
            <SectionLabel dark={dark}>Kairos Unit</SectionLabel>
            <SpecTable dark={dark} rows={[["Rule","Spell out Kairos in full wherever the unit appears."],["K abbreviation","Not approved. Reads as thousands."],["Future","Custom Æ-derived glyph candidate. Not yet designed."]]}/>
          </div>
        )}

        {activeSection==="Collection"&&<CollectionSection dark={dark}/>}
        {activeSection==="Pending"&&<PendingSection dark={dark}/>}

      </div>
    </div>
  );
}
