export class PersonError extends Error {
    constructor(message, code){
        super(message);
        this.name = "PersonError";
        this.status_code = code;
        this.res = {
            success: false,
            error: message
        }
    }
}

export function parse_error(res, error){
    if (error instanceof Persona.PersonError)
        return res.status(error.status_code).json(error.res)
        
    console.log(error);
    return res.status(500).json({success:false, error: error}) 
}



export class ValidationError extends Error {
    constructor(message){
        super(message);
        this.name = "ValidationError";
        this.status_code = 400;
    }
}

export class NotFound extends Error {
    constructor(message){
        super(message);
        this.name = "NotFound";
        this.status_code = 404;
    }
}

export class NothingChanged extends Error {
    constructor(message){
        super(message);
        this.name = "NothingChanged";
        this.status_code = 200;
    }
}