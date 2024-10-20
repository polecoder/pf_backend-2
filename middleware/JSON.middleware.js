/**
 * Middleware to validate JSON in request body
 *
 * @param {Error} err - The error object
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @param {Function} next - The next middleware
 * @returns {Response} - Sends a 400 status code with an error message if the JSON is invalid
 */
function validateJSON(err, req, res, next) {
  if (err instanceof SyntaxError) {
    return res.status(400).send({ error: "Invalid JSON in request body" });
  }
  next();
}

export default validateJSON;
