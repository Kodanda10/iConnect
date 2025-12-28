import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Mock TextEncoder/TextDecoder for Firebase/Node environment compatibility
Object.assign(global, { TextEncoder, TextDecoder });

// Mock global Response if not available
if (typeof global.Response === 'undefined') {
    // @ts-expect-error Mocking global Response for testing environment
    global.Response = class Response {
        json() { return Promise.resolve({}); }
        text() { return Promise.resolve(""); }
        ok = true;
        status = 200;
    };
}

// Mock global fetch if not available
if (typeof global.fetch === 'undefined') {
    global.fetch = jest.fn(() => Promise.resolve(new Response()));
}
