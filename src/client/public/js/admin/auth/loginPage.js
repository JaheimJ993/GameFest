

const username = document.getElementById("username");
const password = document.getElementById("password");

const submit = document.getElementById("submit");

submit.addEventListener("click", (e) => {
    e.preventDefault()

    const formData = {
        user: username.value,
        passcode: password.value
    }

    const postData = async () => {
        try {
            const response = await axios.post("/admin", formData)
            console.log(response.data);

            if (response.data.success === true){
                window.location.href = response.data.redirectURL
            }


        } catch (error) {
            console.error("login error:", error)
        }
    }

    postData()

})