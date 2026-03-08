const firstName = document.getElementById("fName")
const lastName = document.getElementById("lName")
const companyName = document.getElementById("cName")
const email = document.getElementById("email")
const number = document.getElementById("number")
const about = document.getElementById("about")
const submit = document.getElementById("sponsor-submit")
const message = document.getElementById("message")
const error = document.getElementById("error-message")

submit.addEventListener("click", (e) => {
    e.preventDefault()

    const formData = {
    fName: firstName.value,
    lName: lastName.value,
    cName: companyName.value,
    email: email.value,
    number: number.value,
    about: about.value
}

    const sponsorMail = async() => {
        try {
            const response = await axios.post("Sponsor/submitData", formData);
            console.log("✅ Form submitted:");

            if (response.data.success) {
            
            setTimeout (() => {

                message.classList.remove("hidden");
                // Clear fields regardless
                firstName.value = ""
                lastName.value = ""
                companyName.value = ""
                email.value = ""
                number.value = ""
                about.value = ""
            }, 1000)
            
            setTimeout(() => {
                message.classList.add("hidden");
            }, 5000)
        }


        } catch (err) {
            console.error("❌ Error submitting form:", err)

            //Add the error message into view
            setTimeout(() => {
                error.classList.remove("hidden")
            }, 1000)

            //Remove the error message from view
            setTimeout(() => {
                error.classList.remove("hidden")
            }, 1000)
        }
    }

    sponsorMail();
    
})