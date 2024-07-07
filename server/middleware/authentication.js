// Middleware to check if user is authenticated
exports.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next(); // Proceed if authenticated
    }
    res.status(401).json({ message: 'Unauthorized' }); // Unauthorized if not authenticated
};
