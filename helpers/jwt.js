const expressJwt = require("express-jwt");

const api = process.env.API_URL;

function authJwt() {
  const secret = process.env.secret;
  //   const api = process.env.API_URL;

  return expressJwt({
    secret,
    algorithms: ["HS256"],
    isRevoked: isRevoked,
  }).unless({
    path: [
      { url: /\api\/v1\/products(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\api\/v1\/categories(.*)/, methods: ["GET", "OPTIONS"] },
      `${api}/users/login`,
      `${api}/users/register`,
    ],
  });
}

async function isRevoked(req, payload, done) {
  if (!payload.isAdmin) {
    // if (req.originalUrl === `${api}/orders`) {
    if (/\api\/v1\/orders(.*)/.test(req.originalUrl)) {
      done();
    }

    done(null, true);
  }

  done();
}

module.exports = authJwt;
