
// ============================================
// HRX MOVIE HUB
// Homepage - Supabase Database Connection
// ============================================

const SUPABASE_URL = "https://sdfrbfyywzlzpkrlpguh.supabase.co";
const SUPABASE_KEY = "sb_publishable_2PkFUoj4M_jAxOpX7AAODw_GW9Jc4G4";

const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

// ============================================
// HTML ELEMENTS
// ============================================

const grid = document.getElementById("movieGrid");
const searchInput = document.getElementById("searchInput");
const resultCount = document.getElementById("resultCount");
const emptyState = document.getElementById("emptyState");

const movieDialog = document.getElementById("movieDialog");
const dialogArt = document.getElementById("dialogArt");
const dialogGenre = document.getElementById("dialogGenre");
const dialogTitle = document.getElementById("dialogTitle");
const dialogDescription = document.getElementById("dialogDescription");
const trailerLink = document.getElementById("trailerLink");
const dialogNote = document.getElementById("dialogNote");

let movies = [];
let activeGenre = "All";

// ============================================
// PLACEHOLDER POSTER COLORS
// ============================================

const posterColors = [
    "linear-gradient(145deg,#1a3852,#607a86,#101725)",
    "linear-gradient(145deg,#111b29,#4c5360,#111)",
    "linear-gradient(145deg,#9b4266,#e5a2a0,#4d284a)",
    "linear-gradient(145deg,#5e351f,#d18b4a,#241b1b)",
    "linear-gradient(145deg,#192c62,#c43c51,#15162e)"
];

// ============================================
// SAFE TEXT
// ============================================

function safe(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// ============================================
// VALIDATE IMAGE URL
// ============================================

function validImageUrl(url) {
    try {
        const parsed = new URL(url);

        return (
            parsed.protocol === "https:" &&
            parsed.hostname === "res.cloudinary.com"
        );

    } catch {
        return false;
    }
}

// ============================================
// LOAD MOVIES FROM SUPABASE
// ============================================

async function loadMovies() {

    grid.innerHTML = "<p>Loading movies...</p>";

    resultCount.textContent = "LOADING...";

    const { data, error } = await db
        .from("movies")
        .select(`
            id,
            title,
            release_year,
            genre,
            rating,
            poster_url,
            external_url,
            description,
            created_at
        `)
        .order("created_at", { ascending: false });

    if (error) {

        console.error("Movie loading error:", error);

        grid.innerHTML = `
            <p>Unable to load movies. Please refresh the page.</p>
        `;

        resultCount.textContent = "ERROR";

        return;
    }

    movies = data || [];

    createGenreFilters();

    renderMovies();
}

// ============================================
// AUTOMATIC GENRE FILTERS
// ============================================

function createGenreFilters() {

    const filterContainer = document.getElementById("genres");

    const genres = [
        ...new Set(
            movies
                .map(movie => movie.genre)
                .filter(Boolean)
                .map(genre => genre.trim())
        )
    ].sort();

    filterContainer.innerHTML = `
        <button class="filter active" data-genre="All">
            All movies
        </button>
    `;

    genres.forEach(genre => {

        const button = document.createElement("button");

        button.className = "filter";
        button.dataset.genre = genre;
        button.textContent = genre;

        filterContainer.appendChild(button);

    });

    filterContainer.querySelectorAll(".filter").forEach(button => {

        button.addEventListener("click", () => {

            filterContainer
                .querySelector(".filter.active")
                ?.classList.remove("active");

            button.classList.add("active");

            activeGenre = button.dataset.genre;

            renderMovies();

        });

    });
}

// ============================================
// RENDER MOVIES
// ============================================

function renderMovies() {

    const term = searchInput.value.trim().toLowerCase();

    const filteredMovies = movies.filter(movie => {

        const title = String(movie.title || "").toLowerCase();

        const genre = String(movie.genre || "").toLowerCase();

        const year = String(movie.release_year || "");

        const matchesSearch =
            title.includes(term) ||
            genre.includes(term) ||
            year.includes(term);

        const matchesGenre =
            activeGenre === "All" ||
            String(movie.genre || "").trim() === activeGenre;

        return matchesSearch && matchesGenre;

    });

    if (filteredMovies.length === 0) {

        grid.innerHTML = "";

        emptyState.hidden = false;

    } else {

        emptyState.hidden = true;

        grid.innerHTML = filteredMovies.map((movie, index) => {

            const poster = validImageUrl(movie.poster_url)
                ? `
                    <img
                        class="movie-poster-image"
                        src="${safe(movie.poster_url)}"
                        alt="${safe(movie.title)} poster"
                        loading="lazy"
                    >
                `
                : "";

            const color = posterColors[index % posterColors.length];

            return `
                <article
                    class="movie-card"
                    data-id="${safe(movie.id)}"
                    tabindex="0"
                    role="button"
                    aria-label="View ${safe(movie.title)} details"
                >

                    <div
                        class="poster"
                        style="--poster:${color}"
                        data-symbol="✦"
                    >

                        ${poster}

                        <span class="poster-tag">
                            HRX MOVIE
                        </span>

                        <div class="poster-title">
                            ${safe(movie.title)}
                        </div>

                    </div>

                    <div class="movie-info">

                        <div>
                            <h3>${safe(movie.title)}</h3>

                            <p>
                                ${safe(movie.release_year || "N/A")}
                                ·
                                ${safe(movie.genre || "Other")}
                            </p>
                        </div>

                        <span class="rating">
                            ★ ${safe(movie.rating ?? "N/A")}
                        </span>

                    </div>

                </article>
            `;

        }).join("");

    }

    resultCount.textContent =
        `${filteredMovies.length} ${
            filteredMovies.length === 1 ? "TITLE" : "TITLES"
        }`;

}

// ============================================
// OPEN MOVIE DETAILS
// ============================================

function openMovie(id) {

    const movie = movies.find(
        item => String(item.id) === String(id)
    );

    if (!movie) return;

    const poster = validImageUrl(movie.poster_url)
        ? `
            <img
                src="${safe(movie.poster_url)}"
                alt="${safe(movie.title)} poster"
            >
        `
        : "";

    dialogArt.innerHTML = poster;

    dialogArt.style.setProperty(
        "--poster",
        posterColors[0]
    );

    dialogGenre.textContent =
        `${movie.genre || "OTHER"} · ${movie.release_year || "N/A"} · ★ ${movie.rating ?? "N/A"}`;

    dialogTitle.textContent = movie.title || "";

    dialogDescription.textContent =
        movie.description || "No description available.";

    if (movie.external_url) {

        try {

            const url = new URL(movie.external_url);

            if (
                url.protocol === "https:" ||
                url.protocol === "http:"
            ) {

                trailerLink.href = url.href;

                trailerLink.textContent = "Visit official link ↗";

            } else {

                setTrailerSearch(movie.title);

            }

        } catch {

            setTrailerSearch(movie.title);

        }

    } else {

        setTrailerSearch(movie.title);

    }

    dialogNote.textContent =
        "Watch and download links are provided only for legally authorized content.";

    movieDialog.showModal();

}

// ============================================
// OFFICIAL TRAILER SEARCH
// ============================================

function setTrailerSearch(title) {

    trailerLink.href =
        "https://www.youtube.com/results?search_query=" +
        encodeURIComponent((title || "") + " official trailer");

    trailerLink.textContent = "Find official trailer ↗";

}

// ============================================
// MOVIE CARD CLICK
// ============================================

grid.addEventListener("click", event => {

    const card = event.target.closest(".movie-card");

    if (card) {

        openMovie(card.dataset.id);

    }

});

// ============================================
// KEYBOARD ACCESSIBILITY
// ============================================

grid.addEventListener("keydown", event => {

    const card = event.target.closest(".movie-card");

    if (
        card &&
        (event.key === "Enter" || event.key === " ")
    ) {

        event.preventDefault();

        openMovie(card.dataset.id);

    }

});

// ============================================
// SEARCH
// ============================================

searchInput.addEventListener("input", renderMovies);

// ============================================
// CLOSE DETAILS
// ============================================

document.getElementById("closeDialog")
    .addEventListener("click", () => {

        movieDialog.close();

    });

movieDialog.addEventListener("click", event => {

    if (event.target === movieDialog) {

        movieDialog.close();

    }

});

// ============================================
// DOWNLOAD INFORMATION
// ============================================

document.getElementById("downloadInfo")
    .addEventListener("click", () => {

        dialogNote.textContent =
            "Download links will be available only for legally authorized content.";

    });

// ============================================
// CURRENT YEAR
// ============================================

document.getElementById("year").textContent =
    new Date().getFullYear();

// ============================================
// START WEBSITE
// ============================================

loadMovies();
