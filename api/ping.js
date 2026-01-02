module.exports = (req, res) => {
  res.status(200).json({ ok: true, ping: true, now: new Date().toISOString() });
};
