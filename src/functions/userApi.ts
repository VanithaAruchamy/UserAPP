import { app, HttpRequest, InvocationContext } from '@azure/functions';

interface User {
    id: string;
    username: string;
    password:string;
    emailId: string;
    phoneNumber:string;
    role:string;
}

let users: User[] = [];
//     {
//         "id":"1",
//         "username": "johndoe",
//         "password": "password123",
//         "emailId": "johndoe@example.com",
//         "phoneNumber": "+1234567890",
//         "role": "admin"
// }];

const handler = async (request: HttpRequest, context: InvocationContext) => {
    context.log(`HTTP function processed request for URL "${request.url}"`);

    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Allow all origins
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    const method = request.method;
    const userId = request.query.get('id');

    switch (method) {
        case 'GET':
            if (userId) {
                // Fetch specific user by ID
                const user = users.find(u => u.id === userId);
                if (user) {
                    return { body: JSON.stringify(user), headers };
                } else {
                    return { body: JSON.stringify({ error: 'User not found' }), status: 404, headers };
                }
            } else {
                // Return all users
                return { body: JSON.stringify(users), headers };
            }

        case 'POST':
            try {
                const data = await request.json() as User;
                const newUser: User = {
                    id: (users.length + 1).toString(), // Simple ID generation
                    username: data.username,
                    emailId: data.emailId,
                    password:data.password,
                    phoneNumber:data.phoneNumber,
                    role:data.role
                };
                users.push(newUser);
                return { body: JSON.stringify(newUser), status: 201, headers };
            } catch (error) {
                return { body: JSON.stringify({ error: 'Invalid request data' }), status: 400, headers };
            }

        case 'PUT':
            if (!userId) {
                return { body: JSON.stringify({ error: 'User ID is required for update' }), status: 400, headers };
            }
            try {
                const data = await request.json() as Partial<User>;
                const user = users.find(u => u.id === userId);
                if (user) {
                    
                    user.password = data.password || user.password;
                    
                    return { body: JSON.stringify(user), status: 200, headers };
                } else {
                    return { body: JSON.stringify({ error: 'User not found' }), status: 404, headers };
                }
            } catch (error) {
                return { body: JSON.stringify({ error: 'Invalid request data' }), status: 400, headers };
            }

        case 'DELETE':
            if (!userId) {
                return { body: JSON.stringify({ error: 'User ID is required for delete' }), status: 400, headers };
            }
            const initialLength = users.length;
            users = users.filter(u => u.id !== userId);
            if (users.length < initialLength) {
                return { body: JSON.stringify({ message: 'User deleted successfully' }), status: 200, headers };
            } else {
                return { body: JSON.stringify({ error: 'User not found' }), status: 404, headers };
            }

        case 'OPTIONS':
            return { status: 204, headers }; // Handle preflight CORS requests

        default:
            return { body: JSON.stringify({ error: 'Method not allowed' }), status: 405, headers };
    }
};

// Register the HTTP function
app.http('userApi', {
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: handler
});

export { app, handler };
