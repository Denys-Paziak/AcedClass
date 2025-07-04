import { User } from "../modules/user/entities/User.entity";

export type ITokenUser = Pick<User, 'id' | 'role'>
