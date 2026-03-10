CREATE TABLE IF NOT EXISTS t_p61788166_html_to_frontend.payment_documents (
    id SERIAL PRIMARY KEY,
    payment_id INTEGER NOT NULL REFERENCES t_p61788166_html_to_frontend.payments(id),
    file_name VARCHAR(500) NOT NULL,
    file_url TEXT NOT NULL,
    document_type VARCHAR(100) NOT NULL DEFAULT 'invoice',
    uploaded_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    uploaded_by INTEGER REFERENCES t_p61788166_html_to_frontend.users(id)
);

CREATE INDEX IF NOT EXISTS idx_payment_documents_payment_id ON t_p61788166_html_to_frontend.payment_documents(payment_id);

INSERT INTO t_p61788166_html_to_frontend.payment_documents (payment_id, file_name, file_url, document_type, uploaded_at)
SELECT 
    id,
    COALESCE(NULLIF(split_part(invoice_file_url, '/', -1), ''), 'invoice'),
    invoice_file_url,
    'invoice',
    COALESCE(invoice_file_uploaded_at, created_at)
FROM t_p61788166_html_to_frontend.payments
WHERE invoice_file_url IS NOT NULL AND invoice_file_url != '';