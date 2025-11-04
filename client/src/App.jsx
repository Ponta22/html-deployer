import React, {useState, useEffect} from 'react'
export default function App(){
  const [html, setHtml] = useState('')
  const [sites, setSites] = useState([])
  useEffect(()=>{ fetch('/api/health').catch(()=>{}) },[])
  async function createSite(){
    const res = await fetch('/api/create',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({html})})
    const j = await res.json();
    if(j.url) setSites(s=>[j,...s])
  }
  async function uploadFile(e){
    const f = e.target.files[0]; if(!f) return;
    const fd = new FormData(); fd.append('file', f);
    const res = await fetch('/api/upload',{method:'POST',body:fd}); const j=await res.json(); if(j.url) setSites(s=>[j,...s])
  }
  return (
    <div className="app">
      <header><h1>HTML Deployer</h1></header>
      <main>
        <textarea value={html} onChange={e=>setHtml(e.target.value)} placeholder="Paste your full HTML here" />
        <div>
          <button onClick={createSite}>Create</button>
          <input type="file" onChange={uploadFile} accept="text/html" />
        </div>
        <section>
          <h2>Recent</h2>
          <ul>{sites.map(s=> <li key={s.id}><a href={s.url} target="_blank" rel="noreferrer">{s.url}</a></li>)}</ul>
        </section>
      </main>
    </div>
  )
}
