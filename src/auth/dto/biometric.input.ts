import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty } from "class-validator";

@InputType()
export class BiometricInput {
    @Field()
    @IsNotEmpty()
    biometricKey: string;
}