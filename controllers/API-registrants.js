import supabase from "../db.js"

const submitRegistrants = async (req, res) => {

    const {tournamentId, teamName, phone, email, players} = req.body

    try{
        const {error} = await supabase.from("Registrants")
    .insert({
        tournament_id: tournamentId, team_name: teamName, number: phone, email: email, players: players
    })
    } catch(err){

        res.json({
          error: err  
        })

    }
}

const getRegistrants = async (req, res) => {

    const {id} = req.query
    try{
        const {data, error} = await supabase.from("Registrants")
        .select().eq('tournament_id', id)

        res.json({
            message: 'success',
            data: data
        })
    } catch(error) {
        console.log(error)

    }
}

export { submitRegistrants, getRegistrants }