const form = document.getElementById("contact-form");
const nameInput = document.getElementById("Name");
const phoneInput = document.getElementById("Phone");
const emailInput = document.getElementById("Email");
const subjectInput = document.getElementById("Subject");
const messageInput = document.getElementById("Message");
const contactSubmit = document.getElementById("contactSubmit");
const contactSpinner = document.getElementById("contactSpinner");
const contactButtonText = document.getElementById("contactButtonText");
const successMessage = document.getElementById("message");
const successMessageText = document.getElementById("message-text");
const errorMessage = document.getElementById("error-message");
const errorMessageText = document.getElementById("error-message-text");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const showBanner = (element, textNode, text) => {
  if (textNode && text) textNode.textContent = text;
  element.classList.remove("hidden");
  clearTimeout(element.dismissTimer);
  element.dismissTimer = setTimeout(() => {
    element.classList.add("hidden");
  }, 4000);
};

const hideBanners = () => {
  successMessage.classList.add("hidden");
  errorMessage.classList.add("hidden");
};

const setLoadingState = (isLoading) => {
  contactSubmit.disabled = isLoading;
  contactSubmit.classList.toggle("opacity-70", isLoading);
  contactSubmit.classList.toggle("cursor-not-allowed", isLoading);
  contactSpinner.classList.toggle("hidden", !isLoading);
  contactButtonText.textContent = isLoading ? "SENDING..." : "SEND MESSAGE";
};

const clearForm = () => {
  form.reset();
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideBanners();

  const formData = {
    name: nameInput.value.trim(),
    number: phoneInput.value.trim(),
    email: emailInput.value.trim(),
    subject: subjectInput.value.trim(),
    message: messageInput.value.trim(),
  };

  if (!formData.name || !formData.number || !formData.email || !formData.subject || !formData.message) {
    showBanner(errorMessage, errorMessageText, "Please fill in all fields before sending.");
    return;
  }

  if (!emailPattern.test(formData.email)) {
    showBanner(errorMessage, errorMessageText, "Please enter a valid email address.");
    return;
  }

  setLoadingState(true);

  try {
    const response = await axios.post("/contactSubmit", formData);

    if (response?.data?.success) {
      clearForm();
      showBanner(successMessage, successMessageText, response.data.message || "Message sent successfully.");
      return;
    }

    showBanner(errorMessage, errorMessageText, response?.data?.message || "We could not send your message right now.");
  } catch (err) {
    console.error("❌ Error submitting contact form:", err);
    const serverMessage =
      err?.response?.data?.message ||
      err?.response?.data?.errors?.[0] ||
      "Something went wrong. Please verify your details and try again.";

    showBanner(errorMessage, errorMessageText, serverMessage);
  } finally {
    setLoadingState(false);
  }
});