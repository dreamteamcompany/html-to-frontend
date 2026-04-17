CREATE TABLE IF NOT EXISTS t_p61788166_html_to_frontend.payment_cash_receipts (
    id SERIAL PRIMARY KEY,
    payment_id INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    file_name VARCHAR(512),
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    uploaded_by INTEGER
);

CREATE INDEX IF NOT EXISTS idx_payment_cash_receipts_payment_id
    ON t_p61788166_html_to_frontend.payment_cash_receipts(payment_id);

INSERT INTO t_p61788166_html_to_frontend.payment_cash_receipts (payment_id, file_url, uploaded_at, uploaded_by)
SELECT p.id, p.cash_receipt_url, COALESCE(p.cash_receipt_uploaded_at, p.created_at, CURRENT_TIMESTAMP), p.created_by
FROM t_p61788166_html_to_frontend.payments p
WHERE p.cash_receipt_url IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM t_p61788166_html_to_frontend.payment_cash_receipts r
    WHERE r.payment_id = p.id AND r.file_url = p.cash_receipt_url
  );
