import { rateLimit } from 'express-rate-limit'

export const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, 
	limit: 10, 
	standardHeaders: 'draft-8', 
	message : "you have reached maximum api hit"
})