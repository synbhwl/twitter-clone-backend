export class BadRequestError extends Error {
    status: number;
    constructor(message: string) {
      super(message);
      this.name = this.constructor.name;
      this.status = 400;
    }
  }
  
export class DatabaseError extends Error {
    status: number;
    response: string;
    constructor(message: string, response: string) {
      super(message);
      this.name = this.constructor.name;
      this.status = 500;
      this.response = response;
    }
  }