import { useState, useEffect, useRef } from "react";

const T = {
  ink:"#1A1612", inkMid:"#4A4440", inkSoft:"#8A8480", inkFaint:"#C4BEB8",
  clay:"#C4835A", prism:"#B8A9D9", signal:"#6B5FED", moss:"#4CAF82",
  hearth:"#8B5E2F", ember:"#A03020", border:"#E0D8D0", cta:"#2A2520",
  ff:"'DM Sans',system-ui,-apple-system,sans-serif",
};

// Avatar colour derived from handle — 6 palette colours, never hardcoded gradient
const AVATAR_COLS = ["#C4835A","#8BAFD4","#B8A9D9","#4CAF82","#A0673A","rgba(107,95,237,0.85)"];
function avatarCol(handle) {
  const sum = (handle||"?").split("").reduce((a,c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLS[sum % AVATAR_COLS.length];
}
function Avatar({ handle, size=36 }) {
  const bg = avatarCol(handle);
  return (
    <div style={{width:size,height:size,borderRadius:"50%",background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.38,fontWeight:700,color:"white",flexShrink:0,fontFamily:T.ff,userSelect:"none"}}>
      {(handle||"?")[0].toUpperCase()}
    </div>
  );
}

const POL=1.0, FREE=34.0, TOTAL=35.0, BURN_DAYS=5;
const MEMBERS=["kai","nova","river","sol","eden","mira","fox","sage","dawn","reef"];
const TRANSACTIONS=[
  {id:1,dir:"received",who:"Kai",  handle:"kai",  amount:1.0,  pulses:100000,date:"Today, 2:14pm",memo:""},
  {id:2,dir:"sent",    who:"Nova", handle:"nova", amount:2.0,  pulses:200000,date:"Yesterday",    memo:"Coffee last week"},
  {id:3,dir:"received",who:"River",handle:"river",amount:0.5,  pulses:50000, date:"16 Mar",       memo:""},
  {id:4,dir:"sent",    who:"Sol",  handle:"sol",  amount:1.0,  pulses:100000,date:"15 Mar",       memo:"For the intro"},
  {id:5,dir:"received",who:"Eden", handle:"eden", amount:1.0,  pulses:100000,date:"14 Mar",       memo:""},
  {id:6,dir:"sent",    who:"Mira", handle:"mira", amount:3.0,  pulses:300000,date:"12 Mar",       memo:""},
  {id:7,dir:"received",who:"Fox",  handle:"fox",  amount:0.25, pulses:25000, date:"8 Mar",        memo:"Thank you"},
  {id:8,dir:"sent",    who:"Dawn", handle:"dawn", amount:1.0,  pulses:100000,date:"3 Mar",        memo:""},
];

function EarthRiseBG({w,h}){
  const ref=useRef();
  useEffect(()=>{
    function draw(){
      const c=ref.current;if(!c)return;
      const dpr=window.devicePixelRatio||1;
      c.width=w*dpr;c.height=h*dpr;c.style.width=w+"px";c.style.height=h+"px";
      const ctx=c.getContext("2d");ctx.scale(dpr,dpr);
      ctx.fillStyle="#FEFCF9";ctx.fillRect(0,0,w,h);
      [{x:.10,y:.70,r:.70,col:"232,201,160",a:.18},{x:.25,y:.85,r:.55,col:"196,131,90",a:.12},
       {x:.05,y:.50,r:.45,col:"196,131,90",a:.08},{x:.55,y:.60,r:.50,col:"232,201,160",a:.10},
       {x:.88,y:.05,r:.55,col:"214,228,240",a:.16},{x:.95,y:.15,r:.38,col:"184,169,217",a:.12},
       {x:.50,y:1.05,r:.50,col:"232,201,160",a:.12}].forEach(({x,y,r,col,a})=>{
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
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 24px 0",height:44,fontFamily:T.ff,flexShrink:0}}>
      <span style={{fontSize:12,fontWeight:700,color:T.ink,letterSpacing:"-0.02em"}}>9:41</span>
      <div style={{display:"flex",gap:5,alignItems:"center"}}>
        <svg width="15" height="11" viewBox="0 0 15 11">{[0,1,2,3].map(i=><rect key={i} x={i*4} y={10-(i+1)*2.5} width="2.5" height={(i+1)*2.5} rx="0.5" fill={T.ink} opacity={i<3?1:0.3}/>)}</svg>
        <svg width="25" height="11" viewBox="0 0 25 11"><rect x="0" y="1" width="21" height="9" rx="2" fill="none" stroke={T.ink} strokeWidth="1.1"/><rect x="1.2" y="2.2" width="15" height="6.6" rx="1.2" fill={T.ink}/><path d="M22 3.5v4q2-.5 2-2t-2-2z" fill={T.ink} opacity=".4"/></svg>
      </div>
    </div>
  );
}

function BackBar({onBack,title}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 24px 0",flexShrink:0}}>
      <div onClick={onBack} style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",padding:"4px 0"}}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12 5L7 10l5 5" stroke={T.inkSoft} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span style={{fontSize:13,color:T.inkSoft,fontFamily:T.ff}}>Wallet</span>
      </div>
      {title&&<span style={{fontSize:13,fontWeight:700,color:T.ink,fontFamily:T.ff,marginLeft:4}}>{title}</span>}
    </div>
  );
}

// PRIMARY CTA — Deep Ink, Earth Reveal hover
function PrimaryCTA({label,onTap,disabled}){
  const [hov,setHov]=useState(false),[prs,setPrs]=useState(false);
  return(
    <div style={{position:"relative",cursor:disabled?"not-allowed":"pointer",userSelect:"none",opacity:disabled?0.5:1,flex:1}}
      onMouseEnter={()=>!disabled&&setHov(true)} onMouseLeave={()=>{setHov(false);setPrs(false);}}
      onMouseDown={()=>!disabled&&setPrs(true)} onMouseUp={()=>{setPrs(false);!disabled&&onTap&&onTap();}}>
      {hov&&!prs&&!disabled&&<div style={{position:"absolute",bottom:-8,left:"8%",right:"8%",height:20,background:"radial-gradient(ellipse,rgba(196,131,90,0.48) 0%,transparent 70%)",filter:"blur(8px)",pointerEvents:"none"}}/>}
      <div style={{position:"relative",zIndex:1,height:48,borderRadius:13,background:prs?"#1E1510":hov?"#342218":T.cta,color:"#FAF8F5",fontSize:14,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.ff,transform:prs?"translateY(1px) scale(.998)":hov?"translateY(-2px)":"none",boxShadow:"0 2px 16px rgba(42,37,32,.17)",transition:"all .26s cubic-bezier(.34,1.56,.64,1)"}}>{label}</div>
    </div>
  );
}

// SECONDARY CTA — text only, no border, no background
function SecondaryCTA({label,onTap}){
  const [hov,setHov]=useState(false);
  return(
    <div onClick={onTap} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{flex:1,height:48,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
      <span style={{fontSize:14,fontWeight:700,color:hov?T.ink:T.inkMid,fontFamily:T.ff,transition:"color .15s"}}>{label}</span>
    </div>
  );
}

// GHOST CTA — text only, lower emphasis
function GhostCTA({label,onTap}){
  const [hov,setHov]=useState(false);
  return(
    <div onClick={onTap} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{flex:1,height:48,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
      <span style={{fontSize:14,fontWeight:700,color:hov?T.inkMid:T.inkSoft,fontFamily:T.ff,transition:"color .15s"}}>{label}</span>
    </div>
  );
}

function QRBtn({onTap}){
  const [hov,setHov]=useState(false);
  return(
    <div onClick={onTap} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{width:48,height:48,borderRadius:13,border:`1.5px solid ${T.border}`,background:hov?"rgba(255,255,255,0.70)":"rgba(255,255,255,0.45)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all .2s",flexShrink:0}}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" stroke={hov?T.ink:T.inkMid} strokeWidth="1.6"/>
        <rect x="14" y="3" width="7" height="7" rx="1.5" stroke={hov?T.ink:T.inkMid} strokeWidth="1.6"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5" stroke={hov?T.ink:T.inkMid} strokeWidth="1.6"/>
        <rect x="5.5" y="5.5" width="2" height="2" fill={hov?T.ink:T.inkMid}/>
        <rect x="16.5" y="5.5" width="2" height="2" fill={hov?T.ink:T.inkMid}/>
        <rect x="5.5" y="16.5" width="2" height="2" fill={hov?T.ink:T.inkMid}/>
        <path d="M14 14h2v2h-2zM18 14h3M18 18h3M14 18v3" stroke={hov?T.ink:T.inkMid} strokeWidth="1.6"/>
      </svg>
    </div>
  );
}

function CopyIcon({copied}){
  if(copied)return(<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" fill="rgba(76,175,130,0.12)"/><path d="M4.5 8l2.5 2.5L11.5 5" stroke={T.moss} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>);
  return(<svg width="16" height="16" viewBox="0 0 16 16" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="1.5" width="9" height="11" rx="2" stroke={T.signal} strokeWidth="1.4"/><rect x="2" y="4" width="9" height="11" rx="2" stroke={T.signal} strokeWidth="1.4" fill="white" fillOpacity="0.7"/></svg>);
}

function Numpad({value, onChange}){
  function press(k){
    if(k==="del"){onChange(value.slice(0,-1)||"");return;}
    if(k==="."){if(value.includes("."))return;onChange((value||"0")+".");return;}
    if(value==="0"&&k!==".")onChange(k);
    else if(value.length<8){
      const dotIdx=value.indexOf(".");
      if(dotIdx!==-1&&value.length-dotIdx>5)return;
      onChange((value||"")+k);
    }
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
                style={{height:46,borderRadius:12,background:isDel?"transparent":"rgba(255,255,255,0.55)",border:`1px solid ${isDel?"transparent":T.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",userSelect:"none",transition:"background .1s",fontFamily:T.ff,fontSize:isDel?14:18,fontWeight:isDel?400:700,color:isDel?T.inkSoft:T.ink}}
                onMouseEnter={e=>{if(!isDel)e.currentTarget.style.background="rgba(255,255,255,0.80)";}}
                onMouseLeave={e=>{e.currentTarget.style.background=isDel?"transparent":"rgba(255,255,255,0.55)";}}>
                {isDel
                  ?<svg width="18" height="14" viewBox="0 0 24 18" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1H21a2 2 0 012 2v12a2 2 0 01-2 2H9L2 9z" stroke={T.inkSoft} strokeWidth="1.6"/><path d="M13 6l6 6M19 6l-6 6" stroke={T.inkSoft} strokeWidth="1.6"/></svg>
                  :k}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function SendScreen({onBack}){
  const [step,setStep]=useState("recipient");
  const [query,setQuery]=useState("");
  const [recipient,setRecipient]=useState(null);
  const [isExternal,setIsExternal]=useState(false);
  const [amount,setAmount]=useState("");
  const [memo,setMemo]=useState("");
  const [memoFocus,setMemoFocus]=useState(false);
  const [sent,setSent]=useState(false);
  const [focus,setFocus]=useState(null);
  const MEMO_MAX=36;
  const filtered=query.length>1?MEMBERS.filter(m=>m.toLowerCase().includes(query.toLowerCase())):[];
  const looksExternal=query.length>3&&filtered.length===0&&!recipient;
  const num=parseFloat(amount)||0;
  const overTotal=num>TOTAL&&amount!=="";
  const canNext=!!(recipient||isExternal);
  const canReview=num>0&&!overTotal;

  function pickMember(m){setRecipient(m);setQuery(m);setIsExternal(false);}
  function useExternal(){setRecipient(query);setIsExternal(true);}

  const displayAmount=amount===""?"0":amount;
  const pulses=Math.round((parseFloat(amount)||0)*100000);
  const fmtA=(n)=>n%1===0?n.toFixed(1):n.toFixed(5).replace(/\.?0+$/,"");

  if(sent)return(
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px",textAlign:"center"}}>
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none" style={{marginBottom:16}}>
        <circle cx="28" cy="28" r="27" fill="rgba(107,95,237,0.10)" stroke={T.signal} strokeWidth="1.4"/>
        <path d="M17 28l8 8 14-14" stroke={T.signal} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <div style={{fontSize:28,fontWeight:800,letterSpacing:"-0.028em",color:T.ink,fontFamily:T.ff,marginBottom:8}}>Sent.</div>
      <div style={{fontSize:14,color:T.inkMid,fontFamily:T.ff,marginBottom:32,lineHeight:1.6}}>That's how the economy breathes.</div>
      <div onClick={onBack} style={{fontSize:13,fontWeight:700,color:T.inkSoft,fontFamily:T.ff,cursor:"pointer",borderBottom:`1px solid rgba(138,132,128,0.25)`,paddingBottom:1}}>Back to Wallet</div>
    </div>
  );

  if(step==="recipient")return(
    <div style={{flex:1,overflowY:"auto",padding:"8px 24px 40px"}}>
      <div style={{fontSize:22,fontWeight:800,letterSpacing:"-0.025em",color:T.ink,fontFamily:T.ff,marginBottom:4}}>Send</div>
      <div style={{fontSize:13,color:T.inkSoft,fontFamily:T.ff,marginBottom:16}}>Who are you sending to?</div>
      <div style={{position:"relative",marginBottom:8}}>
        <input value={query} onChange={e=>{setQuery(e.target.value);setRecipient(null);setIsExternal(false);}}
          onFocus={()=>setFocus("rec")} onBlur={()=>setTimeout(()=>setFocus(f=>f==="rec"?null:f),150)}
          placeholder="Member handle or wallet address"
          style={{width:"100%",height:52,borderRadius:13,border:`1.5px solid ${focus==="rec"?"rgba(214,228,240,0.90)":recipient?"rgba(184,169,217,0.90)":T.border}`,background:focus==="rec"?"rgba(214,228,240,0.12)":recipient?"rgba(214,228,240,0.08)":"rgba(255,255,255,0.45)",boxShadow:focus==="rec"?"0 0 0 3px rgba(184,169,217,0.14)":"none",padding:"0 16px",fontSize:14,color:T.ink,fontFamily:T.ff,outline:"none",caretColor:"rgba(184,169,217,0.85)",transition:"all .18s"}}/>
        {focus==="rec"&&filtered.length>0&&(
          <div style={{position:"absolute",top:56,left:0,right:0,borderRadius:12,background:"rgba(254,252,249,0.98)",border:`1px solid ${T.border}`,boxShadow:"0 8px 28px rgba(26,22,18,0.14)",zIndex:20,overflow:"hidden"}}>
            {filtered.slice(0,5).map((m,i)=>(
              <div key={m} onMouseDown={()=>pickMember(m)}
                style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderBottom:i<Math.min(filtered.length,5)-1?`1px solid rgba(224,216,208,0.45)`:"none",cursor:"pointer"}}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(107,95,237,0.05)"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <Avatar handle={m} size={32}/>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:T.ink,fontFamily:T.ff}}>{m.charAt(0).toUpperCase()+m.slice(1)}</div>
                  <div style={{fontSize:11,color:T.inkSoft,fontFamily:T.ff}}>aepoch.xyz/{m}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {looksExternal&&!recipient&&(
        <div style={{marginBottom:8}}>
          <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:6,paddingLeft:2}}>
            <div style={{width:4,height:4,borderRadius:"50%",background:T.inkFaint}}/>
            <span style={{fontSize:11,color:T.inkSoft,fontFamily:T.ff}}>External wallet</span>
          </div>
          <div onMouseDown={useExternal}
            style={{padding:"10px 14px",borderRadius:12,background:"rgba(255,255,255,0.50)",border:`1px solid ${T.border}`,cursor:"pointer"}}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(107,95,237,0.04)"}
            onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.50)"}>
            <div style={{fontSize:12,fontWeight:700,color:T.ink,fontFamily:T.ff,wordBreak:"break-all"}}>{query}</div>
            <div style={{fontSize:10,color:T.inkSoft,marginTop:2,fontFamily:T.ff}}>Send to this address</div>
          </div>
        </div>
      )}
      {recipient&&!isExternal&&(
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:12,background:"rgba(255,255,255,0.55)",border:`1px solid ${T.border}`,marginBottom:8}}>
          <Avatar handle={recipient} size={36}/>
          <div><div style={{fontSize:13,fontWeight:700,color:T.ink,fontFamily:T.ff}}>{recipient.charAt(0).toUpperCase()+recipient.slice(1)}</div><div style={{fontSize:11,color:T.inkSoft,fontFamily:T.ff}}>aepoch.xyz/{recipient}</div></div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{marginLeft:"auto"}}><circle cx="8" cy="8" r="7" fill="rgba(184,169,217,0.15)"/><path d="M4 8l2.5 2.5L12 5" stroke={T.prism} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      )}
      {isExternal&&recipient&&(
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderRadius:12,background:"rgba(255,255,255,0.55)",border:`1px solid ${T.border}`,marginBottom:8}}>
          <div style={{width:36,height:36,borderRadius:"50%",background:"rgba(224,216,208,0.60)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="14" rx="3" stroke={T.inkSoft} strokeWidth="1.6"/><path d="M16 13a1 1 0 110 2 1 1 0 010-2z" fill={T.inkSoft}/><path d="M2 10h20" stroke={T.inkSoft} strokeWidth="1.6"/></svg>
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:11,color:T.inkSoft,fontFamily:T.ff,marginBottom:1}}>External wallet</div>
            <div style={{fontSize:12,fontWeight:700,color:T.ink,fontFamily:T.ff,wordBreak:"break-all"}}>{recipient}</div>
          </div>
        </div>
      )}
      <div style={{marginTop:16}}><PrimaryCTA label="Next" onTap={()=>canNext&&setStep("amount")} disabled={!canNext}/></div>
    </div>
  );

  if(step==="amount")return(
    <div style={{flex:1,display:"flex",flexDirection:"column",padding:"8px 0 0"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px 12px"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {!isExternal&&<Avatar handle={recipient} size={28}/>}
          <span style={{fontSize:13,fontWeight:700,color:T.ink,fontFamily:T.ff}}>{isExternal?"External wallet":recipient?.charAt(0).toUpperCase()+recipient?.slice(1)}</span>
        </div>
        <div onClick={()=>setStep("recipient")} style={{fontSize:11,fontWeight:700,color:T.signal,cursor:"pointer",fontFamily:T.ff}}>Change</div>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 24px"}}>
        <div style={{fontSize:overTotal?36:displayAmount.length>6?32:displayAmount==="0"?48:44,fontWeight:800,letterSpacing:"-0.04em",color:overTotal?T.ember:displayAmount==="0"?T.inkFaint:T.ink,fontFamily:T.ff,fontVariantNumeric:"tabular-nums",lineHeight:1,marginBottom:6,transition:"color .2s"}}>
          {displayAmount}
        </div>
        <div style={{fontSize:12,color:T.inkSoft,fontFamily:T.ff,marginBottom:4}}>Kairos</div>
        {num>0&&<div style={{fontSize:11,color:overTotal?T.ember:T.inkFaint,fontFamily:T.ff,fontVariantNumeric:"tabular-nums"}}>{pulses.toLocaleString()} Pulses</div>}
        {overTotal&&<div style={{fontSize:11,color:T.ember,fontFamily:T.ff,marginTop:4,fontWeight:700}}>Max {TOTAL} Kairos available</div>}
        <div style={{display:"flex",gap:6,marginTop:14}}>
          {[
            // TODO copy pass: "Use or Lose" label not final
            {l:"Use or Lose",v:POL.toFixed(1),c:T.hearth},
            {l:"Yours",v:FREE.toFixed(1),c:T.inkSoft},
            {l:"Total",v:TOTAL.toFixed(1),c:T.signal},
          ].map(({l,v,c})=>(
            <div key={l} style={{padding:"4px 10px",borderRadius:20,background:"rgba(255,255,255,0.55)",border:`1px solid ${T.border}`,display:"flex",gap:5,alignItems:"center"}}>
              <span style={{fontSize:10,color:c,fontWeight:700,fontFamily:T.ff}}>{v}</span>
              <span style={{fontSize:9,color:T.inkFaint,fontFamily:T.ff}}>{l}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{padding:"0 24px 10px"}}>
        <div style={{position:"relative"}}>
          <input value={memo} onChange={e=>setMemo(e.target.value.slice(0,MEMO_MAX))}
            onFocus={()=>setMemoFocus(true)} onBlur={()=>setMemoFocus(false)}
            placeholder="What's this for? (optional)"
            style={{width:"100%",height:42,borderRadius:12,border:`1.5px solid ${memoFocus?"rgba(214,228,240,0.90)":T.border}`,background:memoFocus?"rgba(214,228,240,0.12)":"rgba(255,255,255,0.45)",boxShadow:memoFocus?"0 0 0 3px rgba(184,169,217,0.14)":"none",padding:"0 40px 0 14px",fontSize:13,color:T.ink,fontFamily:T.ff,outline:"none",caretColor:"rgba(184,169,217,0.85)",transition:"all .18s"}}/>
          <div style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",fontSize:10,fontWeight:700,fontFamily:T.ff,color:MEMO_MAX-memo.length<8?T.hearth:T.inkFaint,pointerEvents:"none"}}>{MEMO_MAX-memo.length}</div>
        </div>
      </div>
      <div style={{padding:"4px 16px 8px",flexShrink:0}}><Numpad value={amount} onChange={setAmount}/></div>
      <div style={{padding:"8px 24px 16px",flexShrink:0}}><PrimaryCTA label="Review" onTap={()=>canReview&&setStep("confirm")} disabled={!canReview}/></div>
    </div>
  );

  return(
    <div style={{flex:1,overflowY:"auto",padding:"8px 24px 40px"}}>
      <div style={{fontSize:22,fontWeight:800,letterSpacing:"-0.025em",color:T.ink,fontFamily:T.ff,marginBottom:4}}>Confirm.</div>
      <div style={{fontSize:13,color:T.inkSoft,fontFamily:T.ff,marginBottom:16}}>Once sent, this cannot be undone.</div>
      <div style={{borderRadius:14,border:`1px solid ${T.border}`,background:"rgba(255,255,255,0.55)",overflow:"hidden",marginBottom:12}}>
        {[
          ["To", isExternal?"External wallet":`${recipient?.charAt(0).toUpperCase()+recipient?.slice(1)} · aepoch.xyz/${recipient}`],
          ["Amount", `${fmtA(parseFloat(amount))} Kairos`],
          ["Pulses", pulses.toLocaleString()],
          ...(memo?[["Memo",memo]]:[]),
        ].map(([k,v],i,a)=>(
          <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"10px 14px",borderBottom:i<a.length-1?`1px solid rgba(224,216,208,0.55)`:"none"}}>
            <span style={{fontSize:12,color:T.inkSoft,fontFamily:T.ff,flexShrink:0,marginRight:12}}>{k}</span>
            <span style={{fontSize:12,fontWeight:700,color:T.ink,fontFamily:T.ff,textAlign:"right",wordBreak:"break-all"}}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{padding:"10px 12px",borderRadius:10,background:"rgba(139,94,47,0.06)",border:`1px solid rgba(139,94,47,0.18)`,marginBottom:14}}>
        <div style={{fontSize:11,color:T.hearth,lineHeight:1.6,fontFamily:T.ff}}>This cannot be undone. The Kairos moves permanently.</div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <SecondaryCTA label="Back" onTap={()=>setStep("amount")}/>
        <PrimaryCTA label="Send" onTap={()=>setSent(true)}/>
      </div>
    </div>
  );
}

function RequestScreen(){
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px",textAlign:"center"}}>
      <div style={{width:56,height:56,borderRadius:"50%",background:"rgba(107,95,237,0.08)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:16}}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 12h6M9 16h4M7 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2" stroke={T.signal} strokeWidth="1.6"/>
          <rect x="9" y="2" width="6" height="4" rx="1" stroke={T.signal} strokeWidth="1.6"/>
        </svg>
      </div>
      <div style={{fontSize:20,fontWeight:800,color:T.ink,fontFamily:T.ff,marginBottom:8}}>Request</div>
      <div style={{fontSize:14,color:T.inkSoft,fontFamily:T.ff,lineHeight:1.65,maxWidth:260,marginBottom:14}}>Send a payment request to a specific member for a set amount.</div>
      <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"5px 14px",borderRadius:20,background:"rgba(107,95,237,0.06)",border:"1px solid rgba(107,95,237,0.14)"}}>
        <span style={{fontSize:11,fontWeight:700,color:T.signal,fontFamily:T.ff}}>Coming after Epoch 1</span>
      </div>
    </div>
  );
}

function ReceiveScreen(){
  const [copied,setCopied]=useState(null);
  function copy(t){setCopied(t);setTimeout(()=>setCopied(null),2000);}
  const handle="aepoch.xyz/mara", address="ÆP·0x4f3a·9c12·b8e7·2d01";
  return(
    <div style={{flex:1,overflowY:"auto",padding:"8px 24px 40px"}}>
      <div style={{fontSize:22,fontWeight:800,letterSpacing:"-0.025em",color:T.ink,fontFamily:T.ff,marginBottom:4}}>Receive</div>
      <div style={{fontSize:13,color:T.inkSoft,fontFamily:T.ff,marginBottom:24}}>Share your handle or let them scan.</div>
      <div style={{width:180,height:180,borderRadius:16,border:`1.5px solid ${T.border}`,background:"rgba(255,255,255,0.60)",margin:"0 auto 24px",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:8}}>
        <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
          {[[8,8,32,32],[56,8,32,32],[8,56,32,32]].map(([x,y,w,h],i)=>(
            <g key={i}><rect x={x} y={y} width={w} height={h} rx="4" stroke={T.inkMid} strokeWidth="2.5" fill="none"/><rect x={x+8} y={y+8} width={w-16} height={h-16} rx="2" fill={T.inkMid} opacity="0.7"/></g>
          ))}
          {[56,64,72,56,64,72,56,64,72].map((x,i)=>(<rect key={i} x={x} y={56+Math.floor(i/3)*10} width="6" height="6" rx="1" fill={T.inkMid} opacity={0.2+((i*7)%5)*0.14}/>))}
        </svg>
        <span style={{fontSize:9,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",color:T.inkFaint,fontFamily:T.ff}}>QR placeholder</span>
      </div>
      <div style={{borderRadius:14,border:`1px solid ${T.border}`,background:"rgba(255,255,255,0.55)",overflow:"hidden"}}>
        <div style={{padding:"12px 16px",borderBottom:`1px solid rgba(224,216,208,0.5)`}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:T.inkFaint,fontFamily:T.ff,marginBottom:5}}>Handle</div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
            <span style={{fontSize:15,fontWeight:700,color:T.ink,fontFamily:T.ff}}>{handle}</span>
            <div onClick={()=>copy("handle")} style={{cursor:"pointer",flexShrink:0,padding:4}}><CopyIcon copied={copied==="handle"}/></div>
          </div>
        </div>
        <div style={{padding:"12px 16px"}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:T.inkFaint,fontFamily:T.ff,marginBottom:5}}>Wallet address</div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
            <span style={{fontSize:12,color:T.inkMid,fontFamily:"monospace,system-ui",letterSpacing:"0.02em",wordBreak:"break-all",lineHeight:1.5}}>{address}</span>
            <div onClick={()=>copy("address")} style={{cursor:"pointer",flexShrink:0,padding:4}}><CopyIcon copied={copied==="address"}/></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TxRow({tx,expanded,onToggle}){
  const [hov,setHov]=useState(false);
  const isR=tx.dir==="received";
  // Amount formatted — spell out Kairos (K abbreviation not approved)
  const fmtA=(n)=>n%1===0?n.toFixed(1):n.toFixed(5).replace(/\.?0+$/,"");
  return(
    <div style={{borderBottom:`1px solid rgba(224,216,208,0.50)`}}>
      <div onClick={onToggle} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
        style={{display:"flex",alignItems:"center",gap:10,padding:"11px 16px",background:hov||expanded?"rgba(255,255,255,0.35)":"transparent",cursor:"pointer",transition:"background .15s"}}>
        <div style={{width:34,height:34,borderRadius:"50%",background:isR?"rgba(196,131,90,0.10)":"rgba(26,22,18,0.05)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          {isR
            ?<svg width="13" height="13" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12M8 11l4 4 4-4" stroke={T.clay} strokeWidth="1.6"/><path d="M5 19h14" stroke={T.clay} strokeWidth="1.6"/></svg>
            :<svg width="13" height="13" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21V9M8 13l4-4 4 4" stroke={T.inkSoft} strokeWidth="1.6"/><path d="M5 5h14" stroke={T.inkSoft} strokeWidth="1.6"/></svg>
          }
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:13,fontWeight:700,color:T.ink,fontFamily:T.ff}}>{isR?`From ${tx.who}`:`To ${tx.who}`}</div>
          <div style={{fontSize:10,color:T.inkFaint,fontFamily:T.ff,marginTop:1}}>{tx.memo?`${tx.memo} · ${tx.date}`:tx.date}</div>
        </div>
        <div style={{textAlign:"right",flexShrink:0}}>
          <div style={{fontSize:12,fontWeight:700,color:isR?T.moss:T.inkMid,fontFamily:T.ff,fontVariantNumeric:"tabular-nums"}}>
            {isR?"+":"-"}{fmtA(tx.amount)}{" "}
            <span style={{fontSize:10,fontWeight:400,color:isR?T.moss:T.inkSoft}}>Kairos</span>
          </div>
        </div>
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{flexShrink:0,transition:"transform .2s",transform:expanded?"rotate(90deg)":"rotate(0deg)",opacity:0.35}}>
          <path d="M6 4l4 4-4 4" stroke={T.inkSoft} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      {expanded&&(
        <div style={{padding:"0 16px 14px",background:"rgba(255,255,255,0.22)"}}>
          <div style={{borderRadius:12,border:`1px solid ${T.border}`,background:"rgba(255,255,255,0.65)",overflow:"hidden",marginBottom:10}}>
            {[
              [isR?"From":"To",`${tx.who} · aepoch.xyz/${tx.handle}`],
              ["Amount",`${fmtA(tx.amount)} Kairos`],
              ["Pulses",tx.pulses.toLocaleString()],
              ["Date",tx.date],
              ...(tx.memo?[["Memo",tx.memo]]:[]),
            ].map(([k,v],i,a)=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 12px",borderBottom:i<a.length-1?`1px solid rgba(224,216,208,0.45)`:"none"}}>
                <span style={{fontSize:11,color:T.inkSoft,fontFamily:T.ff,flexShrink:0,marginRight:12}}>{k}</span>
                <span style={{fontSize:11,fontWeight:700,color:T.ink,fontFamily:T.ff,textAlign:"right",wordBreak:"break-all"}}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{textAlign:"center"}}>
            <span style={{fontSize:12,fontWeight:700,color:T.signal,fontFamily:T.ff,cursor:"pointer",borderBottom:`1px solid rgba(107,95,237,0.28)`,paddingBottom:1}}>View this Kairos in Collection</span>
          </div>
        </div>
      )}
    </div>
  );
}

function WalletHome({onNav}){
  const [filter,setFilter]=useState("all");
  const [search,setSearch]=useState("");
  const [searchFocus,setSearchFocus]=useState(false);
  const [expandedTx,setExpandedTx]=useState(null);
  const filtered=TRANSACTIONS.filter(tx=>{
    if(filter==="sent"&&tx.dir!=="sent")return false;
    if(filter==="received"&&tx.dir!=="received")return false;
    if(search.trim()){const q=search.toLowerCase();return tx.who.toLowerCase().includes(q)||tx.handle.toLowerCase().includes(q)||tx.date.toLowerCase().includes(q)||(tx.memo&&tx.memo.toLowerCase().includes(q));}
    return true;
  });
  function fmtB(n){return n%1===0?n.toFixed(1):n.toString();}
  return(
    <div style={{flex:1,overflowY:"auto",padding:"16px 24px 48px"}}>
      <div style={{fontSize:26,fontWeight:800,letterSpacing:"-0.025em",color:T.ink,fontFamily:T.ff,marginBottom:20}}>Wallet</div>
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.09em",textTransform:"uppercase",color:T.inkSoft,fontFamily:T.ff,marginBottom:6}}>Total Kairos</div>
        <div style={{fontSize:52,fontWeight:800,letterSpacing:"-0.04em",color:T.ink,fontFamily:T.ff,lineHeight:1,fontVariantNumeric:"tabular-nums"}}>{fmtB(TOTAL)}</div>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:20}}>
        {/* TODO copy pass: "Use or Lose" label not final */}
        <div style={{flex:1,borderRadius:14,background:"rgba(139,94,47,0.06)",border:`1px solid rgba(139,94,47,0.18)`,padding:"12px 14px"}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:T.hearth,fontFamily:T.ff,marginBottom:4}}>Use or Lose</div>
          <div style={{fontSize:22,fontWeight:800,color:T.ink,fontFamily:T.ff,fontVariantNumeric:"tabular-nums",lineHeight:1,marginBottom:4}}>{fmtB(POL)}</div>
          <div style={{fontSize:10,color:T.hearth,fontFamily:T.ff,fontWeight:700}}>Burns in {BURN_DAYS} days</div>
        </div>
        {/* TODO copy pass: "Yours to Keep" label not final */}
        <div style={{flex:1,borderRadius:14,background:"rgba(255,255,255,0.52)",border:`1px solid ${T.border}`,padding:"12px 14px"}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:T.inkSoft,fontFamily:T.ff,marginBottom:4}}>Yours to Keep</div>
          <div style={{fontSize:22,fontWeight:800,color:T.ink,fontFamily:T.ff,fontVariantNumeric:"tabular-nums",lineHeight:1,marginBottom:4}}>{fmtB(FREE)}</div>
          <div style={{fontSize:10,color:T.inkSoft,fontFamily:T.ff}}>Never expires</div>
        </div>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:24}}>
        <PrimaryCTA label="Send" onTap={()=>onNav("send")}/>
        <GhostCTA label="Request" onTap={()=>onNav("request")}/>
        <QRBtn onTap={()=>onNav("receive")}/>
      </div>
      <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.09em",textTransform:"uppercase",color:T.inkSoft,fontFamily:T.ff,marginBottom:10}}>Activity</div>
      <div style={{display:"flex",gap:6,marginBottom:8}}>
        {["all","sent","received"].map(f=>{const sel=filter===f;return(<div key={f} onClick={()=>setFilter(f)} style={{padding:"5px 12px",borderRadius:20,border:`1px solid ${sel?T.signal:T.border}`,background:sel?"rgba(107,95,237,0.08)":"rgba(255,255,255,0.40)",fontSize:11,fontWeight:sel?700:400,color:sel?T.signal:T.inkSoft,cursor:"pointer",transition:"all .15s",fontFamily:T.ff}}>{{all:"All",sent:"Sent",received:"Received"}[f]}</div>);})}
      </div>
      <div style={{position:"relative",marginBottom:10}}>
        <div style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" strokeLinecap="round"><circle cx="10.5" cy="10.5" r="6.5" stroke={searchFocus?T.signal:T.inkFaint} strokeWidth="1.6"/><line x1="15.5" y1="15.5" x2="20" y2="20" stroke={searchFocus?T.signal:T.inkFaint} strokeWidth="1.8"/></svg>
        </div>
        <input value={search} onChange={e=>setSearch(e.target.value)} onFocus={()=>setSearchFocus(true)} onBlur={()=>setSearchFocus(false)} placeholder="Search activity…"
          style={{width:"100%",height:40,borderRadius:12,border:`1.5px solid ${searchFocus?"rgba(214,228,240,0.90)":T.border}`,background:searchFocus?"rgba(214,228,240,0.12)":"rgba(255,255,255,0.45)",boxShadow:searchFocus?"0 0 0 3px rgba(184,169,217,0.14)":"none",paddingLeft:34,paddingRight:28,fontSize:13,color:T.ink,fontFamily:T.ff,outline:"none",caretColor:"rgba(184,169,217,0.85)",transition:"all .18s"}}/>
        {search&&<div onClick={()=>setSearch("")} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",cursor:"pointer",color:T.inkFaint,fontSize:16,lineHeight:1}}>×</div>}
      </div>
      <div style={{borderRadius:14,background:"rgba(255,255,255,0.50)",border:`1px solid ${T.border}`,overflow:"hidden"}}>
        {filtered.length===0
          ?<div style={{padding:"28px 16px",textAlign:"center",fontSize:13,color:T.inkSoft,fontFamily:T.ff}}>Nothing here yet.</div>
          :filtered.map(tx=><TxRow key={tx.id} tx={tx} expanded={expandedTx===tx.id} onToggle={()=>setExpandedTx(expandedTx===tx.id?null:tx.id)}/>)
        }
      </div>
    </div>
  );
}

export default function App(){
  const [screen,setScreen]=useState("home");
  const W=375;
  useEffect(()=>{
    const l=document.createElement("link");l.rel="stylesheet";
    l.href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap";
    document.head.appendChild(l);
  },[]);
  const titles={send:"Send",request:"Request",receive:"Receive"};
  return(
    <div style={{background:"#C8C2BB",minHeight:"100vh",padding:"24px 16px 48px",fontFamily:T.ff,display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
      <div style={{width:W}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:".10em",textTransform:"uppercase",color:"#8A8480",fontFamily:"system-ui"}}>ÆPOCH · Wallet</div>
        <div style={{fontSize:20,fontWeight:800,letterSpacing:"-.025em",color:"#1A1612"}}>Wallet — v1.4</div>
      </div>
      <div style={{position:"relative",width:W,height:693,flexShrink:0}}>
        <div style={{position:"absolute",top:8,left:10,right:10,bottom:-8,borderRadius:44,background:"rgba(200,192,184,0.55)",border:"1px solid rgba(180,172,164,0.4)"}}/>
        <div style={{position:"absolute",top:4,left:5,right:5,bottom:-4,borderRadius:44,background:"rgba(210,204,196,0.70)",border:"1px solid rgba(190,184,176,0.5)"}}/>
        <div style={{position:"absolute",inset:0,borderRadius:44,overflow:"hidden",background:"#FEFCF9",boxShadow:"0 2px 4px rgba(0,0,0,.06),0 24px 72px rgba(0,0,0,.16),inset 0 0 0 1px rgba(0,0,0,.05)",display:"flex",flexDirection:"column"}}>
          <EarthRiseBG w={W} h={693}/>
          <Grain/>
          <div style={{position:"relative",zIndex:5,display:"flex",flexDirection:"column",height:"100%"}}>
            <StatusBar/>
            {screen!=="home"&&<BackBar onBack={()=>setScreen("home")} title={titles[screen]}/>}
            {screen==="home"    &&<WalletHome onNav={setScreen}/>}
            {screen==="send"    &&<SendScreen onBack={()=>setScreen("home")}/>}
            {screen==="request" &&<RequestScreen/>}
            {screen==="receive" &&<ReceiveScreen/>}
          </div>
        </div>
      </div>
      <div style={{width:W,borderRadius:12,background:"rgba(255,255,255,0.35)",border:"1px solid rgba(224,216,208,0.6)",padding:"12px 16px"}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:"#8A8480",marginBottom:8,fontFamily:"system-ui"}}>Engineering notes — Wallet v1.4</div>
        {[
          "Expired Kairos (fossils) do not appear in Activity. Collection only. [Engineering-internal term — not member-visible language.]",
          "Amount entry uses a custom in-screen numpad — no system keyboard. Max 8 digits, 5 decimal places. Memo field uses text keyboard — acceptable for short text.",
          "Request stubbed. Build after Epoch 1. Needs: notification system, pending state, recipient fulfilment action.",
          "Send accepts member handles and external wallet addresses. No validation on external addresses yet.",
          "Memo: 36 char hard limit. Shown in accordion detail if present.",
          "Transaction confirmed: Signal (#6B5FED) tick. Moss is PoL biometric only — never used for transaction confirmation.",
          "QR encodes handle + wallet address. Placeholder — real generation needed.",
          "Copy: icon only. Moss checkmark on success, resets after 2s.",
          "Tx detail: inline accordion. Tap row to expand/collapse.",
          "Avatar colours: derived from handle string (sum of char codes mod 6). See ÆPOCH Brand System — Member Avatar spec.",
          "Balance card labels (Use or Lose / Yours to Keep) are working copy. Pending language pass.",
          "Kairos unit spelled out in full. K abbreviation not approved — pending brand decision.",
        ].map((n,i,a)=>(
          <div key={i} style={{display:"flex",gap:8,padding:"4px 0",borderBottom:i<a.length-1?"1px solid rgba(224,216,208,0.4)":"none"}}>
            <span style={{fontSize:10,fontWeight:700,color:"#C4BEB8",flexShrink:0,fontFamily:"system-ui"}}>{i+1}.</span>
            <span style={{fontSize:11,color:"#4A4440",lineHeight:1.55,fontFamily:"system-ui"}}>{n}</span>
          </div>
        ))}
      </div>
      <div style={{fontSize:10,color:"#8A8480",fontFamily:"system-ui",letterSpacing:".05em",width:W}}>
        260318-ÆPOCH-Wallet-v1.4-0000 · Avatar colour derivation · Text-only secondary/ghost CTAs · Kairos spelled out
      </div>
    </div>
  );
}
