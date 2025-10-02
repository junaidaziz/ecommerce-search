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
    export interface User {
      [key: string]: any;
    }
    export interface Product {
      [key: string]: any;
    }
    export interface ProductWhereInput {
      [key: string]: any;
    }
  }
  export type Role = any;
  export interface Product extends Record<string, any> {}
  export interface User extends Record<string, any> {}
  export interface Order extends Record<string, any> {}
  export interface Category extends Record<string, any> {}
  export interface Payment extends Record<string, any> {}
  export interface PaymentMethod extends Record<string, any> {}
  export interface PolicyDocument extends Record<string, any> {}
  export interface SupportTicket extends Record<string, any> {}
  export interface WishlistItem extends Record<string, any> {}
  export interface Variant extends Record<string, any> {}
  export interface Notification extends Record<string, any> {}
  export interface Message extends Record<string, any> {}
  export interface Coupon extends Record<string, any> {}
  export interface CouponUsage extends Record<string, any> {}
  export interface Review extends Record<string, any> {}
  export interface ChatSession extends Record<string, any> {}
  export interface ChatMessage extends Record<string, any> {}
}
