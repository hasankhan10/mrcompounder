-- Ensure unique token numbers within a queue
CREATE UNIQUE INDEX IF NOT EXISTS idx_tokens_queue_token_number 
ON public.tokens (queue_id, token_number);
