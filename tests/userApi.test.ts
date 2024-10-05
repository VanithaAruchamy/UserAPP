import { handler } from '../src/functions/userApi'; // Adjust the path accordingly
import { HttpRequest, InvocationContext } from '@azure/functions';

// Mock data
const mockUsers = [
    { id: '1', username: 'testuser1', password: 'pass1', emailId: 'user1@example.com', phoneNumber: '1234567890', role: 'admin' },
    { id: '2', username: 'testuser2', password: 'pass2', emailId: 'user2@example.com', phoneNumber: '0987654321', role: 'user' }
];

// Create a mock context
const mockContext: Partial<InvocationContext> = {
    log: jest.fn()
};

// Helper to create a mock request
const createMockRequest = (method: string, query: URLSearchParams, body?: object): Partial<HttpRequest> => ({
    method,
    query,
    json: jest.fn().mockResolvedValue(body),
});

// Unit tests
describe('User API Handler', () => {

    beforeEach(() => {
        // Reset the mock users array before each test
        (global as any).users = [...mockUsers]; // Mimicking your global `users` array
    });

    // test('GET all users', async () => {
    //     const request = createMockRequest('GET', new URLSearchParams());

    //     const result = await handler(request as HttpRequest, mockContext as InvocationContext);

    //     expect(result.body).toEqual(JSON.stringify(mockUsers));
    //     expect(result.headers['Content-Type']).toBe('application/json');
    //     expect(mockContext.log).toHaveBeenCalled();
    // });

    // test('GET user by ID', async () => {
    //     const request = createMockRequest('GET', new URLSearchParams({ id: '1' }));

    //     const result = await handler(request as HttpRequest, mockContext as InvocationContext);

    //     expect(result.body).toEqual(JSON.stringify(mockUsers[0]));
    //     expect(result.headers['Content-Type']).toBe('application/json');
    //     expect(mockContext.log).toHaveBeenCalled();
    // });

    // test('GET user by ID - not found', async () => {
    //     const request = createMockRequest('GET', new URLSearchParams({ id: '99' }));

    //     const result = await handler(request as HttpRequest, mockContext as InvocationContext);

    //     expect(result.body).toEqual(JSON.stringify({ error: 'User not found' }));
    //     expect(result.status).toBe(404);
    //     expect(mockContext.log).toHaveBeenCalled();
    // });

    test('POST a new user', async () => {
        const newUser = { username: 'newuser', password: 'newpass', emailId: 'newuser@example.com', phoneNumber: '5555555555', role: 'admin' };
        const request = createMockRequest('POST', new URLSearchParams(), newUser);

        const result = await handler(request as HttpRequest, mockContext as InvocationContext);

        expect(result.status).toBe(201);
        const createdUser = JSON.parse(result.body);
        expect(createdUser.username).toBe(newUser.username);
        expect(createdUser.emailId).toBe(newUser.emailId);
        expect(mockContext.log).toHaveBeenCalled();
    });

    // test('POST - invalid data', async () => {
    //     const invalidUser = { username: 'newuser' }; // Missing required fields
    //     const request = createMockRequest('POST', new URLSearchParams(), invalidUser);

    //     const result = await handler(request as HttpRequest, mockContext as InvocationContext);

    //     expect(result.status).toBe(400);
    //     expect(result.body).toEqual(JSON.stringify({ error: 'Invalid request data' }));
    //     expect(mockContext.log).toHaveBeenCalled();
    // });

    test('PUT - update a user password', async () => {
        const updatedData = { password: 'newpassword' };
        const request = createMockRequest('PUT', new URLSearchParams({ id: '1' }), updatedData);

        const result = await handler(request as HttpRequest, mockContext as InvocationContext);

        expect(result.status).toBe(200);
        const updatedUser = JSON.parse(result.body);
        expect(updatedUser.password).toBe(updatedData.password);
        expect(mockContext.log).toHaveBeenCalled();
    });

    test('DELETE a user', async () => {
        const request = createMockRequest('DELETE', new URLSearchParams({ id: '1' }));

        const result = await handler(request as HttpRequest, mockContext as InvocationContext);

        expect(result.status).toBe(200);
        expect(result.body).toEqual(JSON.stringify({ message: 'User deleted successfully' }));
        expect(mockContext.log).toHaveBeenCalled();
    });

    test('DELETE - user not found', async () => {
        const request = createMockRequest('DELETE', new URLSearchParams({ id: '99' }));

        const result = await handler(request as HttpRequest, mockContext as InvocationContext);

        expect(result.status).toBe(404);
        expect(result.body).toEqual(JSON.stringify({ error: 'User not found' }));
        expect(mockContext.log).toHaveBeenCalled();
    });
});
