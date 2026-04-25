import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), 'artifacts/api-server/.env') });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
  try {
    const models = await openai.models.list();
    console.log('Successfully connected to OpenAI!');
    console.log('Available models:', models.data.slice(0, 5).map(m => m.id).join(', '));
  } catch (error) {
    console.error('Error connecting to OpenAI:', error.message);
    process.exit(1);
  }
}

main();
