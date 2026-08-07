import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const REQUIRED_ITEM_FIELDS = ['time', 'title'];
const VALID_STATUS = ['confirmed', 'pending'];

function validateDay(filename, data) {
  const errors = [];
  if (typeof data.day !== 'number') errors.push(`${filename}: day must be a number`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) errors.push(`${filename}: date must be YYYY-MM-DD`);
  if (typeof data.title !== 'string' || data.title.length === 0) errors.push(`${filename}: title must be non-empty string`);
  if (!Array.isArray(data.items) || data.items.length === 0) errors.push(`${filename}: items must be a non-empty array`);

  (data.items || []).forEach((item, i) => {
    for (const field of REQUIRED_ITEM_FIELDS) {
      if (!item[field]) errors.push(`${filename}: items[${i}].${field} is required`);
    }
    if (item.time && !/^\d{2}:\d{2}$/.test(item.time)) {
      errors.push(`${filename}: items[${i}].time must be HH:MM`);
    }
    if (item.endTime && !/^\d{2}:\d{2}$/.test(item.endTime)) {
      errors.push(`${filename}: items[${i}].endTime must be HH:MM or null`);
    }
    if (item.status && !VALID_STATUS.includes(item.status)) {
      errors.push(`${filename}: items[${i}].status must be one of ${VALID_STATUS.join(', ')}`);
    }
  });

  return errors;
}

function main() {
  const files = readdirSync(__dirname).filter((f) => /^d[1-9]\.json$/.test(f));
  let allErrors = [];

  if (files.length !== 9) {
    allErrors.push(`Expected 9 day files (d1.json..d9.json), found ${files.length}: [${files.join(', ')}]`);
  }

  for (const file of files) {
    const data = JSON.parse(readFileSync(join(__dirname, file), 'utf-8'));
    allErrors = allErrors.concat(validateDay(file, data));
  }

  if (allErrors.length > 0) {
    console.error('Data validation FAILED:');
    allErrors.forEach((e) => console.error(' -', e));
    process.exit(1);
  }
  console.log(`Data validation passed: ${files.length} day files OK`);
}

main();
