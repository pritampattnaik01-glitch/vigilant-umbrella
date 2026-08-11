const products = [
  {id:1,name:"Saffron Sandalwood Magic Bar",price:399,old:470,cat:"tan",tag:"BESTSELLER"},
  {id:2,name:"Turmeric Glow Soap",price:299,old:349,cat:"glow",tag:"GLOW"},
  {id:3,name:"Oat & Honey Bath Bar",price:329,old:379,cat:"dry",tag:"DRY SKIN"},
  {id:4,name:"Neem Tea Tree Cleanser Bar",price:289,old:329,cat:"acne",tag:"ACNE CARE"},
  {id:5,name:"Coffee De-Tan Scrub Bar",price:319,old:369,cat:"tan",tag:"NEW"},
  {id:6,name:"Aloe Vera Gentle Bar",price:279,old:319,cat:"dry",tag:"GENTLE"},
  {id:7,name:"Rose Saffron Luxury Bar",price:349,old:399,cat:"glow",tag:"LUXURY"},
  {id:8,name:"Multani Mitti Purifying Bar",price:299,old:349,cat:"acne",tag:"PURIFY"}
];
let cart = JSON.parse(localStorage.getItem("soapCart") || "[]");

const money = n => `₹${Number(n).toFixed(0)}`;
function renderProducts(list=products){
  document.getElementById("productGrid").innerHTML = list.map(p => `
    <article class="card">
      <div class="product-img"><span class="tag">${p.tag}</span><div class="bar">${p.name.split(" ")[0]}<br><small>SOAP</small></div></div>
      <div class="card-body"><div class="rating">★★★★★ <span>4.8</span></div><h3>${p.name}</h3><div><span class="old">${money(p.old)}</span><span class="price">${money(p.price)}</span></div><button class="add" onclick="addToCart(${p.id})">ADD TO CART</button></div>
    </article>`).join("");
}
function addToCart(id){
  const found=cart.find(x=>x.id===id); found?found.qty++:cart.push({id,qty:1});
  save(); openCart();
}
function save(){localStorage.setItem("soapCart",JSON.stringify(cart));renderCart();document.getElementById("cartCount").textContent=cart.reduce((s,x)=>s+x.qty,0)}
function renderCart(){
  const box=document.getElementById("cartItems");
  if(!cart.length){box.innerHTML="<p>Your cart is empty.</p>";}
  else box.innerHTML=cart.map(x=>{const p=products.find(a=>a.id===x.id);return `<div class="cart-row"><div><b>${p.name}</b><br>${money(p.price)} × ${x.qty}</div><div class="qty"><button onclick="changeQty(${p.id},-1)">−</button> <button onclick="changeQty(${p.id},1)">+</button></div></div>`}).join("");
  const total=cart.reduce((s,x)=>s+products.find(p=>p.id===x.id).price*x.qty,0);
  document.getElementById("cartTotal").textContent=money(total);
  document.getElementById("orderTotal").textContent=money(total);
}
function changeQty(id,d){const x=cart.find(a=>a.id===id);if(!x)return;x.qty+=d;if(x.qty<=0)cart=cart.filter(a=>a.id!==id);save()}
function openCart(){document.getElementById("cartDrawer").classList.add("open");document.getElementById("overlay").classList.add("show");renderCart()}
function closeCart(){document.getElementById("cartDrawer").classList.remove("open");document.getElementById("overlay").classList.remove("show")}
function goToOrder(){closeCart();document.getElementById("order").scrollIntoView({behavior:"smooth"})}
function scrollToProducts(){document.getElementById("products").scrollIntoView({behavior:"smooth"})}
function filterProducts(cat){renderProducts(cat==="all"?products:products.filter(p=>p.cat===cat));scrollToProducts()}
document.getElementById("search").addEventListener("input",e=>{const q=e.target.value.toLowerCase();renderProducts(products.filter(p=>p.name.toLowerCase().includes(q)))});
document.getElementById("orderForm").addEventListener("submit",async e=>{
  e.preventDefault();
  if(!cart.length){document.getElementById("formNote").textContent="Add at least one product to the cart.";return}
  const items=cart.map(x=>{const p=products.find(a=>a.id===x.id);return {name:p.name,price:p.price,qty:x.qty}});
  const total=items.reduce((s,x)=>s+x.price*x.qty,0);
  const customer={name:name.value,phone:phone.value,email:email.value,address:address.value+(pincode.value?`\\nPIN: ${pincode.value}`:"")};
  const note=document.getElementById("formNote");note.textContent="Sending order…";
  try{
    const r=await fetch("/api/order",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({customer,items,total})});
    const data=await r.json();
    note.textContent=data.message;
    if(data.ok){cart=[];save();e.target.reset()}
  }catch(err){note.textContent="Server connection error. Please try again."}
});
renderProducts();save();
