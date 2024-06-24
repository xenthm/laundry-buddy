const app = require('./app');

const PORT = process.env.PORT || 5000;

exports.server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});