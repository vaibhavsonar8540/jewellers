// Edge Function Handler

export default async function handler(req) {
  return new Response(
    JSON.stringify({ message: "Edge Function active" }),
    {
      status: 200,
      headers: { "content-type": "application/json" },
    }
  );
}
