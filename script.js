// --- DATA INITIALIZATION ---
let movies = JSON.parse(localStorage.getItem('movieData')) || [];
let currentEditingId = null;

// Save to LocalStorage
function save() {
    localStorage.setItem('movieData', JSON.stringify(movies));
}

// --- PRIMARY ACTION: ADD TO QUEUE ---
// This runs from the "To Watch" page
function addDirectToQueue() {
    const titleInput = document.getElementById('new-title');
    const categoryInput = document.getElementById('new-category');
    const lengthInput = document.getElementById('new-length');

    if (titleInput && titleInput.value.trim() !== "") {
        const newMovie = {
            id: Date.now(),
            title: titleInput.value.trim(),
            category: categoryInput.value,
            length: lengthInput.value.trim() || "N/A",
            watched: false,
            rating: 0,
            dateWatched: ""
        };
        
        movies.push(newMovie);
        save();
        
        // Clear inputs and refresh
        titleInput.value = "";
        lengthInput.value = "";
        location.reload();
    } else {
        alert("Please enter a movie title.");
    }
}

// --- EDIT MODAL LOGIC ---
function openEditModal(id) {
    const movie = movies.find(m => m.id === id);
    if (movie) {
        currentEditingId = id;
        document.getElementById('editTitle').value = movie.title;
        document.getElementById('editCategory').value = movie.category;
        document.getElementById('editLength').value = movie.length;
        document.getElementById('editModal').style.display = 'block';
    }
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    currentEditingId = null;
}

function submitEdit() {
    const movie = movies.find(m => m.id === currentEditingId);
    if (movie) {
        movie.title = document.getElementById('editTitle').value.trim();
        movie.category = document.getElementById('editCategory').value;
        movie.length = document.getElementById('editLength').value.trim();
        
        save();
        location.reload();
    }
}

// --- MARK COMPLETE (RATING) MODAL LOGIC ---
function markAsComplete(id) {
    const movie = movies.find(m => m.id === id);
    if (movie) {
        currentEditingId = id;
        document.getElementById('modalMovieTitle').innerText = `Finished "${movie.title}"?`;
        document.getElementById('modalDate').valueAsDate = new Date();
        document.getElementById('ratingModal').style.display = 'block';
    }
}

function closeModal() {
    document.getElementById('ratingModal').style.display = 'none';
    currentEditingId = null;
}

function submitFinalRating() {
    const rating = document.getElementById('modalRating').value;
    const date = document.getElementById('modalDate').value;
    const movie = movies.find(m => m.id === currentEditingId);
    
    if (movie) {
        movie.watched = true;
        movie.rating = parseFloat(rating) || 0;
        movie.dateWatched = date || "Unknown Date";
        
        save();
        // Redirect to Home/Watched page after completing
        window.location.href = "index.html"; 
    }
}

// --- GLOBAL DELETE ---
function deleteMovie(id) {
    if (confirm("Are you sure you want to delete this movie?")) {
        movies = movies.filter(m => m.id !== id);
        save();
        location.reload();
    }
}

// --- PAGE RENDERING ---
window.onload = function() {
    const watchList = document.getElementById('category-lists');
    const ratedList = document.getElementById('watched-list');

    // 1. RENDER TO WATCH LIST (towatch.html)
    if (watchList) {
        const toWatch = movies.filter(m => !m.watched);
        const categories = [...new Set(toWatch.map(m => m.category))];
        
        watchList.innerHTML = toWatch.length === 0 ? "<p style='text-align:center; color:#7f8c8d;'>Your queue is empty.</p>" : "";

        categories.forEach(cat => {
            let section = `<div class="category-group"><span class="category-header">${cat}</span>`;
            toWatch.filter(m => m.category === cat).forEach(m => {
                section += `
                <div class="movie-card">
                    <div class="movie-info">
                        <strong>${m.title}</strong>
                        <small>Length: ${m.length}</small>
                    </div>
                    <div>
                        <button class="btn-watch" onclick="markAsComplete(${m.id})">Complete</button>
                        <button class="btn-edit" onclick="openEditModal(${m.id})">Edit</button>
                        <button class="btn-delete" onclick="deleteMovie(${m.id})">Delete</button>
                    </div>
                </div>`;
            });
            watchList.innerHTML += section + `</div>`;
        });
    }

    // 2. RENDER WATCHED HISTORY (index.html)
    if (ratedList) {
        const watched = movies.filter(m => m.watched);
        
        ratedList.innerHTML = watched.length === 0 ? "<p style='text-align:center; color:#7f8c8d;'>No movies watched yet.</p>" : "";

        watched.forEach(m => {
            ratedList.innerHTML += `
                <div class="movie-card">
                    <div class="movie-info">
                        <strong>${m.title}</strong>
                        <small>Watched: ${m.dateWatched} | Cat: ${m.category}</small>
                    </div>
                    <div style="display:flex; align-items:center;">
                        <span style="color:#f39c12; font-weight:bold; margin-right:15px; font-size:1.1rem;">${m.rating}/10</span>
                        <button class="btn-delete" onclick="deleteMovie(${m.id})">Delete</button>
                    </div>
                </div>`;
        });
    }
};

// --- CLICK OUTSIDE MODAL TO CLOSE ---
window.onclick = function(event) {
    const ratingModal = document.getElementById('ratingModal');
    const editModal = document.getElementById('editModal');
    
    if (event.target == ratingModal) closeModal();
    if (event.target == editModal) closeEditModal();
};