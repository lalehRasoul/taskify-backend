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
  Post,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { messages } from 'src/constants';
import { UserContext } from 'src/user/user.schema';
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
  constructor(private projectService: ProjectService) {}

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
    return await this.projectService.findProjectsByOwner(req.user.id);
  }

  @ApiTags('project')
  @ApiResponse({
    status: 200,
    description: 'Removes the user project.',
  })
  @Delete(':id')
  async remoeUserProject(
    @Req() req: UserContext,
    @Param('id') id: number,
  ): Promise<void> {
    const targetProject: Project =
      await this.projectService.findOwnerProjectById(req.user.id, id);
    if (!targetProject) throw new NotFoundException(messages.projectNotFound);
    await this.projectService.removeProject(targetProject);
  }

  @ApiTags('project')
  @ApiResponse({
    status: 200,
    description: 'Removes the user project.',
  })
  @Put(':id')
  async updateUserProject(
    @Req() req: UserContext,
    @Param('id') id: number,
    @Body() body: CreateProjectDto,
  ): Promise<Project> {
    const targetProject: Project =
      await this.projectService.findOwnerProjectById(req.user.id, id);
    if (!targetProject) throw new NotFoundException(messages.projectNotFound);
    return this.projectService.updateProject(targetProject.id, body.name);
  }
}
