const request = require('supertest');
const bcrypt = require('bcryptjs');
const { query } = require('../config/database');
const app = require('../server');

// Mock database for testing
jest.mock('../config/database', () => ({
    query: jest.fn(),
    getConnection: jest.fn(),
}));

describe('Authentication API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/auth/login', () => {
        it('should login with valid credentials', async () => {
            const hashedPassword = await bcrypt.hash('password123', 10);
            const mockUser = {
                id: 1,
                uid: 'admin',
                password: hashedPassword,
                role: 'admin',
                status: 'active',
            };

            query.mockResolvedValueOnce([mockUser]);

            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    uid: 'admin',
                    password: 'password123',
                })
                .expect(200);

            expect(response.body).toHaveProperty('accessToken');
            expect(response.body).toHaveProperty('refreshToken');
            expect(response.body.user).toEqual({
                id: 1,
                uid: 'admin',
                role: 'admin',
            });
        });

        it('should reject invalid credentials', async () => {
            query.mockResolvedValueOnce([]);

            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    uid: 'invalid',
                    password: 'wrongpassword',
                })
                .expect(401);

            expect(response.body.message).toBe('Invalid credentials');
        });

        it('should reject inactive user', async () => {
            const hashedPassword = await bcrypt.hash('password123', 10);
            const mockUser = {
                id: 1,
                uid: 'inactive',
                password: hashedPassword,
                role: 'student',
                status: 'inactive',
            };

            query.mockResolvedValueOnce([mockUser]);

            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    uid: 'inactive',
                    password: 'password123',
                })
                .expect(403);

            expect(response.body.message).toBe('Account inactive');
        });

        it('should validate required fields', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({})
                .expect(400);

            expect(response.body).toHaveProperty('message');
        });
    });

    describe('POST /api/auth/change-password', () => {
        it('should change password with valid old password', async () => {
            const hashedPassword = await bcrypt.hash('oldpassword', 10);
            const mockUser = {
                id: 1,
                password: hashedPassword,
            };

            query.mockResolvedValueOnce([mockUser]);
            query.mockResolvedValueOnce({ affectedRows: 1 });

            const response = await request(app)
                .post('/api/auth/change-password')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    oldPassword: 'oldpassword',
                    newPassword: 'newpassword123',
                })
                .expect(200);

            expect(response.body.message).toBe('Password updated');
        });

        it('should reject change password with invalid old password', async () => {
            const hashedPassword = await bcrypt.hash('oldpassword', 10);
            const mockUser = {
                id: 1,
                password: hashedPassword,
            };

            query.mockResolvedValueOnce([mockUser]);

            const response = await request(app)
                .post('/api/auth/change-password')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    oldPassword: 'wrongpassword',
                    newPassword: 'newpassword123',
                })
                .expect(400);

            expect(response.body.message).toBe('Old password incorrect');
        });
    });

    describe('GET /api/auth/verify-token', () => {
        it('should verify valid token', async () => {
            const response = await request(app)
                .get('/api/auth/verify-token')
                .set('Authorization', 'Bearer valid-token')
                .expect(200);

            expect(response.body).toHaveProperty('valid');
        });

        it('should reject invalid token', async () => {
            const response = await request(app)
                .get('/api/auth/verify-token')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);

            expect(response.body.valid).toBe(false);
        });
    });
});
