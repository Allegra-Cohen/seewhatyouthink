import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const withMDX = createMDX({
	options: {
		remarkPlugins: [["remark-gfm"], ["remark-frontmatter"]],
	},
});

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/seewhatyouthink",
  assetPrefix: "/seewhatyouthink",
  images: { unoptimized: true },
  pageExtensions: ["ts","tsx","md","mdx"],
};

export default withMDX(nextConfig);
