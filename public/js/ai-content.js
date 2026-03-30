const btn = document.getElementById("generate-btn");

btn.addEventListener("click", async () => {
  const title = document.querySelector("input[name='title']").value;
  const category = document.querySelector("select[name='category']").value;
  const contentField = document.querySelector("textarea[name='content']");

  if (!title) return alert("Enter a title first");
  if (!category) return alert("Please choose a category");

  btn.innerText = "Generating...";

  try {
    const res = await fetch("/api/ai/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, category }),
    });

    const data = await res.json();

    contentField.value = data.draft;
  } catch (err) {
    alert("Failed to generate content");
  }

  btn.innerText = "Generate Content";
});