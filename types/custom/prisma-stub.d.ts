declare module '@prisma/client' {
  export class PrismaClient {
    [prop: string]: any;
    constructor(...args: any[]);
  }
  export namespace Prisma {
    export type OrderGetPayload<T> = any;
    export type ProductGetPayload<T> = any;
    export type UserGetPayload<T> = any;
    export type ProductCreateInput = any;
    export type ProductUpdateInput = any;
    export type UserUpdateInput = any;
    export interface User { [key: string]: any }
    export interface Product { [key: string]: any }
  }
  export type Role = any;
  export interface Product extends Record<string, any> {}
  export interface User extends Record<string, any> {}
  export interface Order extends Record<string, any> {}
}
