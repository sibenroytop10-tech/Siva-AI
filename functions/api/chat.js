export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const message = body.message;

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const apiKey = context.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Gemini API key is not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
        encodeURIComponent(apiKey),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text:
                    "You are Siva AI, a helpful personal AI assistant. " +
                    "Answer naturally and clearly. Support Hindi, English and Assamese. " +
                    "User message: " +
                    message
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: data.error?.message || "Gemini API request failed"
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, mujhe response nahi mila.";

    return new Response(
      JSON.stringify({ reply }),
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Server error: " + error.message
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
