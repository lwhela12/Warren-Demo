-- Manual migration for sentiment fields
ALTER TABLE Question ADD COLUMN sentimentScore REAL;
ALTER TABLE Question ADD COLUMN sentimentSummary TEXT;
