import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { SharedHandsService } from './shared-hands.service';
import { CreateSharedHandDto } from './dto/create-shared-hand.dto';
import { UpdateSharedHandDto } from './dto/update-shared-hand.dto';
import { ListQueryDto } from './dto/list-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddCommentDto } from './dto/add-comment.dto';

@Controller('api/shared-hands')
export class SharedHandsController {
  constructor(private readonly sharedHandsService: SharedHandsService) {}

  @Post()
  async create(@Body() body: CreateSharedHandDto & { userEmail?: string }, @Request() req) {
    console.log('Creating shared hand:', {
      hasJwtUser: Boolean(req.user),
      userEmail: body.userEmail,
      bodyKeys: Object.keys(body),
    });

    // Check if user is authenticated via JWT
    if (req.user && req.user.id) {
      return this.sharedHandsService.create(body, req.user.id);
    }

    // Fall back to email-based creation for NextAuth users
    if (body.userEmail) {
      try {
        return await this.sharedHandsService.createWithEmail(body, body.userEmail);
      } catch (error) {
        console.error('Error creating hand with email:', error);
        throw error;
      }
    }

    throw new UnauthorizedException('Authentication required');
  }

  @Get()
  findAll(@Query() query: ListQueryDto) {
    return this.sharedHandsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sharedHandsService.findOne(id);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  findByUser(@Param('userId') userId: string, @Request() req) {
    return this.sharedHandsService.findByUser(userId, req.user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateSharedHandDto: UpdateSharedHandDto,
    @Request() req,
  ) {
    return this.sharedHandsService.update(id, updateSharedHandDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Request() req) {
    return this.sharedHandsService.remove(id, req.user.id);
  }

  @Post(':id/like')
  async toggleLike(@Param('id') id: string, @Body() body: { userEmail?: string }, @Request() req) {
    // Check if user is authenticated via JWT
    if (req.user && req.user.id) {
      return this.sharedHandsService.toggleLike(id, req.user.id);
    }

    // Fall back to email-based for NextAuth users
    if (body.userEmail) {
      return this.sharedHandsService.toggleLikeByEmail(id, body.userEmail);
    }

    throw new UnauthorizedException('Authentication required');
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  addComment(@Param('id') id: string, @Body() addCommentDto: AddCommentDto, @Request() req) {
    return this.sharedHandsService.addComment(id, req.user.id, addCommentDto.content);
  }
}
