const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function img(src: string) {
  return `${basePath}${src}`;
}
