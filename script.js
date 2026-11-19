
// HRX MOVIE HUB - Supabase Database Connection

const SUPABASE_URL = "https://sdfrbfyywzlzpkrlpguh.supabase.co";
const SUPABASE_KEY = "sb_publishable_2PkFUoj4M_jAxOpX7AAODw_GW9Jc4G4";

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const grid = document.getElementById("movieGrid");
const search = document.getElementById("searchInput");

let movies = [];
let activeGenre = "All";

const posterColors = [
  "linear-gradient(145deg,#1a3852,#607a86,#101725)",
  "linear-gradient(145deg,#111b29,#4c5360,#111)",
  "linear-gradient(145deg,#9b4266,#e5a2a0,#4d284a)",
  "linear-gradient(145deg,#5e351f,#d18b4a,#241b1b)",
  "linear-gradient(145deg,#192c62,#c43c51,#15162e)"
];

function safe(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

async function loadMovies() {
  grid.innerHTML = "<p>Loading movies...</p>";

  const { data, error } = await db
    .from("movies")
    .select("id,title,release_year,genre,rating,poster_url,external_url,description")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    grid.innerHTML = "<p>Movies load failed. Please refresh.</p>";
    return;
  }

  movies = data || [];
  render();
}

function render() {
  const term = search.value.trim().toLowerCase();

  const filtered = movies.filter(movie => {
    const genre = movie.genre || "";
    const title = movie.title || "";

    return (
      (activeGenre === "All" || genre === activeGenre) &&
      (title.toLowerCase().includes(term) ||
       genre.toLowerCase().includes(term))
    );
  });

  grid.innerHTML = filtered.map((movie, index) => `
    <article class="movie-card"
      data-id="${safe(movie.id)}"
      tabindex="0"
      role="button">

      <div class="poster"
        style="--poster:${posterColors[index % posterColors.length]}"
        data-symbol="✦">

        <span class="poster-tag">HRX MOVIE</span>
        <div class="poster-title">${safe(movie.title)}</div>
      </div>

      <div class="movie-info">
        <div>
          <h3>${safe(movie.title)}</h3>
          <p>${safe(movie.release_year || "N/A")} · ${safe(movie.genre || "Other")}</p>
        </div>
        <span class="rating">★ ${safe(movie.rating || "N/A")}</span>
      </div>
    </article>
  `).join("");

  document.getElementById("resultCount").textContent =
    `${filtered.length} ${filtered.length === 1 ? "TITLE" : "TITLES"}`;

  document.getElementById("emptyState").hidden = filtered.length !== 0;
}

function openMovie(id) {
  const movie = movies.find(item => String(item.id) === String(id));
  if (!movie) return;

  document.getElementById("dialogArt").style.setProperty(
    "--poster",
    posterColors[0]
  );

  document.getElementById("dialogArt").dataset.symbol = "✦";

  document.getElementById("dialogGenre").textContent =
    `${movie.genre || "OTHER"} · ${movie.release_year || "N/A"} · ★ ${movie.rating || "N/A"}`;

  document.getElementById("dialogTitle").textContent = movie.title || "";
  document.getElementById("dialogDescription").textContent =
    movie.description || "No description available.";

  const link = document.getElementById("trailerLink");

  if (movie.external_url) {
    link.href = movie.external_url;
    link.textContent = "Visit official link ↗";
  } else {
    link.href = `https://www.youtube.com/results?search_query=${encodeURIComponent((movie.title || "") + " official trailer")}`;
    link.textContent = "Find official trailer ↗";
  }

  document.getElementById("dialogNote").textContent =
    "Watch/download links are provided only when legally authorized.";

  document.getElementById("movieDialog").showModal();
}

grid.addEventListener("click", event => {
  const card = event.target.closest(".movie-card");
  if (card) openMovie(card.dataset.id);
});

grid.addEventListener("keydown", event => {
  if (
    (event.key === "Enter" || event.key === " ") &&
    event.target.classList.contains("movie-card")
  ) {
    event.preventDefault();
    openMovie(event.target.dataset.id);
  }
});

search.addEventListener("input", render);

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelector(".filter.active")?.classList.remove("active");
    button.classList.add("active");
    activeGenre = button.dataset.genre;
    render();
  });
});

document.getElementById("closeDialog").addEventListener("click", () => {
  document.getElementById("movieDialog").close();
});

document.getElementById("movieDialog").addEventListener("click", event => {
  if (event.target === event.currentTarget) {
    event.currentTarget.close();
  }
});

document.getElementById("downloadInfo").addEventListener("click", () => {
  document.getElementById("dialogNote").textContent =
    "Download links will be available only for legally authorized content.";
});

document.getElementById("year").textContent = new Date().getFullYear();

loadMovies();
