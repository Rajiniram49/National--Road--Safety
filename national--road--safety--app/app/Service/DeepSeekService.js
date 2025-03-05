const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const API_KEY = "sk-0a82759dcd9146bf92dc44f3c44ea4b0";

const fetchAIResponse = async (userMessage) => {
    try {
        const response = await fetch(DEEPSEEK_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "deepseek-chat", // Use the correct model name
                messages: [{ role: "user", content: userMessage }],
            }),
        });

        const data = await response.json();
        console.log("API Response:", data); // Log the full response

        if (!data.choices || !data.choices[0]) {
            throw new Error("Invalid response structure from DeepSeek API");
        }

        return data.choices[0].message.content;
    } catch (error) {
        console.error("DeepSeek API Error:", error);
        return "Sorry, an error occurred while processing your request.";
    }
};