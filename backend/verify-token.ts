import * as jwt from 'jsonwebtoken';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjUsImlhdCI6MTc3MjI3ODU4MiwiZXhwIjoxNzcyMjc5NDgyfQ.j7iQcfxjsVpaIm5-OZBbPNiWGffAoxW3IH6y53qLiAg';

console.log('Testing with "your_jwt_secret_key":');
try {
    jwt.verify(token, 'your_jwt_secret_key');
    console.log('SUCCESS');
} catch (e) {
    console.log('FAILED:', e.message);
}

console.log('\nTesting with "SECRET_KEY":');
try {
    jwt.verify(token, 'SECRET_KEY');
    console.log('SUCCESS');
} catch (e) {
    console.log('FAILED:', e.message);
}
