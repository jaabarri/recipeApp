require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { HfInference } = require("@huggingface/inference"); // Import HfInference

const app = express();
app.use(express.json());
const corsOptions = {
  origin: ["http://localhost:5173"],
};
app.use(cors(corsOptions));

const SYSTEM_PROMPT = `
You are an assistant that receives a list of ingredients that a user has and suggests a recipe they could make with some or all of those ingredients. You don't need to use every ingredient they mention in your recipe. The recipe can include additional ingredients they didn't mention, but try not to include too many extra ingredients. Format your response in markdown to make it easier to render to a web page.
`;

// Initialize Hugging Face Inference
const hf = new HfInference(process.env.HF_ACCESS_TOKEN);

// Define the route for fetching recipe suggestions
app.post("/api", async (req, res) => {
  try {
    const { ingredients } = req.body; // Get the ingredients from the frontend

    // Call the function to get the recipe from Mistral
    const recipe = await getRecipeFromMistral(ingredients);

    // Send the recipe back to the frontend
    res.json({ generated_text: recipe });
  } catch (error) {
    console.error("Error fetching recipe:", error);
    res.status(500).json({ message: "Error fetching recipe" });
  }
});

// Function to get recipe from Mistral
async function getRecipeFromMistral(ingredientsArr) {
  const ingredientsString = ingredientsArr.join(", ");
  try {
    const response = await hf.chatCompletion({
      model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `I have ${ingredientsString}. Please give me a recipe you'd recommend I make!` },
      ],
      max_tokens: 1024,
    });
    return response.choices[0].message.content;
  } catch (err) {
    console.error(err.message);
    throw err; // Re-throw the error to handle it in the route
  }
}

app.listen(8080, () => {
  console.log("Server started on port 8080");
});