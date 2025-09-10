const API_KEY = "cd61e72d82326f0e97592dd8e18856f5";
const IMG = "https://image.tmdb.org/t/p/w500";

const grid = document.getElementById("movie-grid");
const searchInput = document.getElementById("search");
const categories = document.querySelectorAll(".categories button");
const paginationDiv = document.getElementById("pagination");

let currentPage = 1;
let currentCategory = "trending";
let currentQuery = "";
let totalPages = 1;

// Load Movies
async function loadMovies(page = 1) {
  let url = "";
  if (currentQuery) {
    url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${currentQuery}&page=${page}`;
  } else {
    if (currentCategory === "trending") {
      url = `https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}&page=${page}`;
    } else {
      url = `https://api.themoviedb.org/3/movie/${currentCategory}?api_key=${API_KEY}&page=${page}`;
    }
  }

  const res = await fetch(url);
  const data = await res.json();

  showMovies(data.results.slice(0, 21));
  totalPages = data.total_pages;
  renderPagination(page, totalPages);
}

// Show Movies
function showMovies(list) {
  grid.innerHTML = "";
  list.forEach(m => {
    if (!m.poster_path) return;
    const card = document.createElement("div");
    card.classList.add("movie-card");
    card.innerHTML = `
      <img src="${IMG + m.poster_path}" alt="${m.title}">
      <h3>${m.title}</h3>
    `;
    card.onclick = () => {
      localStorage.setItem("movieId", m.id);
      window.location.href = "movie.html";
    };
    grid.appendChild(card);
  });
}

// Render Pagination with Numbers
function renderPagination(page, total) {
  paginationDiv.innerHTML = "";

  const prev = document.createElement("button");
  prev.textContent = "⬅ Prev";
  prev.disabled = page === 1;
  prev.onclick = () => {
    if (page > 1) {
      currentPage--;
      loadMovies(currentPage);
    }
  };
  paginationDiv.appendChild(prev);

  let start = Math.max(1, page - 2);
  let end = Math.min(total, page + 2);

  for (let i = start; i <= end; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === page) btn.classList.add("active");
    btn.onclick = () => {
      currentPage = i;
      loadMovies(currentPage);
    };
    paginationDiv.appendChild(btn);
  }

  const next = document.createElement("button");
  next.textContent = "Next ➡";
  next.disabled = page === total;
  next.onclick = () => {
    if (page < total) {
      currentPage++;
      loadMovies(currentPage);
    }
  };
  paginationDiv.appendChild(next);
}

// Search Movies (live search)
if (searchInput) {
  searchInput.addEventListener("input", () => {
    currentQuery = searchInput.value.trim();
    currentPage = 1;
    loadMovies(currentPage);
  });
}

// Category Change
categories.forEach(btn => {
  btn.addEventListener("click", () => {
    categories.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    currentCategory = btn.dataset.cat;
    currentQuery = "";
    if (searchInput) searchInput.value = "";
    currentPage = 1;
    loadMovies(currentPage);
  });
});

// Initial Load
if (grid) {
  document.querySelector(".categories button[data-cat='trending']").classList.add("active");
  loadMovies(currentPage);
}

// ===== Theme Toggle =====
const themeToggle = document.getElementById("theme-toggle");
if (themeToggle) {
  // Load saved theme
  if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light");
    themeToggle.textContent = "🌙";
  } else {
    themeToggle.textContent = "☀️";
  }

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light");
    if (document.body.classList.contains("light")) {
      localStorage.setItem("theme", "light");
      themeToggle.textContent = "🌙";
    } else {
      localStorage.setItem("theme", "dark");
      themeToggle.textContent = "☀️";
    }
  });
}
