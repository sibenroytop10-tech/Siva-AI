export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const message = body.message;

    if (!message || !message.trim()) {
      return new Response(
        JSON.stringify({
          error: "Message nahi mila."
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    const apiKey = context.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "GEMINI_API_KEY configured nahi hai."
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    const prompt = `
You are Siva AI, a helpful personal AI assistant.

Rules:
- Answer naturally and clearly.
- Support Hindi, English and Assamese.
- If the user writes Hindi/Hinglish, reply in Hindi/Hinglish.
- If the user writes Assamese, reply in Assamese.
- Be friendly, helpful and concise.
- Do not say that you are a demo.
- Do not mention API keys or backend.

User message:
${message}
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=" +
        encodeURIComponent(apiKey),
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error:", data);

      return new Response(
        JSON.stringify({
          error:
            data?.error?.message ||
            "Gemini API se response nahi mila."
        }),
        {
          status: response.status,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    const reply =
      data?.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("") ||
      "Sorry, mujhe response nahi mila.";

    return new Response(
      JSON.stringify({
        reply: reply
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

  } catch (error) {
    console.error("Server Error:", error);

    return new Response(
      JSON.stringify({
        error: "Server mein problem ho gayi. Please try again."
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
}
