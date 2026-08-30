const chat=document.querySelector('#chat'),input=document.querySelector('#input'),send=document.querySelector('#send'),welcome=document.querySelector('#welcome'),history=document.querySelector('#history');
let chats=JSON.parse(localStorage.getItem('siva_chats')||'[]');
function save(){localStorage.setItem('siva_chats',JSON.stringify(chats))}
function addMessage(text,me=false){welcome?.remove();const row=document.createElement('div');row.className='msg';row.innerHTML=`<div class="avatar">${me?'U':'✦'}</div><div class="bubble"></div>`;row.querySelector('.bubble').textContent=text;chat.appendChild(row);chat.scrollTop=chat.scrollHeight}
function botReply(q){let l=q.toLowerCase();if(l.includes('assam')||l.includes('অসমীয়া'))return 'Namaskar! Moi Siva AI. Apuni Assamese, Hindi aru English-t kotha patibo pare. Aji ki help lage?';if(l.includes('hello')||l.includes('hi'))return 'Hello! I’m Siva AI. How can I help you today?';return 'I’m ready to help. To enable real AI answers, connect Siva AI to a free/open AI model endpoint from Settings. This starter website already has the chat interface, history, voice and file controls.'}
function ask(){let q=input.value.trim();if(!q)return;addMessage(q,true);input.value='';chats.push(q);save();renderHistory();setTimeout(()=>addMessage(botReply(q)),450)}
send.onclick=ask;input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();ask()}});
document.querySelectorAll('.suggestions button').forEach(b=>b.onclick=()=>{input.value=b.textContent;ask()});
function renderHistory(){history.innerHTML='';chats.slice(-20).reverse().forEach(x=>{let d=document.createElement('div');d.className='item';d.textContent=x;history.appendChild(d)})}renderHistory();
document.querySelector('#newChat').onclick=()=>location.reload();
document.querySelector('#menu').onclick=()=>document.querySelector('#sidebar').classList.add('open');
document.querySelector('#closeSide').onclick=()=>document.querySelector('#sidebar').classList.remove('open');
document.querySelector('#theme').onclick=()=>{document.body.classList.toggle('dark');localStorage.setItem('siva_dark',document.body.classList.contains('dark'))};if(localStorage.getItem('siva_dark')==='true')document.body.classList.add('dark');
document.querySelector('#settings').onclick=()=>document.querySelector('#modal').classList.add('show');document.querySelector('#x').onclick=()=>document.querySelector('#modal').classList.remove('show');document.querySelector('#save').onclick=()=>document.querySelector('#modal').classList.remove('show');
document.querySelector('#file').onchange=e=>{document.querySelector('#fileName').textContent=e.target.files[0]?.name||''};
document.querySelector('#mic').onclick=()=>{if(!('webkitSpeechRecognition'in window||'SpeechRecognition'in window)){alert('Voice input is not supported in this browser.');return}const R=window.SpeechRecognition||window.webkitSpeechRecognition,r=new R();r.lang='hi-IN';r.onresult=e=>input.value=e.results[0][0].transcript;r.start()};
