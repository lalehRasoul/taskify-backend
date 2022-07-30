import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from 'src/project/project.entity';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { TaskDto } from './task.schema';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async createTask(
    newTask: TaskDto,
    owner: User,
    project: Project,
    asign?: User | undefined,
  ): Promise<Task> {
    let task: Task;
    if (!!asign) {
      task = await this.taskRepository.create({
        ...newTask,
        owner,
        project,
        asign,
      });
    } else {
      task = await this.taskRepository.create({
        ...newTask,
        owner,
        project,
      });
    }
    await this.taskRepository.save(task);
    return task;
  }

  async findTask(taskId: number): Promise<Task> {
    return this.taskRepository.findOne({
      where: { id: taskId },
      relations: {
        project: {
          users: true,
        },
        asign: true,
        owner: true,
      },
    });
  }

  async assignedTasks(assignUser: User): Promise<Task[]> {
    const tasks: Task[] = await this.taskRepository.find({
      where: {},
      relations: {
        project: {
          users: true,
        },
        asign: true,
        owner: true,
      },
    });
    return tasks.filter((el) => {
      return el?.asign?.id === assignUser.id;
    });
  }

  async updateTask(oldTask: Task, newTask: TaskDto): Promise<Task> {
    oldTask = { ...oldTask, ...newTask };
    await this.taskRepository.save(oldTask);
    return oldTask;
  }

  async changeCheckField(task: Task): Promise<Task> {
    task.checked = !task.checked;
    await this.taskRepository.save(task);
    return task;
  }

  async setAssignedUser(task: Task, user: User): Promise<Task> {
    task.asign = user;
    await this.taskRepository.save(task);
    return task;
  }
}
