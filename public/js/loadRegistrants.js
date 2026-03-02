document.addEventListener("DOMContentLoaded", ()=> {

   const table = document.getElementById("tableContent")
    

    const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("tournament-id"));

    const loadRegistrants = async() =>{
        
        try{
            const data = await axios.get("/adminPanel/tournaments/api/registrants", { params: { id } })

            const registrantData = data.data.data

            console.log(registrantData)

            
            registrantData.forEach(registrant => {

                const record = document.createElement('tr')
                record.id = registrant.registration_id
                record.className = "transition hover:bg-white/5 [&>td]:px-5 [&>td]:py-4"
                record.innerHTML = 
                `   
                    <!-- Team Name -->
                    <td class="font-semibold text-white/90">${registrant.team_name}</td>

                    <!-- Registrant -->
                        <td class="text-white/80">
                        <div class="flex flex-wrap gap-2">
                            ${
                                (registrant.players ?? [])
                                .map(player => `
                                    <span class="rounded-full border border-white/10 bg-white/5 px-3 py-1">${player}</span>
                                `)
                                .join("")
                            }
                        </div>
                        </td>

                        <td class="whitespace-nowrap text-white/80">+592 ${registrant.number}</td>
                        
                        <td class="whitespace-nowrap text-white/80">
                        <a class="underline decoration-white/20 underline-offset-4 hover:decoration-white/60" href="mailto:${registrant.email}">
                            ${registrant.email}
                        </a>
                        </td>

                        <td class="whitespace-nowrap">
                        <select
                            class="w-full min-w-[180px] cursor-pointer rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white/90 outline-none transition focus:border-white/25 focus:ring-2 focus:ring-white/10"
                        >
                            <option class="bg-zinc-900">Not Confirmed</option>
                            <option class="bg-zinc-900">Confirmed</option>
                        </select>
                        </td>
                `;
                table.appendChild(record)
                
            });
        }
        catch (err){
            console.log(err)

        }
        finally{

        }
        
    }

    loadRegistrants()
})