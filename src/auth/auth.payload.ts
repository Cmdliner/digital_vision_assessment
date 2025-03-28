import { Field, ObjectType } from "@nestjs/graphql";
import { User } from "src/user/user.model";

@ObjectType()
export class AuthPayload {
    @Field()
    access_token: string;

    @Field(() => User)
    user: User
}