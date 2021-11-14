let taskTemplate = (task) => {
  return `<li class="box is-flex is-justify-content-space-between is-align-items-center mb-3">
              <span class="is-family-primary has-text-weight-semibold is-capitalized task-text">${task.text}</span>
              <div>
                <button data-id="${task._id}" class="button is-warning edit-btn">Edit</button>
                <button data-id="${task._id}" class="button is-danger delete-btn">Delete</button>
              </div>
          </li>`;
};

// Page load render
let ourHTML = tasks
  .map((task) => {
    return taskTemplate(task);
  })
  .join("");
document.getElementById("task-list").insertAdjacentHTML("beforeend", ourHTML);

// Create Feature
let taskField = document.getElementById("task-field");

document.getElementById("task-form").addEventListener("submit", (e) => {
  e.preventDefault();
  axios
    .post("/add-task", {
      text: taskField.value,
    })
    .then((response) => {
      // Create the HTML for new item
      document
        .getElementById("task-list")
        .insertAdjacentHTML("beforeend", taskTemplate(response.data));
      taskField.value = "";
      taskField.focus();
    })
    .catch(() => {
      console.log("Please try again later");
    });
});

document.addEventListener("click", (e) => {
  // Deleting Tasks
  if (e.target.classList.contains("delete-btn")) {
    if (confirm("Do you really want to delete this task permanently?")) {
      axios
        .post("/delete-task", {
          id: e.target.getAttribute("data-id"),
        })
        .then(() => {
          e.target.parentElement.parentElement.remove();
        })
        .catch(() => {
          console.log("Please try again later");
        });
    }
  }

  // Updating Tasks
  if (e.target.classList.contains("edit-btn")) {
    let userInput = prompt(
      "Enter your desired new text",
      e.target.parentElement.parentElement.querySelector(".task-text").innerHTML
    );
    if (userInput) {
      axios
        .post("/update-task", {
          text: userInput,
          id: e.target.getAttribute("data-id"),
        })
        .then(() => {
          e.target.parentElement.parentElement.querySelector(
            ".task-text"
          ).innerHTML = userInput;
        })
        .catch(() => {
          console.log("Please try again later");
        });
    }
  }
});
