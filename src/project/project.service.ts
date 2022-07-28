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

  async createProject(owner: User, name: string): Promise<Project> {
    const newProject: Project = await this.projectRepository.create({
      owner,
      name,
    });
    await this.projectRepository.save(newProject);
    return newProject;
  }

  async findProjectByName(name: string): Promise<Project> {
    return await this.projectRepository.findOne({
      where: { name: Like(name) },
    });
  }

  async findProjectsByOwner(ownerId: number): Promise<Project[]> {
    const where: any = { owner: ownerId };
    return await this.projectRepository.find({ where });
  }

  async findOwnerProjectById(
    ownerId: number,
    projectId: number,
  ): Promise<Project> {
    const where: any = { owner: ownerId, id: projectId };
    return await this.projectRepository.findOne({ where });
  }

  async removeProject(project: Project): Promise<void> {
    await this.projectRepository.remove(project);
  }

  async updateProject(projectId: number, name: string): Promise<Project> {
    await this.projectRepository.update({ id: projectId }, { name });
    return this.projectRepository.findOneBy({ id: projectId });
  }
}
