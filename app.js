/* MAGNET OS — modular demo application */
const apps = [
 {id:"inventory",name:"Food Inventory",icon:"🥬",description:"Manage everything inside your fridge.",features:[{name:"Inventory Management",buttons:["View All Items","Add Food","Remove Item"]},{name:"Food Health",buttons:["Freshness Score","Expiring Soon","Food Waste Risk"]},{name:"Stock Management",buttons:["Low Stock","Shopping List"]}]},
 {id:"notes",name:"Sticky Notes",icon:"📝",description:"Leave messages for your family.",features:[{name:"Notes",buttons:["View Notes","Add Note","Clear Notes"]}]},
 {id:"recipes",name:"AI Recipes",icon:"👨‍🍳",description:"Your personal cooking assistant.",features:[{name:"Smart Recommendations",buttons:["Use Expiring Ingredients","Recipes From My Fridge","Quick Meals"]},{name:"Cooking Assistant",buttons:["Cooking Instructions","Ingredient Substitutes"]}]},
 {id:"mobile",name:"Mobile Connect",icon:"📱",description:"Connect your phone to your refrigerator.",features:[{name:"Device Pairing",buttons:["Generate QR Code","Connect Device","Disconnect Device"]},{name:"Synchronization",buttons:["Sync Inventory","Sync Shopping List"]}]},
 {id:"wifi",name:"Wi-Fi & Network",icon:"📶",description:"Manage internet connectivity.",features:[{name:"Network Settings",buttons:["Connect Wi-Fi","Available Networks","Forget Network"]},{name:"Connection Status",buttons:["Check Connection","Test Internet"]}]},
 {id:"device",name:"Fridge Health",icon:"❄️",description:"Monitor refrigerator health.",features:[{name:"Temperature",buttons:["Fridge Temperature","Freezer Temperature"]},{name:"Maintenance",buttons:["Door Status","Filter Health","Device Diagnostics"]}]},
 {id:"calendar",name:"Calendar",icon:"📅",description:"Family events and reminders.",features:[{name:"Events",buttons:["View Events","Add Event","Upcoming Events"]}]},
 {id:"music",name:"Music",icon:"🎵",description:"Music and entertainment.",features:[{name:"Music Player",buttons:["Play","Pause","Next Track"]}]},
 {id:"weather",name:"Weather",icon:"🌤️",description:"Weather forecasts.",features:[{name:"Forecast",buttons:["Today","Tomorrow","Weekly Forecast"]}]},
 {id:"timer",name:"Kitchen Timer",icon:"⏲️",description:"Manage your cooking timers.",features:[{name:"Timers",buttons:["5 Minutes","10 Minutes","20 Minutes"]}]},
 {id:"family",name:"Family Board",icon:"👨‍👩‍👧",description:"Your shared family space.",features:[{name:"Family Messages",buttons:["View Messages","Add Message","Reminders"]}]}
];

let inventory = [
 {name:"Milk",category:"Dairy",quantity:"1 litre",daysLeft:2},
 {name:"Spinach",category:"Vegetables",quantity:"1 bunch",daysLeft:1},
 {name:"Apples",category:"Fruits",quantity:"5 pieces",daysLeft:8},
 {name:"Eggs",category:"Dairy",quantity:"6 pieces",daysLeft:15},
 {name:"Bread",category:"Bakery",quantity:"1 pack",daysLeft:3},
 {name:"Cheese",category:"Dairy",quantity:"200 grams",daysLeft:10}
];

const DEFAULT_NAV = ["homePage","notes","recipes","inventory"];
const NAV_META = {
 homePage:{label:"Home",icon:"⌂",type:"page"},
 notes:{label:"Notes",icon:"📝",type:"app"},
 recipes:{label:"Cook",icon:"🍳",type:"app"},
 inventory:{label:"Inside",icon:"🥬",type:"app"}
};
const state = {
 currentApp:null, connectedMobile:false, wifiConnected:true,
 notes:["Remember to buy milk!"], shoppingList:[],
 navItems:loadNav()
};
const $ = id => document.getElementById(id);
function loadNav(){
 try{
  const saved=JSON.parse(localStorage.getItem("magnetNav"));
  return Array.isArray(saved)&&saved.length?saved.filter(id=>NAV_META[id]||apps.some(a=>a.id===id)).slice(0,5):[...DEFAULT_NAV];
 }catch{return [...DEFAULT_NAV];}
}
function saveNav(){localStorage.setItem("magnetNav",JSON.stringify(state.navItems));}
let toastTimer;
function notify(message){const toast=$("toast");toast.textContent=message;toast.classList.remove("hidden");clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.add("hidden"),2400);}
function getFreshnessPercent(item){return Math.max(0,Math.min(100,Math.round(item.daysLeft/15*100)));}
function getFreshness(item){if(item.daysLeft<=1)return "Use today";if(item.daysLeft<=3)return "Use soon";return "Fresh";}
function getStatusClass(item){return item.daysLeft<=1?"urgent":item.daysLeft<=3?"soon":"";}
function getFreshnessScore(){return inventory.length?Math.round(inventory.reduce((s,i)=>s+getFreshnessPercent(i),0)/inventory.length):0;}

function renderApps(){
 const cards=apps.map(app=>`<button class="app-card" data-app="${app.id}"><div class="app-icon">${app.icon}</div><strong>${app.name}</strong><small>${app.description}</small></button>`).join("");
 $("homeApps").innerHTML=cards;
 $("allApps").innerHTML=apps.map(app=>`<div class="app-card-wrap"><button class="app-card" data-app="${app.id}"><div class="app-icon">${app.icon}</div><strong>${app.name}</strong><small>${app.description}</small></button></div>`).join("");
 $("moduleList").innerHTML=apps.map(app=>`<div class="module-row">${app.icon} ${app.name}<span style="float:right;color:#8b718e">Installed</span></div>`).join("");
 renderNav();renderNavManager();updateDashboard();
}
function renderNav(){
 $("bottomNav").innerHTML=state.navItems.map(id=>{
  const meta=NAV_META[id]||(()=>{const a=apps.find(x=>x.id===id);return a?{label:a.name,icon:a.icon,type:"app"}:null;})();
  if(!meta)return "";
  const active=(id==="homePage"&&$("homePage")&&!$("homePage").classList.contains("hidden"))||(state.currentApp===id);
  return `<button data-nav="${id}" class="${active?"active":""}"><span>${meta.icon}</span><small>${meta.label}</small></button>`;
 }).join("");
}
function renderNavManager(){
 const rows=state.navItems.map((id,index)=>{
  const m=NAV_META[id]||(()=>{const a=apps.find(x=>x.id===id);return a?{label:a.name,icon:a.icon}:null;})();
  if(!m)return "";
  return `<div class="nav-manager-row"><div><strong>${m.icon} ${m.label}</strong><small>Navigation shortcut ${index+1}</small></div><div class="nav-manager-actions"><button data-nav-move="${index}" data-dir="-1" ${index===0?"disabled":""}>↑</button><button data-nav-move="${index}" data-dir="1" ${index===state.navItems.length-1?"disabled":""}>↓</button><button data-nav-remove="${id}">Remove</button></div></div>`;
 }).join("");
 const available=apps.filter(a=>!state.navItems.includes(a.id));
 $("navManager").innerHTML=`<div>${rows||"<p>No shortcuts selected.</p>"}</div><p><strong>Add an app</strong></p><div class="nav-add-list">${available.map(a=>`<button data-nav-add="${a.id}">＋ ${a.icon} ${a.name}</button>`).join("")||"<small>All apps are already in navigation.</small>"}</div><small>You can show up to five shortcuts.</small>`;
}
function updateDashboard(){
 $("itemCount").textContent=inventory.length;
 const exp=inventory.filter(i=>i.daysLeft<=3);
 $("expiringCount").textContent=exp.length;
 $("freshnessScore").textContent=getFreshnessScore()+"%";
 $("alertText").textContent=exp.length?`${exp[0].name} ${exp[0].daysLeft<=1?"needs to be used today":"expires soon"}. Use it soon!`:"Your fridge is looking good. No urgent items.";
}
function showPage(pageId){
 document.querySelectorAll(".page").forEach(p=>p.classList.add("hidden"));
 $(pageId)?.classList.remove("hidden");
 if(pageId==="settingsPage")renderNavManager();
 renderNav();
}
function openApp(appId){
 if(appId==="inside")appId="inventory";
 const app=apps.find(a=>a.id===appId);if(!app)return;
 state.currentApp=appId;showPage("appPage");
 if(appId==="inventory"){renderInventory("all");return;}
 if(appId==="notes"){renderNotesApp();return;}
 if(appId==="recipes"){renderRecipesApp();return;}
 $("appContent").innerHTML=`<div class="app-header"><div class="app-icon">${app.icon}</div><div><h2>${app.name}</h2><p>${app.description}</p></div></div>${app.features.map(f=>`<div class="feature"><h3>${f.name}</h3><p style="font-size:11px;color:#817d88">${f.description||""}</p>${f.buttons.map(b=>`<button class="feature-action" data-action="${b}">${b}</button>`).join("")}</div>`).join("")}<div id="actionResult" class="feature-result">Select a feature to get started.</div>`;
}
function renderInventory(filter="all"){
 state.currentApp="inventory";showPage("appPage");
 const items=inventory.map((item,index)=>({item,index})).filter(x=>filter==="expiring"?x.item.daysLeft<=3:true);
 $("appContent").innerHTML=`<div class="app-header"><div class="app-icon">🥬</div><div><h2>Inside your fridge</h2><p>${filter==="expiring"?"Items approaching their estimated expiry":"Your food inventory and freshness"} · ${items.length} items</p></div></div>
 <div class="inventory-toolbar"><button data-inventory-filter="all">All items (${inventory.length})</button><button data-inventory-filter="expiring">Expiring soon (${inventory.filter(i=>i.daysLeft<=3).length})</button><button data-action="Add Food">＋ Add food</button></div>
 <div class="inventory-list">${items.length?items.map(({item,index})=>{const pct=getFreshnessPercent(item);const color=item.daysLeft<=1?"#d68a79":item.daysLeft<=3?"#d3ae61":"#91a9a0";return `<article class="food-item"><div class="food-item-top"><div><h3>${item.name}</h3><div class="food-meta">${item.quantity} · ${item.category}</div></div><span class="status-pill ${getStatusClass(item)}">${getFreshness(item)}</span></div><div class="freshness-track"><div class="freshness-fill" style="width:${pct}%;background:${color}"></div></div><div class="freshness-label"><span>Freshness estimate</span><strong>${pct}%</strong></div><div class="food-meta" style="margin-top:8px">${item.daysLeft===0?"Estimated expiry: today":`${item.daysLeft} day(s) remaining`}</div><button data-remove-item="${index}">Remove item</button></article>`;}).join(""):"<p>No items in this category.</p>"}</div>`;
}
function renderNotesApp(){
 $("appContent").innerHTML=`<div class="app-header"><div class="app-icon">📝</div><div><h2>Family notes</h2><p>Little reminders for everyone at home.</p></div></div><div class="feature"><h3>Your notes</h3>${state.notes.length?state.notes.map((n,i)=>`<div class="module-row">${n}<button data-remove-note="${i}" style="float:right">Remove</button></div>`).join(""):"<p>No notes yet.</p>"}<button data-action="Add Note">＋ Add a note</button></div>`;
}
function renderRecipesApp(){
 const urgent=inventory.filter(i=>i.daysLeft<=3).map(i=>i.name);
 $("appContent").innerHTML=`<div class="app-header"><div class="app-icon">🍳</div><div><h2>Cook something lovely</h2><p>Recipe ideas using what is already in your fridge.</p></div></div><div class="feature"><span class="eyebrow">USE FIRST</span><h3>Spinach & cheese omelette</h3><p>Uses spinach, eggs and cheese · 15 minutes</p><button data-action="Cooking Instructions">View cooking instructions</button></div><div class="feature"><h3>Vegetable sandwich</h3><p>Uses bread, spinach and cheese · 10 minutes</p></div><div class="feature-result">Prioritising ingredients: ${urgent.join(", ")||"your available ingredients"}.<br><small>These are sample recommendations, not live AI-generated recipes.</small></div>`;
}
function handleAction(action){
 const result=$("actionResult");
 if(action==="inventory-list"){renderInventory("all");return;}
 if(action==="expiring-list"){renderInventory("expiring");return;}
 if(action==="View All Items"){renderInventory("all");return;}
 if(action==="Expiring Soon"){renderInventory("expiring");return;}
 if(action==="Freshness Score"){result.innerHTML=`<strong>Freshness score: ${getFreshnessScore()}%</strong><p>Calculated from the sample remaining shelf-life estimates for each item.</p>`;return;}
 if(action==="Food Waste Risk"){result.innerHTML=`<strong>Food waste watch</strong><p>${inventory.filter(i=>i.daysLeft<=3).length} item(s) are approaching their estimated expiry.</p>`;return;}
 if(action==="Add Food"){openModal(`<h3>＋ Add food item</h3><input id="foodName" placeholder="Food name"><input id="foodQuantity" placeholder="Quantity (e.g. 1 litre)"><input id="foodCategory" placeholder="Category (e.g. Dairy)"><input id="foodDays" type="number" min="0" placeholder="Estimated days remaining"><button id="saveFood">Save item</button>`);return;}
 if(action.startsWith("Remove:")){const index=Number(action.split(":")[1]);inventory.splice(index,1);renderInventory("all");updateDashboard();notify("Item removed");return;}
 if(action==="Low Stock"){result.textContent="No automated low-stock thresholds configured yet.";return;}
 if(action==="Shopping List"){result.innerHTML=`<strong>🛒 Shopping list</strong>${state.shoppingList.map(x=>`<p>• ${x}</p>`).join("")||"<p>Your shopping list is empty.</p>"}`;return;}
 if(["Use Expiring Ingredients","Recipes From My Fridge","Quick Meals"].includes(action)){renderRecipesApp();return;}
 if(action==="Cooking Instructions"){result.innerHTML="<strong>🍳 Spinach & Cheese Omelette</strong><p>1. Wash and chop the spinach.</p><p>2. Beat two eggs.</p><p>3. Cook spinach in a pan.</p><p>4. Add eggs and cheese.</p><p>5. Cook until fully set.</p>";return;}
 if(action==="Generate QR Code"){openModal("<h3>📱 Pair your mobile</h3><div style='background:white;color:#222;padding:25px;margin:20px auto;width:150px;text-align:center;font-size:13px'><div style='font-size:65px'>▦</div>DEMO PAIRING</div><p>QR pairing is represented as a demo placeholder.</p>");return;}
 if(action==="Connect Device"){state.connectedMobile=true;result.textContent="Demo mobile device paired successfully.";notify("Mobile device paired");return;}
 if(action==="Disconnect Device"){state.connectedMobile=false;result.textContent="Mobile device disconnected.";return;}
 if(["Sync Inventory","Sync Shopping List","Sync Family Data"].includes(action)){result.textContent=state.connectedMobile?"Synchronization requested successfully.":"Please connect your mobile device first.";return;}
 if(["Connect Wi-Fi","Available Networks"].includes(action)){openModal("<h3>📶 Wi-Fi settings</h3><p>Choose a demo network</p><button class='connect-network'>Home_WiFi</button><button class='connect-network'>Guest_WiFi</button>");return;}
 if(action==="Check Connection"){result.textContent=state.wifiConnected?"🟢 Connected to Home Wi-Fi":"🔴 Not connected";return;}
 if(action==="Test Internet"){result.textContent=state.wifiConnected?"Demo connection check passed.":"No network connection.";return;}
 if(action==="Forget Network"){state.wifiConnected=false;$("wifiStatus").textContent="● Offline";$("miniWifi").textContent="Offline";result.textContent="Demo network disconnected.";return;}
 const deviceResponses={"Fridge Temperature":"Current sample temperature: 4°C","Freezer Temperature":"Current sample temperature: -18°C","Door Status":"Fridge door: Closed","Filter Health":"Filter health: Good","Device Diagnostics":"All demo device checks passed.","Software Updates":"Your demo software is up to date.","Power Consumption":"Power consumption data requires a connected energy sensor."};
 if(deviceResponses[action]){result.textContent=deviceResponses[action];return;}
 if(action==="View Notes"){renderNotesApp();return;}
 if(action==="Add Note"||action==="Add Message"){openModal("<h3>📝 Add a note</h3><input id='noteInput' placeholder='Write your message'><button id='saveNote'>Save note</button>");return;}
 if(action==="Clear Notes"){state.notes=[];renderNotesApp();notify("Notes cleared");return;}
 result.innerHTML=`<strong>${action}</strong><p>This feature is ready for implementation.</p>`;
}
function openModal(content){$("modalContent").innerHTML=content;$("modal").classList.remove("hidden");}
function closeModal(){$("modal").classList.add("hidden");}
$("closeModal").addEventListener("click",closeModal);
$("modal").addEventListener("click",e=>{if(e.target===$("modal"))closeModal();});
$("modalContent").addEventListener("click",e=>{
 const t=e.target;
 if(t.id==="saveFood"){
  const name=$("foodName").value.trim(),quantity=$("foodQuantity").value.trim(),days=Number($("foodDays").value),category=$("foodCategory").value.trim()||"Other";
  if(!name||!quantity||$("foodDays").value===""||!Number.isFinite(days)||days<0){notify("Enter valid food details");return;}
  inventory.push({name,quantity,category,daysLeft:days});closeModal();updateDashboard();notify("Food added to inventory");if(state.currentApp==="inventory")renderInventory("all");return;
 }
 if(t.id==="saveNote"){const note=$("noteInput").value.trim();if(!note)return;state.notes.push(note);closeModal();notify("Note saved");if(state.currentApp==="notes")renderNotesApp();return;}
 if(t.classList.contains("connect-network")){state.wifiConnected=true;$("wifiStatus").textContent="● Wi-Fi";$("miniWifi").textContent="Wi-Fi";closeModal();notify("Demo Wi-Fi connected");}
});
document.addEventListener("click",e=>{
 const nav=e.target.closest("[data-nav]");
 if(nav){const id=nav.dataset.nav;id==="homePage"?showPage("homePage"):openApp(id);return;}
 const add=e.target.closest("[data-nav-add]");
 if(add){if(state.navItems.length>=5){notify("Navigation can contain up to five apps");return;}state.navItems.push(add.dataset.navAdd);saveNav();renderNav();renderNavManager();notify("App added to navigation");return;}
 const remove=e.target.closest("[data-nav-remove]");
 if(remove){state.navItems=state.navItems.filter(id=>id!==remove.dataset.navRemove);saveNav();renderNav();renderNavManager();notify("App removed from navigation");return;}
 const move=e.target.closest("[data-nav-move]");
 if(move){const i=Number(move.dataset.navMove),j=i+Number(move.dataset.dir);if(j>=0&&j<state.navItems.length){[state.navItems[i],state.navItems[j]]=[state.navItems[j],state.navItems[i]];saveNav();renderNav();renderNavManager();}return;}
 const restore=e.target.closest("#restoreNav");
 if(restore){state.navItems=[...DEFAULT_NAV];saveNav();renderNav();renderNavManager();notify("Default navigation restored");return;}
 const filter=e.target.closest("[data-inventory-filter]");
 if(filter){renderInventory(filter.dataset.inventoryFilter);return;}
 const removeItem=e.target.closest("[data-remove-item]");
 if(removeItem){inventory.splice(Number(removeItem.dataset.removeItem),1);renderInventory("all");updateDashboard();notify("Item removed");return;}
 const removeNote=e.target.closest("[data-remove-note]");
 if(removeNote){state.notes.splice(Number(removeNote.dataset.removeNote),1);renderNotesApp();return;}
 const appButton=e.target.closest("[data-app]");
 if(appButton){openApp(appButton.dataset.app);return;}
 const pageButton=e.target.closest("[data-page]");
 if(pageButton){showPage(pageButton.dataset.page);return;}
 const actionButton=e.target.closest("[data-action]");
 if(actionButton){handleAction(actionButton.dataset.action);return;}
 if(e.target.id==="appBack"){showPage("appsPage");return;}
});
function openDisplay(){$("fridgeScene").classList.add("hidden");$("magnetView").classList.remove("hidden");showPage("homePage");}
function closeDisplay(){$("magnetView").classList.add("hidden");$("fridgeScene").classList.remove("hidden");}
$("openDisplay").addEventListener("click",openDisplay);$("zoomButton").addEventListener("click",openDisplay);$("backButton").addEventListener("click",closeDisplay);
function updateClock(){
 const now=new Date(),time=now.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:false});
 $("clock").textContent=time;$("miniTime").textContent=time;
 $("miniDate").textContent=now.toLocaleDateString("en-IN",{weekday:"short",month:"short",day:"numeric"}).toUpperCase().replace(","," ·");
}
setInterval(updateClock,30000);updateClock();renderApps();showPage("homePage");
