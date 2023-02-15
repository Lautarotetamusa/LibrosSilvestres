export class ValidationError extends Error {
    constructor(message){
        super(message);
        this.name = "ValidationError";
        this.status = 400;
    }
}

export class NotFound extends Error {
    constructor(message){
        super(message);
        this.name = "NotFound";
        this.status = 404;
    }
}

export class NothingChanged extends Error {
    constructor(message){
        super(message);
        this.name = "NothingChanged";
        this.status = 200;
    }
}



export function parse_error(res, error){
    if (error instanceof ValidationError || error instanceof NotFound || error instanceof NothingChanged)
        return res.status(error.status).json({
            success: false,
            error: error.message
        });
        
    console.log(error);
    return res.status(500).json({
        success:false, error: error
    }) 
}
