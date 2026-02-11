document.addEventListener('DOMContentLoaded', ()=>{

    const tournamentContainer = document.getElementById("tournamentContainer")

    const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
    });

    const getTournaments = async() => {

        try{
            const data = await axios.get("admin/api/getTournaments")

            const tournaments = data.data.data

            console.log(tournaments)
            
            tournaments.forEach(tournament => {
                const row = document.createElement("div")
                row.id = tournament.id
                row.className ="flex flex-col justify-center rounded-2xl border-2 border-gradient1 px-4 py-4 duration-150 hover:bg-gradient1 hover:shadow-2xl max-lg:w-[450px] max-lg:gap-y-[22px] md:gap-x-[20px] lg:w-full lg:flex-row lg:items-center"
                row.innerHTML = `
                <!-- Game Icon -->
                <img id="gameIcon" class="mx-auto w-[300px] rounded-2xl lg:w-[100px] shadow-2xl" src=${tournament.game_icon} />

                <!-- Game Info Wrapper -->
                <div class="mx-auto w-[300px]">
                    <h1 id="gameName" class="text-2xl font-bold tracking-[3px]">${tournament.game_name}</h1>
                    <p id="gameCategory" class="text-md font-semibold">${tournament.game_category}</p>
                </div>

                <!-- Player Info Wrapper -->
                <div class="mx-auto w-[300px]">
                    <h1 class="text-2xl font-bold tracking-[3px]">Team Size:</h1>
                    <h1 id="teamSize" class="text-md font-medium tracking-[2px]">${tournament.team_size} ${tournament.team_size == 1 ? "Player" : "Players"}</h1>
                </div>
                <!-- Player Info Wrapper -->
                <div class="mx-auto w-[300px]">
                    <h1 class="text-2xl font-bold tracking-[3px]">First Prize:</h1>
                    <h1 id="prize1" class="text-md font-medium tracking-[2px] text-green-400">$${formatter.format(tournament.first_prize)}</h1>
                </div>

                <!-- Player Info Wrapper -->
                <div class="mx-auto w-[300px]">
                    <h1 class="text-2xl font-bold tracking-[3px]">Sign-Up:</h1>
                    <h1 id="regEnd" class="text-md font-medium tracking-[2px] text-red-500">${tournament.reg_end}</h1>
                </div>

                <div class="mx-auto w-fit">
                    <a href="adminPanel/tournaments/${tournament.id}"> <button class="border- rounded-[10px] border-gamefest bg-gamefest px-6 py-4 text-xl font-bold text-black duration-150 hover:cursor-pointer hover:brightness-75">More Details</button></a>
                </div>
                `;
                tournamentContainer.appendChild(row)
                
            });


        } catch(err){
            console.log(err)
        }



    }

    getTournaments()
})