import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
    mongodb: {
        url: process.env.MONGODB_URL as string,
    },
    jwt: {
        secret: process.env.JWT_SECRET as string,
        expiresIn: '1d' as string,
    },
}));