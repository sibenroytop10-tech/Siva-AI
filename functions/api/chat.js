export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const message = body?.message?.trim();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const apiKey = context.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "GEMINI_API_KEY Cloudflare mein configured nahi hai."
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    /*
      IMAGE REQUEST CHECK
      Examples:
      "image banao..."
      "photo generate karo..."
      "picture create karo..."
      "ek image bana do..."
    */

    const q = message.toLowerCase();

    const isImageRequest =
      q.includes("image banao") ||
      q.includes("image bana") ||
      q.includes("image generate") ||
      q.includes("generate image") ||
      q.includes("photo banao") ||
      q.includes("photo bana") ||
      q.includes("photo generate") ||
      q.includes("picture banao") ||
      q.includes("picture bana") ||
      q.includes("picture generate") ||
      q.includes("tasveer banao") ||
      q.includes("tasvir banao") ||
      q.includes("chitra banao") ||
      q.includes("draw an image") ||
      q.includes("create an image");

    /*
      ==========================================================
      IMAGE GENERATION
      ==========================================================
    */

    if (isImageRequest) {
      const imageResponse = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/interactions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey
          },
          body: JSON.stringify({
            model: "gemini-3.1-flash-image",

            input: message,

            response_format: {
              type: "image",
              mime_type: "image/png",
              aspect_ratio: "1:1",
              image_size: "1K"
            }
          })
        }
      );

      const imageData = await imageResponse.json();

      if (!imageResponse.ok) {
        console.error("Gemini Image Error:", imageData);

        return new Response(
          JSON.stringify({
            error:
              imageData?.error?.message ||
              "Image generate nahi ho payi."
          }),
          {
            status: imageResponse.status,
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
      }

      /*
        Find generated image inside steps
      */

      let imageBase64 = null;
      let mimeType = "image/png";

      if (Array.isArray(imageData.steps)) {
        for (const step of imageData.steps) {
          if (step.type === "model_output" && Array.isArray(step.content)) {
            for (const content of step.content) {
              if (content.type === "image" && content.data) {
                imageBase64 = content.data;
                mimeType = content.mime_type || "image/png";
                break;
              }
            }
          }

          if (imageBase64) break;
        }
      }

      /*
        Some responses may expose output_image directly
      */

      if (!imageBase64 && imageData.output_image?.data) {
        imageBase64 = imageData.output_image.data;
        mimeType =
          imageData.output_image.mime_type || "image/png";
      }

      if (!imageBase64) {
        console.error("No image found:", imageData);

        return new Response(
          JSON.stringify({
            error: "Gemini ne image data return nahi kiya."
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
      }

      return new Response(
        JSON.stringify({
          type: "image",
          reply: "Image ready hai! 🖼️",
          image: `data:${mimeType};base64,${imageBase64}`
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    /*
      ==========================================================
      NORMAL TEXT CHAT
      ==========================================================
    */

    const chatResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/interactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          model: "gemini-3.6-flash",

          input:
            "You are Siva AI, a helpful personal AI assistant. " +
            "Answer naturally and clearly. " +
            "Support Hindi, English and Assamese. " +
            "Be friendly, respectful and useful.\n\n" +
            "User message: " +
            message
        })
      }
    );

    const chatData = await chatResponse.json();

    if (!chatResponse.ok) {
      console.error("Gemini Chat Error:", chatData);

      return new Response(
        JSON.stringify({
          error:
            chatData?.error?.message ||
            "AI se response nahi mila."
        }),
        {
          status: chatResponse.status,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    /*
      Get text from interaction steps
    */

    let reply = "";

    if (Array.isArray(chatData.steps)) {
      for (const step of chatData.steps) {
        if (step.type === "model_output" && Array.isArray(step.content)) {
          for (const content of step.content) {
            if (content.type === "text" && content.text) {
              reply += content.text;
            }
          }
        }
      }
    }

    /*
      Fallback
    */

    if (!reply && chatData.output_text) {
      reply = chatData.output_text;
    }

    if (!reply) {
      reply = "Sorry, mujhe response nahi mila.";
    }

    return new Response(
      JSON.stringify({
        type: "text",
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
    console.error("Siva AI Error:", error);

    return new Response(
      JSON.stringify({
        error: "AI server se connection mein problem hai."
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
