declare module "jsxapi" {
  export function connect(
    url: string,
    credentials: {
      username: string;
      password: string;
    },
  ): Promise<any>;

  export function connectGen(
    url: string,
    credentials: {
      username: string;
      password: string;
    },
  ): Promise<any>;

  export class XAPI {
    constructor(url: string, credentials: { username: string; password: string });
  }
}
