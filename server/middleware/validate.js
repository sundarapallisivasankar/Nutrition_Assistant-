export const validate = (schema) => (req, res, next) => {
  try {
    // Validate request body
    const validated = schema.safeParse(req.body);
    
    if (!validated.success) {
      const errors = validated.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    // Assign validated data back to body
    req.body = validated.data;
    next();
  } catch (error) {
    next(error);
  }
};
