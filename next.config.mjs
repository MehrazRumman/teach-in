// @ts-check
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
import million from 'million/compiler';
/** @type {import("next").NextConfig} */

const config = {
  reactStrictMode: true,

  swcMinify: true,

  images: {
    unoptimized: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },
  staticPageGenerationTimeout: 5 * 6 * 1000,
};
export default million.next(config);
