let jwt = require("jsonwebtoken");
const { JWT_SecretKey } = require("../config/env");

function verifyToken(req, res, next) {
  let token = req.headers["accesstoken"];
  /*
 let token;
 let bearerHeader = req.headers['authorization']
  console.log("req.headers : ", bearerHeader)
  if(typeof bearerHeader !=="undefined"){
    token = bearerHeader.split("");
  }
*/
  // console.log("token : ", token);

  if (!token)
    return res
      .status(403)
      .send({ auth: false, message: "아이디와 비밀번호를 다시 확인 하세요" });

  jwt.verify(token, JWT_SecretKey, function (err, decoded) {
    if (err)
      return res
        .status(500)
        .send({ auth: false, message: "아이디와 비밀번호를 다시 확인 하세요" });
    // console.log("decoded", decoded)
    req.email = decoded.email;
    req.userId = decoded._id;
    req.id = decoded.id;
    next();
  });
}

module.exports = verifyToken;