import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';

export class CreateAlternativeDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsBoolean()
  isCorrect: boolean;
}

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @ValidateNested({ each: true })
  @Type(() => CreateAlternativeDto)
  @ArrayMinSize(5)
  @ArrayMaxSize(5)
  alternatives: CreateAlternativeDto[];
}
