window.addEventListener('error',event=>{
 if(event.target?.tagName==='SCRIPT'||event.error){
  const banner=document.getElementById('load-error');if(banner)banner.hidden=false;
 }
},true);
