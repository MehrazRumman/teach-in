import type { User } from 'next-auth';
import NextAuth, { type NextAuthOptions } from 'next-auth';
// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import FacebookProvider from 'next-auth/providers/facebook';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { env } from '../../../env/server.mjs';
import { prisma } from '../../../server/db/client';

const credentialsProvider = CredentialsProvider({
  async authorize(credentials: {
    name: string;
    number: string;
    address?: string;
    district?: string;
    division?: string;
    upazila?: string;
  }): Promise<User | null> {
    const { name, number, address, district, division, upazila } = credentials;

    // Check if the user exists in the database
    let user = await prisma.user.findUnique({ where: { number } });

    if (user && address && district && division && upazila) {
      await prisma.user.update({
        where: {
          number,
        },
        data: {
          address,
          district,
          division,
          upazila,
        },
      });
    }

    if (!user) {
      // User does not exist, create a new user
      user = await prisma.user.create({
        data: {
          name,
          number,
          address,
          district,
          division,
          upazila,
        },
      });
    }
    user = { ...user, number };
    return user;
  },
});

export const authOptions: NextAuthOptions = {
  // Include user.id on session
  callbacks: {
    async session({ session, token }) {
      session = {
        ...session,
        user: {
          ...session.user,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          id: token?.sub,
        },
      };
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: env.JWT_SECRET,
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_ID,
      clientSecret: env.GOOGLE_SECRET,
    }),
    FacebookProvider({
      clientId: env.FACEBOOK_CLIENT_ID,
      clientSecret: env.FACEBOOK_CLIENT_SECRET,
    }),
    credentialsProvider,
  ],
};

export default NextAuth(authOptions);
