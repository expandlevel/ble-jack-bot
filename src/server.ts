export const server = Bun.serve({
  port: 6700,
  routes: {
    "/": (request) => {
      return Response.json({ message: "hi" });
    },
  },
});
