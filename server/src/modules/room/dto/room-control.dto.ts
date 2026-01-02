import { IsBoolean, IsNotEmpty } from "class-validator";

export class ControlDTO {

    @IsNotEmpty()
    @IsBoolean()
    mic?: boolean;

    @IsNotEmpty()
    @IsBoolean()
    camera?: boolean;
}
