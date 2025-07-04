import '@testing-library/jest-dom';
import { Response } from 'node-fetch';

// jsdom doesn't provide TextEncoder/TextDecoder which are required by some libs
// so we polyfill them using Node's util implementation
import { TextEncoder, TextDecoder } from 'util';

// @ts-ignore
if (!global.TextEncoder) global.TextEncoder = TextEncoder;
// @ts-ignore
if (!global.TextDecoder) global.TextDecoder = TextDecoder;
// Polyfill fetch Response in jsdom environment
// @ts-ignore
if (typeof global.Response === 'undefined') {
  // @ts-ignore
  global.Response = Response;
}
