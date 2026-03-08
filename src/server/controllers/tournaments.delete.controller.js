const supabase = require("../config/db");

const deleteTournament = async (req, res) => {
  const id = Number(req.params.id);

  if (!id) {
    return res.status(400).json({ message: "error", error: "Missing tournament id" });
  }

  try {
    const { data, error } = await supabase
      .from("Tournaments")
      .delete()
      .eq("id", id)
      .select();

    if (error) {
      return res.status(400).json({ message: "error", error });
    }

    return res.json({ message: "success", data });
  } catch (err) {
    return res.status(500).json({ message: "error", error: err?.message ?? err });
  }
};

module.exports = { deleteTournament };
