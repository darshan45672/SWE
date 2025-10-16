import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export function handleValidationErrors(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.type === 'field' ? error.path : 'general',
      message: error.msg
    }));
    
    res.status(400).json({
      error: 'Validation failed',
      message: 'Please check your input and try again',
      details: errorMessages
    });
    return;
  }
  
  next();
}
