class WishlistApp {
    constructor() {
        this.wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        this.books = [];
        this.init();
    }

    async init() {
        if (this.wishlist.length === 0) {
            document.getElementById('wishlistBooks').innerHTML = '<p>No books in your wishlist yet.</p>';
            return;
        }

        this.toggleLoader(true);

        await this.fetchWishlistBooks();
        
        this.toggleLoader(false);
        this.displayWishlistBooks();
    }

    async fetchWishlistBooks() {
        const fetchPromises = this.wishlist.map(id => fetch(`https://gutendex.com/books/${id}`).then(res => res.json()));
        this.books = await Promise.all(fetchPromises);
    }

    displayWishlistBooks() {
        const wishlistBooks = document.getElementById('book-list');
        wishlistBooks.innerHTML = '';

        this.books.forEach(book => {
            const genres = book.subjects.length ? book.subjects.join(', ') : 'Unknown genre';
            const bookCard = document.createElement('div');
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
                <span class="remove-wishlist" onclick="wishlistApp.removeFromWishlist(${book.id})">
                        ❌ Remove from Wishlist
                    </span>
                </div>
                </div>
            `;
            wishlistBooks.appendChild(bookCard);
        });
    }

    removeFromWishlist(id) {
        this.wishlist = this.wishlist.filter(bookId => bookId !== id);
        localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
        
        this.init();
    }

    toggleLoader(show) {
        const loader = document.getElementById('loader');
        loader.style.display = show ? 'block' : 'none';
    }
}

const wishlistApp = new WishlistApp();
