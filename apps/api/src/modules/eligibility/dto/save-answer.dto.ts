import { IsString, IsNotEmpty } from 'class-validator';

export class SaveAnswerDto {
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @IsString()
  @IsNotEmpty()
  answer: string;
}
