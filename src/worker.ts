export default {
  async fetch(request: Request, env: { ASSETS: Fetcher; BASE_PATH?: string }) {
    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404) {
      return response;
    }

    const basePathRaw = env.BASE_PATH ?? "/";
    const basePath = basePathRaw.endsWith("/") ? basePathRaw : `${basePathRaw}/`;
    const url = new URL(request.url);

    if (!url.pathname.startsWith(basePath)) {
      return response;
    }

    const indexUrl = new URL(basePath, url);
    return env.ASSETS.fetch(new Request(indexUrl.toString(), request));
  },
};
