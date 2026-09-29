const clock=document.getElementById('ue-utc-clock');
if (clock) {
  const render=()=>{
    const iso=new Date().toISOString();
    clock.dateTime=iso;
    clock.textContent=`${iso.slice(8,10)}.${iso.slice(5,7)}.${iso.slice(0,4)} · ${iso.slice(11,19)} UTC`;
  };
  render();
  setInterval(render,250);
}
