document.addEventListener("DOMContentLoaded", ()=> {


    const openTournament = document.getElementById("newTournament");
    const closeTournament = document.getElementById("closeTournament");
    const closeTournamentModal = document.getElementById("closeTournamentModal");
    const tournamentModal = document.getElementById("tournamentModal");


    openTournament.addEventListener("click", (e)=> {

        e.preventDefault()

        tournamentModal.classList.remove("hidden");

    })

    closeTournament.addEventListener("click", (e)=> {

        e.preventDefault()

        tournamentModal.classList.add("hidden");

    })
    closeTournamentModal.addEventListener("click", (e)=> {

        e.preventDefault()

        tournamentModal.classList.add("hidden");
        
    })
    


})