import sha256 from "sha256";
import { InternalServerError, AuthrizationError } from "../errors/error.js";
import { read, write } from "../utils/model.js";
import path from 'path'
import jwt from "../utils/jwt.js";

/* USERS */
const GET = (req, res, next) => {
  try {
    let { userId } = req.params;
    
    if (userId) {
      let [user] = read("users").filter((user) => user.userId == userId);
      delete user.password
      return res.status(200).send(user);
    }

    let users = read("users").filter((user) => delete user.password);
    res.status(200).send(users);

  } catch (error) {
    return next(new InternalServerError(500, error.message));
  }
};



/* REGISTER */
const REGISTER = (req, res, next) => {
  try {
    let users = read("users");
    let { file } = req.files

    let fileName = Date.now() + file.name.replace(/\s/, '')
    file.mv(path.join(process.cwd(), 'uploads', fileName))


    req.body.userId = users.length ? users.at(-1).userId + 1 : 1;
    req.body.password = sha256(req.body.password);
    req.body.avatar = '/' + fileName

    let user = users.find((user) => user.username == req.body.username);
    if (user) {
      return next(new AuthrizationError(401, "this username is already taken"));
    }

    users.push(req.body);
    write("users", users);

    res.status(201).json({
      status: 201,
      message: "you are registered",
      token: jwt.sign({ userId: req.body.userId }),
      data: req.body,
    });
  } catch (error) {
    return next(new InternalServerError(500, error.message));
  }
};

/* LOGIN */
const LOGIN = (req, res, next) => {
  try {
    let { username, password } = req.body

    let users = read("users");
    let user = users.find(
      (user) => user.username == username && user.password == sha256(password)
      );
      
      // delete user.password;

    if (!user) {
      return next(new AuthrizationError(401, "wrong username or password"));
    }

    res.status(200).json({
      status: 200,
      message: "succecc",
      token: jwt.sign({ userId: user.userId }),
      data: user,
    });
  } catch (error) {
    return next(new InternalServerError(500, error.message));
  }
};

export default {
  LOGIN,
  REGISTER,
  GET,
};
