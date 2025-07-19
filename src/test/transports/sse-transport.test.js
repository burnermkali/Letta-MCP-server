import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';

// Create a shared mock logger instance
const mockLoggerInstance = {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
};

// Mock the logger module BEFORE importing anything else
vi.mock('../../core/logger.js', () => ({
    createLogger: vi.fn(() => mockLoggerInstance),
}));

// Now import after mocking
import { runSSE } from '../../transports/sse-transport.js';
import { createMockLettaServer } from '../utils/mock-server.js';

describe('SSE Transport - Basic Tests', () => {
    let mockServer;
    let httpServer;
    let port;

    beforeEach(async () => {
        mockServer = createMockLettaServer();

        // Mock server methods
        mockServer.server.setRequestHandler = vi.fn();
        mockServer.server.connect = vi.fn().mockResolvedValue();

        // Clear all mocks
        vi.clearAllMocks();

        // Use dynamic port
        process.env.PORT = '0';

        // Start server
        httpServer = await runSSE(mockServer);

        // Wait for server to be listening
        if (!httpServer.listening) {
            await new Promise((resolve) => {
                httpServer.once('listening', resolve);
            });
        }

        // Get the actual port
        port = httpServer.address().port;
    });

    afterEach(async () => {
        // Clean up server
        if (httpServer && httpServer.listening) {
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    resolve(); // Force resolve after timeout
                }, 2000);

                httpServer.close((err) => {
                    clearTimeout(timeout);
                    if (err) reject(err);
                    else resolve();
                });
            });
        }

        // Restore mocks
        vi.restoreAllMocks();

        // Clean up environment
        delete process.env.PORT;
    });

    it('should start SSE server and return server instance', () => {
        expect(httpServer).toBeDefined();
        expect(httpServer.listening).toBe(true);
        expect(port).toBeGreaterThan(0);
    });

    it('should log server start message', async () => {
        // Wait a bit for async logs
        await new Promise((resolve) => setTimeout(resolve, 100));

        const calls = mockLoggerInstance.info.mock.calls;

        const hasStartMessage = calls.some(
            (call) =>
                call[0] &&
                typeof call[0] === 'string' &&
                call[0].includes('Letta SSE server is running on port'),
        );
        expect(hasStartMessage).toBe(true);
    });

    it('should have health endpoint', async () => {
        const response = await request(`http://localhost:${port}`).get('/health').expect(200);

        const health = JSON.parse(response.text);
        expect(health.status).toBe('ok');
    });

    it('should have SSE endpoint that accepts connections', (done) => {
        // Just test that the endpoint exists and accepts connections
        // Don't test the actual SSE stream as it will hang
        request(`http://localhost:${port}`)
            .get('/sse')
            .set('Accept', 'text/event-stream')
            .timeout(500) // Set short timeout
            .end((err, res) => {
                // We expect this to timeout since SSE keeps connection open
                expect(err).toBeDefined();
                expect(err.timeout).toBe(500);
                done();
            });
    });

    it('should have message endpoint', async () => {
        const response = await request(`http://localhost:${port}`)
            .post('/message')
            .send({ test: 'message' })
            .expect(503);

        const body = JSON.parse(response.text);
        expect(body.error).toBe('No active SSE connection');
    });
});
