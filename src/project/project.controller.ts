import {
  Body,
  ClassSerializerInterceptor,
  ConflictException,
  Controller,
  Delete,
  Get,
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
import { User } from 'src/user/user.entity';
import { UserContext } from 'src/user/user.schema';
import { UserService } from 'src/user/user.service';
import { Project } from './project.entity';
import { CreateProjectDto } from './project.schema';
import { ProjectService } from './project.service';

@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiResponse({
  status: 401,
  description: 'Unauthorized',
})
@Controller('project')
export class ProjectController {
  constructor(
    private projectService: ProjectService,
    private userService: UserService,
  ) {}

  @ApiTags('project')
  @ApiResponse({
    status: 201,
    description: 'The project has been successfully created.',
  })
  @ApiResponse({
    status: 409,
    description: 'The project already exist with this name.',
  })
  @HttpCode(201)
  @Post()
  async newProject(
    @Req() req: UserContext,
    @Body() body: CreateProjectDto,
  ): Promise<Project> {
    const project: Project = await this.projectService.findProjectByName(
      body.name,
    );
    if (!!project) throw new ConflictException(messages.projectExist);
    return this.projectService.createProject(req.user, body.name);
  }

  @ApiTags('project')
  @ApiResponse({
    status: 200,
    description: 'Returns user projects.',
  })
  @Get()
  async allUserProjects(@Req() req: UserContext): Promise<Project[]> {
    return await this.projectService.findUserProjects(req.user);
  }

  @ApiTags('project')
  @ApiResponse({
    status: 200,
    description: 'returns project.',
  })
  @Get(':id')
  async getProject(@Param('id') id: number): Promise<Project> {
    return this.projectService.findProject(id);
  }

  @ApiTags('project')
  @ApiResponse({
    status: 200,
    description: 'Removes the user project.',
  })
  @Delete(':id')
  async removeUserProject(
    @Req() req: UserContext,
    @Param('id') id: number,
  ): Promise<void> {
    const targetProject: Project = await this.projectService.findProject(
      id,
      req.user.id,
    );
    if (!targetProject) throw new NotFoundException(messages.projectNotFound);
    await this.projectService.removeProject(targetProject);
  }

  @ApiTags('project')
  @ApiResponse({
    status: 200,
    description: 'The project has been successfully updated.',
  })
  @Put(':id')
  async updateUserProject(
    @Req() req: UserContext,
    @Param('id') id: number,
    @Body() body: CreateProjectDto,
  ): Promise<Project> {
    const targetProject: Project = await this.projectService.findProject(
      id,
      req.user.id,
    );
    if (!targetProject) throw new NotFoundException(messages.projectNotFound);
    return this.projectService.updateProject(targetProject.id, body.name);
  }

  @ApiTags('project')
  @ApiResponse({
    status: 200,
    description: 'The project user has been successfully assigned.',
  })
  @Patch('/:id/:userId')
  async addUserToProject(
    @Req() req: UserContext,
    @Param('id') id: number,
    @Param('userId') userId: number,
  ): Promise<Project> {
    const targetUser: User = await this.userService.findUserById(userId);
    if (!targetUser) throw new NotFoundException(messages.userNotFound);

    const targetProject: Project = await this.projectService.findProject(
      id,
      req.user.id,
    );
    if (!targetProject) throw new NotFoundException(messages.projectNotFound);
    if (targetProject.owner.id !== req.user.id) {
      throw new ConflictException(messages.doesNotHavePermission);
    }

    const user: User = targetProject.users.find((el) => el.id === req.user.id);
    if (!user) throw new ConflictException(messages.doesNotHavePermission);

    return this.projectService.addUserToProject(targetProject, targetUser);
  }

  @ApiTags('project')
  @ApiResponse({
    status: 200,
    description: 'The project user has been successfully removed.',
  })
  @Delete('/:id/:userId')
  async removeUserFromProject(
    @Req() req: UserContext,
    @Param('id') id: number,
    @Param('userId') userId: number,
  ): Promise<Project> {
    const targetUser: User = await this.userService.findUserById(userId);
    if (!targetUser) throw new NotFoundException(messages.userNotFound);

    const targetProject: Project = await this.projectService.findProject(
      id,
      req.user.id,
    );
    if (!targetProject) throw new NotFoundException(messages.projectNotFound);
    if (targetProject.owner.id !== req.user.id) {
      throw new ConflictException(messages.doesNotHavePermission);
    }

    const user: User = targetProject.users.find((el) => el.id === req.user.id);
    if (!user) throw new ConflictException(messages.doesNotHavePermission);

    return this.projectService.removeUserFromProject(targetProject, targetUser);
  }
}
