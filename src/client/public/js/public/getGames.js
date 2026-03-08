const table = document.getElementById("Games")
const Message = document.getElementById("Message")

const getGames = async () => {
    try {
        const response = await axios.get("/admin/dashboard/manage-games/games/data");
        const games = response.data;
        console.log(games)

        games.forEach(game => {
            const row = document.createElement("tr");
            row.id = game.GameID;
            row.className = "border-b border-gray-600 hover:bg-gray-600 transition-colors";
            row.innerHTML = `
            <td class="p-3">
                <img src="${game.Image}" alt="${game.GameName} Image" class="h-14 w-14 object-cover rounded-md border border-gray-500 mx-auto" />
            </td>
            <td class="p-3 text-center">${game.GameID}</td>
            <td class="p-3 text-center font-semibold text-yellow-300">${game.GameName}</td>
            <td class="p-3 text-center font-semibold text-yellow-300">${game.Category}</td>
            <td class="p-3 text-center space-x-2">
            <button class="edit-btn rounded-md bg-blue-500 px-3 py-1 text-sm font-medium text-white hover:bg-blue-400 transition" data-id="${game.GameID}">Edit</button>
            <button class="delete-btn rounded-md bg-red-500 px-3 py-1 text-sm font-medium text-white hover:bg-red-400 transition" data-id="${game.GameID}">Delete</button>
            </td>
            `;
            table.appendChild(row);
        });

        if (games.length === 0){
            Message.innerText = "Add a game new game to have it displayed in the table"
        }
    } catch (err) {
        console.error("Failed to load games:", err)
    }
}

getGames();