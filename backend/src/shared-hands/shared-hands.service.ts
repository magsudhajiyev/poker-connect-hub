import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SharedHand, SharedHandDocument } from './entities/shared-hand.entity';
import { CreateSharedHandDto } from './dto/create-shared-hand.dto';
import { UpdateSharedHandDto } from './dto/update-shared-hand.dto';
import { ListQueryDto } from './dto/list-query.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class SharedHandsService {
  constructor(
    @InjectModel(SharedHand.name) private sharedHandModel: Model<SharedHandDocument>,
    private readonly usersService: UsersService,
  ) {}

  async create(createSharedHandDto: CreateSharedHandDto, userId: string): Promise<SharedHand> {
    const createdHand = new this.sharedHandModel({
      ...createSharedHandDto,
      userId: new Types.ObjectId(userId),
    });
    return createdHand.save();
  }

  async createWithEmail(
    createSharedHandDto: CreateSharedHandDto,
    email: string,
  ): Promise<SharedHand> {
    console.log('Finding user by email:', email);
    // Find user by email
    const user = await this.usersService.findByEmail(email);
    console.log('Found user:', user ? { id: user.id, email: user.email } : null);

    if (!user) {
      throw new NotFoundException(`User not found with email: ${email}`);
    }

    const createdHand = new this.sharedHandModel({
      ...createSharedHandDto,
      userId: user._id || user.id,
    });

    const saved = await createdHand.save();
    // Populate user data before returning
    return this.sharedHandModel.findById(saved._id).populate('userId', 'name picture email').exec();
  }

  async findAll(query: ListQueryDto): Promise<{ hands: SharedHand[]; total: number }> {
    const { page = 1, limit = 10, userId, tags, search } = query;
    const skip = (page - 1) * limit;

    const filter: any = { isPublic: true };

    if (userId) {
      filter.userId = new Types.ObjectId(userId);
    }

    if (tags && tags.length > 0) {
      filter.tags = { $in: tags };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const [hands, total] = await Promise.all([
      this.sharedHandModel
        .find(filter)
        .populate('userId', 'name picture email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.sharedHandModel.countDocuments(filter),
    ]);

    return { hands, total };
  }

  async findOne(id: string): Promise<SharedHand> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid hand ID');
    }

    const hand = await this.sharedHandModel
      .findById(id)
      .populate('userId', 'name picture email')
      .exec();

    if (!hand) {
      throw new NotFoundException('Hand not found');
    }

    // Increment view count
    await this.sharedHandModel.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

    return hand;
  }

  async findByUser(userId: string, currentUserId: string): Promise<SharedHand[]> {
    const filter: any = { userId: new Types.ObjectId(userId) };

    // If not the owner, only show public hands
    if (userId !== currentUserId) {
      filter.isPublic = true;
    }

    return this.sharedHandModel
      .find(filter)
      .populate('userId', 'name picture email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async update(
    id: string,
    updateSharedHandDto: UpdateSharedHandDto,
    userId: string,
  ): Promise<SharedHand> {
    const hand = await this.sharedHandModel.findById(id);

    if (!hand) {
      throw new NotFoundException('Hand not found');
    }

    if (hand.userId.toString() !== userId) {
      throw new ForbiddenException('You can only update your own hands');
    }

    const updated = await this.sharedHandModel
      .findByIdAndUpdate(id, updateSharedHandDto, { new: true })
      .populate('userId', 'name picture email')
      .exec();

    return updated;
  }

  async remove(id: string, userId: string): Promise<void> {
    const hand = await this.sharedHandModel.findById(id);

    if (!hand) {
      throw new NotFoundException('Hand not found');
    }

    if (hand.userId.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own hands');
    }

    await this.sharedHandModel.findByIdAndDelete(id);
  }

  async toggleLike(handId: string, userId: string): Promise<{ liked: boolean; likeCount: number }> {
    const hand = await this.sharedHandModel.findById(handId);

    if (!hand) {
      throw new NotFoundException('Hand not found');
    }

    const userObjectId = new Types.ObjectId(userId);
    const isLiked = hand.likes.some((like) => like.toString() === userId);

    if (isLiked) {
      // Unlike
      hand.likes = hand.likes.filter((like) => like.toString() !== userId);
    } else {
      // Like
      hand.likes.push(userObjectId);
    }

    await hand.save();

    return {
      liked: !isLiked,
      likeCount: hand.likes.length,
    };
  }

  async toggleLikeByEmail(
    handId: string,
    email: string,
  ): Promise<{ liked: boolean; likeCount: number }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toggleLike(handId, (user._id || user.id).toString());
  }

  async addComment(handId: string, userId: string, content: string): Promise<SharedHand> {
    const hand = await this.sharedHandModel.findById(handId);

    if (!hand) {
      throw new NotFoundException('Hand not found');
    }

    hand.comments.push({
      userId: new Types.ObjectId(userId),
      content,
      createdAt: new Date(),
    });

    await hand.save();

    return this.sharedHandModel
      .findById(handId)
      .populate('userId', 'name picture email')
      .populate('comments.userId', 'name picture')
      .exec();
  }
}
