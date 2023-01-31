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