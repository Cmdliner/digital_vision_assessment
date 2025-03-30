import { Field, ObjectType } from "@nestjs/graphql";
import { User } from "src/user/user.model";

@ObjectType()
export class RegisterResponse {
    @Field()
    access_token: string;

    @Field(() => User)
    user: User
}

@ObjectType()
export class LoginResponse {
    @Field()
    access_token: string;
}