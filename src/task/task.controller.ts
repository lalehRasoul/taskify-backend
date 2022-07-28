import {
  Body,
  ClassSerializerInterceptor,
  ConflictException,
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { messages } from 'src/constants';
import { Project } from 'src/project/project.entity';
import { ProjectService } from 'src/project/project.service';
import { User } from 'src/user/user.entity';
import { UserContext } from 'src/user/user.schema';
import { UserService } from 'src/user/user.service';
import { Task } from './task.entity';
import { TaskDto } from './task.schema';
import { TaskService } from './task.service';

@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiResponse({
  status: 401,
  description: 'Unauthorized',
})
@Controller('task')
export class TaskController {
  constructor(
    private taskService: TaskService,
    private projectService: ProjectService,
    private userService: UserService,
  ) {}

  @ApiTags('task')
  @ApiResponse({
    status: 201,
    description: 'The task has been successfully created.',
  })
  @ApiResponse({
    status: 409,
    description: 'The task already exist with this name.',
  })
  @HttpCode(201)
  @Post('/:projectId')
  async newTask(
    @Req() req: UserContext,
    @Body() body: TaskDto,
    @Param('projectId') projectId: number,
  ): Promise<Task> {
    const project: Project = await this.projectService.findProject(projectId);
    if (!project) throw new NotFoundException(messages.projectNotFound);
    const user: User = project.users.find((el) => el.id === req.user.id);
    if (!user) throw new ConflictException(messages.doesNotHavePermission);
    return this.taskService.createTask(body, req.user, project);
  }

  @ApiTags('task')
  @ApiResponse({
    status: 200,
    description: 'Returns the task.',
  })
  @Put('/:taskId')
  async updateTask(
    @Req() req: UserContext,
    @Body() body: TaskDto,
    @Param('taskId') taskId: number,
  ): Promise<Task> {
    const targetTask: Task = await this.taskService.findTask(taskId);
    if (!targetTask) throw new NotFoundException(messages.taskNotFound);
    const user: User = targetTask.project.users.find(
      (el) => el.id === req.user.id,
    );
    if (!user) throw new ConflictException(messages.doesNotHavePermission);
    return this.taskService.updateTask(targetTask, body);
  }

  @ApiTags('task')
  @ApiResponse({
    status: 200,
    description: 'Check or uncheck the task.',
  })
  @Patch('/:taskId')
  async checkTask(
    @Req() req: UserContext,
    @Param('taskId') taskId: number,
  ): Promise<Task> {
    const targetTask: Task = await this.taskService.findTask(taskId);
    if (!targetTask) throw new NotFoundException(messages.taskNotFound);
    const user: User = targetTask.project.users.find(
      (el) => el.id === req.user.id,
    );
    if (!user) throw new ConflictException(messages.doesNotHavePermission);
    return this.taskService.changeCheckField(targetTask);
  }

  @ApiTags('task')
  @ApiResponse({
    status: 200,
    description: 'The task has been successfully assigned.',
  })
  @Patch('/:taskId/:userId')
  async assignTo(
    @Req() req: UserContext,
    @Param('taskId') taskId: number,
    @Param('userId') userId: number,
  ): Promise<Task> {
    const targetUser: User = await this.userService.findUserById(userId);
    if (!targetUser) throw new NotFoundException(messages.userNotFound);
    const targetTask: Task = await this.taskService.findTask(taskId);
    if (!targetTask) throw new NotFoundException(messages.taskNotFound);
    const user: User = targetTask.project.users.find(
      (el) => el.id === req.user.id,
    );
    if (!user) throw new ConflictException(messages.doesNotHavePermission);
    const checkTargetUser: User = targetTask.project.users.find(
      (el) => el.id === targetUser.id,
    );
    if (!checkTargetUser) {
      throw new ConflictException(messages.doesNotHavePermission);
    }
    return this.taskService.setAssignedUser(targetTask, targetUser);
  }
}
