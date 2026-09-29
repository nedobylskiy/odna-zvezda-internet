// Mean time at Mars's prime meridian (MTC), adapted from NASA Mars24, step C-2.
// A fixed TT−UTC offset keeps this deliberately simple; it is approximate.
export function marsTime(utcMillis, ttMinusUtcSeconds=69.184) {
  const julianTT=2440587.5+(utcMillis+ttMinusUtcSeconds*1000)/86400000;
  const marsSolDate=(julianTT-2451549.5)/1.0274912517+44796-0.0009626;
  const sol=Math.floor(marsSolDate);
  const seconds=Math.floor((marsSolDate-sol)*86400);
  const two=n=>String(n).padStart(2,'0');
  return {sol,clock:`${two(Math.floor(seconds/3600))}:${two(Math.floor(seconds%3600/60))}:${two(seconds%60)}`};
}

if (typeof document!=='undefined') {
  const output=document.getElementById('mars-clock');
  const solOutput=document.getElementById('mars-sol');
  if (output && solOutput) {
    const render=()=>{
      const now=Date.now();
      const {sol,clock}=marsTime(now);
      output.textContent=`${clock} MTC`;
      solOutput.textContent=`СОЛ ${sol} · 24 ч 39 м 35 с / сол`;
    };
    render();
    setInterval(render,250);
  }
}
