import { PartialType } from '@nestjs/mapped-types';
import { CreateSharedHandDto } from './create-shared-hand.dto';

export class UpdateSharedHandDto extends PartialType(CreateSharedHandDto) {}
