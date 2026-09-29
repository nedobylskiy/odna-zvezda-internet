// In-world estimate: one arrival per second, one departure every two seconds.
const utcClock=document.getElementById('ue-utc-clock');
if (utcClock) {
  const renderUTC=()=>{
    const now=new Date();
    const iso=now.toISOString();
    utcClock.dateTime=iso;
    utcClock.textContent=`${iso.slice(8,10)}.${iso.slice(5,7)}.${iso.slice(0,4)} · ${iso.slice(11,19)} UTC`;
  };
  renderUTC();
  setInterval(renderUTC,250);
}
const output=document.getElementById('population-count');
if (output) {
  const baseline=42_381_204_117;
  const epoch=Date.parse('2026-09-29T12:00:00Z');
  const formatter=new Intl.NumberFormat('ru-RU');
  const render=()=>{
    const elapsed=Math.max(0,Math.floor((Date.now()-epoch)/1000));
    output.textContent=formatter.format(baseline+elapsed-Math.floor(elapsed/2));
  };
  render();
  setInterval(render,250);
}
