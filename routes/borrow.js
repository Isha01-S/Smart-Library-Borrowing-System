const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/authMiddleware');

// Max days allowed for borrow
const MAX_DAYS = 14;
const DUE_PER_DAY = 10; // Overdue per day, adjust as needed

// Validate borrow
router.post('/validate', auth, async (req, res) => {
    const { book_id } = req.body;
    const user_id = req.user.id;

    if (!book_id) return res.status(400).json({ message: 'Book ID required' });

    try {
        // Check active borrow for user
        const [active] = await db.promise().query(
            "SELECT * FROM borrows WHERE user_id = ? AND status = 'Active'", [user_id]
        );
        if (active.length > 0) return res.status(400).json({ message: 'You already have an active borrow' });

        // Check if book is available
        const [book] = await db.promise().query(
            "SELECT * FROM books WHERE id = ? AND is_available = 1", [book_id]
        );
        if (book.length === 0) return res.status(400).json({ message: 'Book not available' });

        res.json({ message: 'Book can be borrowed', book: book[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Calculate cost
router.post('/calculate', auth, async (req, res) => {
    const { book_id, days } = req.body;

    if (!book_id || !days) return res.status(400).json({ message: 'Book ID and days required' });
    if (days <= 0 || days > MAX_DAYS) return res.status(400).json({ message: `Days must be 1 to ${MAX_DAYS}` });

    try {
        const [book] = await db.promise().query(
            "SELECT * FROM books WHERE id = ?", [book_id]
        );
        if (book.length === 0) return res.status(400).json({ message: 'Book not found' });

        const totalCost = book[0].price_per_day * days;
        res.json({ message: 'Cost calculated', totalCost });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Borrow book
router.post('/', auth, async (req, res) => {
    const { book_id, days } = req.body;
    const user_id = req.user.id;

    if (!book_id || !days) return res.status(400).json({ message: 'Book ID and days required' });

    try {
        // Check active borrow
        const [active] = await db.promise().query(
            "SELECT * FROM borrows WHERE user_id = ? AND status = 'Active'", [user_id]
        );
        if (active.length > 0) return res.status(400).json({ message: 'Already have active borrow' });

        // Check book availability
        const [book] = await db.promise().query(
            "SELECT * FROM books WHERE id = ? AND is_available = 1", [book_id]
        );
        if (book.length === 0) return res.status(400).json({ message: 'Book not available' });

        const borrow_date = new Date();
        const due_date = new Date();
        due_date.setDate(borrow_date.getDate() + parseInt(days));

        const totalCost = book[0].price_per_day * days;

        // Insert borrow
        const [insert] = await db.promise().query(
            "INSERT INTO borrows (user_id, book_id, borrow_date, due_date, total_cost, due_per_day, status) VALUES (?, ?, ?, ?, ?, ?, 'Active')",
            [user_id, book_id, borrow_date, due_date, totalCost, DUE_PER_DAY]
        );

        // Update book availability
        await db.promise().query("UPDATE books SET is_available = 0 WHERE id = ?", [book_id]);

        res.json({ message: 'Book borrowed successfully', totalCost, due_date, borrow_id: insert.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Submit / Return book
router.post('/:borrowId/submit', auth, async (req, res) => {
    const { borrowId } = req.params;
    const { return_date } = req.body;
    const user_id = req.user.id;

    if (!return_date) return res.status(400).json({ message: 'Return date required' });

    try {
        // Get active borrow
        const [borrows] = await db.promise().query(
            "SELECT * FROM borrows WHERE id = ? AND user_id = ? AND status = 'Active'",
            [borrowId, user_id]
        );
        if (borrows.length === 0) return res.status(400).json({ message: 'Active borrow not found' });

        const borrow = borrows[0];

        // Calculate overdue
        const dueDate = new Date(borrow.due_date);
        const actualReturn = new Date(return_date);
        let overdueDays = Math.ceil((actualReturn - dueDate) / (1000 * 60 * 60 * 24));
        if (overdueDays < 0) overdueDays = 0;

        const overdueCost = overdueDays * borrow.due_per_day;
        const totalAmount = borrow.total_cost + overdueCost;

        // Update borrow
        await db.promise().query(
            "UPDATE borrows SET status='Returned', return_date=?, total_amount=? WHERE id=?",
            [return_date, totalAmount, borrowId]
        );

        // Make book available again
        await db.promise().query("UPDATE books SET is_available=1 WHERE id=?", [borrow.book_id]);

        res.json({ message: 'Book returned successfully', totalAmount, overdueDays });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Borrow history
router.get('/history', auth, async (req, res) => {
    const user_id = req.user.id;

    try {
        const [rows] = await db.promise().query(
            `SELECT b.id as borrow_id, bk.title, b.borrow_date, b.due_date, b.return_date, 
                    b.total_cost, b.total_amount, b.status
             FROM borrows b
             JOIN books bk ON b.book_id = bk.id
             WHERE b.user_id = ?
             ORDER BY b.borrow_date DESC`,
            [user_id]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
