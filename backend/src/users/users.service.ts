import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './entities/user.entity';

export interface CreateUserDto {
  googleId?: string;
  email: string;
  name?: string;
  picture?: string;
  refreshToken?: string;
  password?: string;
  authProvider?: string;
}

export interface UpdateUserDto {
  name?: string;
  picture?: string;
  refreshToken?: string;
  isActive?: boolean;
  hasCompletedOnboarding?: boolean;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = new this.userModel(createUserDto);
    return await user.save();
  }

  async findAll(): Promise<User[]> {
    return await this.userModel.find({ isActive: true }).sort({ createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findOne({ _id: id, isActive: true }).exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findOne(id: string): Promise<User> {
    return this.findById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userModel.findOne({ email, isActive: true }).exec();
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return await this.userModel.findOne({ googleId, isActive: true }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel
      .findOneAndUpdate({ _id: id, isActive: true }, updateUserDto, { new: true })
      .exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async updateRefreshToken(id: string, refreshToken: string | null): Promise<void> {
    await this.userModel.updateOne({ _id: id }, { refreshToken }).exec();
  }

  async deactivate(id: string): Promise<void> {
    await this.findById(id);
    await this.userModel.updateOne({ _id: id }, { isActive: false }).exec();
  }

  async findOrCreateByGoogle(googleProfile: {
    googleId: string;
    email: string;
    name?: string;
    picture?: string;
  }): Promise<User> {
    // Try to find existing user by Google ID
    let user = await this.findByGoogleId(googleProfile.googleId);

    if (user) {
      // Update existing user with latest profile info
      const updateData = {
        name: googleProfile.name || user.name,
        picture: googleProfile.picture || user.picture,
        email: googleProfile.email, // Update email in case it changed
      };

      return await this.userModel
        .findByIdAndUpdate(user.id || user._id, updateData, { new: true })
        .exec();
    }

    // Try to find by email in case user exists but wasn't linked to Google
    user = await this.findByEmail(googleProfile.email);

    if (user) {
      // Link existing user to Google account
      const updateData = {
        googleId: googleProfile.googleId,
        name: googleProfile.name || user.name,
        picture: googleProfile.picture || user.picture,
      };

      return await this.userModel
        .findByIdAndUpdate(user.id || user._id, updateData, { new: true })
        .exec();
    }

    // Create new user
    return await this.create({
      ...googleProfile,
      authProvider: 'google',
    });
  }

  async updateOnboardingStatus(id: string, hasCompletedOnboarding: boolean): Promise<User> {
    const user = await this.userModel
      .findOneAndUpdate(
        { _id: id, isActive: true },
        { hasCompletedOnboarding },
        { new: true },
      )
      .exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }
}
