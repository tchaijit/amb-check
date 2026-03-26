import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getUserByEmail } from './lib/db';

// Mock users for testing (when database is not available)
// All passwords are 'password123' (pre-hashed for better performance)
const MOCK_USERS = [
  {
    id: 1,
    email: 'driver@hospital.com',
    name: 'John Driver',
    role: 'driver',
    passwordHash: '$2b$10$K3ebqTbYMLcHYLBmO4mAxemSNiIm2SsCqzaXRJDFRz4/Og.WaRSaC',
  },
  {
    id: 2,
    email: 'equipment@hospital.com',
    name: 'Jane Equipment',
    role: 'equipment_officer',
    passwordHash: '$2b$10$K3ebqTbYMLcHYLBmO4mAxemSNiIm2SsCqzaXRJDFRz4/Og.WaRSaC',
  },
  {
    id: 3,
    email: 'nurse@hospital.com',
    name: 'Mary Nurse',
    role: 'nurse',
    passwordHash: '$2b$10$K3ebqTbYMLcHYLBmO4mAxemSNiIm2SsCqzaXRJDFRz4/Og.WaRSaC',
  },
  {
    id: 4,
    email: 'hod@hospital.com',
    name: 'Dr. Smith HOD',
    role: 'hod',
    passwordHash: '$2b$10$K3ebqTbYMLcHYLBmO4mAxemSNiIm2SsCqzaXRJDFRz4/Og.WaRSaC',
  },
];

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        let user;

        // Try to get user from database
        try {
          user = await getUserByEmail(credentials.email as string);
        } catch (error) {
          // If database fails, use mock users
          console.log('Database not available, using mock users');
          user = MOCK_USERS.find(u => u.email === credentials.email);
        }

        if (!user) {
          return null;
        }

        // Verify password
        const isValid = await bcrypt.compare(
          credentials.password as string,
          (user as any).passwordHash || ''
        );

        if (!isValid) {
          return null;
        }

        // Return user object (without password)
        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
});
