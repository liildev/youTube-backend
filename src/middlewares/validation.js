import { ValidationError } from "../errors/error.js";
import { loginSchema, registerSchema, videoPutSchema } from "../utils/validation.js";

export default (req, res, next) => {
    try {
        if(req.method == 'POST' && req.url == '/login'){
            let {error} = loginSchema.validate(req.body)
            if(error) throw error
        }

        if(req.method == 'POST' && req.url == '/register'){
            let {error} = registerSchema.validate(req.body)
            if(error) throw error
        }

        if(req.method == 'PUT' && req.url == `/admin/videos/${req.params.videoId}`){
            let {error} = videoPutSchema.validate({body: req.body, params: req.params})
            if(error) throw error
        }

        return next()

    } catch (error) {
        return next( new ValidationError(401, error.message) )
    }

}

