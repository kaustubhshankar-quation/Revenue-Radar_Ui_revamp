const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api/rss-feed",
    createProxyMiddleware({
      target: "https://news.google.com",
      changeOrigin: true,
      pathRewrite: (_path, req) => {
        const query = req.query.q || "sunfeast";
        return `/rss/search?q=${encodeURIComponent(query)}&hl=en-IN&gl=IN&ceid=IN:en`;
      },
    })
  );
};
