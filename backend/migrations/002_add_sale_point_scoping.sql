-- Migration 002: Add salePointId & area columns for row-level authorization scoping
ALTER TABLE sales ADD COLUMN salePointId TEXT DEFAULT 'Main Office';
ALTER TABLE sales ADD COLUMN area TEXT DEFAULT '';
ALTER TABLE employees ADD COLUMN salePointId TEXT DEFAULT 'Main Office';
ALTER TABLE inventory ADD COLUMN salePointId TEXT DEFAULT 'Main Office';
ALTER TABLE users ADD COLUMN salePointId TEXT DEFAULT 'Main Office';
