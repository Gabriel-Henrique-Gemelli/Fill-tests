import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuestionsService {
  private readonly logger = new Logger(QuestionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createQuestionDto: CreateQuestionDto, userId: string) {
    this.logger.log('Creating question');

    const correctCount = createQuestionDto.alternatives.filter(
      (a) => a.isCorrect,
    ).length;
    if (correctCount !== 1) {
      throw new BadRequestException(
        'There must be exactly one correct alternative',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.question.create({
      data: {
        description: createQuestionDto.description,
        subject: createQuestionDto.subject,
        userId: userId,
        alternatives: {
          create: createQuestionDto.alternatives,
        },
      },
      include: { alternatives: true },
    });
  }

  async findAll() {
    this.logger.log('Fetching all questions');
    return this.prisma.question.findMany({
      include: { alternatives: true },
    });
  }

  async findOne(id: string) {
    this.logger.log(`Fetching question by id: ${id}`);
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: { alternatives: true },
    });
    if (!question) {
      throw new NotFoundException('Question not found');
    }
    return question;
  }

  async update(
    id: string,
    updateQuestionDto: UpdateQuestionDto,
    userId: string,
  ) {
    this.logger.log(`Updating question with id: ${id}`);
    const question = await this.findOne(id);

    const { alternatives, ...questionData } = updateQuestionDto;

    if (alternatives) {
      const correctCount = alternatives.filter((a) => a.isCorrect).length;
      if (correctCount !== 1) {
        throw new BadRequestException(
          'There must be exactly one correct alternative',
        );
      }
      if (question.userId !== userId) {
        throw new BadRequestException(
          'Only the creator of the question can update',
        );
      }

      await this.prisma.alternative.deleteMany({ where: { questionId: id } });

      return this.prisma.question.update({
        where: { id },
        data: {
          ...questionData,
          alternatives: { create: alternatives },
        },
        include: { alternatives: true },
      });
    }

    return this.prisma.question.update({
      where: { id },
      data: questionData,
      include: { alternatives: true },
    });
  }

  async remove(id: string) {
    this.logger.log(`Deleting question with id: ${id}`);
    await this.findOne(id);
    await this.prisma.question.delete({ where: { id } });
    return { deletedQuestionId: id };
  }
}
