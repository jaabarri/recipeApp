import React, { useState, useEffect } from "react";
import IngredientsList from "./components/IngredientsList";
import ClaudeRecipe from "./components/ClaudeRecipe"

export default function Main() {
  const [ingredients, setIngredients] = useState([]);
  const [recipeShown, setRecipeShown] = useState(false);
  const [recipe, setRecipe] = useState(""); // Store the recipe here
  

  // Toggle to show the recipe
  function toggleRecipeShown() {
    setRecipeShown((prevShown) => !prevShown);
  }

  // Add ingredient to the list
  function addIngredient(formData) {
    const newIngredient = formData.get("ingredient").trim();
    if (newIngredient && !ingredients.includes(newIngredient)) {
      setIngredients((prevIngredients) => [...prevIngredients, newIngredient]);
    }
  }

  // Fetch recipe suggestion from the backend
  useEffect(() => {
    if (recipeShown) {
      fetchRecipe();
    }
  }, [recipeShown]);

  async function fetchRecipe() {
    try {
      const response = await fetch("http://localhost:8080/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ingredients }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Recipe Response:", data); // Log full response

        // Extract the recipe text from the response
        const recipeText = data.generated_text || "Sorry, no recipe found.";
        setRecipe(recipeText); // Update the recipe state
      } else {
        console.error("Error fetching recipe:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  return (
    <main>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          addIngredient(new FormData(e.target));
          e.target.reset(); // Clear input field after submission
        }}
        className="add-ingredient-form"
      >
        <input
          type="text"
          placeholder="e.g. oregano"
          aria-label="Add ingredient"
          name="ingredient"
        />
        <button type="submit">Add ingredient</button>
      </form>

      {ingredients.length > 0 && (
        <IngredientsList
          ingredients={ingredients}
          toggleRecipeShown={toggleRecipeShown}
        />
      )}

      {recipeShown && recipe && <ClaudeRecipe recipe={recipe} />}
        {/* <div className="recipe-output">
          <h2>Recipe Suggestion:</h2>
          <div dangerouslySetInnerHTML={{ __html: recipe }} />
        </div> */}
      
    </main>
  );
}
