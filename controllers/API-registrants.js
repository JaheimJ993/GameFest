import supabase from "../db.js";

const submitRegistrants = async (req, res) => {
  const { tournamentId, teamName, phone, email, players } = req.body;

  if (!tournamentId || !phone || !email) {
    return res.status(400).json({
      message: "error",
      error: "Missing required fields: tournamentId, phone, email",
    });
  }

  try {
    const { data, error } = await supabase
      .from("Registrants")
      .insert({
        tournament_id: tournamentId,
        team_name: teamName ?? null,
        number: phone,
        email,
        players: players ?? [],
        reg_confirmed: false,
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: "error", error });
    }

    return res.json({ message: "success", data });
  } catch (err) {
    return res.status(500).json({ message: "error", error: err?.message ?? err });
  }
};

const getRegistrants = async (req, res) => {
  const { id, confirmed } = req.query;

  if (!id) {
    return res.status(400).json({ message: "error", error: "Missing tournament id" });
  }

  try {
    let query = supabase.from("Registrants").select().eq("tournament_id", id);

    // Optional filter: confirmed=true/false
    if (confirmed !== undefined) {
      const confirmedBool = confirmed === "true" || confirmed === true;
      query = query.eq("reg_confirmed", confirmedBool);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({ message: "error", error });
    }

    return res.json({ message: "success", data });
  } catch (err) {
    return res.status(500).json({ message: "error", error: err?.message ?? err });
  }
};

const updateRegistrantConfirmation = async (req, res) => {
  const { registrationId, reg_confirmed } = req.body;

  if (!registrationId) {
    return res.status(400).json({ message: "error", error: "Missing registrationId" });
  }

  try {
    const { data, error } = await supabase
      .from("Registrants")
      .update({ reg_confirmed: !!reg_confirmed })
      .eq("registration_id", registrationId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: "error", error });
    }

    return res.json({ message: "success", data });
  } catch (err) {
    return res.status(500).json({ message: "error", error: err?.message ?? err });
  }
};

const deleteRegistrant = async (req, res) => {
  const registrationId = Number(req.params.registrationId);

  if (!registrationId) {
    return res.status(400).json({ message: "error", error: "Missing registrationId" });
  }

  try {
    const { data, error } = await supabase
      .from("Registrants")
      .delete()
      .eq("registration_id", registrationId)
      .select();

    if (error) {
      return res.status(400).json({ message: "error", error });
    }

    return res.json({ message: "success", data });
  } catch (err) {
    return res.status(500).json({ message: "error", error: err?.message ?? err });
  }
};

export { submitRegistrants, getRegistrants, updateRegistrantConfirmation, deleteRegistrant };
