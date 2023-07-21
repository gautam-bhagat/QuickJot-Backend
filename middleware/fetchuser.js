const jwt = require("jsonwebtoken");

const JWT_SECRET = "QuickJot_NoteTakingApp";
const fetchuser = (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    res.status(401).send({ error: "Unauthorized Access" });
  }

  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.userid = data.id;
    next();
  } catch (error) {
    res.status(401).send({ error: "Unauthorized Access" });
  }
};

module.exports = fetchuser;
