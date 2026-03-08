const Name = document.getElementById("Name");
const email = document.getElementById("Email");
const subject = document.getElementById("Subject");
const message = document.getElementById("Message");
const contactSubmit = document.getElementById("contactSubmit");
const Successmessage = document.getElementById("message")
const error = document.getElementById("error-message")


contactSubmit.addEventListener("click", (e) => {
    e.preventDefault();

    const formData = {
        name: Name.value,
        email: email.value,
        subject: subject.value,
        message: message.value
    };
    
    console.log(formData)

    const sendContact = async () => {
        try {
            const response = await axios.post("/contactSubmit", formData);
            console.log("✅ Form submitted");
            
            if (response.data.success) {
            
            setTimeout (() => {

                Successmessage.classList.remove("hidden");
                // Clear fields regardless
                firstName.value = ""
                lastName.value = ""
                companyName.value = ""
                email.value = ""
                number.value = ""
                about.value = ""
            }, 1000)
            
            setTimeout(() => {
                Successmessage.classList.add("hidden");

                Name.value = "";
                email.value = "";
                subject.value = "";
                message.value = "";
            }, 3000)
        }

        } catch (err) {
            console.error("❌ Error submitting form:", err);

            //Add the error message into view
            setTimeout(() => {
                error.classList.remove("hidden")
            }, 1000)

            //Remove the error message from view
            setTimeout(() => {
                error.classList.add("hidden")
                Name.value = "";
                email.value = "";
                subject.value = "";
                message.value = "";
            }, 5000)
        
        }
    };

    sendContact();

    // Clear the form
    setTimeout(() => {
        
    }, 2000)
    
});
