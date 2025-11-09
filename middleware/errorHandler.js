const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ 
      error: 'Resource already exists' 
    });
  }

  res.status(500).json({ 
    error: 'Internal server error' 
  });
};

module.exports = errorHandler;