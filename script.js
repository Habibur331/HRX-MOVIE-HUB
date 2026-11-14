const movies = [
  {id:1,title:"Interstellar",year:2014,genre:"Sci-Fi",rating:"8.7",symbol:"✦",tag:"EDITOR'S PICK",poster:"linear-gradient(145deg,#1a3852,#607a86 48%,#101725)",description:"A team of explorers travels beyond this galaxy to discover whether mankind has a future among the stars."},
  {id:2,title:"The Dark Knight",year:2008,genre:"Action",rating:"9.0",symbol:"◈",tag:"TOP RATED",poster:"linear-gradient(145deg,#111b29,#4c5360 52%,#111)",description:"A masked hero faces a new challenge as chaos spreads through Gotham City."},
  {id:3,title:"The Grand Budapest Hotel",year:2014,genre:"Drama",rating:"8.1",symbol:"✿",tag:"CULT FAVOURITE",poster:"linear-gradient(145deg,#9b4266,#e5a2a0 55%,#4d284a)",description:"A legendary concierge and his young protégé become involved in a colourful adventure."},
  {id:4,title:"Dune: Part Two",year:2024,genre:"Adventure",rating:"8.5",symbol:"⌁",tag:"FEATURED",poster:"linear-gradient(145deg,#5e351f,#d18b4a 55%,#241b1b)",description:"Paul Atreides unites with the Fremen while seeking justice and facing a difficult destiny."},
  {id:5,title:"Spider-Man: Into the Spider-Verse",year:2018,genre:"Animation",rating:"8.4",symbol:"✕",tag:"ANIMATION",poster:"linear-gradient(145deg,#192c62,#c43c51 55%,#15162e)",description:"A teenager meets heroes from other dimensions and discovers what it means to be a hero."},
  {id:6,title:"Mad Max: Fury Road",year:2015,genre:"Action",rating:"8.1",symbol:"⚡",tag:"ACTION",poster:"linear-gradient(145deg,#54301c,#e18a36 50%,#241b18)",description:"In a post-apocalyptic world, a high-speed journey becomes a fight for freedom."}
];
const grid=document.getElementById("movieGrid"), search=document.getElementById("searchInput");
let activeGenre="All";
function render(){
  const term=search.value.trim().toLowerCase();
  const filtered=movies.filter(m=>(activeGenre==="All"||m.genre===activeGenre)&&(m.title.toLowerCase().includes(term)||m.genre.toLowerCase().includes(term)));
  grid.innerHTML=filtered.map(m=>`<article class="movie-card" data-id="${m.id}" tabindex="0" role="button" aria-label="Details for ${m.title}">
    <div class="poster" style="--poster:${m.poster}" data-symbol="${m.symbol}"><span class="poster-tag">${m.tag}</span><div class="poster-title">${m.title}</div></div>
    <div class="movie-info"><div><h3>${m.title}</h3><p>${m.year} · ${m.genre}</p></div><span class="rating">★ ${m.rating}</span></div>
  </article>`).join("");
  document.getElementById("resultCount").textContent=`${filtered.length} ${filtered.length===1?"TITLE":"TITLES"}`;
  document.getElementById("emptyState").hidden=filtered.length!==0;
}
function openMovie(id){
  const m=movies.find(x=>x.id===Number(id)); if(!m)return;
  document.getElementById("dialogArt").style.setProperty("--poster",m.poster);
  document.getElementById("dialogArt").dataset.symbol=m.symbol;
  document.getElementById("dialogGenre").textContent=`${m.genre.toUpperCase()} · ${m.year} · ★ ${m.rating}`;
  document.getElementById("dialogTitle").textContent=m.title;
  document.getElementById("dialogDescription").textContent=m.description;
  document.getElementById("trailerLink").href=`https://www.youtube.com/results?search_query=${encodeURIComponent(m.title+" official trailer")}`;
  document.getElementById("movieDialog").showModal();
}
grid.addEventListener("click",e=>{const card=e.target.closest(".movie-card");if(card)openMovie(card.dataset.id)});
grid.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.classList.contains("movie-card")){e.preventDefault();openMovie(e.target.dataset.id)}});
search.addEventListener("input",render);
document.querySelectorAll(".filter").forEach(btn=>btn.addEventListener("click",()=>{document.querySelector(".filter.active").classList.remove("active");btn.classList.add("active");activeGenre=btn.dataset.genre;render()}));
document.getElementById("closeDialog").addEventListener("click",()=>document.getElementById("movieDialog").close());
document.getElementById("movieDialog").addEventListener("click",e=>{if(e.target===e.currentTarget)e.currentTarget.close()});
document.getElementById("downloadInfo").addEventListener("click",()=>{document.getElementById("dialogNote").textContent="No download file is attached in this demo. The site owner can add an authorized download URL after confirming distribution rights."});
document.getElementById("year").textContent=new Date().getFullYear();
render();