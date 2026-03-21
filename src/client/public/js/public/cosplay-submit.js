document.addEventListener("DOMContentLoaded", () => {
  const cosplayForm = document.getElementById("cosplay-form");
  const cosplaySubmit = document.getElementById("cosplay-submit");
  const cosplaySubmitText = document.getElementById("cosplay-submit-text");
  const cosplaySubmitSpinner = document.getElementById("cosplay-submit-spinner");

  const cosplayName = document.getElementById("cosplay-name");
  const cosplayEmail = document.getElementById("cosplay-email");
  const cosplayNumber = document.getElementById("cosplay-phone");
  const cosplayCharacter = document.getElementById("cosplay-inspiration");
  const cosplayReference = document.getElementById("cosplay-reference");

  const successMessage = document.getElementById("message");
  const failMessage = document.getElementById("error-message");

  const toggleLoadingState = (isLoading) => {
    cosplaySubmit.disabled = isLoading;
    cosplaySubmit.classList.toggle("opacity-70", isLoading);
    cosplaySubmit.classList.toggle("cursor-not-allowed", isLoading);
    cosplaySubmit.classList.toggle("pointer-events-none", isLoading);

    if (cosplaySubmitText) {
      cosplaySubmitText.textContent = isLoading ? "SENDING..." : "SIGN UP NOW";
    }

    if (cosplaySubmitSpinner) {
      cosplaySubmitSpinner.classList.toggle("hidden", !isLoading);
    }
  };

  const showMessage = (elementToShow) => {
    successMessage.classList.add("hidden");
    failMessage.classList.add("hidden");

    elementToShow.classList.remove("hidden");

    setTimeout(() => {
      elementToShow.classList.add("hidden");
    }, 1500);
  };

  cosplayForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const cosplayData = {
      Name: cosplayName.value.trim(),
      Email: cosplayEmail.value.trim(),
      Number: cosplayNumber.value.trim(),
      Character: cosplayCharacter.value.trim(),
      Reference: cosplayReference.value.trim(),
    };

    toggleLoadingState(true);

    try {
      const res = await axios.post("/api/cosplayData", cosplayData);

      if (res.status < 200 || res.status >= 300) {
        throw new Error("Failed to send email");
      }

      showMessage(successMessage);
      cosplayForm.reset();
    } catch (error) {
      console.error(error);
      showMessage(failMessage);
    } finally {
      toggleLoadingState(false);
    }
  });
});
