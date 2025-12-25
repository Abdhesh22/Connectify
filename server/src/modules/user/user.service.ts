import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RegisterUserDto } from 'src/common/dto/register-user.dto';
import { User } from './schemas/user.schema';
import { Model, Types } from 'mongoose';
import { USER_STATUS } from 'src/common/constants/user-status.constant';
import { UserEmailExistDto } from './dto/user-email-exist.dto';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) { }
    async createUser(registerUserDto: RegisterUserDto) {
        const isExist = await this.userModel.findOne({ email: registerUserDto.email, status: { $ne: USER_STATUS.INACTIVE } });
        if (isExist) {
            throw new ConflictException({
                success: false,
                code: 'EMAIL_ALREADY_EXISTS',
                message: 'This email is already registered',
            });
        }
        const user = await this.userModel.create(registerUserDto);
        return user;
    }


    async isEmailExist(userEmailExistDto: UserEmailExistDto) {
        try {

            const isExist = await this.userModel.findOne({ email: userEmailExistDto.email, status: { $ne: USER_STATUS.INACTIVE } });
            if (isExist) {
                throw new ConflictException({
                    success: false,
                    code: 'EMAIL_ALREADY_EXISTS',
                    message: 'This email is already registered',
                });
            }

            return {
                success: true,
                message: 'Email is not exist'
            }

        } catch (error) {
            const e = error as { code: string };
            if (e?.code == 'EMAIL_ALREADY_EXISTS') {
                throw new ConflictException({
                    success: false,
                    code: 'EMAIL_ALREADY_EXISTS',
                    message: 'This email is already registered',
                });
            }
            throw error;
        }
    }

    async findOneUser(filter: Partial<{ email: string; _id: string }>, projection?: Record<string, 0 | 1>,) {
        return await this.userModel.findOne(filter, projection);
    }

    async findById(_id: Types.ObjectId | string, projection = {}) {
        return await this.userModel.findById({ _id: _id }, projection);
    }

}
