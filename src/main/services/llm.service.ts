import axios from "axios";

export const generateLlmResponse = async (
  prompt: string,
  model = "llama3.1:latest",
): Promise<string> => {
  try {
    const response = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model,
        prompt,
      },
      {
        responseType: "stream",
      },
    );

    return new Promise((resolve, reject) => {
      let fullResponse = "";

      response.data.on("data", (chunk: Buffer) => {
        const chunkStr = chunk.toString();
        const lines = chunkStr.split("\n").filter((line) => line.trim());

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.response) {
              fullResponse += parsed.response;
            }
            if (parsed.done) {
              resolve(fullResponse);
              return;
            }
          } catch (e) {
            console.error("Error parsing chunk:", line);
          }
        }
      });

      response.data.on("error", (error: Error) => {
        reject(error);
      });

      response.data.on("end", () => {
        resolve(fullResponse);
      });
    });
  } catch (error) {
    console.error("Error generating LLM response:", error);
    throw error;
  }
};

// Usage example:
// const result = await generateLlamaResponse('llama3.1:latest', 'Why is the sky blue?');
// console.log(result);
