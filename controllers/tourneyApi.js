import supabase from "../db.js"

// Get all the tournaments currently available and all their information
const getTournaments = async (req, res) => {

    try{
        const { data, error } = await supabase.from('Tournaments').select()

        

        res.status(200).json({
            message: "All rows obtained successfully",
            data: data
        })
    } catch (err) {

        console.log(err)

    }
}

const newTournament = async (req, res) => {

    const { gameName, gameCategory, gameIcon, players, prize1, prize2, prize3, regCloseDate } = req.body;

    const { error } = await supabase
        .from('Tournaments')
        .insert(
            {
                game_name: gameName, game_category: gameCategory, game_icon: gameIcon,
                team_size: players,
                first_prize: prize1, second_prize: prize2, third_prize: prize3,
                reg_end: regCloseDate
            }
        )

}

const getTournament = async (req, res) => {

    const { id } = req.query

    try{
        const { data, error } = await supabase.from('Tournaments').select().eq('id', id)

        res.json({
        message: 'success',
        data: data
    })

    } catch(err){
        console.log(err)

    }

    
}

export {newTournament, getTournaments, getTournament} 


