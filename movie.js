const API_KEY = "cd61e72d82326f0e97592dd8e18856f5";
const IMG = "https://image.tmdb.org/t/p/w500";
const BACKDROP = "https://image.tmdb.org/t/p/original";

// Safe large demo file (public domain, ~400MB)
const fileLink = "https://download.blender.org/durian/movies/sintel-1024-surround.mp4";

const movieId = localStorage.getItem("movieId");
if (!movieId) {
  document.body.innerHTML =
    "<h2 style='text-align:center;color:red'>❌ Movie ID not found. Please go back and select a movie.</h2>";
  throw new Error("Movie ID not found");
}

// Download Buttons Data
const downloads = [
  { quality: "480p", size: "300MB", link: fileLink, color: "btn-blue" },
  { quality: "720p", size: "800MB", link: fileLink, color: "btn-green" },
  { quality: "1080p", size: "2GB", link: fileLink, color: "btn-red" }
];

// ===== Expand Description if too short =====
function expandDescription(text) {
  if (!text) return "Description not available.";
  let words = text.split(" ");
  if (words.length >= 250) return text;

  let extra =
    " In this film, the story dives deeper into the challenges faced by characters, exploring emotions, struggles, and unexpected turns. The direction keeps viewers engaged throughout. It emphasizes the importance of relationships, choices, and consequences, while balancing drama, action, and heartfelt emotion. The film also highlights determination, ambition, and courage.";
  let finalText = text + extra;
  let finalWords = finalText.split(" ");
  while (finalWords.length < 280) {
    finalText +=
      " ";
    finalWords = finalText.split(" ");
  }
  return finalWords.slice(0, 300).join(" ");
}

// ===== Load Movie Details =====
async function loadDetails() {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}&append_to_response=videos,images,recommendations`
    );
    const data = await res.json();

    // Banner
    const banner = document.getElementById("banner");
    banner.style.backgroundImage = `url(${BACKDROP + data.backdrop_path})`;
    banner.innerHTML = `<h2>${data.title} (${data.release_date.split("-")[0]}) ⭐ ${data.vote_average.toFixed(
      1
    )}</h2>`;

    // Description
    let description = expandDescription(data.overview);

    // Movie Info
    document.getElementById("movie-detail").innerHTML = `
      <img src="${IMG + data.poster_path}" alt="${data.title}">
      <div class="info">
        <h2>${data.title}</h2>
        <p><strong>Release:</strong> ${data.release_date}</p>
        <p><strong>Runtime:</strong> ${data.runtime} min</p>
        <p><strong>Genres:</strong> ${data.genres.map(g => g.name).join(", ")}</p>
        <p>${description}</p>
      </div>
    `;

    // Trailer
    const trailerDiv = document.getElementById("trailer");
    const trailer = data.videos.results.find(
      v => v.type === "Trailer" && v.site === "YouTube"
    );
    trailerDiv.innerHTML = trailer
      ? `<iframe src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allowfullscreen></iframe>`
      : "<p>Trailer not available</p>";

    // Screenshots
    const screensDiv = document.getElementById("screens");
    screensDiv.innerHTML = "";
    data.images.backdrops.slice(0, 6).forEach(img => {
      const el = document.createElement("img");
      el.src = IMG + img.file_path;
      screensDiv.appendChild(el);
    });

    // ===== Dynamic Download Buttons (CORS-free) =====
    const downloadDiv = document.getElementById("download-btns");
    downloads.forEach(d => {
      const btn = document.createElement("a");
      btn.href = d.link; // direct file link
      btn.className = d.color;
      btn.textContent = `${d.quality} [${d.size}]`;
      btn.setAttribute("download", "Demo-Movie.mp4"); // try force download
      btn.setAttribute("target", "_blank"); // fallback: open in new tab if browser ignores download
      downloadDiv.appendChild(btn);
    });

    // Similar Movies
    const similarDiv = document.getElementById("similar-grid");
    data.recommendations.results.slice(0, 6).forEach(m => {
      if (!m.poster_path) return;
      const el = document.createElement("div");
      el.innerHTML = `<img src="${IMG + m.poster_path}" alt="${m.title}">`;
      el.onclick = () => {
        localStorage.setItem("movieId", m.id);
        location.reload();
      };
      similarDiv.appendChild(el);
    });

    // More Movies
    const moreDiv = document.getElementById("more-grid");
    data.recommendations.results.slice(6, 18).forEach(m => {
      if (!m.poster_path) return;
      const el = document.createElement("div");
      el.innerHTML = `<img src="${IMG + m.poster_path}" alt="${m.title}">`;
      el.onclick = () => {
        localStorage.setItem("movieId", m.id);
        location.reload();
      };
      moreDiv.appendChild(el);
    });
  } catch (err) {
    console.error("Error loading movie details:", err);
    document.body.innerHTML =
      "<h2 style='text-align:center;color:red'>⚠ Error loading movie details</h2>";
  }
}

loadDetails();

// ===== Theme Toggle =====
const themeToggle = document.getElementById("theme-toggle");
if (themeToggle) {
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
