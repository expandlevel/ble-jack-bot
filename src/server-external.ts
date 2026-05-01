export const server = Bun.serve({
  port: 6700,
  routes: {
    "/": () => {
      return Response.json({ message: "hi" });
    },
    "/tmp_download/parts/:partName": (request) => {
      const partName = request.params.partName;

      const filePath = `./tmp_download/parts/${partName}`;

      return new Response(Bun.file(filePath));
    },
  },
});
