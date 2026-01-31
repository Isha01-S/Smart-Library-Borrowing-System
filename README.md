# Smart-Library-Borrowing-System

# Smart Library

A simple library management system built with **Node.js**, **Express**, and **MySQL**.  
It allows users to **signup/login**, **view available books**, **borrow books**, and **return books**.  

---

## Features

- User signup and login with JWT authentication  
- View all available books  
- Borrow books (with due dates and cost calculation)  
- Return books (calculates overdue fees if any)  
- View borrow history  

---

## Tech Stack

- Backend: Node.js, Express  
- Database: MySQL  
- Authentication: JWT  
- Password Hashing: bcrypt  

---

## Books Available

1. The Alchemist – Paulo Coelho  
2. Atomic Habits – James Clear  
3. Rich Dad Poor Dad – Robert Kiyosaki  
4. Wings of Fire – A.P.J Abdul Kalam  
5. Think and Grow Rich – Napoleon Hill  
6. Ikigai – Hector Garcia  
7. The Power of Habit – Charles Duhigg  
8. Deep Work – Cal Newport  
9. The Psychology of Money – Morgan Housel  
10. Zero to One – Peter Thiel  
11. Sapiens – Yuval Noah Harari  
12. Harry Potter – J.K Rowling  
13. The Hobbit – J.R.R Tolkien  
14. The Monk Who Sold His Ferrari – Robin Sharma  
15. Do Epic Shit – Ankur Warikoo  
16. The Subtle Art of Not Giving a F*ck – Mark Manson  
17. Can’t Hurt Me – David Goggins  
18. The 5 AM Club – Robin Sharma  
19. Start With Why – Simon Sinek  
20. Grit – Angela Duckworth  


---

## Installation & Running

1. **Clone the repository**

```bash
git clone <your-repo-link>
cd Smart-Library
Install dependencies

npm install
Set up database

Create a MySQL database (e.g., smart_library)

Create tables users, books, borrows

Insert the 20 books listed above

Create a .env file in project root
Start the Node.js server

node server.js
Server will run on: http://localhost:5000

Open frontend

Open index.html directly in your browser or

Serve via Apache / XAMPP to access it through http://localhost/your-folder

Usage
Signup: POST /auth/signup

Login: POST /auth/login

View books: GET /books (create route if needed for frontend)

Borrow book: POST /borrow

Return book: POST /borrow/:borrowId/submit

View borrow history: GET /borrow/history

Frontend Actions (Quick Guide)

Borrow a book: Click the borrow button next to available books.

Return a book: Click the return button for the active borrowed book.

Check borrow history: Borrowed books will show in the history section.

