// In-world estimate: one arrival per second, one departure every two seconds.
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
