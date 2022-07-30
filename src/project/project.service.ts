import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { Project } from './project.entity';
import { Like } from 'typeorm';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  async createProject(
    owner: User,
    name: string,
    users: User[],
  ): Promise<Project> {
    const newProject: Project = await this.projectRepository.create({
      owner,
      name,
      users,
    });
    await this.projectRepository.save(newProject);
    return newProject;
  }

  async findProjectByName(name: string): Promise<Project> {
    return await this.projectRepository.findOne({
      where: { name: Like(name) },
    });
  }

  async findUserProjects(owner: User): Promise<Project[]> {
    const project: Project[] = await this.projectRepository.find({
      where: {},
      relations: {
        users: true,
        owner: true,
        tasks: true,
      },
    });
    return project.filter((el) => {
      return el.users.map((el2) => el2.id).includes(owner.id);
    });
  }

  async findProject(
    projectId: number,
    ownerId?: number | undefined,
  ): Promise<Project> {
    const where: any = { id: projectId };
    if (!!projectId) where.owner = ownerId;
    return await this.projectRepository.findOne({
      where,
      relations: {
        users: true,
        owner: true,
        tasks: true,
      },
    });
  }

  async removeProject(project: Project): Promise<void> {
    await this.projectRepository.remove(project);
  }

  async updateProject(
    projectId: number,
    name: string,
    users: User[],
  ): Promise<Project> {
    const project: Project = await this.findProject(projectId);
    project.name = name;
    project.users = [...users];
    this.projectRepository.save(project);
    return project;
  }

  async addUserToProject(project: Project, user: User): Promise<Project> {
    project.users.push(user);
    await this.projectRepository.save(project);
    return this.projectRepository.findOne({
      where: { id: project.id },
      relations: {
        users: true,
        owner: true,
        tasks: true,
      },
    });
  }

  async removeUserFromProject(project: Project, user: User): Promise<Project> {
    project.users = project.users.filter((el) => el.id !== user.id);
    await this.projectRepository.save(project);
    return this.projectRepository.findOne({
      where: { id: project.id },
      relations: {
        users: true,
        owner: true,
        tasks: true,
      },
    });
  }
}
