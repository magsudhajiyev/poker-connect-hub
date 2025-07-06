import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsObject,
  IsOptional,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

export class CreateSharedHandDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description: string;

  @IsString()
  @IsNotEmpty()
  gameType: string;

  @IsString()
  @IsNotEmpty()
  gameFormat: string;

  @IsNumber()
  @Min(2)
  @Max(10)
  tableSize: number;

  @IsObject()
  @IsNotEmpty()
  positions: Record<string, any>;

  @IsObject()
  @IsNotEmpty()
  preflopCards: Record<string, any>;

  @IsArray()
  @IsOptional()
  preflopActions?: Array<any>;

  @IsArray()
  @IsOptional()
  flopCards?: string[];

  @IsArray()
  @IsOptional()
  flopActions?: Array<any>;

  @IsString()
  @IsOptional()
  turnCard?: string;

  @IsArray()
  @IsOptional()
  turnActions?: Array<any>;

  @IsString()
  @IsOptional()
  riverCard?: string;

  @IsArray()
  @IsOptional()
  riverActions?: Array<any>;

  @IsObject()
  @IsOptional()
  analysis?: Record<string, any>;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsOptional()
  isPublic?: boolean;
}
