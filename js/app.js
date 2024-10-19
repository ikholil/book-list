class BookApp {
    constructor() {
        this.books = [];
        this.filteredBooks = [];
        this.wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        this.nextPage = null;
        this.prevPage = null;
        this.loading = false;
        this.genres = new Set();
        this.notyf = new Notyf({
            position: {
                x: 'right',
                y: 'top',
            },
        });
        this.init();
    }
    async init() {
        this.addEventListeners();
        await this.fetchBooks();
    }
    async fetchBooks(page = 1) {
        this.toggleLoader(true);
        
        try {
            const response = await fetch(`https://gutendex.com/books/?page=${page}`);
            const data = await response.json();
            this.books = data.results;
            this.nextPage = this.getPageNumber(data.next);
            this.prevPage = this.getPageNumber(data.previous);

            console.log('fetchBooks', this.prevPage, this.nextPage);
            this.populateGenres();
            this.displayBooks(this.books);
            this.disableOrEnableButtons();

        } catch (error) {
            console.error('Error fetching books:', error);
        } finally {
            this.toggleLoader(false);
        }
    }
    displayBooks(books) {
        const bookList = document.getElementById('book-list');
        bookList.innerHTML = '';
        books.forEach(book => {
            const isWishlisted = this.wishlist.includes(book.id);
            const bookCard = document.createElement('div');
            const genres = book.subjects.length ? book.subjects.join(', ') : 'Unknown genre';
            bookCard.classList.add('book-card');
            bookCard.innerHTML = `
                <div class="book-image">
                    <img src="${book.formats['image/jpeg']}" alt="${book.title}">
                </div>
                <div class="book-info">
                <h3>${book.title}</h3>
                <p class="author">By ${book.authors[0]?.name || 'Unknown'}</p>
                <p class="genre">Genre: ${genres}</p>
                <div class="bottom-info">
                <p>Book id: ${book.id}</p>
                <button class="add-to-wishlist" onclick="bookApp.toggleWishlist(${book.id})" data-id="${book.id}"> ${isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'} ${isWishlisted ? '❤️' : '🤍'}</button>
                </div>
                <a href="book-details.html?id=${book.id}" class="view-details">View Details</a>
                </div>
            `;
            bookList.appendChild(bookCard);
        });
    }
    getPageNumber(url) {
        if (url === null) return null;
        const params = new URLSearchParams(url.split('?')[1]);
        return params.get('page') || 1;
    }
    toggleLoader(show) {
        const loader = document.getElementById('loader');
        loader.style.display = show ? 'block' : 'none';
    }
    populateGenres() {
        this.books.forEach(book => {
            book.subjects.forEach(subject => {
                this.genres.add(subject); // Add unique genres to the Set
            });
        });

        const genreFilter = document.getElementById('genreFilter');
        this.genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre;
            option.textContent = genre;
            genreFilter.appendChild(option);
        });
    }
    toggleWishlist(id) {
        if (this.wishlist.includes(id)) {
            this.wishlist = this.wishlist.filter(bookId => bookId !== id);
            this.notyf.error('Book removed from wishlist!');
        } else {
            this.wishlist.push(id);
            this.notyf.success('Book added to wishlist!');
        }
        localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
        this.displayBooks(this.books);
    }
    addEventListeners() {
        // Search bar filtering
        document.getElementById('searchBar').addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            this.filteredBooks = this.books.filter(book =>
                book.title.toLowerCase().includes(searchTerm)
            );
            this.displayBooks(this.filteredBooks);
        });

        // Genre filtering
        document.getElementById('genreFilter').addEventListener('change', (e) => {
            const selectedGenre = e.target.value;
            if (selectedGenre === "") {
                // If "All Genres" is selected, show all books
                this.displayBooks(this.books);
            } else {
                // Filter books by the selected genre
                const filteredByGenre = this.books.filter(book =>
                    book.subjects.includes(selectedGenre)
                );
                this.displayBooks(filteredByGenre);
            }
        });
        // goto previous page
        document.getElementById("prev").addEventListener('click', () => {
            if (this.prevPage) {
                this.fetchBooks(this.prevPage);
            }
        })

        // goto next page
        document.getElementById("next").addEventListener('click', () => {
            if (this.nextPage) {
                this.fetchBooks(this.nextPage);
            }
        })

    }

    disableOrEnableButtons() {
        const nextButton = document.getElementById("next");
        const prevButton = document.getElementById("prev");
    
        nextButton.disabled = true;
        prevButton.disabled = true;
    
        if (this.nextPage !== null) {
            nextButton.disabled = false;
        }
    
        if (this.prevPage !== null) {
            prevButton.disabled = false;
        }
    }
}

const bookApp = new BookApp();

