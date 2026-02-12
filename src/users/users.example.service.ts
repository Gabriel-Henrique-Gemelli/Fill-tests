import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

/**
 * EXEMPLO DE COMO USAR O PRISMA
 *
 * Este arquivo mostra como usar o PrismaService nos seus services.
 * Copie os métodos que você precisa para o seu users.service.ts
 */

@Injectable()
export class UsersExampleService {
  constructor(private prisma: PrismaService) {}

  // Criar usuário
  async create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        password: createUserDto.password,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        // Não retorna a senha
      },
    });
  }

  // Buscar todos os usuários
  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: {
          select: { questions: true }, // Conta quantas questões o usuário tem
        },
      },
    });
  }

  // Buscar usuário por ID
  async findByID(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        questions: {
          // Include questões do usuário
          include: {
            alternatives: true, // Include alternativas de cada questão
          },
        },
      },
    });
  }

  // Buscar usuário por email
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      // Retorna todos os campos incluindo senha para autenticação
    });
  }

  // Atualizar usuário
  async update(id: string, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });
  }

  // Deletar usuário
  async remove(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  // Criar questão para um usuário
  async createQuestion(
    userId: string,
    data: {
      description: string;
      subject: string;
      alternatives: Array<{ description: string; isCorrect: boolean }>;
    },
  ) {
    return this.prisma.question.create({
      data: {
        description: data.description,
        subject: data.subject,
        userId: userId,
        alternatives: {
          create: data.alternatives,
        },
      },
      include: {
        alternatives: true,
      },
    });
  }

  // Buscar questões de um usuário
  async findUserQuestions(userId: string) {
    return this.prisma.question.findMany({
      where: { userId },
      include: {
        alternatives: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Buscar questões por assunto
  async findQuestionsBySubject(subject: string) {
    return this.prisma.question.findMany({
      where: {
        subject: {
          contains: subject,
          mode: 'insensitive', // Case insensitive
        },
      },
      include: {
        alternatives: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // Verificar se a resposta está correta
  async checkAnswer(alternativeId: string) {
    const alternative = await this.prisma.alternative.findUnique({
      where: { id: alternativeId },
      select: {
        isCorrect: true,
        question: {
          include: {
            alternatives: true,
          },
        },
      },
    });

    return {
      isCorrect: alternative?.isCorrect,
      correctAnswer: alternative?.question.alternatives.find(
        (alt) => alt.isCorrect,
      ),
    };
  }

  // Transação - Exemplo de operação complexa
  async createUserWithQuestions(
    userData: CreateUserDto,
    questions: Array<{
      description: string;
      subject: string;
      alternatives: Array<{ description: string; isCorrect: boolean }>;
    }>,
  ) {
    return this.prisma.$transaction(async (prisma) => {
      // Criar usuário
      const user = await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: userData.password,
        },
      });

      // Criar questões
      const createdQuestions = await Promise.all(
        questions.map((question) =>
          prisma.question.create({
            data: {
              description: question.description,
              subject: question.subject,
              userId: user.id,
              alternatives: {
                create: question.alternatives,
              },
            },
            include: {
              alternatives: true,
            },
          }),
        ),
      );

      return {
        user,
        questions: createdQuestions,
      };
    });
  }
}