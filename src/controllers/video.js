import { InternalServerError, NotFoundError, ValidationError } from "../errors/error.js";
import { read, write } from "../utils/model.js";
import path from 'path'

/* VIDEOS */
const GET = (req, res, next) => {
  try {
    let videos = read("videos");
    let users = read("users");

    let { userId, search } = req.query;
    if(req.url == '/admin/videos') userId = req.userId

    let data = videos.filter((video) => {
      let byUserId = userId ? video.userId == userId : true;
      let bySearch = search ? video.title.toLowerCase().includes(search.toLowerCase()) : true;
      video.user = users.find(user => user.userId == video.userId)
      delete video.userId
      delete video.user.password
      return byUserId && bySearch;
    });


    res.status(200).send(data);
  } catch (error) {
    return next(new InternalServerError(500, error.message));
  }
};

const POST = (req, res, next) => {
  try {
    let videos = read("videos");
    let users = read('users')
    let { file } = req.files

    if(file.size > (1024 * 1024 * 50)){
      return new ValidationError(400, 'invalid video size')
    }

    if(!['video/mp4', 'video/mov'].includes(file.mimetype)){
      return new ValidationError(400, 'invalid video format')
    }

    let fileName = Date.now() + file.name.replace(/\s/, '')
    file.mv(path.join(process.cwd(), 'uploads', fileName))


    req.body.videoId = videos.length ? videos.at(-1).videoId + 1 : 1;
    req.body.size = file.size
    req.body.link = fileName
    req.body.download = 'download/' + fileName
    req.body.date = Date.now()
    req.body.mime = file.mimetype
    req.body.userId = req.userId

    videos.push(req.body);
    write("videos", videos);

    req.body.user = users.find(user => user.userId == req.userId)
    delete req.body.userId
    delete req.body.user.password

    res.status(201).json({
      status: 201,
      message: "video uploaded",
      data: req.body,
    });
  } catch (error) {
    return next(new InternalServerError(500, error.message));
  }
}

const PUT = (req, res, next) => {
  try {
    let videos = read("videos");
    let users = read('users')

    let video = videos.find(video => video.videoId == req.params.videoId && video.userId == req.userId)

    if(!video) {
      return next( new NotFoundError(404, 'video not found'))
    }

    video.title = req.body.title || video.title

    write('videos', videos)

    video.user = users.find(user => user.userId == req.userId)
    delete video.userId
    delete video.user.password

    res.status(200).json({
      status: 200,
      message: "video updated",
      data: video,
    });
    
  } catch (error) {
    return next(new InternalServerError(500, error.message));
  }
}

const DELETE = (req, res, next) => {
  try {
    let videos = read("videos");
    let users = read('users')

    let videoIndex = videos.findIndex(video => video.videoId == req.params.videoId && video.userId == req.userId)

    if(videoIndex == -1) {
      return next( new NotFoundError(404, 'video not found'))
    }

    let [video] = videos.splice(videoIndex, 1)

    write('videos', videos)
    
    video.user = users.find(user => user.userId == req.userId)
    delete video.userId
    delete video.user.password

    res.status(200).json({
      status: 200,
      message: "video deleted",
      data: video,
    });
  } catch (error) {
    return next(new InternalServerError(500, error.message));
  }
}

const DOWNLOAD = (req, res) => {
  let data = req.params.file;
  res.download(path.join(process.cwd(), "uploads", data));
}



export default {
  GET,
  POST,
  PUT,
  DELETE,
  DOWNLOAD
};
