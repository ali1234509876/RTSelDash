
ALTER TABLE public.transactions DROP CONSTRAINT transactions_sales_rep_id_fkey;
ALTER TABLE public.transactions ALTER COLUMN sales_rep_id DROP NOT NULL;
ALTER TABLE public.transactions
  ADD CONSTRAINT transactions_sales_rep_id_fkey
  FOREIGN KEY (sales_rep_id) REFERENCES auth.users(id) ON DELETE SET NULL;
