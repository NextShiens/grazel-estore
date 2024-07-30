const multer = require("multer");

// Multer configuration for parsing form data
const formDataMulter = multer();

// Middleware for parsing form data without handling files
const parsing = formDataMulter.none();

export { parsing };
