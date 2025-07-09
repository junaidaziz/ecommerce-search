const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../docs/json-schema/json-schema.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

// 1. Add shared Timestamp definition
schema.definitions = schema.definitions || {};
schema.definitions.Timestamp = {
  type: 'string',
  format: 'date-time',
};

// Helper: Recursively process all object definitions
function processObject(obj) {
  if (obj && typeof obj === 'object') {
    // 2. Add additionalProperties: false to all objects with properties
    if (obj.type === 'object' && obj.properties) {
      obj.additionalProperties = false;
      // 5. Add required array if missing
      if (!obj.required) {
        obj.required = Object.keys(obj.properties).filter(
          (key) => !obj.properties[key].optional
        );
      }
    }
    // 3. Replace {type: 'string', format: 'date-time'} with $ref to Timestamp
    if (obj.type === 'string' && obj.format === 'date-time') {
      delete obj.type;
      delete obj.format;
      obj['$ref'] = '#/definitions/Timestamp';
    }
    // 4. Add format/pattern constraints
    if (obj.type === 'string') {
      if (obj.title && obj.title.toLowerCase().includes('email')) {
        obj.format = 'email';
      }
      if (obj.title && obj.title.toLowerCase().includes('uuid')) {
        obj.pattern = '^[\\w-]{36}$';
      }
      if (obj.title && obj.title.toLowerCase().includes('password')) {
        obj.minLength = 8;
      }
    }
    for (const key in obj) {
      processObject(obj[key]);
    }
  }
}

processObject(schema);

fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2));
console.log('Post-processed JSON Schema written to', schemaPath); 