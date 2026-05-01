export const server = Bun.serve({
  port: 6701,
  routes: {
    "/": () => {
      return Response.json({ message: "hi" });
    },
  },
});
