class BookDetails {
    constructor() {
        this.bookId = this.getBookIdFromUrl();
        this.book = null;
        this.init();
    }

    // Extract the book ID from the URL parameters
    getBookIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    }

    async init() {
        if (!this.bookId) {
            document.getElementById('bookDetails').innerHTML = '<p>Invalid Book ID.</p>';
            return;
        }

        // Show loader while fetching the book details
        this.toggleLoader(true);

        await this.fetchBookDetails();
        
        this.toggleLoader(false);
        this.displayBookDetails();
    }

    // Fetch book details from the API using the book ID
    async fetchBookDetails() {
        try {
            const response = await fetch(`https://gutendex.com/books/${this.bookId}`);
            this.book = await response.json();
        } catch (error) {
            console.error('Error fetching book details:', error);
            document.getElementById('bookDetails').innerHTML = '<p>Error fetching book details.</p>';
        }
    }

    // Display the book details on the page
    displayBookDetails() {
        if (!this.book) return;

        const genres = this.book.subjects.length ? this.book.subjects.join(', ') : 'Unknown genre';
        const bookDetails = document.getElementById('bookDetails');

        const bookHtml = `
            <div class="book-details-card">
                <img src="${this.book.formats['image/jpeg']}" alt="${this.book.title}">
                <h2>${this.book.title}</h2>
                <p><strong>Author:</strong> ${this.book.authors[0]?.name || 'Unknown'}</p>
                <p><strong>Genres:</strong> ${genres}</p>
                <p><strong>Download count:</strong> ${this.book.download_count}</p>
                <p><strong>Available formats:</strong></p>
                <ul class="book-formats">
                    <li><a href="${this.book.formats['text/html']}">Read online (HTML)</a></li>
                    <li><a href="${this.book.formats['application/epub+zip']}">Download EPUB</a></li>
                    <li><a href="${this.book.formats['application/x-mobipocket-ebook']}">Download MOBI</a></li>
                    <li><a href="${this.book.formats['text/plain; charset=us-ascii']}">Download TXT</a></li>
                </ul>
            </div>
        `;
        bookDetails.innerHTML = bookHtml;
    }

    // Toggle the loader
    toggleLoader(show) {
        const loader = document.getElementById('loader');
        loader.style.display = show ? 'block' : 'none';
    }
}

const bookDetails = new BookDetails();
