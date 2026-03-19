import { useState, useEffect, useRef } from "react";

const T = {
  ink:"#1A1612", inkMid:"#4A4440", inkSoft:"#8A8480", inkFaint:"#C4BEB8",
  clay:"#C4835A", ochre:"#A0673A", sand:"#E8C9A0",
  pearl:"#D6E4F0", iris:"#8BAFD4", prism:"#B8A9D9",
  signal:"#6B5FED", glow:"#9B8FF5", pulse:"#C4B8FF",
  moss:"#4CAF82", hearth:"#8B5E2F", ember:"#A03020",
  border:"#E0D8D0", mist:"#F3F0EB", cta:"#2A2520",
  ff:"'DM Sans',system-ui,-apple-system,sans-serif",
};

const LANGS = [
  { key:"en_gb", abbr:"EN", label:"English",   sub:"United Kingdom" },
  { key:"en_us", abbr:"EN", label:"English",   sub:"United States"  },
  { key:"pt_br", abbr:"PT", label:"Português", sub:"Brasil"         },
  { key:"es",    abbr:"ES", label:"Español",   sub:"Latinoamérica"  },
  { key:"fr",    abbr:"FR", label:"Français",  sub:"France"         },
  { key:"ar",    abbr:"ع",  label:"العربية",   sub:"Arabic"         },
  { key:"zh",    abbr:"文", label:"中文",       sub:"Simplified"     },
  { key:"hi",    abbr:"हि", label:"हिन्दी",    sub:"Hindi"          },
  { key:"sw",    abbr:"SW", label:"Kiswahili", sub:"Swahili"        },
];

// ── EARTH RISE BG ──────────────────────────────────────────
function EarthRiseBG({ w, h }) {
  const ref = useRef();
  useEffect(() => {
    function draw() {
      const c = ref.current; if (!c) return;
      const dpr = window.devicePixelRatio || 1;
      c.width = w*dpr; c.height = h*dpr;
      c.style.width = w+"px"; c.style.height = h+"px";
      const ctx = c.getContext("2d");
      ctx.scale(dpr, dpr);
      ctx.fillStyle = "#FEFCF9"; ctx.fillRect(0,0,w,h);
      [
        {x:.10,y:.70,r:.70,col:[232,201,160],a:.18},
        {x:.25,y:.85,r:.55,col:[196,131,90], a:.12},
        {x:.05,y:.50,r:.45,col:[196,131,90], a:.08},
        {x:.55,y:.60,r:.50,col:[232,201,160],a:.10},
        {x:.88,y:.05,r:.55,col:[214,228,240],a:.16},
        {x:.95,y:.15,r:.38,col:[184,169,217],a:.12},
        {x:.50,y:1.05,r:.50,col:[232,201,160],a:.12},
      ].forEach(({x,y,r,col,a}) => {
        const cx=x*w,cy=y*h,rad=r*Math.min(w,h);
        const g=ctx.createRadialGradient(cx,cy,0,cx,cy,rad);
        g.addColorStop(0,`rgba(${col},${a})`);
        g.addColorStop(0.45,`rgba(${col},${a*.55})`);
        g.addColorStop(1,`rgba(${col},0)`);
        ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
      });
    }
    draw(); const t=setTimeout(draw,80); return ()=>clearTimeout(t);
  },[w,h]);
  return <canvas ref={ref} style={{position:"absolute",inset:0}}/>;
}

// ── GRAIN ──────────────────────────────────────────────────
function Grain() {
  const ref = useRef();
  useEffect(() => {
    const c=ref.current; if(!c) return;
    c.width=375; c.height=812;
    const ctx=c.getContext("2d");
    const id=ctx.createImageData(375,812); const d=id.data;
    for(let i=0;i<d.length;i+=4){const v=Math.random()*255|0;d[i]=d[i+1]=d[i+2]=v;d[i+3]=18;}
    ctx.putImageData(id,0,0);
  },[]);
  return <canvas ref={ref} style={{position:"absolute",inset:0,width:"100%",height:"100%",mixBlendMode:"overlay",opacity:.65,pointerEvents:"none"}}/>;
}

// ── STATUS BAR ─────────────────────────────────────────────
function StatusBar() {
  return (
    <div style={{position:"relative",zIndex:10,display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 28px 0",height:44,fontFamily:T.ff}}>
      <span style={{fontSize:12,fontWeight:700,color:T.ink,letterSpacing:"-0.02em"}}>9:41</span>
      <div style={{display:"flex",gap:5,alignItems:"center"}}>
        <svg width="15" height="11" viewBox="0 0 15 11">
          {[0,1,2,3].map(i=><rect key={i} x={i*4} y={10-(i+1)*2.5} width="2.5" height={(i+1)*2.5} rx="0.5" fill={T.ink} opacity={i<3?1:0.3}/>)}
        </svg>
        <svg width="25" height="11" viewBox="0 0 25 11">
          <rect x="0" y="1" width="21" height="9" rx="2" fill="none" stroke={T.ink} strokeWidth="1.1"/>
          <rect x="1.2" y="2.2" width="15" height="6.6" rx="1.2" fill={T.ink}/>
          <path d="M22 3.5v4q2-.5 2-2t-2-2z" fill={T.ink} opacity=".4"/>
        </svg>
      </div>
    </div>
  );
}

// ── VESICA — two clean circles, fully visible ──────────────
function Vesica({ size = 96 }) {
  const r = size * 0.30;
  const overlap = r * 0.55;
  // total width = two circle diameters minus the overlap
  const W = r*2 + r*2 - overlap;
  const H = r*2 + 4; // full circle height plus small padding
  const lx = r;
  const rx = W - r;
  const cy = r + 2;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none">
      <circle cx={lx} cy={cy} r={r} stroke={T.ink} strokeWidth="1.4" opacity="0.70"/>
      <circle cx={rx} cy={cy} r={r} stroke={T.ink} strokeWidth="1.4" opacity="0.70"/>
    </svg>
  );
}

// ── LANGUAGE PILL ──────────────────────────────────────────
function LangPill({ lang, onPress }) {
  const [hov, setHov] = useState(false);
  const isRTL = lang.key === "ar";
  return (
    <div
      onClick={onPress}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display:"flex", alignItems:"center", gap:6,
        padding:"5px 10px 5px 6px",
        border:`1px solid ${hov ? T.inkMid : T.border}`,
        borderRadius:20, cursor:"pointer",
        background:"rgba(255,255,255,0.45)",
        transition:"all .15s",
      }}>
      {/* Abbr badge */}
      <div style={{
        width:26, height:26, borderRadius:13,
        background:"rgba(255,255,255,0.70)",
        border:`1px solid ${T.border}`,
        display:"flex", alignItems:"center", justifyContent:"center",
        flexShrink:0,
      }}>
        <span style={{
          fontSize:9, fontWeight:800, color:T.inkMid,
          fontFamily:T.ff, letterSpacing:isRTL?0:"-0.02em",
          direction:isRTL?"rtl":"ltr",
        }}>{lang.abbr}</span>
      </div>
      <span style={{fontSize:12, fontWeight:600, color:T.inkMid, fontFamily:T.ff}}>{lang.label}</span>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{marginLeft:2}}>
        <path d="M2 4l3 3 3-3" stroke={T.inkSoft} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

// ── LANGUAGE SHEET ─────────────────────────────────────────
function LangSheet({ current, onSelect, onClose }) {
  return (
    <div style={{
      position:"absolute", inset:0, zIndex:50,
      background:"rgba(26,22,18,0.32)",
      display:"flex", alignItems:"flex-end",
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width:"100%", background:"#FEFCF9",
          borderRadius:"20px 20px 0 0",
          padding:"12px 20px 32px",
          boxShadow:"0 -8px 32px rgba(0,0,0,0.12)",
        }}>
        {/* Handle */}
        <div style={{width:36,height:4,borderRadius:2,background:T.border,margin:"0 auto 20px"}}/>
        <div style={{fontSize:13,fontWeight:700,color:T.inkSoft,letterSpacing:".06em",textTransform:"uppercase",fontFamily:T.ff,marginBottom:12}}>Language</div>
        {LANGS.map(l => (
          <div key={l.key} onClick={() => { onSelect(l); onClose(); }}
            style={{
              display:"flex", alignItems:"center", gap:12,
              padding:"10px 12px", borderRadius:10, cursor:"pointer",
              background: current.key===l.key ? "rgba(107,95,237,0.06)" : "transparent",
              border:`1px solid ${current.key===l.key ? T.signal : "transparent"}`,
              marginBottom:4,
            }}>
            <div style={{
              width:36,height:36,borderRadius:8,
              background:"rgba(255,255,255,0.80)",
              border:`1px solid ${T.border}`,
              display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
            }}>
              <span style={{fontSize:11,fontWeight:800,color:current.key===l.key?T.signal:T.inkMid,fontFamily:T.ff}}>{l.abbr}</span>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:700,color:current.key===l.key?T.signal:T.ink,fontFamily:T.ff}}>{l.label}</div>
              <div style={{fontSize:11,color:T.inkSoft,fontFamily:T.ff,marginTop:1}}>{l.sub}</div>
            </div>
            {current.key===l.key && (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" fill={T.signal} opacity="0.12"/>
                <polyline points="4,8 7,11 12,5" stroke={T.signal} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PRIMARY CTA ────────────────────────────────────────────
function PrimaryCTA({ label, disabled=false, onClick }) {
  const [hov,setHov]=useState(false);
  const [prs,setPrs]=useState(false);
  if(disabled) return (
    <div style={{height:52,borderRadius:13,background:"rgba(255,255,255,0.20)",color:T.inkFaint,fontSize:14,fontWeight:700,fontFamily:T.ff,display:"flex",alignItems:"center",justifyContent:"center",opacity:0.5,userSelect:"none",width:"100%"}}>{label}</div>
  );
  return (
    <div style={{position:"relative",userSelect:"none",width:"100%",cursor:"pointer"}}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>{setHov(false);setPrs(false);}}
      onMouseDown={()=>setPrs(true)} onMouseUp={()=>{setPrs(false);onClick?.();}}>
      {hov&&!prs&&<div style={{position:"absolute",bottom:-8,left:"8%",right:"8%",height:24,background:"radial-gradient(ellipse, rgba(196,131,90,0.48) 0%, transparent 70%)",filter:"blur(8px)",pointerEvents:"none",zIndex:0}}/>}
      <div style={{
        position:"relative",zIndex:1,height:52,borderRadius:13,
        background:prs?"#1E1510":hov?"#342218":T.cta,
        color:"#FAF8F5",fontSize:14,fontWeight:700,
        display:"flex",alignItems:"center",justifyContent:"center",
        fontFamily:T.ff,letterSpacing:".01em",
        transform:prs?"translateY(1px) scale(.998)":hov?"translateY(-2px)":"none",
        boxShadow:prs?"0 1px 4px rgba(42,37,32,.10)":hov?"0 6px 28px rgba(42,37,32,.24)":"0 2px 16px rgba(42,37,32,.17)",
        transition:"all .26s cubic-bezier(.34,1.56,.64,1)",
      }}>{label}</div>
    </div>
  );
}

// ── INLINE LINK ────────────────────────────────────────────
function InlineLink({ label }) {
  const [hov,setHov]=useState(false);
  return (
    <span onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{color:hov?T.ink:T.inkMid,textDecoration:"underline",textDecorationColor:hov?"rgba(26,22,18,0.40)":"rgba(74,68,64,0.30)",textUnderlineOffset:"2px",textDecorationThickness:"1px",transition:"color 0.15s",cursor:"pointer",fontFamily:T.ff,fontSize:"inherit"}}>{label}</span>
  );
}

// ── RESEND TIMER ───────────────────────────────────────────
function ResendTimer({ totalSeconds=150 }) {
  const [rem,setRem]=useState(totalSeconds);
  const [resent,setResent]=useState(false);
  const [hov,setHov]=useState(false);
  useEffect(()=>{
    if(rem<=0) return;
    const id=setInterval(()=>setRem(r=>r-1),1000);
    return ()=>clearInterval(id);
  },[rem]);
  const mins=Math.floor(rem/60), secs=String(rem%60).padStart(2,"0");
  if(resent) return <div style={{fontSize:12,color:T.inkSoft,textAlign:"center",fontFamily:T.ff}}>Code sent.</div>;
  if(rem<=0) return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={()=>setResent(true)}
      style={{fontSize:12,color:hov?T.signal:T.inkSoft,textAlign:"center",cursor:"pointer",fontFamily:T.ff,transition:"color .15s"}}>
      Resend code
    </div>
  );
  return (
    <div style={{fontSize:12,color:T.inkFaint,textAlign:"center",fontFamily:T.ff,userSelect:"none"}}>
      Resend in <span style={{fontVariantNumeric:"tabular-nums",fontWeight:600,color:T.inkSoft}}>{mins}:{secs}</span>
    </div>
  );
}

// ── OTP INPUT ──────────────────────────────────────────────
function OTPInput({ onComplete }) {
  const [vals,setVals]=useState(["","","","","",""]);
  const [focus,setFocus]=useState(0);
  const [error,setError]=useState(false);
  const refs=useRef([]);
  useEffect(()=>{ refs.current[focus]?.focus(); },[focus]);

  function handleKey(i,e) {
    setError(false);
    if(e.key==="Backspace"){
      e.preventDefault();
      const n=[...vals];
      if(n[i]!==""){n[i]="";setVals(n);}
      else if(i>0){n[i-1]="";setVals(n);setFocus(i-1);}
      return;
    }
    if(e.key==="ArrowLeft"&&i>0){setFocus(i-1);return;}
    if(e.key==="ArrowRight"&&i<5){setFocus(i+1);return;}
    if(/^\d$/.test(e.key)){
      e.preventDefault();
      const n=[...vals]; n[i]=e.key; setVals(n);
      if(i<5) setFocus(i+1);
      else if(n.every(v=>v!=="")){
        setTimeout(()=>{setError(true);setTimeout(()=>{setError(false);setVals(["","","","","",""]);setFocus(0);},1800);},300);
      }
    }
  }
  function handlePaste(e){
    e.preventDefault();
    const t=e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6);
    if(!t) return;
    const n=[...vals]; t.split("").forEach((ch,i)=>{n[i]=ch;}); setVals(n); setFocus(Math.min(t.length,5));
  }
  const allFilled=vals.every(v=>v!=="");

  return (
    <>
      <div style={{display:"flex",gap:9}}>
        {vals.map((v,i)=>{
          const isFocus=i===focus, isFilled=v!=="";
          let box={border:`1.5px solid ${T.border}`,background:"rgba(255,255,255,0.40)",boxShadow:"none"};
          if(error) box={border:`1.5px solid ${T.hearth}`,background:"rgba(139,94,47,0.04)",boxShadow:"0 0 0 3px rgba(139,94,47,0.08)"};
          else if(isFocus) box={border:"1.5px solid rgba(214,228,240,0.90)",background:"rgba(214,228,240,0.12)",boxShadow:"0 0 0 3px rgba(184,169,217,0.14), 0 0 12px rgba(184,169,217,0.18)"};
          else if(isFilled) box={border:`1.5px solid ${T.border}`,background:"rgba(255,255,255,0.70)",boxShadow:"none"};
          return (
            <div key={i} style={{flex:1,height:54,borderRadius:12,position:"relative",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:700,fontFamily:T.ff,color:error?T.hearth:T.ink,transition:"all 0.18s ease",cursor:"text",...box}} onClick={()=>setFocus(i)}>
              <input ref={el=>refs.current[i]=el} type="text" inputMode="numeric" maxLength={1} value={v}
                onKeyDown={e=>handleKey(i,e)} onPaste={handlePaste} onChange={()=>{}} onFocus={()=>setFocus(i)}
                style={{position:"absolute",opacity:0,width:"100%",height:"100%",cursor:"text",fontSize:22,border:"none",background:"none"}}/>
              {v ? v : isFocus&&!error
                ? <span style={{display:"inline-block",width:2,height:22,background:"rgba(184,169,217,0.85)",borderRadius:1,animation:"blink 1s step-end infinite"}}/>
                : <span style={{fontSize:13,color:T.inkFaint,fontWeight:400}}>—</span>}
            </div>
          );
        })}
      </div>
      <div style={{marginTop:10,minHeight:20}}>
        {error
          ? <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:5,height:5,borderRadius:"50%",background:T.hearth,flexShrink:0}}/><span style={{fontSize:12,color:T.hearth,fontFamily:T.ff,lineHeight:1.55}}>That's not it. Try again or get a new code.</span></div>
          : <span style={{fontSize:12,color:T.inkSoft,fontFamily:T.ff,lineHeight:1.55}}>Check your spam if it's not there.</span>}
      </div>
      <div style={{flex:1}}/>
      <PrimaryCTA label="Confirm" disabled={!allFilled||error}/>
    </>
  );
}

// ══════════════════════════════════════════════════════════
// SCREEN A — SPLASH
// ══════════════════════════════════════════════════════════
function ScreenSplash({ onBegin, lang, onLangOpen }) {
  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column",padding:"0 28px",fontFamily:T.ff}}>
      {/* Language selector — top right */}
      <div style={{display:"flex",justifyContent:"flex-end",paddingTop:8,paddingBottom:4}}>
        <LangPill lang={lang} onPress={onLangOpen}/>
      </div>

      {/* Vesica + wordmark — centred */}
      <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",gap:20}}>
        <Vesica size={96}/>
        <div style={{fontSize:11,fontWeight:700,letterSpacing:".22em",color:T.inkSoft,textTransform:"uppercase"}}>ÆPOCH</div>
      </div>

      {/* Lower — headline · body · CTA · legal */}
      <div style={{paddingBottom:36}}>
        <div style={{fontSize:34,fontWeight:800,letterSpacing:"-.03em",lineHeight:1.08,color:T.ink,marginBottom:14}}>
          You're here.<br/>That means something.
        </div>
        <div style={{fontSize:15,lineHeight:1.70,color:T.inkMid,marginBottom:32}}>
          Every alive human being creates one Kairos a day.
          Yours is permanent, unforged, and belongs to no one but you.
        </div>
        <PrimaryCTA label="Begin" onClick={onBegin}/>
        <div style={{marginTop:20,textAlign:"center",fontSize:12,color:T.inkSoft,lineHeight:1.65}}>
          By continuing you agree to our <InlineLink label="Privacy Policy"/> and <InlineLink label="Terms of Use"/>.
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// SCREEN B — EMAIL ENTRY
// ══════════════════════════════════════════════════════════
function ScreenEmail({ onContinue, onBack }) {
  const [email,setEmail]=useState("");
  const [focused,setFocused]=useState(false);
  const valid=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column",padding:"16px 28px 36px",fontFamily:T.ff}}>
      {/* Back */}
      <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:28,cursor:"pointer",width:"fit-content"}} onClick={onBack}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12 5L7 10l5 5" stroke={T.inkSoft} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span style={{fontSize:13,color:T.inkSoft,fontWeight:500}}>Back</span>
      </div>

      <div style={{fontSize:26,fontWeight:800,letterSpacing:"-.025em",lineHeight:1.15,color:T.ink,marginBottom:10}}>
        What's your email?
      </div>
      <div style={{fontSize:15,lineHeight:1.65,color:T.inkMid,marginBottom:32}}>
        We'll send you a code. No password needed.
      </div>

      {/* Email input */}
      <div style={{
        height:52,borderRadius:13,
        border:focused?"1.5px solid rgba(214,228,240,0.90)":`1.5px solid ${T.border}`,
        background:focused?"rgba(214,228,240,0.10)":"rgba(255,255,255,0.50)",
        boxShadow:focused?"0 0 0 3px rgba(184,169,217,0.14)":"none",
        display:"flex",alignItems:"center",padding:"0 16px",
        transition:"all .18s ease",marginBottom:8,
        position:"relative",
      }}>
        <input
          type="email" placeholder="your@email.com"
          value={email} onChange={e=>setEmail(e.target.value)}
          onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
          style={{
            flex:1,border:"none",background:"none",outline:"none",
            fontSize:15,fontWeight:400,color:T.ink,fontFamily:T.ff,
            caretColor:"rgba(184,169,217,0.85)",
          }}
        />
        {valid&&<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="8" fill="rgba(76,175,130,0.12)"/>
          <path d="M5 9l3 3 5-5" stroke={T.moss} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>}
      </div>
      <div style={{marginBottom:32}}/>

      <div style={{flex:1}}/>
      <PrimaryCTA label="Send code" disabled={!valid} onClick={()=>valid&&onContinue(email)}/>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// SCREEN C — OTP
// ══════════════════════════════════════════════════════════
function ScreenOTP({ email, onBack }) {
  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column",padding:"16px 28px 36px",fontFamily:T.ff}}>
      {/* Back */}
      <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:24,cursor:"pointer",width:"fit-content"}} onClick={onBack}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12 5L7 10l5 5" stroke={T.inkSoft} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span style={{fontSize:13,color:T.inkSoft,fontWeight:500}}>Back</span>
      </div>

      <div style={{fontSize:26,fontWeight:800,letterSpacing:"-.025em",lineHeight:1.15,color:T.ink,marginBottom:10}}>
        There's a code<br/>in your inbox.
      </div>
      <div style={{fontSize:15,lineHeight:1.65,color:T.inkMid,marginBottom:28}}>
        We sent six digits to{" "}
        <span style={{fontWeight:700,color:T.ink}}>{email||"nova@aepoch.xyz"}</span>
      </div>

      <OTPInput/>

      <div style={{marginTop:16}}>
        <ResendTimer totalSeconds={150}/>
      </div>
    </div>
  );
}

// ── PHONE SHELL ────────────────────────────────────────────
function Phone({ activeScreen, screenProps, label }) {
  const W=375, H=812;
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
      <div style={{width:W,height:H,borderRadius:44,overflow:"hidden",background:"#FEFCF9",position:"relative",flexShrink:0,boxShadow:"0 2px 4px rgba(0,0,0,.06), 0 24px 72px rgba(0,0,0,.14), inset 0 0 0 1px rgba(0,0,0,.05)"}}>
        <EarthRiseBG w={W} h={H}/>
        <Grain/>
        <StatusBar/>
        <div style={{position:"relative",zIndex:5,height:"calc(100% - 44px)"}}>
          {activeScreen==="splash" && <ScreenSplash {...screenProps}/>}
          {activeScreen==="email"  && <ScreenEmail  {...screenProps}/>}
          {activeScreen==="otp"    && <ScreenOTP    {...screenProps}/>}
        </div>
      </div>
      <div style={{fontSize:11,fontWeight:700,letterSpacing:".07em",textTransform:"uppercase",color:"#8A8480",fontFamily:"system-ui"}}>{label}</div>
    </div>
  );
}

// ── MAIN ───────────────────────────────────────────────────
export default function App() {
  const [lang, setLang] = useState(LANGS[0]);
  const [langOpen, setLangOpen] = useState(false);

  // Each phone tracks its own screen state independently
  const [splashScreen] = useState("splash");
  const [emailScreen] = useState("email");
  const [otpScreen]   = useState("otp");

  useEffect(() => {
    const l=document.createElement("link"); l.rel="stylesheet";
    l.href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700;9..40,800&display=swap";
    document.head.appendChild(l);
    const s=document.createElement("style");
    s.textContent=`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`;
    document.head.appendChild(s);
  },[]);

  return (
    <div style={{background:"#E4E1DC",minHeight:"100vh",padding:"32px 24px 56px",fontFamily:T.ff}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:6,flexWrap:"wrap",gap:8}}>
        <div>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:".10em",textTransform:"uppercase",color:"#8A8480",fontFamily:"system-ui"}}>ÆPOCH</div>
          <div style={{fontSize:22,fontWeight:800,letterSpacing:"-.025em",color:T.ink}}>Onboarding — v1.4</div>
        </div>
        <div style={{fontSize:10,color:"#8A8480",fontFamily:"system-ui",letterSpacing:".05em"}}>260316-ÆPOCH-Onboarding-v1.4 · Brand System v6.6</div>
      </div>

      <div style={{fontSize:13,color:T.inkMid,lineHeight:1.6,marginBottom:28,maxWidth:520}}>
        Three screens shown static. Hover CTAs for Earth Reveal. Type digits into OTP boxes — paste a 6-digit string to fill all at once.
      </div>

      <div style={{display:"flex",gap:24,flexWrap:"wrap",alignItems:"flex-start"}}>

        {/* Splash — with lang sheet overlay */}
        <div style={{position:"relative"}}>
          <Phone activeScreen="splash" label="A — Splash"
            screenProps={{ lang, onLangOpen:()=>setLangOpen(true), onBegin:()=>{} }}/>
          {langOpen && (
            <div style={{position:"absolute",top:0,left:0,width:375,height:812,borderRadius:44,overflow:"hidden",zIndex:20}}>
              <LangSheet current={lang} onSelect={setLang} onClose={()=>setLangOpen(false)}/>
            </div>
          )}
        </div>

        {/* Email entry */}
        <Phone activeScreen="email" label="B — Email entry"
          screenProps={{ onContinue:()=>{}, onBack:()=>{} }}/>

        {/* OTP */}
        <Phone activeScreen="otp" label="C — OTP"
          screenProps={{ email:"nova@aepoch.xyz", onBack:()=>{} }}/>

      </div>
    </div>
  );
}
