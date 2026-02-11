document.addEventListener("DOMContentLoaded", () => {

    const gameName = document.getElementById("gameName");
    const gameCategory = document.querySelector("input[name='gameCategory']:checked");
    const gameIconUrl = document.getElementById("gameIconUrl");
    const players = document.getElementById("players");
    const firstPrize = document.getElementById("prize1");
    const secondPrize = document.getElementById("prize2");
    const thirdPrize = document.getElementById("prize3");
    const regCloseDate = document.getElementById("regCloseDate");
    const createButton = document.getElementById("createTournament");

    function getGameCategory() {
        const selectedRadio = document.querySelector('input[name="gameCategory"]:checked');
        if (selectedRadio) {
            const value = selectedRadio.value; // Store the value in a variable
            return value;
        } else {
            return null;
        }
    }

    createButton.addEventListener("click", (e) => {
        e.preventDefault()

        const selected = getGameCategory();

        const formData = 
        {
            gameName: gameName.value,
            gameCategory: selected,
            gameIcon: gameIconUrl.value,
            players: players.value,
            prize1:firstPrize.value,
            prize2:secondPrize.value,
            prize3:thirdPrize.value,
            regCloseDate:regCloseDate.value,

        }

        for (const key in formData){
            
            console.log(key.value)

            // if(key.value == undefined){
            //     al("Ensure all fields are entered correctly")
            //     break
            // }
        }

        const submitForm = async() => {

            try{
                const response = axios.post('/admin/newTournament', formData);
                console.log("Form Submitted")

            } catch(err) {
                console.log(err)
            }
        }
        
        submitForm()
    })

})