const modes={easy:{min:1,max:50,tries:10,label:"Easy Mode"},classic:{min:1,max:100,tries:8,label:"Classic Mode"},expert:{min:1,max:500,tries:7,label:"Expert Mode"}};
let mode="classic", secret, attempts, hints, history=[], sound=true;
let best=Number(localStorage.getItem("numera-best")||0), streak=Number(localStorage.getItem("numera-streak")||0);

const $=id=>document.getElementById(id);
const input=$("guessInput"), slider=$("guessSlider"), msg=$("gameMessage"), historyList=$("historyList");

function tone(freq=520,d=.07){if(!sound)return;try{const c=new AudioContext(),o=c.createOscillator(),g=c.createGain();o.frequency.value=freq;g.gain.value=.05;o.connect(g);g.connect(c.destination);o.start();g.gain.exponentialRampToValueAtTime(.001,c.currentTime+d);o.stop(c.currentTime+d)}catch(e){}}
function toast(text){const t=$("toast");t.textContent=text;t.classList.add("show");clearTimeout(t._timer);t._timer=setTimeout(()=>t.classList.remove("show"),2200)}
function newGame(){
 const m=modes[mode];secret=Math.floor(Math.random()*(m.max-m.min+1))+m.min;attempts=0;hints=2;history=[];
 input.min=slider.min=m.min;input.max=slider.max=m.max;input.value="";
 slider.value=Math.round((m.min+m.max)/2);$("sliderValue").textContent=slider.value;
 $("difficultyLabel").textContent=m.label;$("rangeText").innerHTML=`A number between <b>${m.min}</b> and <b>${m.max}</b>`;
 $("hintCount").textContent="2 left";msg.textContent="The system has generated a secret number. Make your first move.";
 $("mysteryNumber").textContent="?";$("gameStatus").textContent="IN PROGRESS";render();updateStats();
}
function updateStats(){
 const m=modes[mode];$("attempts").textContent=attempts;$("bestScore").textContent=best||"—";$("streak").textContent=streak;
 $("attemptFill").style.width=`${Math.min(100,attempts/m.tries*100)}%`;
 $("attemptCaption").textContent=`${Math.max(0,m.tries-attempts)} attempts available`;
}
function render(){
 if(!history.length){historyList.innerHTML='<p class="empty-history">Your guesses will appear here.</p>';return}
 historyList.innerHTML=[...history].reverse().map(x=>`<div class="history-item"><span>Guess <b>${x.value}</b></span><small class="${x.type}">${x.label}</small></div>`).join("");
}
function submitGuess(){
 const value=Number(input.value);const m=modes[mode];
 if(!Number.isInteger(value)||value<m.min||value>m.max){toast(`Enter a whole number from ${m.min} to ${m.max}.`);input.classList.add("shake");setTimeout(()=>input.classList.remove("shake"),400);return}
 attempts++;
 if(value===secret){history.push({value,type:"correct",label:"CORRECT"});msg.textContent="Signal matched. You decoded the hidden number.";tone(760,.18);win();render();return}
 const type=value>secret?"high":"low", label=value>secret?"TOO HIGH ↑":"TOO LOW ↓";
 history.push({value,type,label});msg.textContent=value>secret?"Your guess is above the secret number. Shift lower.":"Your guess is below the secret number. Push higher.";
 $("mysteryNumber").textContent=value>secret?"↓":"↑";$("mysteryNumber").classList.add("flash");setTimeout(()=>$("mysteryNumber").classList.remove("flash"),500);
 tone(value>secret?220:330);input.value="";render();updateStats();
 if(attempts>=m.tries)lose();
}
function win(){
 const score=Math.max(100,1000-attempts*90);best=Math.max(best,score);streak++;localStorage.setItem("numera-best",best);localStorage.setItem("numera-streak",streak);
 $("gameStatus").textContent="COMPLETED";$("finalNumber").textContent=secret;$("modalTitle").textContent=attempts<=3?"Perfect decode!":"Challenge complete!";
 $("modalText").textContent=`You found ${secret} in ${attempts} attempt${attempts===1?"":"s"} and earned ${score} points.`;
 updateStats();setTimeout(()=>$("modalBackdrop").classList.add("show"),350);
}
function lose(){
 streak=0;localStorage.setItem("numera-streak",streak);$("gameStatus").textContent="LOCKED";
 msg.textContent=`No attempts left. The hidden number was ${secret}. Start a new challenge.`;$("mysteryNumber").textContent=secret;toast("Challenge over — the number has been revealed.");tone(150,.25);updateStats();
}
$("guessBtn").onclick=submitGuess;input.addEventListener("keydown",e=>{if(e.key==="Enter")submitGuess()});
slider.oninput=e=>{$("sliderValue").textContent=e.target.value;input.value=e.target.value};slider.onchange=()=>input.focus();
$("restartBtn").onclick=()=>{newGame();toast("Fresh number generated.")};
$("playAgainBtn").onclick=()=>{$("modalBackdrop").classList.remove("show");newGame()};
$("hintBtn").onclick=()=>{
 if(hints<=0){toast("No hints remaining.");return}
 hints--;$("hintCount").textContent=`${hints} left`;
 const distance=Math.abs(secret-(Number(input.value)||Math.round((modes[mode].min+modes[mode].max)/2)));
 msg.textContent=secret%2===0?"Hint: the secret number is even.": "Hint: the secret number is odd.";
 if(distance<10) msg.textContent+=" You're getting very close.";
 tone(620);toast("Hint decrypted.");
};
document.querySelectorAll("[data-mode]").forEach(b=>b.onclick=()=>{mode=b.dataset.mode;document.querySelectorAll("[data-mode]").forEach(x=>x.classList.remove("active"));b.classList.add("active");newGame();toast(`${modes[mode].label} activated.`)});
$("clearHistory").onclick=()=>{history=[];render()};
$("themeBtn").onclick=()=>{document.body.classList.toggle("light");$("themeBtn").textContent=document.body.classList.contains("light")?"◐":"☼"};
$("soundBtn").onclick=()=>{sound=!sound;$("soundBtn").textContent=sound?"♬":"×";toast(sound?"Sound enabled":"Sound muted")};
newGame();
