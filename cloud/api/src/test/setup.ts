// api/test/setup.ts
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables for testing
config({ path: resolve(__dirname, '../.env') });
